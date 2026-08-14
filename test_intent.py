import sys
sys.path.append("backend")
from main import parse_dataset_intent

res = parse_dataset_intent("eye doctor")
print(res)
