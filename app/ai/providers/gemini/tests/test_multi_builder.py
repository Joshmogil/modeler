from app.ai.providers.gemini.gemini import GeminiAI, get_client
from app.ai.examples.user_goals import get_sample_user_goals
from app.ai.examples.user import get_sample_user
from app.ai.providers.gemini.multis.builder import generate_workout_day_via_multistep


async def test_multi_builder():
    client = await get_client()
    ai = GeminiAI(client=client)
    user = get_sample_user(num="2")
    goals = get_sample_user_goals()

    workout_week = await generate_workout_day_via_multistep(ai, user, goals, [])


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_multi_builder())