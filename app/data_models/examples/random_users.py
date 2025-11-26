import random
import uuid
from datetime import datetime, timedelta
from typing import List

from app.data_models.persistent.user import (
    User,
    Interest,
    Skill,
    FocusLevel,
    ActivityLevel,
    VarietyPreference,
)

# --- Data Pools for Randomization ---

FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Skyler"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

INTEREST_DATA = {
    "Strength Training": ["Squat", "Deadlift", "Bench Press", "Overhead Press", "Pull-up"],
    "Cardio": ["Running", "Cycling", "Swimming", "Rowing", "Jump Rope"],
    "Yoga": ["Downward Dog", "Warrior II", "Triangle Pose", "Tree Pose"],
    "CrossFit": ["Burpees", "Kettlebell Swings", "Box Jumps", "Wall Balls"],
    "Bodyweight Fitness": ["Push-ups", "Plank", "Lunges", "Dips"],
    "Olympic Lifting": ["Snatch", "Clean and Jerk"],
    "Pilates": ["The Hundred", "Roll Up", "Leg Circles"],
}

# --- Helper Functions ---

def _generate_random_interests() -> List[Interest]:
    """Generates a random list of 1 to 5 unique interests."""
    num_interests = random.randint(1, 5)
    chosen_interest_names = random.sample(list(INTEREST_DATA.keys()), num_interests)
    
    interests = []
    for name in chosen_interest_names:
        # Ensure at least one interest is the primary focus
        focus = "Primary" if not any(i.focus == "Primary" for i in interests) else random.choice(list(FocusLevel.__args__))
        
        interest = Interest(
            name=name,
            skill=random.choice(list(Skill.__args__)),
            focus=focus,
            active=True,
            favorite_exercises=random.sample(INTEREST_DATA[name], k=random.randint(1, len(INTEREST_DATA[name])))
        )
        interests.append(interest)
        
    return interests

# --- Main Generator Function ---

def generate_random_users(count: int) -> List[User]:
    """
    Generates a list of randomized User objects.

    Args:
        count: The number of random users to generate.

    Returns:
        A list of User objects with randomized data.
    """
    users = []
    for _ in range(count):
        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)
        age = random.randint(18, 65)
        
        user = User(
            id=uuid.uuid4(),
            is_active=True,
            is_premium=random.choice([True, False]),
            email=f"{first_name.lower()}.{last_name.lower()}{random.randint(1,99)}@example.com",
            provider="google",
            first_name=first_name,
            last_name=last_name,
            display_name=f"{first_name} {last_name[0]}.",
            age=age,
            desired_workouts_per_week=random.randint(1, 10),
            birthday=datetime.now() - timedelta(days=365 * age),
            variety_preference=random.choice(list(VarietyPreference.__args__)),
            activity_level=random.choice(list(ActivityLevel.__args__)),
            interests=_generate_random_interests()
        )
        users.append(user)
        
    return users

if __name__ == "__main__":
    # Example of how to use the generator
    random_users = generate_random_users(5)
    for u in random_users:
        print(u.model_dump_json(indent=2))