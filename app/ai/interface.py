from abc import abstractmethod
from typing import List

from app.utils.abc_extensions import SignatureEnforcingABC
from app.data_models.persistent.user import User
from app.data_models.persistent.week import WorkoutDay
from app.data_models.persistent.goal import Goal, GoalDataPoint

class AIInterface(SignatureEnforcingABC):
    
    @abstractmethod
    async def prompt(self, *, contents: str, schema: type, model: str = None) -> any:
        pass

    @abstractmethod
    async def generate_workout(self, user: User, goals: List[Goal], existing_workouts: List[WorkoutDay]) -> WorkoutDay:
        pass

    @abstractmethod
    async def one_shot_generate_workout_week(self, user: User, goals: List[Goal]) -> List[WorkoutDay]:
        pass

    @abstractmethod
    async def analyze_goal_progress(self, goal: Goal, workout: WorkoutDay) -> List[GoalDataPoint]:
        pass

