from app.data_models.persistent.user import User, Interest

user = User(
    id="00000000-0000-0000-0000-000000000000",
    is_active=True,
    is_premium=False,
    email="josh.doe@example.com",
    apple_user_id=None,
    provider="google",
    measurement_system="imperial",
    refresh_token=None,
    first_name="Josh",
    last_name="Doe",
    display_name="Josh D.",
    age=28,
    desired_workouts_per_week=4,
    birthday="1997-10-22T14:30:00Z",
    variety_preference="Medium",
    
    interests=[
        Interest(
            name="Strength Training",
            skill="Advanced",
            focus="Primary",
            favorite_exercises=["Squats", "Deadlifts", "Bench Press"]
        ),
        Interest(
            name="Cardio",
            skill="Intermediate",
            focus="Secondary",
            favorite_exercises=["Running", "Cycling"]
        )
    ]
)

def get_example_user() -> User:
    return user
