from app.ai.providers.gemini.gemini import GeminiAI, get_client
from app.ai.examples.user_goals import get_sample_user_goals
from app.ai.examples.user import get_sample_user


async def test_one_shot_generate_workout_week():
    client = await get_client()
    ai = GeminiAI(client=client)
    user = get_sample_user()
    goals = get_sample_user_goals()

    workout_week = await ai.one_shot_generate_workout_week(user, goals)

    print("Generated Workout Week:")
    out = [ex.model_dump(mode='json') for ex in workout_week]
    with open("./app/ai/examples/one_shot_workout_week.json", "w+") as f:
        import json
        json.dump(out, f, indent=4)

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_one_shot_generate_workout_week())