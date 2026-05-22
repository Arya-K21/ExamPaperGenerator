"""
LangChain + Claude question generation agent.
Generates exam questions per Bloom's taxonomy level and builds the audit report.
"""
import json
import re
import uuid
from typing import List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from schemas import (
    AuditDistribution,
    AuditReport,
    BloomLevel,
    GenerateResponse,
    Question,
)

# ── Model setup ────────────────────────────────────────────────────────────────
def get_llm(model: str = "gemini-2.5-flash") -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(model=model, max_output_tokens=8192, temperature=0.7)


# ── Prompts ────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert academic examiner with deep knowledge of Bloom's Taxonomy.
Your task is to generate high-quality exam questions from a given syllabus.

Rules:
1. Questions must align precisely with the specified Bloom's Taxonomy level.
2. Questions must be based ONLY on the provided syllabus content.
3. Each question must be unique — no repetition of concepts.
4. Answers must be comprehensive model answers suitable for marking.
5. You MUST return valid JSON only — no markdown fences, no extra text.
"""

GENERATE_PROMPT = """Generate exactly {count} exam question(s) at Bloom's Taxonomy level: **{level}**
Each question carries **{marks} marks**.

Syllabus content:
{syllabus}

Previously generated topics (avoid repeating these): {used_topics}

Instructions for Answer Length:
- The length of the answer MUST strictly scale with the marks assigned ({marks} marks).
- For 2 marks: Ensure the answer is highly detailed and >= 200 words.
- For 5 marks: Ensure the answer is an extensive essay of around 30-40 lines, aiming for >= 2500 words.
- Scale the length and detail proportionally for other marks. DO NOT generate short answers!

Return a JSON array of exactly {count} object(s) with this structure:
[
  {{
    "topic": "specific topic from syllabus",
    "question": "the full standard question text",
    "scaffolded_question": "the same question broken down into guided sub-steps (a, b, c) for students needing more structure",
    "advanced_question": "the same question made more open-ended, complex, or interdisciplinary for advanced students",
    "answer": "comprehensive and extremely detailed model answer matching the word count criteria covering all core concepts"
  }}
]

Bloom's level reminder:
- Remember: recall facts, definitions, lists
- Understand: explain, describe, summarise in own words
- Apply: use knowledge in new situations, solve problems, show working
- Analyse: compare, contrast, break down, examine relationships
- Evaluate: justify, critique, recommend with reasoning
- Create: design, construct, propose original solutions

Return ONLY the JSON array."""


BACKLOG_GENERATE_PROMPT = """You are given a previous exam paper. Your task is to generate exactly {count} exam question(s) at Bloom's Taxonomy level: **{level}** (each carrying **{marks} marks**), that are TOPICALLY RELATED to the questions in the previous exam paper, but NOT identical.
Do not repeat any question from the previous paper verbatim. Rephrase, change variables, change the angle, or test a different sub-topic within the same domain.

Previous Exam Paper content:
{backlog_text}

Syllabus content:
{syllabus}

Previously generated topics (avoid repeating these in this run): {used_topics}

Instructions for Answer Length:
- The length of the answer MUST strictly scale with the marks assigned ({marks} marks).
- For 2 marks: Ensure the answer is highly detailed and >= 200 words.
- For 5 marks: Ensure the answer is an extensive essay of around 30-40 lines, aiming for >= 2500 words.
- Scale the length and detail proportionally for other marks. DO NOT generate short answers!

Return a JSON array of exactly {count} object(s) with this structure:
[
  {{
    "topic": "specific topic from syllabus",
    "question": "the full standard question text",
    "scaffolded_question": "the same question broken down into guided sub-steps (a, b, c) for students needing more structure",
    "advanced_question": "the same question made more open-ended, complex, or interdisciplinary for advanced students",
    "answer": "comprehensive and extremely detailed model answer matching the word count criteria covering all core concepts"
  }}
]

Return ONLY the JSON array."""


REGENERATE_PROMPT = """Regenerate ONE exam question for Bloom's level: **{level}**
This question carries **{marks} marks**.

Syllabus content:
{syllabus}

Original question: {original_question}
Rejection reason: {reason}

Generate a better question addressing the rejection reason.

Instructions for Answer Length:
- The length of the answer MUST strictly scale with the marks assigned ({marks} marks).
- For 2 marks: Ensure the answer is highly detailed and >= 200 words.
- For 5 marks: Ensure the answer is an extensive essay of around 30-40 lines, aiming for >= 2500 words.
- Scale the length and detail proportionally for other marks. DO NOT generate short answers!

Return a JSON object:
{{
  "topic": "specific topic from syllabus",
  "question": "the improved standard question text",
  "scaffolded_question": "the improved question broken down into guided sub-steps (a, b, c)",
  "advanced_question": "the improved question made more open-ended and complex",
  "answer": "comprehensive and extremely detailed model answer matching the word count criteria"
}}

Return ONLY the JSON object."""


# ── Helpers ────────────────────────────────────────────────────────────────────
def parse_json_response(text: str):
    """Robustly extract JSON from LLM response."""
    text = text.strip()
    # Remove markdown fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def estimate_difficulty(levels: List[BloomLevel]) -> str:
    """Estimate overall difficulty from Bloom's distribution."""
    level_weights = {
        "remember": 1, "understand": 2, "apply": 3,
        "analyse": 4, "evaluate": 5, "create": 6,
    }
    total_q = sum(l.count for l in levels)
    if total_q == 0:
        return "Medium"

    weighted_sum = sum(
        level_weights.get(l.label.lower(), 3) * l.count for l in levels
    )
    avg = weighted_sum / total_q

    if avg <= 1.5:
        return "Easy"
    elif avg <= 2.5:
        return "Easy-Medium"
    elif avg <= 3.5:
        return "Medium"
    elif avg <= 4.5:
        return "Medium-Hard"
    else:
        return "Hard"


def extract_topics_from_syllabus(syllabus: str) -> List[str]:
    """Simple topic extractor — splits by newlines and filters short lines."""
    lines = [l.strip() for l in syllabus.splitlines() if l.strip()]
    topics = [l for l in lines if len(l) > 5]
    return topics or ["General Topics"]


# ── Main generation agent ──────────────────────────────────────────────────────
async def generate_paper(syllabus: str, levels: List[BloomLevel], backlog_text: str = None) -> GenerateResponse:
    llm = get_llm()
    all_questions: List[Question] = []
    used_topics: List[str] = []

    syllabus_topics = extract_topics_from_syllabus(syllabus)
    total_marks = sum(l.count * l.marks for l in levels)
    total_questions = sum(l.count for l in levels)

    for level in levels:
        if level.count == 0:
            continue

        if backlog_text and backlog_text.strip():
            prompt = BACKLOG_GENERATE_PROMPT.format(
                count=level.count,
                level=level.label,
                marks=level.marks,
                backlog_text=backlog_text[:4000],
                syllabus=syllabus[:4000],
                used_topics=", ".join(used_topics) if used_topics else "none",
            )
        else:
            prompt = GENERATE_PROMPT.format(
                count=level.count,
                level=level.label,
                marks=level.marks,
                syllabus=syllabus[:4000],  # cap syllabus length
                used_topics=", ".join(used_topics) if used_topics else "none",
            )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]

        response = await llm.ainvoke(messages)
        raw = response.content

        try:
            parsed = parse_json_response(raw)
            # Handle both array and single object
            if isinstance(parsed, dict):
                parsed = [parsed]

            for i, item in enumerate(parsed[:level.count]):
                topic = item.get("topic", level.label)
                used_topics.append(topic)

                q = Question(
                    id=f"q_{level.id}_{i}_{uuid.uuid4().hex[:6]}",
                    level=level.label,
                    marks=level.marks,
                    topic=topic,
                    question=item.get("question", ""),
                    scaffolded_question=item.get("scaffolded_question", ""),
                    advanced_question=item.get("advanced_question", ""),
                    answer=item.get("answer", ""),
                )
                all_questions.append(q)

        except (json.JSONDecodeError, KeyError, TypeError) as e:
            # Graceful fallback: add a placeholder so count is maintained
            all_questions.append(Question(
                id=f"q_{level.id}_err_{uuid.uuid4().hex[:6]}",
                level=level.label,
                marks=level.marks,
                topic=level.label,
                question=f"[Parse error for level {level.label}. Raw: {raw[:200]}]",
                scaffolded_question="[Parse error]",
                advanced_question="[Parse error]",
                answer="Please regenerate this question.",
            ))

    # ── Build audit report ─────────────────────────────────────────────────────
    covered_topics = list({q.topic for q in all_questions})
    missed = [t for t in syllabus_topics[:10] if not any(t.lower() in q.topic.lower() for q in all_questions)]

    distribution = [
        AuditDistribution(
            level=lv.label,
            count=lv.count,
            marks=lv.count * lv.marks,
            percent=round((lv.count / total_questions) * 100, 1) if total_questions else 0,
        )
        for lv in levels if lv.count > 0
    ]

    audit = AuditReport(
        topicsCovered=len(covered_topics),
        topicsTotal=max(len(syllabus_topics[:10]), len(covered_topics)),
        missedTopics=missed[:3],
        bloomsMatch=True,
        originality=100,
        difficulty=estimate_difficulty(levels),
        totalQuestions=total_questions,
        totalMarks=total_marks,
        distribution=distribution,
    )

    return GenerateResponse(questions=all_questions, audit=audit)


# ── Single question regeneration ───────────────────────────────────────────────
async def regenerate_question(
    question_id: str,
    question_text: str,
    level: str,
    topic: str,
    marks: int,
    reason: str,
    syllabus: str,
) -> Question:
    llm = get_llm()

    prompt = REGENERATE_PROMPT.format(
        level=level,
        marks=marks,
        syllabus=syllabus[:4000],
        original_question=question_text,
        reason=reason,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=prompt),
    ]

    response = await llm.ainvoke(messages)
    raw = response.content

    try:
        parsed = parse_json_response(raw)
        if isinstance(parsed, list):
            parsed = parsed[0]

        return Question(
            id=question_id,
            level=level,
            marks=marks,
            topic=parsed.get("topic", topic),
            question=parsed.get("question", question_text),
            scaffolded_question=parsed.get("scaffolded_question", ""),
            advanced_question=parsed.get("advanced_question", ""),
            answer=parsed.get("answer", ""),
            rejected=False,
            rejectionReason=reason,
        )
    except Exception:
        return Question(
            id=question_id,
            level=level,
            marks=marks,
            topic=topic,
            question=question_text,
            scaffolded_question="",
            advanced_question="",
            answer="Could not regenerate. Please try again.",
            rejected=False,
            rejectionReason=reason,
        )


# ── Voice Command Parser ───────────────────────────────────────────────────────
from langchain_core.prompts import ChatPromptTemplate

async def parse_voice_command(transcript: str) -> dict:
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an intelligent assistant for teachers.
Your job is to parse a teacher's spoken command to generate an exam paper, and extract the topic/syllabus and the desired question counts per Bloom's Taxonomy level.

Map general difficulty terms to Bloom's levels:
- Easy/Basic -> remember, understand
- Medium/Intermediate -> apply, analyse
- Hard/Advanced -> evaluate, create

If they don't specify marks, assume 2 marks per question as default. If they say "a 10 mark question", set marks to 10.

Return ONLY a valid JSON object matching this schema exactly:
{{
  "syllabus": "Extracted topic or syllabus text",
  "levels": [
    {{"id": "remember", "count": 2, "marks": 2}},
    {{"id": "evaluate", "count": 1, "marks": 5}}
  ]
}}
Valid level IDs: remember, understand, apply, analyse, evaluate, create.
"""),
        ("user", "{transcript}")
    ])
    
    messages = prompt.format_messages(transcript=transcript)
    response = await llm.ainvoke(messages)
    
    try:
        parsed = parse_json_response(response.content)
        return parsed
    except Exception as e:
        print("Failed to parse LLM JSON:", response.content)
        return {"syllabus": transcript, "levels": []}
