import re
from typing import Annotated

from pydantic import BeforeValidator, Field

# Regular expression patterns for prompt injection detection
INJECTION_PATTERNS = [
    # Instructions override attempts
    r"(?:ignore|disregard|forget)(?:\s+(?:all|the|your|previous))?\s+(?:above|instructions|prompt)",
    r"(?:your|the)\s+(?:new|actual|real)\s+instructions",
    r"(?:do\s+not|don'?t)\s+(?:follow|obey|use)\s+(?:the|your|previous)\s+(?:above|instructions|prompt)",
    
    # Role changes
    r"(?:act|behave|perform)(?:\s+as)?\s+(?:if|though|like)",
    r"you\s+(?:are|as|should\s+be|will\s+be)\s+(?:a|an|the)",
    r"(?:respond|reply|answer)\s+(?:as|like|in\s+the\s+style\s+of)",
    
    # System prompt probing
    r"(?:what\s+(?:are|is|were))?\s+your\s+(?:instructions|prompt|system\s+message|programming)",
    r"(?:show|display|reveal|tell\s+me)\s+(?:your|the)\s+(?:instructions|prompt|system\s+message)",
    r"system\s+prompt",
    r"developer\s+mode",
    
    # Text extraction/repetition
    r"(?:repeat|echo|restate)\s+(?:the\s+)?(?:above|words|text|prompt)",
]

# Check for repetition of characters that might be used to "break" the model
REPETITION_PATTERNS = [
    r"(.)\1{10,}",  # Same character repeated 10+ times
    r"(.{1,3})\1{5,}",  # Same 1-3 character sequence repeated 5+ times
]

# Check for unusual Unicode that might be used for evasion
UNICODE_EVASION_PATTERNS = [
    r"[\u200B-\u200F\u2060-\u2064\uFEFF]{1,}",  # Zero-width characters and joiners
]

def validate_for_prompt_injection(text: str) -> str:
    """
    An advanced validator that checks for prompt injection attempts using regex patterns.

    Args:
        text: The input string to validate.

    Raises:
        ValueError: If a potential prompt injection pattern is detected.

    Returns:
        The original text if it passes validation, with leading/trailing whitespace stripped.
    """
    if not isinstance(text, str):
        raise TypeError("Input must be a string.")
    
    # Normalize text for checking - lowercase and remove extra spaces
    normalized_text = re.sub(r'\s+', ' ', text.lower()).strip()
    
    # Check main injection patterns
    for pattern in INJECTION_PATTERNS:
        matches = re.search(pattern, normalized_text)
        if matches:
            raise ValueError(
                f"Potential prompt injection detected. Pattern matched: '{matches.group(0)}'"
            )
    
    # Check for suspicious character repetition
    for pattern in REPETITION_PATTERNS:
        matches = re.search(pattern, normalized_text)
        if matches:
            raise ValueError(
                f"Suspicious character repetition detected: '{matches.group(0)}'"
            )
    
    # Check for Unicode evasion techniques
    for pattern in UNICODE_EVASION_PATTERNS:
        matches = re.search(pattern, text)  # Use original text to preserve Unicode
        if matches:
            raise ValueError(
                "Suspicious Unicode characters detected that might be used for evasion"
            )
    
    # Check for code weeks or markdown formatting that might be used to escape context
    if "```" in text or "~~~" in text:
        if re.search(r"```\w*\n[\s\S]+?\n```", text):
            raise ValueError("Code week detected which may be used for prompt injection")
    
    return text.strip()

UntrustedText20 = Annotated[
    str, 
    BeforeValidator(validate_for_prompt_injection),
    Field(max_length=20)
]

UntrustedText80 = Annotated[
    str, 
    BeforeValidator(validate_for_prompt_injection),
    Field(max_length=80)
]

UntrustedText140 = Annotated[
    str, 
    BeforeValidator(validate_for_prompt_injection),
    Field(max_length=140)
]

UntrustedText500 = Annotated[
    str, 
    BeforeValidator(validate_for_prompt_injection),
    Field(max_length=500)
]

UntrustedText2000 = Annotated[
    str, 
    BeforeValidator(validate_for_prompt_injection),
    Field(max_length=1000)
]

# Keep the factory function for non-standard limits
def create_untrusted_text(char_limit: int = 1000):
    """Creates a model field for UntrustedText with a custom character limit."""
    return Field(
        default=...,
        max_length=char_limit,
        json_schema_extra={"format": "untrusted-text"}
    )