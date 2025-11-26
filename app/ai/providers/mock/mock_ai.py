from typing import List

from app.ai.interface import AIInterface

from app.data_models.persistent.user import User
from app.data_models.persistent.week import WorkoutDay
from app.data_models.persistent.goal import Goal, GoalDataPoint


from app.ai.examples import (
    workout_week,
    goal_data_points
)


class MockAI(AIInterface):

    async def prompt(self, *, contents: str, schema: type, model: str = None) -> any:
        return None  # Mock does not implement prompt functionality

    async def generate_workout(self, user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]) -> WorkoutDay:
        return workout_week.get_sample_week().workouts[0]

    async def one_shot_generate_workout_week(self, user: User, goals: List[Goal]) -> List[WorkoutDay]:
        return workout_week.get_sample_week().workouts

    async def analyze_goal_progress(self, goal: Goal, workout: WorkoutDay) -> List[GoalDataPoint]:
        return goal_data_points.get_sample_goal_data_points()
