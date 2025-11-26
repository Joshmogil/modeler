import uuid

def replace_uuids_recursively(data):
    """
    Recursively traverses a dictionary or list and replaces all UUID strings with new ones.
    """
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, str):
                try:
                    # Check if the string is a valid UUID
                    uuid.UUID(value)
                    # If it is, replace it with a new one
                    data[key] = str(uuid.uuid4())
                except ValueError:
                    # Not a UUID, do nothing
                    pass
            else:
                # If the value is another dict or a list, recurse into it
                replace_uuids_recursively(value)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, str):
                try:
                    uuid.UUID(item)
                    data[i] = str(uuid.uuid4())
                except ValueError:
                    pass
            else:
                replace_uuids_recursively(item)
    return data