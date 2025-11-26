from typing import List
import asyncio

from google.genai import Client

from app.ai.prompt_builders.analyze_goal_progress import analyze_goal_progress_prompt
from app.ai.providers.gemini.multis.builder import generate_workout_day_via_multistep
from app.config.settings import settings

from app.data_models.persistent.user import User
from app.data_models.persistent.week import WorkoutDay
from app.data_models.persistent.goal import Goal, GoalDataPoint


from app.ai.interface import AIInterface

from app.ai.prompt_builders.one_shot_generate_workout_week_prompt import one_shot_generate_workout_week_prompt
from app.ai.prompt_builders.generate_single_workout_prompt import generate_single_workout_prompt

from app.ai.providers.gemini.parse_workout_week import parse_workout_week
from app.ai.providers.gemini.parse_workout_day import parse_workout_day, set_workout_actual_measurements
from app.ai.providers.gemini.parse_goal_data_points import parse_goal_data_points

#MODEL_ID = "gemini-2.5-flash"  # shove in settings
#MODEL_ID = "gemini-2.5-pro"
MODEL_ID = "gemini-3.0-pro"
MODEL_ID = "gemini-2.5-flash-lite"

async def get_client() -> Client:
    return Client(api_key=settings.GEMINI_API_KEY)

class GeminiAI(AIInterface):
    """
    Async-only Gemini client wrapper.
    Usage:
        async with GeminiAI() as ai:
            days = await ai.organize_days(proto_exercises)
    """
    def __init__(self, client: Client, model_id: str = MODEL_ID, timeout_s: float = 300.0):
        self._client = client
        self._aclient = self._client.aio
        self._model_id = model_id
        self._timeout_s = timeout_s
        self._closed = False

    async def __aenter__(self) -> "GeminiAI":
        # if you need warmup, do it here
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.aclose()

    async def aclose(self):
        if not self._closed:
            await self._aclient.aclose()
            self._closed = True

    # ---------- helpers ----------
    async def _gen(self, *, contents: str, config: dict = {}, model_id: str = None):
        # centralizes timeouts/retries/logging
        #if not config.get("system_instructions"):
        #    config["system_instructions"] = ["You are an expert fitness trainer AI that helps users create workout plans."]


        try:
            return await asyncio.wait_for(
                self._aclient.models.generate_content(
                    model=model_id or self._model_id,
                    contents=contents,
                    config=config
                ),
                timeout=self._timeout_s,
            )
        except asyncio.TimeoutError as e:
            # map to your domain error
            raise RuntimeError(f"gemini timeout after {self._timeout_s}s") from e

    # ---------- your API ----------
    async def prompt(self, *, contents: str, schema: type, model: str = None) -> any:
        r = await self._gen(contents=contents, config={
            "response_mime_type": "application/json",
            "response_schema": schema
        }, model_id=model)
        return r.text  # caller to parse

    async def generate_workout(self, user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]) -> WorkoutDay:
        return await generate_workout_day_via_multistep(self, user, goals, existing_workouts)
        #prompt = generate_single_workout_prompt(user, goals, existing_workouts)
        #r = await self._gen(contents=prompt, config={
        #    "response_mime_type": "application/json",
        #    "response_schema": WorkoutDay
        #})
        #workout_day = parse_workout_day(r.text)
        #workout_day = set_workout_actual_measurements(workout_day)
        #return workout_day
        
    async def one_shot_generate_workout_week(self, user: User, goals: List[Goal]) -> List[WorkoutDay]:
        # Combines all steps into one-shot generation
        prompt = one_shot_generate_workout_week_prompt(user, goals)
        r = await self._gen(contents=prompt, config={
            "response_mime_type": "application/json",
            "response_schema": list[WorkoutDay]
        })
        return parse_workout_week(r.text)
    
    async def analyze_goal_progress(self, goal: Goal, workout: WorkoutDay) -> List[GoalDataPoint]:
        prompt = analyze_goal_progress_prompt(goal, workout)
        r = await self._gen(contents=prompt, config={
            "response_mime_type": "application/json",
            "response_schema": list[GoalDataPoint]
        })
        return parse_goal_data_points(r.text)