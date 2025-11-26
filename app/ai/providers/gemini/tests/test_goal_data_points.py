import asyncio
from typing import List
import json

from app.ai.providers.gemini.gemini import GeminiAI, get_client

from app.ai.examples.workout_week import get_sample_week
from app.ai.examples.user_goals import get_sample_user_goals
    
from app.data_models.persistent.goal import GoalDataPoint


async def test_goal_data_points():
    client = await get_client()
    ai = GeminiAI(client=client)
    workout = get_sample_week().workouts[0]
    user_goals = get_sample_user_goals()

    goal_data_points: List[GoalDataPoint] = await ai.analyze_goal_progress(
        workout=workout,
        goal=user_goals[0],
    )

    out = [ex.model_dump(mode='json') for ex in goal_data_points]
    with open("./app/ai/examples/goal_data_points.json", "w+") as f:
        json.dump(out, f, indent=4)

if __name__ == "__main__":
    asyncio.run(test_goal_data_points())