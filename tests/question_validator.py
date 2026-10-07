import json
from pathlib import Path
data=json.loads(Path('data/exam_questions.json').read_text(encoding='utf-8'))
required={'id','year','level','theme','type','marks','question','answer'}
assert 'questions' in data
for q in data['questions']: assert required <= set(q), f'Missing fields: {required-set(q)}'
print('Question database validation passed.')