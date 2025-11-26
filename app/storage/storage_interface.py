from abc import abstractmethod
from uuid import UUID

from app.utils.abc_extensions import SignatureEnforcingABC
from app.data_models.persistent.user import User
from app.data_models.persistent.week import Week
from app.data_models.persistent.goal import Goal


class StorageInterface(SignatureEnforcingABC):

    @abstractmethod
    async def test_connection(self) -> bool:
        """
        Test the connection to the storage backend.
        Returns True if the connection is successful, False otherwise.
        """
        pass

    @abstractmethod
    async def create_user(self, user: User) -> UUID:
        """
        Create a new user in the storage backend.
        Returns the ID of the created user.
        """
        pass

    @abstractmethod
    async def get_user(self, user_id: UUID) -> User:
        """
        Retrieve a user by their ID from the storage backend.
        Returns the User object.
        """
        pass

    @abstractmethod
    async def get_user_by_apple_id(self, apple_id: str) -> User:
        """
        Retrieve a user by their Apple ID from the storage backend.
        Returns the User object.
        """
        pass

    @abstractmethod
    async def create_week(self, user_id: UUID, week: Week) -> UUID:
        """
        Create a new week entry in the storage backend.
        Returns the ID of the created week.
        """
        pass

    @abstractmethod
    async def get_week(self, user_id: UUID, week_id: UUID) -> Week:
        """
        Retrieve a week by its ID for the specified user.
        Returns the Week object.
        """
        pass

    @abstractmethod
    async def delete_week(self, user_id: UUID, week_id: UUID) -> None:
        """
        Delete a week by its ID for the specified user.
        """
        pass

    @abstractmethod
    async def create_goal(self, user_id: UUID, goal: Goal) -> UUID:
        """
        Create a new goal entry in the storage backend.
        Returns the ID of the created goal.
        """
        pass

    @abstractmethod
    async def get_goal(self, user_id: UUID, goal_id: UUID) -> Goal:
        """
        Retrieve a goal by its ID for the specified user.
        Returns the Goal object.
        """
        pass

    @abstractmethod
    async def delete_goal(self, user_id: UUID, goal_id: UUID) -> None:
        """
        Delete a goal by its ID for the specified user.
        """
        pass