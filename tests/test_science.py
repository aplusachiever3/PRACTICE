import json
from pathlib import Path

data = json.loads(Path("data/exam_questions.json").read_text(encoding="utf-8"))
questions = data.get("questions", [])
assert questions, "Question database must not be empty"

allowed = {"Diversity", "Cycles", "Systems", "Interactions", "Energy"}
assert all(q.get("theme") in allowed for q in questions)
assert all(q.get("level") == "P6" for q in questions)
assert all(q.get("year") == 2026 for q in questions)

print(f"Science smoke test passed: {len(questions)} questions.")