import random
import datetime

# Constants
INTERESTS = [
    "Travel",
    "Music",
    "Movies",
    "Reading",
    "Sports",
    "Cooking",
    "Photography",
    "Gaming",
    "Art",
    "Technology",
]
BIOS = [
    "Loves long walks on the beach. Avid reader and coffee enthusiast and above all, a great listener.",
    "Coffee addict and tech enthusiast.",
    "Looking for a partner in crime.",
    "Just here for the memes.",
    "Adventure seeker.",
    "Foodie at heart.",
    "Music is my life.",
    "Always learning something new.",
    "Dog lover.",
    "Cat person.",
    "Born in the south, raised in the north, I bring a mix of cultures and flavors to everything I do.",
    "Avid traveler and photographer. I love capturing moments and exploring new places.",
    "Fitness enthusiast and outdoor lover. Whether it's a morning run or a weekend hike, I enjoy staying active.",
]

CITIES = [
    {"name": "Paris", "lat": 48.8566, "lng": 2.3522},
    {"name": "Lyon", "lat": 45.7640, "lng": 4.8357},
    {"name": "Marseille", "lat": 43.2965, "lng": 5.3698},
    {"name": "Bordeaux", "lat": 44.8378, "lng": -0.5792},
    {"name": "Lille", "lat": 50.6292, "lng": 3.0573},
]

FIRST_NAMES_MALE = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
]
FIRST_NAMES_FEMALE = [
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
]
LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
]

# Generate SQL
sql_statements = []

# Password hash for 'password123' (example)
DEFAULT_PASSWORD_HASH = (
    "$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm"  # 'Nicolas'
)

for i in range(1, 201):
    is_male = i % 2 != 0
    gender_id = 1 if is_male else 2

    first_name = random.choice(FIRST_NAMES_MALE if is_male else FIRST_NAMES_FEMALE)
    last_name = random.choice(LAST_NAMES)
    username = f"{first_name}{last_name}{i}"
    email = f"{username.lower()}@example.com"

    # Random birth date (18-50 years old)
    age = random.randint(18, 50)
    year = 2024 - age
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    birth_date = f"{year}-{month:02d}-{day:02d}"

    city = random.choice(CITIES)
    # Add some random variation to location
    lat = city["lat"] + random.uniform(-0.05, 0.05)
    lng = city["lng"] + random.uniform(-0.05, 0.05)

    bio = random.choice(BIOS).replace("'", "''")

    # Insert User
    sql_statements.append(
        f"INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, latitude, longitude, biography, status_id) VALUES ('{email}', '{username}', '{DEFAULT_PASSWORD_HASH}', '{first_name}', '{last_name}', '{birth_date}', {gender_id}, {lat}, {lng}, '{bio}', 2);"
    )

    # Insert Interests
    num_interests = random.randint(1, 4)
    selected_interests = random.sample(range(1, len(INTERESTS) + 1), num_interests)
    for interest_id in selected_interests:
        sql_statements.append(
            f"INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = '{username}'), {interest_id});"
        )

    # Insert Images
    # Using randomuser.me images
    gender_str = "men" if is_male else "women"
    # We need unique images if possible, randomuser has id 0-99
    img_id = random.randint(0, 99)
    profile_pic_url = f"https://randomuser.me/api/portraits/{gender_str}/{img_id}.jpg"

    sql_statements.append(
        f"INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = '{username}'), '{profile_pic_url}', TRUE);"
    )

    # Add 1-3 more random images
    for _ in range(random.randint(1, 3)):
        other_img_id = random.randint(0, 99)
        other_url = (
            f"https://randomuser.me/api/portraits/{gender_str}/{other_img_id}.jpg"
        )
        sql_statements.append(
            f"INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = '{username}'), '{other_url}', FALSE);"
        )

# Write to file
with open("seed_data.sql", "w") as f:
    f.write("\n".join(sql_statements))

print("Seed data generated in seed_data.sql")
