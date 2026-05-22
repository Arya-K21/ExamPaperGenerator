"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import List, Optional


class BloomLevel(BaseModel):
    id: str
    label: str
    count: int
    marks: int


class GenerateRequest(BaseModel):
    syllabus: str
    levels: List[BloomLevel]
    backlog_text: Optional[str] = None


class RegenerateRequest(BaseModel):
    question_id: str
    question_text: str
    level: str
    topic: str
    marks: int
    reason: str
    syllabus: str


class Question(BaseModel):
    id: str
    level: str
    marks: int
    topic: str
    question: str
    scaffolded_question: str
    advanced_question: str
    answer: str
    rejected: bool = False
    rejectionReason: Optional[str] = None


class AuditDistribution(BaseModel):
    level: str
    count: int
    marks: int
    percent: float


class AuditReport(BaseModel):
    topicsCovered: int
    topicsTotal: int
    missedTopics: List[str]
    bloomsMatch: bool
    originality: int
    difficulty: str
    totalQuestions: int
    totalMarks: int
    distribution: List[AuditDistribution]


class GenerateResponse(BaseModel):
    questions: List[Question]
    audit: AuditReport


class RegenerateResponse(BaseModel):
    question: Question


class VoiceCommandRequest(BaseModel):
    transcript: str
