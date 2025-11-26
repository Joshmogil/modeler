from uuid import UUID
from google.cloud import firestore
from google.cloud.firestore_v1 import FieldFilter

from app.data_models.persistent.user import User
from app.data_models.persistent.week import Week
from app.data_models.persistent.goal import Goal

from app.storage.firestore.validations.goal import validate_progress_length
from app.storage.storage_interface import StorageInterface


class FirestoreInterface(StorageInterface):

    def __init__(self, connection: firestore.AsyncClient):
        self.connection = connection

    async def test_connection(self) -> bool:
        """
        Test the connection to Firestore.
        Returns True if the connection is successful, False otherwise.
        """
        try:
            # Perform a simple operation to verify the connection
            doc_ref = self.connection.collection("health_check").document("test_doc")
            await doc_ref.set({"status": "ok"})
            doc = await doc_ref.get()
            return doc.exists and doc.to_dict().get("status") == "ok"
        except Exception as e:
            print(f"Firestore connection test failed: {e}")
            return False

    async def create_user(self, user: User) -> UUID:
        """
        Create a new user in Firestore.
        Returns the ID of the created user.
        """
        user_dict = user.model_dump(mode="json")
        user_ref = self.connection.collection("users").document(str(user.id))
        await user_ref.set(user_dict)
        return user.id
    
    async def get_user(self, user_id: UUID) -> User:
        """
        Retrieve a user by their ID from Firestore.
        Returns the User object.
        """
        user_ref = self.connection.collection("users").document(str(user_id))
        user_doc = await user_ref.get()
        if not user_doc.exists:
            raise ValueError(f"User with ID {user_id} does not exist.")
        user_data = user_doc.to_dict()
        return User.model_validate(user_data)
    
    async def get_user_by_apple_id(self, apple_id: str) -> User:
        """
        Retrieve a user by their Apple ID from Firestore.
        Returns the User object.
        """
        users_ref = self.connection.collection("users")
        query = users_ref.where(filter=FieldFilter("apple_user_id", "==", apple_id)).limit(1)
        results = await query.get()
        if not results:
            return None
        user_data = results[0].to_dict()
        return User.model_validate(user_data)

    async def create_goal(self, user_id: UUID, goal: Goal) -> UUID:
        """
        Create a new goal entry in Firestore.
        Returns the ID of the created goal.
        """
        validate_progress_length(goal)
        goal_dict = goal.model_dump(mode="json")
        goal_ref = self.connection.collection("users").document(str(user_id)).collection("goals").document(str(goal.id))
        await goal_ref.set(goal_dict)
        return goal.id
    
    async def get_goal(self, user_id: UUID, goal_id: UUID) -> Goal:
        """
        Retrieve a goal by its ID from Firestore.
        Returns the Goal object.
        """
        goal_ref = self.connection.collection("users").document(str(user_id)).collection("goals").document(str(goal_id))
        goal_doc = await goal_ref.get()
        if not goal_doc.exists:
            raise ValueError(f"Goal with ID {goal_id} does not exist for user {user_id}.")
        goal_data = goal_doc.to_dict()
        return Goal.model_validate(goal_data)
    
    async def delete_goal(self, user_id: UUID, goal_id: UUID) -> None:
        """
        Delete a goal by its ID from Firestore.
        """
        goal_ref = self.connection.collection("users").document(str(user_id)).collection("goals").document(str(goal_id))
        await goal_ref.delete()

    async def create_week(self, user_id: UUID, week: Week) -> UUID:
        """
        Create a new week entry in Firestore.
        Returns the ID of the created week.
        """
        week_dict = week.model_dump(mode="json")
        week_ref = self.connection.collection("users").document(str(user_id)).collection("weeks").document(str(week.id))
        await week_ref.set(week_dict)
        return week.id

    async def get_week(self, user_id: UUID, week_id: UUID) -> Week:
        """
        Retrieve a week by its ID from Firestore.
        Returns the Week object.
        """
        week_ref = self.connection.collection("users").document(str(user_id)).collection("weeks").document(str(week_id))
        week_doc = await week_ref.get()
        if not week_doc.exists:
            raise ValueError(f"Week with ID {week_id} does not exist for user {user_id}.")
        week_data = week_doc.to_dict()
        return Week.model_validate(week_data)
    
    async def delete_week(self, user_id: UUID, week_id: UUID) -> None:
        """
        Delete a week by its ID from Firestore.
        """
        week_ref = self.connection.collection("users").document(str(user_id)).collection("weeks").document(str(week_id))
        await week_ref.delete()

