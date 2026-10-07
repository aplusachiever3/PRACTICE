import json
from pathlib import Path

DATA = Path("data/exam_questions.json")
REQUIRED = {"id", "year", "level", "theme", "type", "marks", "question", "answer"}
ALLOWED_THEMES = {"Diversity", "Cycles", "Systems", "Interactions", "Energy"}
ALLOWED_TYPES = {"mcq", "short", "structured"}

data = json.loads(DATA.read_text(encoding="utf-8"))
assert isinstance(data.get("questions"), list) and data["questions"], "No questions found."

ids = set()
for q in data["questions"]:
    missing = REQUIRED - set(q)
    assert not missing, f"{q.get('id','UNKNOWN')}: missing fields {missing}"
    assert q["id"] not in ids, f"Duplicate question id: {q['id']}"
    ids.add(q["id"])
    assert q["theme"] in ALLOWED_THEMES, f"{q['id']}: invalid theme"
    assert q["type"] in ALLOWED_TYPES, f"{q['id']}: invalid type"
    assert isinstance(q["marks"], int) and q["marks"] > 0, f"{q['id']}: invalid marks"
    assert str(q["question"]).strip(), f"{q['id']}: empty question"
    assert str(q["answer"]).strip(), f"{q['id']}: empty answer"

print(f"Question database validation passed: {len(ids)} questions.")