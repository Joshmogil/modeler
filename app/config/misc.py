import random

ANIMALS = [
    "Ape", "Bear", "Boar", "Cat", "Cobra", "Crane", "Crow", "Deer", "Dog",
    "Eagle", "Elk", "Fox", "Goat", "Hawk", "Lion", "Mule", "Owl", "Pig",
    "Puma", "Rat", "Shark", "Snake", "Tiger", "Viper", "Wolf"
]

NATO_ALPHABET = [
    "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel",
    "India", "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
    "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey",
    "X-ray", "Yankee", "Zulu"
]

def generate_version_name():
    """Generates a random version name like 'Beaver-Delta-Bravo'."""
    animal = random.choice(ANIMALS)
    word1, word2 = random.sample(NATO_ALPHABET, 2)
    return f"{animal}-{word1}-{word2}"