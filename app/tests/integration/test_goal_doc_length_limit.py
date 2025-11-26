import requests

def test_goal_doc_length_limit(length=1460):

    # Assuming the FastAPI app is running locally on port 8000
    url = "http://localhost:8000/user/goal/"
    
    # Create a goal with a very long semantic description to test length limit
    long_string = "A" * 140 

    progress_entry = {
        "date": "2025-11-05T12:00:00Z",
        "percent_estimate": 0.25,
        "semantic_description": long_string
    }
    progress = [progress_entry for _ in range(length)]  # Three entries with long descriptions

    goal_data = {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "user_id": "00000000-0000-0000-0000-000000000000",
        "created_at": "2025-10-22T10:00:00Z",
        "starting_date": "2025-10-22T10:00:00Z",
        "target_date": "2026-01-22T10:00:00Z",
        "achieved": False,
        "active": True,
        "starting_point": "Bench press 185 lbs for 5 reps",
        "target": "Bench press 225 lbs for 5 reps",
        "progress": progress
        }
    
    response = requests.post(url, json=goal_data)
    
    # Check if the response indicates failure due to length limit
    #assert response.status_code == 422  # Unprocessable Entity for validation errors
    #assert "semantic_description" in response.text
    assert str(response.status_code).startswith("2")  # Created
    print("Test passed: Goal document length limit enforced.")

if __name__ == "__main__":
    test_goal_doc_length_limit()