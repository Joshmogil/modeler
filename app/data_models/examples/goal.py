import json

from app.data_models.examples.goal import Goal


goal = """{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "created_at": "2025-10-22T10:00:00Z",
  "starting_date": "2025-10-22T10:00:00Z",
  "target_date": "2026-01-22T10:00:00Z",
  "achieved": false,
  "active": true,
  "starting_point": "Bench press 185 lbs for 5 reps",
  "target": "Bench press 225 lbs for 5 reps",
  "progress": [
    {
      "date": "2025-11-05T12:00:00Z",
      "percent_estimate": 0.25,
      "semantic_description": "Felt strong today, managed 195 lbs for 3 reps."
    },
    {
      "date": "2025-11-20T12:00:00Z",
      "percent_estimate": 0.40,
      "semantic_description": "Hit 205 lbs for 2 reps. Progress is steady."
    },
    {
      "date": "2025-12-10T12:00:00Z",
      "percent_estimate": 0.55,
      "semantic_description": "Successfully benched 205 lbs for 5 reps. Halfway to the weight target!"
    }
  ]
}"""


def get_example_goal() -> Goal:
    return Goal.model_validate(json.loads(goal))