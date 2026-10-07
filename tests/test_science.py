import json
from pathlib import Path
data=json.loads(Path('data/exam_questions.json').read_text(encoding='utf-8'))
assert data['questions'], 'Question database must not be empty'
allowed={'Diversity','Cycles','Systems','Interactions','Energy'}
assert all(q['theme'] in allowed for q in data['questions'])
print('Science smoke test passed.')