import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for name in ['data/exam_questions.json','data/exam_blueprint.json']: json.loads((root/name).read_text(encoding='utf-8'))
print('Maintenance check passed: JSON files are valid.')