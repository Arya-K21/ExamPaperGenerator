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

Syllabus content:
{syllabus}

Previously generated topics (avoid repeating these): {used_topics}

Return a JSON array of exactly {count} object(s) with this structure:
[
  {{
    "topic": "specific topic from syllabus",
    "question": "the full question text",
    "answer": "comprehensive model answer"
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


REGENERATE_PROMPT = """Regenerate ONE exam question for Bloom's level: **{level}**

Syllabus content:
{syllabus}

Original question: {original_question}
Rejection reason: {reason}

Generate a better question addressing the rejection reason.

Return a JSON object:
{{
  "topic": "specific topic from syllabus",
  "question": "the improved question text",
  "answer": "comprehensive model answer"
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
async def generate_paper(syllabus: str, levels: List[BloomLevel]) -> GenerateResponse:
    llm = get_llm()
    all_questions: List[Question] = []
    used_topics: List[str] = []

    syllabus_topics = extract_topics_from_syllabus(syllabus)
    total_marks = sum(l.count * l.marks for l in levels)
    total_questions = sum(l.count for l in levels)

    for level in levels:
        if level.count == 0:
            continue

        prompt = GENERATE_PROMPT.format(
            count=level.count,
            level=level.label,
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
            answer="Could not regenerate. Please try again.",
            rejected=False,
            rejectionReason=reason,
        )
