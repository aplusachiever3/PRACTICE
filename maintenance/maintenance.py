import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ["data/exam_questions.json", "data/exam_blueprint.json"]

for name in FILES:
    path = ROOT / name
    assert path.exists(), f"Missing required file: {name}"
    json.loads(path.read_text(encoding="utf-8"))

questions = json.loads((ROOT / "data/exam_questions.json").read_text(encoding="utf-8"))["questions"]
blueprint = json.loads((ROOT / "data/exam_blueprint.json").read_text(encoding="utf-8"))

assert blueprint.get("level") == "P6"
assert blueprint.get("country") == "Singapore"
assert questions, "Question database is empty"

print(f"Maintenance check passed: {len(questions)} questions and blueprint are valid.")