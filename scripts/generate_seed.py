import random
from faker import Faker

fake = Faker(["fr_FR"])  # Use French locale for names matching the cities

# Constants
CITIES = [
    {"name": "Paris", "lat": 48.8566, "lng": 2.3522},
    {"name": "Lyon", "lat": 45.7640, "lng": 4.8357},
    {"name": "Marseille", "lat": 43.2965, "lng": 5.3698},
    {"name": "Bordeaux", "lat": 44.8378, "lng": -0.5792},
    {"name": "Lille", "lat": 50.6292, "lng": 3.0573},
    {"name": "Nice", "lat": 43.7102, "lng": 7.2620},
    {"name": "Toulouse", "lat": 43.6047, "lng": 1.4442},
    {"name": "Nantes", "lat": 47.2184, "lng": -1.5536},
    {"name": "Strasbourg", "lat": 48.5734, "lng": 7.7521},
    {"name": "Montpellier", "lat": 43.6108, "lng": 3.8767},
]

# Generate SQL
sql_statements = []

# Password hash for 'password123'
DEFAULT_PASSWORD_HASH = "$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm"

print("Generating seed data...")

for i in range(1, 201):
    # Determine Gender (1: Male, 2: Female, 3: Other)
    gender_roll = random.random()
    if gender_roll < 0.45:
        gender_id = 1
        is_male = True
    elif gender_roll < 0.90:
        gender_id = 2
        is_male = False
    else:
        gender_id = 3
        is_male = random.choice([True, False])

    if is_male:
        first_name = fake.first_name_male()
    else:
        first_name = fake.first_name_female()

    last_name = fake.last_name()

    # Ensure unique username
    username_base = f"{first_name}{last_name}"
    username = f"{username_base}{i}"

    email = f"{username.lower()}@example.com"

    # Bio
    bio = fake.text(max_nb_chars=120).replace("'", "''").replace("\n", " ")

    # Birth date
    dob = fake.date_of_birth(minimum_age=18, maximum_age=50)
    birth_date = dob.strftime("%Y-%m-%d")

    # Location
    city = random.choice(CITIES)
    lat = city["lat"] + random.uniform(-0.05, 0.05)
    lng = city["lng"] + random.uniform(-0.05, 0.05)

    # Sexual Preferences
    pref_roll = random.random()
    sexual_preferences = []

    if gender_id == 1:  # Male
        if pref_roll < 0.7:
            sexual_preferences = [2]
        elif pref_roll < 0.8:
            sexual_preferences = [1]
        elif pref_roll < 0.9:
            sexual_preferences = [1, 2]
        elif pref_roll < 0.95:
            sexual_preferences = [2, 3]
        else:
            sexual_preferences = [1, 2, 3]
    elif gender_id == 2:  # Female
        if pref_roll < 0.7:
            sexual_preferences = [1]
        elif pref_roll < 0.8:
            sexual_preferences = [2]
        elif pref_roll < 0.9:
            sexual_preferences = [1, 2]
        elif pref_roll < 0.95:
            sexual_preferences = [1, 3]
        else:
            sexual_preferences = [1, 2, 3]
    else:
        options = [1, 2, 3]
        num_prefs = random.randint(1, 3)
        sexual_preferences = sorted(random.sample(options, num_prefs))

    sexual_preferences_str = "{" + ",".join(map(str, sexual_preferences)) + "}"

    sql_statements.append(
        f"INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('{email}', '{username}', '{DEFAULT_PASSWORD_HASH}', '{first_name}', '{last_name}', '{birth_date}', {gender_id}, '{sexual_preferences_str}', {lat}, {lng}, '{city['name']}', '{bio}', 2);"
    )

    # Interests (IDs 1-10)
    num_interests = random.randint(1, 4)
    selected_interests = random.sample(range(1, 11), num_interests)
    for interest_id in selected_interests:
        sql_statements.append(
            f"INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = '{username}'), {interest_id});"
        )

    # Images
    # Using xsgames for better quality (0-75)
    gender_str = "male" if is_male else "female"
    img_id = random.randint(0, 75)
    profile_pic_url = (
        f"https://xsgames.co/randomusers/assets/avatars/{gender_str}/{img_id}.jpg"
    )

    sql_statements.append(
        f"INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = '{username}'), '{profile_pic_url}', TRUE);"
    )

    for _ in range(random.randint(1, 3)):
        other_img_id = random.randint(0, 75)
        while other_img_id == img_id:
            other_img_id = random.randint(0, 75)

        other_url = f"https://xsgames.co/randomusers/assets/avatars/{gender_str}/{other_img_id}.jpg"
        sql_statements.append(
            f"INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = '{username}'), '{other_url}', FALSE);"
        )

with open("seed_data.sql", "w") as f:
    f.write("\n".join(sql_statements))

print("Seed data generated in seed_data.sql using Faker")
