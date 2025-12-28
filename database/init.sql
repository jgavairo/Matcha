-- Status table --------------------------------------------------------------

CREATE TABLE status (
    id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

INSERT INTO status (id, status_name) VALUES (0, 'NEW'), (1, 'VERIFIED'), (2, 'COMPLETED');


-- Genders table --------------------------------------------------------------

CREATE TABLE genders (
    id INT PRIMARY KEY,
    gender VARCHAR(50) NOT NULL
);

INSERT INTO genders (id, gender) VALUES (1, 'male'), (2, 'female'), (3, 'other');



-- Users table --------------------------------------------------------------

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    gender_id INT REFERENCES genders(id),
    sexual_preferences INT[] DEFAULT '{}',
    biography TEXT,
    status_id INT REFERENCES status(id) DEFAULT 0,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);


-- INSERT DEBUG USER --------------------------------------------------------------

INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id) VALUES ('test@test.com', 'Sarko', 'Nicolas', 'Sarkozy', 'Test', '1990-01-01', 1);
