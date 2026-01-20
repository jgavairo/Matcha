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


-- Interests table --------------------------------------------------------------

CREATE TABLE interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO interests (name) VALUES 
('Travel'), ('Music'), ('Movies'), ('Reading'), ('Sports'), 
('Cooking'), ('Photography'), ('Gaming'), ('Art'), ('Technology');


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
    verification_token_expires TIMESTAMP,
    latitude FLOAT,
    longitude FLOAT,
    city VARCHAR(100),
    geolocation_consent BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_connection TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);


-- User Interests table --------------------------------------------------------------

CREATE TABLE user_interests (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    interest_id INT REFERENCES interests(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, interest_id)
);


-- Images table --------------------------------------------------------------

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    is_profile_picture BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);


-- INSERT DEBUG USER --------------------------------------------------------------

INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, status_id, latitude, longitude, city, geolocation_consent) VALUES ('test@test.com', 'Sarko', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Sarkozy', 'Test', '1990-01-01', 1, 2, 48.8566, 2.3522, 'Paris', TRUE);


-- Likes table --------------------------------------------------------------

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    liker_id INT REFERENCES users(id) ON DELETE CASCADE,
    liked_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(liker_id, liked_id)
);


-- Matches table --------------------------------------------------------------

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user_id_1 INT REFERENCES users(id),
    user_id_2 INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id_1, user_id_2)
);


-- Dislikes table --------------------------------------------------------------

CREATE TABLE dislikes (
    id SERIAL PRIMARY KEY,
    disliker_id INT REFERENCES users(id) ON DELETE CASCADE,
    disliked_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(disliker_id, disliked_id)
);


-- Blocks table --------------------------------------------------------------

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INT REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);


-- Views table --------------------------------------------------------------

CREATE TABLE views (
    id SERIAL PRIMARY KEY,
    viewer_id INT REFERENCES users(id) ON DELETE CASCADE,
    viewed_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table --------------------------------------------------------------

CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table --------------------------------------------------------------

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dates table --------------------------------------------------------------

CREATE TABLE dates (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    date_time TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reports table --------------------------------------------------------------

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    reported_id INT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table --------------------------------------------------------------

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INT REFERENCES users(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SEED DATA --------------------------------------------------------------
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('aiméebernard1@example.com', 'AiméeBernard1', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Aimée', 'Bernard', '1979-06-15', 2, '{1}', 45.726030959115874, 4.805671024876723, 'Lyon', 'Serrer corde instant quart trop passion.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméeBernard1'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméeBernard1'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméeBernard1'), 'https://xsgames.co/randomusers/assets/avatars/female/30.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméeBernard1'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('éricdos santos2@example.com', 'ÉricDos Santos2', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Éric', 'Dos Santos', '1993-06-21', 1, '{2}', 43.70870820753515, 7.2988192726229055, 'Nice', 'Sûr cours bras de sérieux.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricDos Santos2'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricDos Santos2'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricDos Santos2'), 'https://xsgames.co/randomusers/assets/avatars/male/35.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricDos Santos2'), 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricDos Santos2'), 'https://xsgames.co/randomusers/assets/avatars/male/10.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('étienneblanchet3@example.com', 'ÉtienneBlanchet3', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Étienne', 'Blanchet', '1990-11-09', 1, '{1}', 43.733354679160065, 7.244664706898672, 'Nice', 'Entraîner prouver moyen même. Revoir chemise inventer l''un transformer. Rendre observer rejoindre rompre instinct.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneBlanchet3'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneBlanchet3'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneBlanchet3'), 'https://xsgames.co/randomusers/assets/avatars/male/39.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneBlanchet3'), 'https://xsgames.co/randomusers/assets/avatars/male/67.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneBlanchet3'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('jérômelamy4@example.com', 'JérômeLamy4', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Jérôme', 'Lamy', '2002-06-05', 1, '{2}', 45.790405963088816, 4.842473040069096, 'Lyon', 'Bout crier ailleurs. Exister être règle instinct. Découvrir envoyer train sens gauche.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 'https://xsgames.co/randomusers/assets/avatars/male/48.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JérômeLamy4'), 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('juliengomez5@example.com', 'JulienGomez5', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Julien', 'Gomez', '1978-06-11', 1, '{2}', 44.838006740862404, -0.5649176410627393, 'Bordeaux', 'Distinguer but auteur ne art. Face sept or fatigue contenter.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 'https://xsgames.co/randomusers/assets/avatars/male/54.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 'https://xsgames.co/randomusers/assets/avatars/male/59.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienGomez5'), 'https://xsgames.co/randomusers/assets/avatars/male/24.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('danielletoussaint6@example.com', 'DanielleToussaint6', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Danielle', 'Toussaint', '1987-07-29', 2, '{1}', 48.59376805184581, 7.79366651806716, 'Strasbourg', 'Sens arrière sommet. Étudier indiquer trésor couleur foi fauteuil voir reculer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DanielleToussaint6'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DanielleToussaint6'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DanielleToussaint6'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DanielleToussaint6'), 'https://xsgames.co/randomusers/assets/avatars/female/43.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('mathildebouvet7@example.com', 'MathildeBouvet7', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Mathilde', 'Bouvet', '1993-03-11', 2, '{1}', 45.74323573518344, 4.838978773790564, 'Lyon', 'Grave cruel garçon beau difficile. Erreur vers veille histoire herbe.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MathildeBouvet7'), 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('patrickmaillet8@example.com', 'PatrickMaillet8', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Patrick', 'Maillet', '1997-02-03', 1, '{2}', 43.33381263498775, 5.389348311877632, 'Marseille', 'Loup agent envie blanc aile. Science demi intelligence presser auquel grave loup.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickMaillet8'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickMaillet8'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickMaillet8'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickMaillet8'), 'https://xsgames.co/randomusers/assets/avatars/male/27.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickMaillet8'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margotaubry9@example.com', 'MargotAubry9', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margot', 'Aubry', '2003-03-02', 2, '{1}', 48.81049719307079, 2.37667845585777, 'Paris', 'Appartenir but derrière vieillard chat. Puis situation froid dangereux course intelligence long écraser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 'https://xsgames.co/randomusers/assets/avatars/female/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 'https://xsgames.co/randomusers/assets/avatars/female/0.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotAubry9'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marcellehardy10@example.com', 'MarcelleHardy10', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marcelle', 'Hardy', '1996-11-11', 2, '{1,3}', 43.65684612864709, 3.840102633109986, 'Montpellier', 'Partout bientôt inconnu camarade. Politique selon tard exprimer soumettre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 'https://xsgames.co/randomusers/assets/avatars/female/48.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 'https://xsgames.co/randomusers/assets/avatars/female/0.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleHardy10'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('étienneschneider11@example.com', 'ÉtienneSchneider11', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Étienne', 'Schneider', '1992-01-11', 1, '{2}', 45.760970486362346, 4.822495195181579, 'Lyon', 'Toujours ajouter avance rose sentiment. Vin ciel enfant intéresser. Dangereux problème marcher regretter.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneSchneider11'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneSchneider11'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneSchneider11'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneSchneider11'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneSchneider11'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('victorlecoq12@example.com', 'VictorLecoq12', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Victor', 'Lecoq', '2001-10-05', 1, '{1,2}', 50.602971557115524, 3.0850731532061366, 'Lille', 'Tuer joli tour. Métier devant dieu choisir prier pouvoir trace.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 'https://xsgames.co/randomusers/assets/avatars/male/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 'https://xsgames.co/randomusers/assets/avatars/male/27.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 'https://xsgames.co/randomusers/assets/avatars/male/25.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorLecoq12'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('juliedidier13@example.com', 'JulieDidier13', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Julie', 'Didier', '1982-05-06', 2, '{1}', 43.60917549714588, 3.911049577507871, 'Montpellier', 'Séparer seuil bord protéger jeu remonter. Côte ancien chaîne reculer toujours fenêtre. Environ que paysage.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 'https://xsgames.co/randomusers/assets/avatars/female/27.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieDidier13'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('élisenavarro14@example.com', 'ÉliseNavarro14', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Élise', 'Navarro', '2002-12-29', 2, '{1}', 43.605874886533165, 3.872042072607803, 'Montpellier', 'Riche cesser pauvre. Honte moins droit fumer billet.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉliseNavarro14'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉliseNavarro14'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉliseNavarro14'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉliseNavarro14'), 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉliseNavarro14'), 'https://xsgames.co/randomusers/assets/avatars/female/6.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('guydidier15@example.com', 'GuyDidier15', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Guy', 'Didier', '2006-11-05', 1, '{2}', 43.73291599037703, 7.259582395761779, 'Nice', 'Signer puissant drame beaux aller traverser jusque. Changement plaisir recommencer tapis sou.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GuyDidier15'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyDidier15'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyDidier15'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyDidier15'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyDidier15'), 'https://xsgames.co/randomusers/assets/avatars/male/26.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('carolinepaul16@example.com', 'CarolinePaul16', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Caroline', 'Paul', '1993-01-08', 2, '{1}', 43.62416198401881, 3.8912919159766535, 'Montpellier', 'Étude soi le ni. Point baisser user dont lui livrer profiter loin. Classe étude fatiguer faute sourd rouler.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 'https://xsgames.co/randomusers/assets/avatars/female/68.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolinePaul16'), 'https://xsgames.co/randomusers/assets/avatars/female/27.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gilbertguillon17@example.com', 'GilbertGuillon17', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilbert', 'Guillon', '1997-03-21', 1, '{1,2}', 48.57239789888807, 7.781788679419237, 'Strasbourg', 'Neuf empire aspect goût ni cinquante accomplir. Le précieux son bout.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 'https://xsgames.co/randomusers/assets/avatars/male/48.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 'https://xsgames.co/randomusers/assets/avatars/male/0.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGuillon17'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('frédériquemeyer18@example.com', 'FrédériqueMeyer18', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Frédérique', 'Meyer', '1995-08-18', 2, '{1}', 50.62215415880224, 3.0766476851626385, 'Lille', 'Changement propos pont assez cent chaque femme. Rideau consulter courir rapide coucher claire. Fuir envie journée.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédériqueMeyer18'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédériqueMeyer18'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédériqueMeyer18'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrédériqueMeyer18'), 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrédériqueMeyer18'), 'https://xsgames.co/randomusers/assets/avatars/female/45.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('agnèsmasse19@example.com', 'AgnèsMasse19', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Agnès', 'Masse', '1985-07-14', 3, '{1,3}', 45.79359779162641, 4.827033513752718, 'Lyon', 'Espérer papier chez garçon réveiller tuer finir. Même composer mener épais.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 'https://xsgames.co/randomusers/assets/avatars/female/43.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AgnèsMasse19'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('adrienalves20@example.com', 'AdrienAlves20', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Adrien', 'Alves', '1978-02-16', 3, '{1,3}', 43.596982312088834, 1.4587854849883604, 'Toulouse', 'Courir tantôt engager étoile énorme manier importance. Froid pleurer dehors examiner reposer rapidement.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 'https://xsgames.co/randomusers/assets/avatars/male/71.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienAlves20'), 'https://xsgames.co/randomusers/assets/avatars/male/35.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('julieseguin21@example.com', 'JulieSeguin21', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Julie', 'Seguin', '1993-05-20', 2, '{1}', 50.580047729280615, 3.0392017417179984, 'Lille', 'Jeune lorsque angoisse rassurer troubler. Répondre vif fille. Pendre remplir juger arrivée éclat masse traiter.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulieSeguin21'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieSeguin21'), 'https://xsgames.co/randomusers/assets/avatars/female/68.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulieSeguin21'), 'https://xsgames.co/randomusers/assets/avatars/female/61.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('renémeyer22@example.com', 'RenéMeyer22', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'René', 'Meyer', '1994-10-13', 1, '{1,2,3}', 47.18399001799326, -1.5078552297874306, 'Nantes', 'Désirer volonté croire échapper rose miser. Cou dessus rouge. Pencher expliquer chercher. Bon public pour prendre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéMeyer22'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéMeyer22'), 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéMeyer22'), 'https://xsgames.co/randomusers/assets/avatars/male/53.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéMeyer22'), 'https://xsgames.co/randomusers/assets/avatars/male/68.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexandreguyon23@example.com', 'AlexandreGuyon23', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alexandre', 'Guyon', '1977-06-01', 1, '{1,2}', 43.5620719055274, 1.4802062079756337, 'Toulouse', 'Nous plus surveiller faux dessiner.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandreGuyon23'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandreGuyon23'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandreGuyon23'), 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('aurorevalentin24@example.com', 'AuroreValentin24', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Aurore', 'Valentin', '2000-05-04', 2, '{1}', 43.56639986720565, 3.863666552741483, 'Montpellier', 'Acheter même docteur proposer. Obtenir police oeil déclarer agir enfant savoir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AuroreValentin24'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('grégoirejacquot25@example.com', 'GrégoireJacquot25', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Grégoire', 'Jacquot', '1993-01-25', 1, '{1}', 50.65024331745141, 3.091784306789129, 'Lille', 'Herbe son attendre dessiner que. Annoncer beau milieu marcher.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GrégoireJacquot25'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GrégoireJacquot25'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GrégoireJacquot25'), 'https://xsgames.co/randomusers/assets/avatars/male/62.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GrégoireJacquot25'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('victordiallo26@example.com', 'VictorDiallo26', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Victor', 'Diallo', '1980-05-01', 1, '{2}', 48.60575773938263, 7.78383921662007, 'Strasbourg', 'Demain pénétrer honneur jeunesse mille. Prévenir marché simple répandre erreur et chaise étude.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 'https://xsgames.co/randomusers/assets/avatars/male/27.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 'https://xsgames.co/randomusers/assets/avatars/male/52.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorDiallo26'), 'https://xsgames.co/randomusers/assets/avatars/male/0.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('olivierguillot27@example.com', 'OlivierGuillot27', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Olivier', 'Guillot', '2001-01-31', 1, '{2}', 48.8823570237992, 2.387154098680698, 'Paris', 'Avancer or attention servir. Oeil continuer toucher découvrir construire tout. Cour prince acte paquet abri planche.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OlivierGuillot27'), 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('nathpottier28@example.com', 'NathPottier28', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Nath', 'Pottier', '1983-04-19', 2, '{1,2}', 48.610668736246694, 7.7912079254270985, 'Strasbourg', 'Droit côte enlever table user. Ce préparer père chef histoire chaise.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathPottier28'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathPottier28'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathPottier28'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathPottier28'), 'https://xsgames.co/randomusers/assets/avatars/female/69.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathPottier28'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('paulinedelahaye29@example.com', 'PaulineDelahaye29', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Pauline', 'Delahaye', '1991-06-05', 2, '{1}', 48.815807618320335, 2.333298767665014, 'Paris', 'Gens vieillard système blanc livrer droite de. Saisir prière paquet l''une visage. Charger pluie importer envoyer vie.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineDelahaye29'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('chantallebrun30@example.com', 'ChantalLebrun30', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Chantal', 'Lebrun', '1997-12-05', 2, '{1}', 43.608892805494676, 3.909705399008515, 'Montpellier', 'Chemin petit transformer accorder. Coucher gros quatre foi. Colon pourtant guerre tête.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 'https://xsgames.co/randomusers/assets/avatars/female/63.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChantalLebrun30'), 'https://xsgames.co/randomusers/assets/avatars/female/8.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('théophileloiseau31@example.com', 'ThéophileLoiseau31', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Théophile', 'Loiseau', '1998-09-14', 1, '{1}', 48.88696186694852, 2.316892988100459, 'Paris', 'Lever lettre dégager bientôt. Étaler comme lit français.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 'https://xsgames.co/randomusers/assets/avatars/male/46.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéophileLoiseau31'), 'https://xsgames.co/randomusers/assets/avatars/male/30.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('patrickleclercq32@example.com', 'PatrickLeclercq32', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Patrick', 'Leclercq', '2004-04-03', 1, '{2}', 48.82396420992394, 2.3918570952026053, 'Paris', 'Mari visage suite oncle décrire éclat. Place poids entretenir douter. Trou vérité plaine présence recueillir officier.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickLeclercq32'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickLeclercq32'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickLeclercq32'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickLeclercq32'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickLeclercq32'), 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('annebrunet33@example.com', 'AnneBrunet33', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Anne', 'Brunet', '1999-05-22', 2, '{1}', 47.24492970424985, -1.5908723114791012, 'Nantes', 'Faveur début sourire sein arrêter continuer. Mal propre victime étudier endroit servir. Tenter sourire devoir eau.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnneBrunet33'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnneBrunet33'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnneBrunet33'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnneBrunet33'), 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('éricverdier34@example.com', 'ÉricVerdier34', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Éric', 'Verdier', '2003-03-20', 3, '{2,3}', 44.80510148184975, -0.620804700281897, 'Bordeaux', 'Surveiller mauvais livre cesse aucun. Valeur après cerveau mouvement. Libre blanc regretter but.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricVerdier34'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricVerdier34'), 'https://xsgames.co/randomusers/assets/avatars/male/68.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricVerdier34'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('rolandmarin35@example.com', 'RolandMarin35', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Roland', 'Marin', '1986-12-28', 1, '{2}', 48.58612805633973, 7.743399319302603, 'Strasbourg', 'Passé inviter autrement condition remplir chez question. Reculer entrer couper digne notre jeune composer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandMarin35'), 'https://xsgames.co/randomusers/assets/avatars/male/62.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('lorrainehuet36@example.com', 'LorraineHuet36', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Lorraine', 'Huet', '1976-12-24', 2, '{1}', 43.57066736773717, 3.869279695546677, 'Montpellier', 'Joindre gauche direction résister. Trouver anglais attendre déclarer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LorraineHuet36'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LorraineHuet36'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LorraineHuet36'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LorraineHuet36'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LorraineHuet36'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('denisroger37@example.com', 'DenisRoger37', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Denis', 'Roger', '1999-01-27', 1, '{1}', 43.29814481279802, 5.408747441061017, 'Marseille', 'Parmi muet entier dieu rouler. Danser curieux détruire tout colline. Si payer entourer long parfois moyen rouge.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 'https://xsgames.co/randomusers/assets/avatars/male/37.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DenisRoger37'), 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('philippinerobin38@example.com', 'PhilippineRobin38', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Philippine', 'Robin', '1979-10-15', 2, '{1}', 44.872772422656006, -0.6159770488019707, 'Bordeaux', 'Fumée lendemain droite cacher faute étranger auteur. Revenir étude douceur lentement alors genou ton.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 'https://xsgames.co/randomusers/assets/avatars/female/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineRobin38'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margauxbonnin39@example.com', 'MargauxBonnin39', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaux', 'Bonnin', '2005-07-04', 2, '{1}', 43.70571082636831, 7.282579782672674, 'Nice', 'Seigneur hôtel ami accent apprendre élément. Plante preuve perdre âme céder. Moyen grâce oreille presque nommer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxBonnin39'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxBonnin39'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxBonnin39'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('thibaultfernandez40@example.com', 'ThibaultFernandez40', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Thibault', 'Fernandez', '1996-07-05', 1, '{2}', 43.59318321145992, 3.828108429519523, 'Montpellier', 'Pluie partager chance déclarer beaux. Mêler ci françois frapper.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThibaultFernandez40'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThibaultFernandez40'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThibaultFernandez40'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThibaultFernandez40'), 'https://xsgames.co/randomusers/assets/avatars/male/53.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThibaultFernandez40'), 'https://xsgames.co/randomusers/assets/avatars/male/66.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marcellegirard41@example.com', 'MarcelleGirard41', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marcelle', 'Girard', '1995-09-11', 2, '{1}', 43.31587816256851, 5.380644661168381, 'Marseille', 'D''Autres avoir sourire chaque que haut. Que fils événement à pur.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleGirard41'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleGirard41'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleGirard41'), 'https://xsgames.co/randomusers/assets/avatars/female/41.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleGirard41'), 'https://xsgames.co/randomusers/assets/avatars/female/31.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('charlotteraymond42@example.com', 'CharlotteRaymond42', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Charlotte', 'Raymond', '1979-11-21', 2, '{1}', 43.61356790237685, 1.4222042086353186, 'Toulouse', 'Sur retrouver intérieur partout mince réserver victime. Servir jeu simplement établir pensée homme.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CharlotteRaymond42'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CharlotteRaymond42'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CharlotteRaymond42'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CharlotteRaymond42'), 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CharlotteRaymond42'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('françoislaunay43@example.com', 'FrançoisLaunay43', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'François', 'Launay', '1976-07-25', 1, '{1,2}', 43.73938595386586, 7.242109818838863, 'Nice', 'Musique côté beaux. Réfléchir robe quant à.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 'https://xsgames.co/randomusers/assets/avatars/male/66.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLaunay43'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('ériclejeune44@example.com', 'ÉricLejeune44', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Éric', 'Lejeune', '1994-04-02', 1, '{2}', 43.63031612436368, 3.8999317875392787, 'Montpellier', 'Avant assister mur ensemble détail embrasser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricLejeune44'), 'https://xsgames.co/randomusers/assets/avatars/male/55.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('noémichauveau45@example.com', 'NoémiChauveau45', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Noémi', 'Chauveau', '1977-05-28', 2, '{1}', 48.8400653447729, 2.3151329683993285, 'Paris', 'Commencer fatiguer mur représenter on. Maintenir entre départ situation.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NoémiChauveau45'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NoémiChauveau45'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NoémiChauveau45'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NoémiChauveau45'), 'https://xsgames.co/randomusers/assets/avatars/female/65.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NoémiChauveau45'), 'https://xsgames.co/randomusers/assets/avatars/female/72.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('antoinettepotier46@example.com', 'AntoinettePotier46', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Antoinette', 'Potier', '1986-08-22', 2, '{1}', 45.78151374489985, 4.804000577995107, 'Lyon', 'Social ouvrage ni année lentement. Peau vêtement dominer quel verser emporter après. Long bientôt vers entier général.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AntoinettePotier46'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AntoinettePotier46'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AntoinettePotier46'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AntoinettePotier46'), 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('stéphaniechevallier47@example.com', 'StéphanieChevallier47', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Stéphanie', 'Chevallier', '1987-07-14', 2, '{1}', 43.59946415783841, 3.870886614865716, 'Montpellier', 'Lier mieux dans si. Malgré exprimer oncle obtenir chemise d''abord cercle étudier.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 'https://xsgames.co/randomusers/assets/avatars/female/46.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieChevallier47'), 'https://xsgames.co/randomusers/assets/avatars/female/69.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margotrousseau48@example.com', 'MargotRousseau48', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margot', 'Rousseau', '2003-01-03', 2, '{2}', 45.75224585006077, 4.8591693807475025, 'Lyon', 'Ensemble l''un article pointe bois haïr. Dès mentir plan colline. Signer plonger pointe plusieurs souhaiter médecin.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 'https://xsgames.co/randomusers/assets/avatars/female/14.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotRousseau48'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gillesguyot49@example.com', 'GillesGuyot49', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilles', 'Guyot', '2007-08-19', 1, '{2}', 43.75195860836787, 7.215034143635217, 'Nice', 'Sien rapidement minute tard tout. Cheval queue nature eaux voici pourtant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 'https://xsgames.co/randomusers/assets/avatars/male/10.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 'https://xsgames.co/randomusers/assets/avatars/male/31.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGuyot49'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('paulineraynaud50@example.com', 'PaulineRaynaud50', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Pauline', 'Raynaud', '1997-08-06', 2, '{1}', 45.79775041520329, 4.817339987773188, 'Lyon', 'Que quatre espérer claire emmener hauteur.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineRaynaud50'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('jeanrodrigues51@example.com', 'JeanRodrigues51', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Jean', 'Rodrigues', '2002-06-21', 1, '{1,2,3}', 45.73528575912171, 4.817179197413327, 'Lyon', 'Nécessaire pluie autre suivre terrible. Tête sortir fond.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JeanRodrigues51'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeanRodrigues51'), 'https://xsgames.co/randomusers/assets/avatars/male/55.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeanRodrigues51'), 'https://xsgames.co/randomusers/assets/avatars/male/47.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeanRodrigues51'), 'https://xsgames.co/randomusers/assets/avatars/male/47.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeanRodrigues51'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('davidlemonnier52@example.com', 'DavidLemonnier52', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'David', 'Lemonnier', '1988-12-06', 1, '{2}', 50.58372774627987, 3.016537329543577, 'Lille', 'Usage ressembler douze foule seuil tout. Compagnie cesse jeu étage long arrivée.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 'https://xsgames.co/randomusers/assets/avatars/male/55.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 'https://xsgames.co/randomusers/assets/avatars/male/71.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidLemonnier52'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('sabinejoly53@example.com', 'SabineJoly53', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Sabine', 'Joly', '1981-09-08', 2, '{1,2,3}', 48.535348061983925, 7.704493574347928, 'Strasbourg', 'Voilà que continuer approcher glace.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineJoly53'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineJoly53'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineJoly53'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexandredeschamps54@example.com', 'AlexandreDeschamps54', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alexandre', 'Deschamps', '1984-05-25', 1, '{2}', 43.618888043722514, 3.9144377037561595, 'Montpellier', 'Emporter pain tombe comment lune. Mari fatiguer résister soir. Roche conscience reconnaître.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandreDeschamps54'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandreDeschamps54'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandreDeschamps54'), 'https://xsgames.co/randomusers/assets/avatars/male/9.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alfredrivière55@example.com', 'AlfredRivière55', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alfred', 'Rivière', '1978-06-17', 1, '{2}', 50.6605519804461, 3.0546902617979046, 'Lille', 'Douter accorder à transformer chien gagner. Demeurer parcourir paupière seulement jeune occasion.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlfredRivière55'), 'https://xsgames.co/randomusers/assets/avatars/male/10.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('valérieleroy56@example.com', 'ValérieLeroy56', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Valérie', 'Leroy', '1989-04-04', 2, '{1}', 48.88055638616051, 2.3599247266334915, 'Paris', 'Signe dès vague vent voile. Car petit sur passer puis toile oeuvre quatre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ValérieLeroy56'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alaincoste57@example.com', 'AlainCoste57', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alain', 'Coste', '1979-03-24', 1, '{2}', 47.245007645520104, -1.5714483661975251, 'Nantes', 'Avancer frère cours voie bien marcher. Être savoir divers quand violent mener eh. Employer âgé quand fort briser loup.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainCoste57'), 'https://xsgames.co/randomusers/assets/avatars/male/26.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('jacquesbertin58@example.com', 'JacquesBertin58', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Jacques', 'Bertin', '1991-06-08', 1, '{2}', 43.27214187548154, 5.344531946709178, 'Marseille', 'Rare essuyer sauter chemise. Blond annoncer entre nommer heure route. Surtout complet dresser. Mur riche brûler tout.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JacquesBertin58'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesBertin58'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesBertin58'), 'https://xsgames.co/randomusers/assets/avatars/male/56.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesBertin58'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('océanecohen59@example.com', 'OcéaneCohen59', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Océane', 'Cohen', '2003-06-02', 2, '{1}', 43.5653000334071, 3.8735797247002552, 'Montpellier', 'Répandre droit parmi marier. Voix rayon trembler risquer fixer peu fixe.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'OcéaneCohen59'), 'https://xsgames.co/randomusers/assets/avatars/female/57.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('honorébourdon60@example.com', 'HonoréBourdon60', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Honoré', 'Bourdon', '1994-08-14', 1, '{2}', 44.84131279570172, -0.5656781807434044, 'Bordeaux', 'Satisfaire alors lors escalier. Mien passé lequel politique passer dans blanc. Nombreux profiter moi matière décider.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 'https://xsgames.co/randomusers/assets/avatars/male/70.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréBourdon60'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexandriegrégoire61@example.com', 'AlexandrieGrégoire61', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alexandrie', 'Grégoire', '2004-05-04', 2, '{2}', 43.634772287318235, 1.4698540904754596, 'Toulouse', 'Arrière savoir plan. Aventure ruine taille détruire remettre. Français devant semaine au auprès.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandrieGrégoire61'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandrieGrégoire61'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandrieGrégoire61'), 'https://xsgames.co/randomusers/assets/avatars/female/63.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandrieGrégoire61'), 'https://xsgames.co/randomusers/assets/avatars/female/55.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('stéphaniemallet62@example.com', 'StéphanieMallet62', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Stéphanie', 'Mallet', '1989-09-27', 2, '{1,2,3}', 45.769558927801285, 4.882296815855394, 'Lyon', 'Femme banc spectacle tranquille rose lumière chiffre. Ligne remercier titre dernier veille.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieMallet62'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'StéphanieMallet62'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieMallet62'), 'https://xsgames.co/randomusers/assets/avatars/female/22.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'StéphanieMallet62'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margaudmace63@example.com', 'MargaudMace63', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaud', 'Mace', '2005-02-17', 2, '{1}', 43.723069945054014, 7.280346315563896, 'Nice', 'Début armer source genre. Couleur partir plonger y. Forêt beaucoup douter bientôt.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 'https://xsgames.co/randomusers/assets/avatars/female/11.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaudMace63'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('georgeslaunay64@example.com', 'GeorgesLaunay64', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Georges', 'Launay', '2000-03-27', 1, '{2}', 43.31625523234303, 5.4137468154660535, 'Marseille', 'Vers suivant sommet minute devoir public vide prison. Bon peser gris passé vivant représenter prier autour.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GeorgesLaunay64'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('andréguillet65@example.com', 'AndréGuillet65', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'André', 'Guillet', '1991-01-26', 1, '{2}', 48.84703452917027, 2.350505524620685, 'Paris', 'Avec coûter prendre but forêt votre. Attendre rang monter révolution soin âge.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréGuillet65'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréGuillet65'), 'https://xsgames.co/randomusers/assets/avatars/male/60.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréGuillet65'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréGuillet65'), 'https://xsgames.co/randomusers/assets/avatars/male/7.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréGuillet65'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('carolineturpin66@example.com', 'CarolineTurpin66', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Caroline', 'Turpin', '1976-12-13', 2, '{2}', 47.177430333308955, -1.5411341698062173, 'Nantes', 'Animer prier capable. Quel battre mensonge tirer dangereux. Sable creuser bas éloigner fier gauche cent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolineTurpin66'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineTurpin66'), 'https://xsgames.co/randomusers/assets/avatars/female/18.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineTurpin66'), 'https://xsgames.co/randomusers/assets/avatars/female/14.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineTurpin66'), 'https://xsgames.co/randomusers/assets/avatars/female/67.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineTurpin66'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('élisabethpelletier67@example.com', 'ÉlisabethPelletier67', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Élisabeth', 'Pelletier', '1980-03-12', 2, '{1}', 48.53686437340473, 7.769573283250938, 'Strasbourg', 'Guère quatre principe nature garçon. Passé rocher plaindre quel hasard. Accord capable parler science rideau.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉlisabethPelletier67'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉlisabethPelletier67'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉlisabethPelletier67'), 'https://xsgames.co/randomusers/assets/avatars/female/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉlisabethPelletier67'), 'https://xsgames.co/randomusers/assets/avatars/female/70.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('victortanguy68@example.com', 'VictorTanguy68', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Victor', 'Tanguy', '2007-09-03', 1, '{2}', 43.62570777785507, 1.4178032613205869, 'Toulouse', 'Oser étouffer étage émotion suivant bleu mon minute. Cher peser pourquoi dehors ci intelligence vision.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorTanguy68'), 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marinetexier69@example.com', 'MarineTexier69', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marine', 'Texier', '1992-01-18', 2, '{1,3}', 43.29594473447717, 5.366390257625904, 'Marseille', 'Elle lune exprimer puis brusquement rose. Condamner si champ auprès devoir respecter.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineTexier69'), 'https://xsgames.co/randomusers/assets/avatars/female/58.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('dominiquepoirier70@example.com', 'DominiquePoirier70', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Dominique', 'Poirier', '1991-03-06', 3, '{1}', 43.65446126759532, 1.426826114804547, 'Toulouse', 'À rejeter arrivée fruit mot. Yeux cheveu dehors immense.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 'https://xsgames.co/randomusers/assets/avatars/female/54.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DominiquePoirier70'), 'https://xsgames.co/randomusers/assets/avatars/female/18.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('daniellepottier71@example.com', 'DaniellePottier71', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Danielle', 'Pottier', '1995-11-12', 2, '{1}', 50.60602842422283, 3.072208957238559, 'Lille', 'Mer gloire révolution bonheur tranquille honneur. Habiter appartenir riche gouvernement bonheur.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DaniellePottier71'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DaniellePottier71'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DaniellePottier71'), 'https://xsgames.co/randomusers/assets/avatars/female/23.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DaniellePottier71'), 'https://xsgames.co/randomusers/assets/avatars/female/52.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('frédériclabbé72@example.com', 'FrédéricLabbé72', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Frédéric', 'Labbé', '1998-07-25', 1, '{2}', 48.88701411227175, 2.370982590075378, 'Paris', 'Tout fatiguer cesser pays vide. Auprès monde si règle fort. Poésie je soit nuit conclure nez charge retrouver.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédéricLabbé72'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédéricLabbé72'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrédéricLabbé72'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrédéricLabbé72'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrédéricLabbé72'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gérardcoulon73@example.com', 'GérardCoulon73', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gérard', 'Coulon', '1994-07-26', 3, '{1,2,3}', 43.63570067638561, 3.9217249356336823, 'Montpellier', 'Tuer sourire saisir détacher espace unique écouter. Étude pénétrer hors jardin marier.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 'https://xsgames.co/randomusers/assets/avatars/male/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardCoulon73'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('andréegaillard74@example.com', 'AndréeGaillard74', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Andrée', 'Gaillard', '1979-08-04', 2, '{2}', 48.842248425773924, 2.3297752634145237, 'Paris', 'Tromper calme frapper parler jour mériter. Plante nouveau sûr mais haïr. Million protéger enfin établir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréeGaillard74'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeGaillard74'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeGaillard74'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeGaillard74'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('emmanuellepons75@example.com', 'EmmanuellePons75', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Emmanuelle', 'Pons', '1992-05-13', 2, '{1}', 48.621541014361796, 7.790092864638836, 'Strasbourg', 'Jamais école rire confiance droite scène plaine. Système lors double. Danser aucun présence absence drôle entretenir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuellePons75'), 'https://xsgames.co/randomusers/assets/avatars/female/43.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('rogerlejeune76@example.com', 'RogerLejeune76', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Roger', 'Lejeune', '2005-03-08', 3, '{2,3}', 45.72261016992479, 4.845525894146044, 'Lyon', 'Repousser esprit marche content. Tantôt tu ou enfin.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RogerLejeune76'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('victoiremasse77@example.com', 'VictoireMasse77', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Victoire', 'Masse', '2005-06-03', 2, '{1}', 45.73764240218032, 4.853183150309602, 'Lyon', 'Signe serrer cinquante. Désir trente avec action.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictoireMasse77'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictoireMasse77'), 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictoireMasse77'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictoireMasse77'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('benoîtlabbé78@example.com', 'BenoîtLabbé78', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Benoît', 'Labbé', '1980-02-26', 1, '{1}', 45.78917847287342, 4.8141924299923815, 'Lyon', 'Envelopper manquer calmer rappeler haut. Membre traverser sourire décrire autour empêcher commander.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtLabbé78'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtLabbé78'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtLabbé78'), 'https://xsgames.co/randomusers/assets/avatars/male/41.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtLabbé78'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtLabbé78'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('christinebonneau79@example.com', 'ChristineBonneau79', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Christine', 'Bonneau', '1993-12-28', 2, '{1}', 48.89939385305924, 2.338774623543975, 'Paris', 'Libre nuage fort sueur mariage tenir étendue. Chasse fumer mur frais sept remercier.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 'https://xsgames.co/randomusers/assets/avatars/female/56.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristineBonneau79'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('camilledupont80@example.com', 'CamilleDupont80', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Camille', 'Dupont', '1994-09-24', 3, '{1}', 43.60680748488375, 3.8821356225186205, 'Montpellier', 'Propre froid apparaître plutôt dormir course. Ancien retourner toucher. Garde bas nouveau intérieur dos joue animal.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 'https://xsgames.co/randomusers/assets/avatars/female/33.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 'https://xsgames.co/randomusers/assets/avatars/female/72.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleDupont80'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('inèsjacques81@example.com', 'InèsJacques81', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Inès', 'Jacques', '1978-12-23', 2, '{1}', 43.74078985151884, 7.298672738449119, 'Nice', 'Marchand taille existence derrière goutte glisser. Promener crise attendre moment agent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'InèsJacques81'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'InèsJacques81'), 'https://xsgames.co/randomusers/assets/avatars/female/41.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'InèsJacques81'), 'https://xsgames.co/randomusers/assets/avatars/female/31.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'InèsJacques81'), 'https://xsgames.co/randomusers/assets/avatars/female/54.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('michellemorin82@example.com', 'MichelleMorin82', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Michelle', 'Morin', '1995-09-27', 2, '{1}', 43.58292657394313, 3.914481111915896, 'Montpellier', 'Calmer voie exister franchir donc petit ancien tapis. Changement moins avis pauvre magnifique depuis.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMorin82'), 'https://xsgames.co/randomusers/assets/avatars/female/5.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('arthurcoulon83@example.com', 'ArthurCoulon83', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Arthur', 'Coulon', '1998-01-14', 1, '{2}', 48.90240708137844, 2.372043141549617, 'Paris', 'Point miser souffrance. Côte personne bleu françois.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 'https://xsgames.co/randomusers/assets/avatars/male/15.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurCoulon83'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexandriaperez84@example.com', 'AlexandriaPerez84', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alexandria', 'Perez', '1988-10-20', 2, '{1}', 50.63135376854222, 3.0985804588960235, 'Lille', 'Énergie presque dehors vert. Dégager voix hiver réel réveiller lumière.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandriaPerez84'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandriaPerez84'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexandriaPerez84'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandriaPerez84'), 'https://xsgames.co/randomusers/assets/avatars/female/6.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexandriaPerez84'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('nathaliebaudry85@example.com', 'NathalieBaudry85', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Nathalie', 'Baudry', '1987-08-19', 2, '{1,2}', 50.61635073306368, 3.049243571522231, 'Lille', 'Réflexion semaine faible soudain soi inutile. Achever lieu sous retirer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathalieBaudry85'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathalieBaudry85'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathalieBaudry85'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieBaudry85'), 'https://xsgames.co/randomusers/assets/avatars/female/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieBaudry85'), 'https://xsgames.co/randomusers/assets/avatars/female/51.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('sabinecoulon86@example.com', 'SabineCoulon86', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Sabine', 'Coulon', '2002-04-21', 2, '{1}', 43.67214792996401, 7.253535842557413, 'Nice', 'Environ cerveau fidèle agir danger tâche. Armée rien fonction sauvage. Visage blanc social jamais.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 'https://xsgames.co/randomusers/assets/avatars/female/51.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineCoulon86'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('benoîtguillon87@example.com', 'BenoîtGuillon87', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Benoît', 'Guillon', '1994-11-13', 1, '{2}', 45.75445617683466, 4.819159554424203, 'Lyon', 'Causer puissance étonner journal justice. Fortune route reposer cruel sortir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtGuillon87'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtGuillon87'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtGuillon87'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtGuillon87'), 'https://xsgames.co/randomusers/assets/avatars/male/70.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtGuillon87'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('paulinealexandre88@example.com', 'PaulineAlexandre88', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Pauline', 'Alexandre', '1987-03-20', 2, '{1}', 45.75450543544711, 4.880004631912415, 'Lyon', 'Ventre emmener en vrai preuve or. Car garder nouveau étaler. Par demande billet.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 'https://xsgames.co/randomusers/assets/avatars/female/70.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulineAlexandre88'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('bernadettelucas89@example.com', 'BernadetteLucas89', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Bernadette', 'Lucas', '1978-08-12', 2, '{1}', 45.74927162150074, 4.847674581560209, 'Lyon', 'Cuisine reposer plusieurs autre. Savoir dire hauteur mort rapport précipiter demain.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 'https://xsgames.co/randomusers/assets/avatars/female/73.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteLucas89'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('henriettegiraud90@example.com', 'HenrietteGiraud90', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Henriette', 'Giraud', '1993-06-28', 2, '{1}', 43.27963592294815, 5.352599676882427, 'Marseille', 'Mourir construire pain coin pousser depuis confondre ça. Solitude occasion long voici.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HenrietteGiraud90'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HenrietteGiraud90'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HenrietteGiraud90'), 'https://xsgames.co/randomusers/assets/avatars/female/14.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HenrietteGiraud90'), 'https://xsgames.co/randomusers/assets/avatars/female/8.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('davidde oliveira91@example.com', 'DavidDe Oliveira91', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'David', 'De Oliveira', '1980-10-07', 3, '{1,2}', 48.83815614619382, 2.396246357024598, 'Paris', 'Annoncer beau bon puis rouge abri créer. Genre découvrir immobile nouveau plaire avant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 'https://xsgames.co/randomusers/assets/avatars/male/59.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 'https://xsgames.co/randomusers/assets/avatars/male/49.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'DavidDe Oliveira91'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexlopez92@example.com', 'AlexLopez92', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alex', 'Lopez', '1995-09-10', 2, '{1}', 47.2189568741915, -1.529719991189448, 'Nantes', 'Bleu éternel flamme aimer. Départ bureau songer ruine. Avec habitant montagne droite souvenir vouloir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 'https://xsgames.co/randomusers/assets/avatars/female/0.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexLopez92'), 'https://xsgames.co/randomusers/assets/avatars/female/30.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('nathalieguillot93@example.com', 'NathalieGuillot93', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Nathalie', 'Guillot', '2006-03-30', 3, '{1,2,3}', 48.89058385817195, 2.3869008623293126, 'Paris', 'Enfant intéresser désert résultat dont cela. Souvenir soleil cinq étendue vague étonner pouvoir tandis que.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 'https://xsgames.co/randomusers/assets/avatars/female/55.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 'https://xsgames.co/randomusers/assets/avatars/female/54.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NathalieGuillot93'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('laurentmace94@example.com', 'LaurentMace94', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Laurent', 'Mace', '1985-04-01', 1, '{2}', 45.7914287968401, 4.861191378578911, 'Lyon', 'Après double veiller. Vert durant grand surtout choisir expérience. Raison apprendre front là chant reculer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 'https://xsgames.co/randomusers/assets/avatars/male/7.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 'https://xsgames.co/randomusers/assets/avatars/male/67.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentMace94'), 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('théodorelemonnier95@example.com', 'ThéodoreLemonnier95', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Théodore', 'Lemonnier', '2001-12-19', 1, '{2}', 43.56195362855523, 3.8482076727787446, 'Montpellier', 'Militaire immobile long rideau appeler ville. Commander marcher payer non quitter. Loin obéir mari doucement fil.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 'https://xsgames.co/randomusers/assets/avatars/male/0.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 'https://xsgames.co/randomusers/assets/avatars/male/47.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThéodoreLemonnier95'), 'https://xsgames.co/randomusers/assets/avatars/male/25.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('philippinehuet96@example.com', 'PhilippineHuet96', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Philippine', 'Huet', '1985-04-01', 2, '{1,2,3}', 43.624953649721306, 1.4834023389678441, 'Toulouse', 'Pied haïr faux y amour demeurer. Âme parvenir général éclat. Bête métier travail.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineHuet96'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippineHuet96'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineHuet96'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineHuet96'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippineHuet96'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marinepeltier97@example.com', 'MarinePeltier97', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marine', 'Peltier', '1998-02-23', 2, '{2}', 48.8875259301559, 2.324941628053625, 'Paris', 'Coin froid détail long. Recommencer réflexion heure complètement. Connaître position fine françois traiter désirer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarinePeltier97'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarinePeltier97'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarinePeltier97'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarinePeltier97'), 'https://xsgames.co/randomusers/assets/avatars/female/31.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarinePeltier97'), 'https://xsgames.co/randomusers/assets/avatars/female/62.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('patrickregnier98@example.com', 'PatrickRegnier98', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Patrick', 'Regnier', '2005-07-29', 1, '{2}', 47.24948306675614, -1.5799327690486122, 'Nantes', 'Reposer compagnon bout écraser. Revenir armée soleil briser claire tapis.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 'https://xsgames.co/randomusers/assets/avatars/male/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PatrickRegnier98'), 'https://xsgames.co/randomusers/assets/avatars/male/52.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('williamevrard99@example.com', 'WilliamEvrard99', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'William', 'Evrard', '1980-02-10', 1, '{2,3}', 43.5815850060342, 3.8638267510512496, 'Montpellier', 'Rose détail place agir voici l''un gouvernement. Somme flot ton entraîner rapidement discours offrir siècle.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamEvrard99'), 'https://xsgames.co/randomusers/assets/avatars/male/53.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('christianegarcia100@example.com', 'ChristianeGarcia100', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Christiane', 'Garcia', '1989-02-15', 2, '{1}', 43.649565642233554, 1.4049741099734294, 'Toulouse', 'Signe leur repas venir habitude appeler sourire. Ton sueur gloire suffire ombre avant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristianeGarcia100'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('andréesamson101@example.com', 'AndréeSamson101', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Andrée', 'Samson', '1992-11-16', 2, '{1}', 48.82134174400422, 2.3883769361751646, 'Paris', 'Gloire idée sentiment verre anglais poids. Soirée chaise si toute même.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréeSamson101'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeSamson101'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeSamson101'), 'https://xsgames.co/randomusers/assets/avatars/female/41.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeSamson101'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréeSamson101'), 'https://xsgames.co/randomusers/assets/avatars/female/49.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('timothéecharpentier102@example.com', 'TimothéeCharpentier102', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Timothée', 'Charpentier', '1992-06-20', 1, '{1}', 43.69990707435688, 7.266448929667437, 'Nice', 'Vêtement avenir pointe l''une. Pays suivre voir carte fusil. Trouver remarquer en rire.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'TimothéeCharpentier102'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'TimothéeCharpentier102'), 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'TimothéeCharpentier102'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'TimothéeCharpentier102'), 'https://xsgames.co/randomusers/assets/avatars/male/52.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('émileroux103@example.com', 'ÉmileRoux103', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Émile', 'Roux', '1995-07-26', 1, '{2}', 45.71631066867927, 4.800437050120266, 'Lyon', 'Poste conclure venir certes faux. Mode front sommeil portier.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉmileRoux103'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉmileRoux103'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉmileRoux103'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('raymondhardy104@example.com', 'RaymondHardy104', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Raymond', 'Hardy', '1989-01-07', 1, '{2}', 48.8590110031389, 2.308896929476708, 'Paris', 'Pourquoi blanc doux remettre serrer ressembler. Me envoyer compter affaire. Afin De compagnie environ.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RaymondHardy104'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RaymondHardy104'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RaymondHardy104'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RaymondHardy104'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('timothéegimenez105@example.com', 'TimothéeGimenez105', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Timothée', 'Gimenez', '1983-09-17', 1, '{1,2}', 43.257668576010516, 5.358012482949866, 'Marseille', 'François entretenir poursuivre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'TimothéeGimenez105'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'TimothéeGimenez105'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'TimothéeGimenez105'), 'https://xsgames.co/randomusers/assets/avatars/male/18.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'TimothéeGimenez105'), 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('madeleinebègue106@example.com', 'MadeleineBègue106', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Madeleine', 'Bègue', '1994-09-22', 3, '{2,3}', 47.24160508751466, -1.5410948848085797, 'Nantes', 'Nation désir aussitôt enfoncer franc accompagner. Vers dehors peuple présent propre. Accent avec feu été choix comme.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 'https://xsgames.co/randomusers/assets/avatars/female/50.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MadeleineBègue106'), 'https://xsgames.co/randomusers/assets/avatars/female/45.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('philippebodin107@example.com', 'PhilippeBodin107', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Philippe', 'Bodin', '1995-12-09', 1, '{2}', 47.25512475688396, -1.5613767800950495, 'Nantes', 'Envelopper robe règle visite ce être. Durant noir âme autour même officier autrement changement.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippeBodin107'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PhilippeBodin107'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippeBodin107'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PhilippeBodin107'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('étiennecamus108@example.com', 'ÉtienneCamus108', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Étienne', 'Camus', '1984-04-02', 1, '{2}', 43.63459131862305, 3.841586254080477, 'Montpellier', 'Fine prière prétendre longtemps qui rêve table. Membre oh l''une. Énergie âme campagne raconter fil avance.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 'https://xsgames.co/randomusers/assets/avatars/male/71.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 'https://xsgames.co/randomusers/assets/avatars/male/8.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉtienneCamus108'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('isabellegrenier109@example.com', 'IsabelleGrenier109', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Isabelle', 'Grenier', '1993-10-01', 2, '{1}', 44.84139418568114, -0.619485312533454, 'Bordeaux', 'Compagnon secret second paysan jeune. Effacer saison départ auteur absolument caractère mais. Prêter conseil boire.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'IsabelleGrenier109'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'IsabelleGrenier109'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'IsabelleGrenier109'), 'https://xsgames.co/randomusers/assets/avatars/female/54.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'IsabelleGrenier109'), 'https://xsgames.co/randomusers/assets/avatars/female/62.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('renéelaunay110@example.com', 'RenéeLaunay110', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Renée', 'Launay', '1986-10-31', 2, '{1}', 45.78432696162747, 4.839383228665105, 'Lyon', 'Saint trace dehors quoi. Avouer veille haute ça. Veille entrée convenir voyage.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéeLaunay110'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéeLaunay110'), 'https://xsgames.co/randomusers/assets/avatars/female/54.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéeLaunay110'), 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéeLaunay110'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéeLaunay110'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('jeanninefontaine111@example.com', 'JeannineFontaine111', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Jeannine', 'Fontaine', '1998-01-05', 3, '{1,2,3}', 45.78848350061066, 4.8015622228914205, 'Lyon', 'Volonté fermer flamme bras siège nécessaire. Creuser vue bleu carte mentir étranger. Choisir peur rouler gris.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 'https://xsgames.co/randomusers/assets/avatars/female/43.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 'https://xsgames.co/randomusers/assets/avatars/female/65.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 'https://xsgames.co/randomusers/assets/avatars/female/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JeannineFontaine111'), 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('christopheallard112@example.com', 'ChristopheAllard112', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Christophe', 'Allard', '2000-10-21', 1, '{1,2}', 43.75547057362568, 7.301566690309235, 'Nice', 'Lieu voyage poursuivre. Plante quelque complet appeler.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheAllard112'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('anastasiedevaux113@example.com', 'AnastasieDevaux113', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Anastasie', 'Devaux', '1983-06-25', 2, '{1,2,3}', 48.53493117794356, 7.794358079229188, 'Strasbourg', 'Plein partie poésie bande on champ. Marché affaire plaindre direction sol.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDevaux113'), 'https://xsgames.co/randomusers/assets/avatars/female/8.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('luciegonzalez114@example.com', 'LucieGonzalez114', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Lucie', 'Gonzalez', '1981-11-04', 3, '{1,2,3}', 48.53365336323033, 7.782263071177056, 'Strasbourg', 'Départ curiosité long fortune. Queue condamner pleurer penser cours étendue bras parole.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucieGonzalez114'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucieGonzalez114'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucieGonzalez114'), 'https://xsgames.co/randomusers/assets/avatars/female/67.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucieGonzalez114'), 'https://xsgames.co/randomusers/assets/avatars/female/35.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucieGonzalez114'), 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('éricrossi115@example.com', 'ÉricRossi115', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Éric', 'Rossi', '1978-06-25', 1, '{2}', 50.65141522072937, 3.053056475419655, 'Lille', 'Pointe admettre ferme paysan. Montagne mourir mon instant pas bas. Pur pénétrer voie côté brûler.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricRossi115'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricRossi115'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉricRossi115'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricRossi115'), 'https://xsgames.co/randomusers/assets/avatars/male/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉricRossi115'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('susanalves116@example.com', 'SusanAlves116', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Susan', 'Alves', '1988-03-01', 2, '{1}', 50.64491782065084, 3.0753512689097358, 'Lille', 'Terre blanc vite. Forme accepter écraser appartement.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SusanAlves116'), 'https://xsgames.co/randomusers/assets/avatars/female/69.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('célinemonnier117@example.com', 'CélineMonnier117', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Céline', 'Monnier', '2004-11-21', 2, '{1}', 48.880119032273925, 2.379531447763697, 'Paris', 'Terre mouvement l''un soldat rouge quartier dos mer. Tuer tel vert docteur envie causer digne.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineMonnier117'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineMonnier117'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélineMonnier117'), 'https://xsgames.co/randomusers/assets/avatars/female/66.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélineMonnier117'), 'https://xsgames.co/randomusers/assets/avatars/female/37.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alainmartel118@example.com', 'AlainMartel118', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alain', 'Martel', '1978-08-19', 1, '{2}', 44.81362633880164, -0.5904960826662817, 'Bordeaux', 'Haut dur rencontre en. Vieil monsieur assurer reprendre enfoncer roi comment. Mauvais bien faire.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlainMartel118'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainMartel118'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainMartel118'), 'https://xsgames.co/randomusers/assets/avatars/male/23.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainMartel118'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlainMartel118'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gilbertbertin119@example.com', 'GilbertBertin119', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilbert', 'Bertin', '1993-01-25', 1, '{2}', 48.584193686487716, 7.782632928512998, 'Strasbourg', 'Plaindre selon famille acheter apporter acheter occasion. Vraiment espace apercevoir parce que franc système étude.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertBertin119'), 'https://xsgames.co/randomusers/assets/avatars/male/33.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('jacquesrousset120@example.com', 'JacquesRousset120', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Jacques', 'Rousset', '2003-11-02', 1, '{2}', 48.841065909131785, 2.313940886699486, 'Paris', 'Dresser pouvoir arme exemple demain. Arrêter soulever pain or.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 'https://xsgames.co/randomusers/assets/avatars/male/37.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JacquesRousset120'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('anaïspons121@example.com', 'AnaïsPons121', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Anaïs', 'Pons', '1998-09-26', 2, '{1}', 43.56722817485266, 3.911224159399708, 'Montpellier', 'Machine demeurer maintenant acheter. Soldat noir campagne placer. Absence nombreux quelque chaise.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 'https://xsgames.co/randomusers/assets/avatars/female/66.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnaïsPons121'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marcelleimbert122@example.com', 'MarcelleImbert122', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marcelle', 'Imbert', '1988-07-28', 2, '{1}', 50.63734598858639, 3.0079362495531905, 'Lille', 'Bande peser beau beauté terreur. Commun poser dégager étudier. Croiser obéir habiller angoisse prévoir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelleImbert122'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('renégauthier123@example.com', 'RenéGauthier123', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'René', 'Gauthier', '1986-10-01', 1, '{2}', 45.74832270453413, 4.875355686349761, 'Lyon', 'Surtout branche préparer espérer mine vent. Agent milieu soin riche dur chant argent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RenéGauthier123'), 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('victorcosta124@example.com', 'VictorCosta124', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Victor', 'Costa', '1996-03-01', 3, '{1}', 50.64097784688542, 3.022486608430565, 'Lille', 'Pourtant dessus dehors signe attendre. Fait idée allumer rapide habiller. Auquel prier nord franc.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 'https://xsgames.co/randomusers/assets/avatars/male/49.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 'https://xsgames.co/randomusers/assets/avatars/male/70.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VictorCosta124'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('rolandlecomte125@example.com', 'RolandLecomte125', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Roland', 'Lecomte', '1985-01-31', 1, '{1}', 43.70379719039679, 7.275970217688409, 'Nice', 'Peser trembler verser garder vieux. Accuser fine arrivée phrase.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RolandLecomte125'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RolandLecomte125'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandLecomte125'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RolandLecomte125'), 'https://xsgames.co/randomusers/assets/avatars/male/41.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('suzannepires126@example.com', 'SuzannePires126', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Suzanne', 'Pires', '1990-05-07', 2, '{1}', 45.74043125947481, 4.8802363645376845, 'Lyon', 'Car sou gros endroit dresser emmener manquer. Premier effort dent. Entourer larme aller.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SuzannePires126'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SuzannePires126'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SuzannePires126'), 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SuzannePires126'), 'https://xsgames.co/randomusers/assets/avatars/female/49.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SuzannePires126'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margaretblanchet127@example.com', 'MargaretBlanchet127', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaret', 'Blanchet', '2002-03-02', 2, '{1}', 43.34175504421284, 5.343706525772477, 'Marseille', 'Professeur pénétrer papier calme. Nord entier baisser fort.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaretBlanchet127'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretBlanchet127'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretBlanchet127'), 'https://xsgames.co/randomusers/assets/avatars/female/2.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretBlanchet127'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('anastasiedidier128@example.com', 'AnastasieDidier128', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Anastasie', 'Didier', '1992-04-11', 2, '{1}', 48.58605192721702, 7.756438990777169, 'Strasbourg', 'L''Une trouver bout lequel décrire matin folie scène. Branche mentir sein poitrine.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 'https://xsgames.co/randomusers/assets/avatars/female/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnastasieDidier128'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marinejacob129@example.com', 'MarineJacob129', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marine', 'Jacob', '2007-07-30', 3, '{1,3}', 44.87190187687314, -0.6193805117840624, 'Bordeaux', 'Précipiter surprendre compte assister doucement. Naître pénétrer jardin voler.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarineJacob129'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineJacob129'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineJacob129'), 'https://xsgames.co/randomusers/assets/avatars/female/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarineJacob129'), 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gérardrodrigues130@example.com', 'GérardRodrigues130', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gérard', 'Rodrigues', '1986-05-06', 1, '{1,2}', 43.26072755247324, 5.364351479026835, 'Marseille', 'Marier pouvoir épais blond indiquer interroger réussir. Soutenir important autrement horizon mode effacer l''un.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 'https://xsgames.co/randomusers/assets/avatars/male/27.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 'https://xsgames.co/randomusers/assets/avatars/male/30.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GérardRodrigues130'), 'https://xsgames.co/randomusers/assets/avatars/male/35.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('françoisledoux131@example.com', 'FrançoisLedoux131', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'François', 'Ledoux', '1985-11-14', 1, '{2}', 43.264110508392086, 5.41586269006242, 'Marseille', 'Peau rappeler juger d''autres autrement ce. Haïr cinquante certes humain réveiller geste près.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 'https://xsgames.co/randomusers/assets/avatars/male/66.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 'https://xsgames.co/randomusers/assets/avatars/male/7.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 'https://xsgames.co/randomusers/assets/avatars/male/30.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'FrançoisLedoux131'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('célinaclerc132@example.com', 'CélinaClerc132', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Célina', 'Clerc', '2005-12-14', 2, '{1}', 43.332509017895774, 5.395100740808477, 'Marseille', 'Oncle mieux obtenir essayer devoir commun. Parti quartier pont. Mensonge rêve pierre choix lueur quelque.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 'https://xsgames.co/randomusers/assets/avatars/female/47.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélinaClerc132'), 'https://xsgames.co/randomusers/assets/avatars/female/37.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gillesgros133@example.com', 'GillesGros133', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilles', 'Gros', '1988-05-20', 1, '{2}', 45.806085264126544, 4.831135549627481, 'Lyon', 'Discuter ailleurs sommeil sur bas. Faute marquer hôtel fin naître grand sauver. Lui minute vouloir celui cause.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesGros133'), 'https://xsgames.co/randomusers/assets/avatars/male/67.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('arthurde sousa134@example.com', 'ArthurDe Sousa134', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Arthur', 'De Sousa', '1993-03-15', 1, '{2}', 45.78423338831759, 4.870744493425247, 'Lyon', 'Lui accomplir plaindre. Propos français yeux leur.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 'https://xsgames.co/randomusers/assets/avatars/male/65.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurDe Sousa134'), 'https://xsgames.co/randomusers/assets/avatars/male/41.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('christopherobin135@example.com', 'ChristopheRobin135', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Christophe', 'Robin', '1989-01-28', 1, '{2}', 43.58722273742821, 1.4567896272594527, 'Toulouse', 'Blond reconnaître mettre doute étudier autant roi muet. Printemps nuage dix grand croix peser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristopheRobin135'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristopheRobin135'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheRobin135'), 'https://xsgames.co/randomusers/assets/avatars/male/0.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristopheRobin135'), 'https://xsgames.co/randomusers/assets/avatars/male/56.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('alexdelmas136@example.com', 'AlexDelmas136', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Alex', 'Delmas', '1975-04-14', 2, '{1}', 43.63522282551564, 3.835650069071868, 'Montpellier', 'Calme terrain rayon inquiétude riche. Expression face pourquoi obliger moment.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 'https://xsgames.co/randomusers/assets/avatars/female/44.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 'https://xsgames.co/randomusers/assets/avatars/female/50.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AlexDelmas136'), 'https://xsgames.co/randomusers/assets/avatars/female/62.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('josettevalentin137@example.com', 'JosetteValentin137', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Josette', 'Valentin', '1981-09-06', 2, '{2}', 47.250807962445066, -1.6029677563688558, 'Nantes', 'Sourire un ramasser quoi départ circonstance.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 'https://xsgames.co/randomusers/assets/avatars/female/51.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JosetteValentin137'), 'https://xsgames.co/randomusers/assets/avatars/female/46.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('thierryfabre138@example.com', 'ThierryFabre138', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Thierry', 'Fabre', '1988-03-07', 1, '{1}', 43.32724248428911, 5.347356500668082, 'Marseille', 'Pluie discours tache vieillard brûler route. Fort temps prononcer chef projet. Feuille exprimer image cabinet on fumée.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryFabre138'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryFabre138'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryFabre138'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryFabre138'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryFabre138'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('audreyseguin139@example.com', 'AudreySeguin139', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Audrey', 'Seguin', '1979-07-24', 2, '{1}', 43.59135024944979, 1.493644652109111, 'Toulouse', 'Mal supporter cependant justice. Plus ferme heure neuf sauvage. Danser fort rire relever coucher.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AudreySeguin139'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AudreySeguin139'), 'https://xsgames.co/randomusers/assets/avatars/female/59.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AudreySeguin139'), 'https://xsgames.co/randomusers/assets/avatars/female/61.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AudreySeguin139'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('thierryguillaume140@example.com', 'ThierryGuillaume140', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Thierry', 'Guillaume', '1977-05-08', 1, '{2}', 47.25493644753133, -1.5235757743931226, 'Nantes', 'Air barbe bureau voiture livrer. Tâche saluer lutte pont.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 'https://xsgames.co/randomusers/assets/avatars/male/35.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 'https://xsgames.co/randomusers/assets/avatars/male/69.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryGuillaume140'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('camillefaure141@example.com', 'CamilleFaure141', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Camille', 'Faure', '1989-10-08', 2, '{1,2}', 44.81622397715607, -0.6126835846906851, 'Bordeaux', 'Jeu avant perdre ainsi surtout.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 'https://xsgames.co/randomusers/assets/avatars/female/24.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 'https://xsgames.co/randomusers/assets/avatars/female/6.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CamilleFaure141'), 'https://xsgames.co/randomusers/assets/avatars/female/15.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('christianeroux142@example.com', 'ChristianeRoux142', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Christiane', 'Roux', '1991-06-10', 2, '{1}', 43.70586023671074, 7.297141832618762, 'Nice', 'Joue chien dangereux terreur bande quarante. Éviter existence personne dehors salle vite. Si que tout depuis secret.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeRoux142'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ChristianeRoux142'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristianeRoux142'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ChristianeRoux142'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('aimélagarde143@example.com', 'AiméLagarde143', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Aimé', 'Lagarde', '1994-04-04', 1, '{2}', 44.80038559161929, -0.6140698677993623, 'Bordeaux', 'Inquiéter tirer nouveau sable chance oser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 'https://xsgames.co/randomusers/assets/avatars/male/9.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméLagarde143'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('claudewagner144@example.com', 'ClaudeWagner144', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Claude', 'Wagner', '1977-05-11', 2, '{1,2,3}', 50.674506072501636, 3.012438619750423, 'Lille', 'Choix ramasser tourner discussion planche figure. Chat troubler établir courant aile.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ClaudeWagner144'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ClaudeWagner144'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ClaudeWagner144'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ClaudeWagner144'), 'https://xsgames.co/randomusers/assets/avatars/female/43.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('henrijacob145@example.com', 'HenriJacob145', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Henri', 'Jacob', '1978-06-03', 1, '{2}', 43.62979070921868, 3.871641302027513, 'Montpellier', 'Entrée palais disparaître inspirer ligne. Entendre souvent arrivée cercle. Figurer lequel nuage tombe.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HenriJacob145'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HenriJacob145'), 'https://xsgames.co/randomusers/assets/avatars/male/10.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HenriJacob145'), 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HenriJacob145'), 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('zoébecker146@example.com', 'ZoéBecker146', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Zoé', 'Becker', '2006-06-05', 2, '{1}', 43.58070898787593, 3.9246947535610266, 'Montpellier', 'Bientôt fond loi drame heure. Droit défendre esprit tard impossible. Fin sauvage officier profond tapis quatre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 'https://xsgames.co/randomusers/assets/avatars/female/39.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ZoéBecker146'), 'https://xsgames.co/randomusers/assets/avatars/female/42.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gilbertgarcia147@example.com', 'GilbertGarcia147', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilbert', 'Garcia', '1988-09-05', 1, '{2}', 43.70702346764401, 7.296584932004597, 'Nice', 'Lire avance homme six mettre homme. Plaire perte obliger essayer. Réveiller que somme.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 'https://xsgames.co/randomusers/assets/avatars/male/29.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 'https://xsgames.co/randomusers/assets/avatars/male/54.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GilbertGarcia147'), 'https://xsgames.co/randomusers/assets/avatars/male/35.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('sabinecolin148@example.com', 'SabineColin148', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Sabine', 'Colin', '1980-01-09', 2, '{1}', 48.8729810083585, 2.391951810494472, 'Paris', 'Admettre chair nombre hauteur. Calmer valeur mois droite rendre rose. Chose sac quelque arracher.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineColin148'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'SabineColin148'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineColin148'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineColin148'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'SabineColin148'), 'https://xsgames.co/randomusers/assets/avatars/female/30.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margotcousin149@example.com', 'MargotCousin149', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margot', 'Cousin', '1987-10-14', 2, '{1,3}', 43.28523128021113, 5.3591182675524855, 'Marseille', 'Étudier cruel parent visite public. Bataille noire employer frais. Passé puis non vérité beaux avance arriver.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 'https://xsgames.co/randomusers/assets/avatars/female/52.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotCousin149'), 'https://xsgames.co/randomusers/assets/avatars/female/44.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margauxmary150@example.com', 'MargauxMary150', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaux', 'Mary', '1983-04-28', 2, '{2}', 50.62253733891197, 3.0758456907920797, 'Lille', 'Puissance parce que réfléchir mieux exemple ciel. Veille autorité particulier convenir toute joli cabinet affaire.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 'https://xsgames.co/randomusers/assets/avatars/female/50.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 'https://xsgames.co/randomusers/assets/avatars/female/29.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxMary150'), 'https://xsgames.co/randomusers/assets/avatars/female/63.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('laurentlambert151@example.com', 'LaurentLambert151', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Laurent', 'Lambert', '1977-09-24', 1, '{2}', 44.83974172810649, -0.5802567561790024, 'Bordeaux', 'Emmener problème longtemps herbe.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentLambert151'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentLambert151'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentLambert151'), 'https://xsgames.co/randomusers/assets/avatars/male/58.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentLambert151'), 'https://xsgames.co/randomusers/assets/avatars/male/42.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentLambert151'), 'https://xsgames.co/randomusers/assets/avatars/male/25.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('williambertrand152@example.com', 'WilliamBertrand152', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'William', 'Bertrand', '1993-11-30', 1, '{1,2}', 50.59761736513516, 3.0206645361939755, 'Lille', 'Rêver tuer signer remplir écouter pied. Avenir beaucoup franchir se assister.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 'https://xsgames.co/randomusers/assets/avatars/male/34.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 'https://xsgames.co/randomusers/assets/avatars/male/0.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'WilliamBertrand152'), 'https://xsgames.co/randomusers/assets/avatars/male/24.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('adriengirard153@example.com', 'AdrienGirard153', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Adrien', 'Girard', '1994-11-15', 1, '{2}', 50.67298464881117, 3.0547723082946496, 'Lille', 'Voix tout capable surprendre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdrienGirard153'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdrienGirard153'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienGirard153'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienGirard153'), 'https://xsgames.co/randomusers/assets/avatars/male/71.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdrienGirard153'), 'https://xsgames.co/randomusers/assets/avatars/male/33.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('édithboutin154@example.com', 'ÉdithBoutin154', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Édith', 'Boutin', '1990-03-29', 2, '{2}', 45.740017495404835, 4.8737379465126045, 'Lyon', 'Beaux muet tendre lequel non bientôt amuser. Présent arme figurer est seconde.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 'https://xsgames.co/randomusers/assets/avatars/female/45.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 'https://xsgames.co/randomusers/assets/avatars/female/46.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 'https://xsgames.co/randomusers/assets/avatars/female/56.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithBoutin154'), 'https://xsgames.co/randomusers/assets/avatars/female/50.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('aimédelahaye155@example.com', 'AiméDelahaye155', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Aimé', 'Delahaye', '1983-06-12', 1, '{2}', 48.57530286180322, 7.705451468742203, 'Strasbourg', 'Lorsque durant idée moi gauche espèce pas. Attacher plusieurs oh accent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AiméDelahaye155'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméDelahaye155'), 'https://xsgames.co/randomusers/assets/avatars/male/58.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AiméDelahaye155'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('michellegendre156@example.com', 'MichelLegendre156', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Michel', 'Legendre', '2004-12-17', 1, '{2}', 44.88215373121308, -0.5663661770329737, 'Bordeaux', 'Lueur lorsque lèvre paysage fou. Sombre moins condamner salut instinct marché. Siècle fou expliquer air traiter or.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 'https://xsgames.co/randomusers/assets/avatars/male/31.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelLegendre156'), 'https://xsgames.co/randomusers/assets/avatars/male/7.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('agnèslesage157@example.com', 'AgnèsLesage157', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Agnès', 'Lesage', '1997-08-28', 2, '{1}', 43.72737527565844, 7.220158051184873, 'Nice', 'Inspirer plein haute et fermer épais. Beau pierre docteur avoir écouter discussion. Nouveau hors éclater devant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 'https://xsgames.co/randomusers/assets/avatars/female/19.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AgnèsLesage157'), 'https://xsgames.co/randomusers/assets/avatars/female/0.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('laurentnavarro158@example.com', 'LaurentNavarro158', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Laurent', 'Navarro', '1998-09-28', 1, '{2}', 43.6471035707297, 3.891399064886305, 'Montpellier', 'Gouvernement militaire épais rencontre jeune entre poids. Appuyer défaut humain lever sommet joli.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LaurentNavarro158'), 'https://xsgames.co/randomusers/assets/avatars/male/34.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('arthurnavarro159@example.com', 'ArthurNavarro159', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Arthur', 'Navarro', '1980-06-01', 1, '{2}', 43.62099199937921, 1.4213344407571054, 'Toulouse', 'Pensée roche flot reconnaître parole. Depuis avis croix triste beaucoup professeur.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 'https://xsgames.co/randomusers/assets/avatars/male/14.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 'https://xsgames.co/randomusers/assets/avatars/male/20.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurNavarro159'), 'https://xsgames.co/randomusers/assets/avatars/male/52.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margotperrot160@example.com', 'MargotPerrot160', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margot', 'Perrot', '2004-08-12', 2, '{1}', 43.62621478164428, 1.4914613850351075, 'Toulouse', 'Ça fonction entraîner appuyer avec troubler. Frais soleil chose village. Nuit croix fuir cabinet esprit.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotPerrot160'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotPerrot160'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargotPerrot160'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotPerrot160'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargotPerrot160'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('célineblot161@example.com', 'CélineBlot161', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Céline', 'Blot', '1991-09-29', 2, '{1}', 48.899791110061365, 2.3135385629146024, 'Paris', 'Quelqu''Un pareil le sorte. Nature éprouver courant accomplir dur droit article. Rapidement conclure violent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 10);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CélineBlot161'), 'https://xsgames.co/randomusers/assets/avatars/female/65.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('guycordier162@example.com', 'GuyCordier162', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Guy', 'Cordier', '2002-12-16', 1, '{2}', 43.57646683420678, 3.868342000217256, 'Montpellier', 'Entrée tout paysage soudain reste forêt. Qualité habiter lentement plein clef.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GuyCordier162'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('pénélopeseguin163@example.com', 'PénélopeSeguin163', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Pénélope', 'Seguin', '1984-11-16', 2, '{1,2}', 48.87263815509506, 2.3522355264438697, 'Paris', 'Cerveau reste bon portier écouter croix préférer. Type ennemi votre mettre goût nez. Étranger pour relever.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PénélopeSeguin163'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PénélopeSeguin163'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PénélopeSeguin163'), 3);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PénélopeSeguin163'), 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PénélopeSeguin163'), 'https://xsgames.co/randomusers/assets/avatars/female/64.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('brigittegallet164@example.com', 'BrigitteGallet164', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Brigitte', 'Gallet', '1996-07-11', 2, '{1,2}', 48.86995903628026, 2.3971609228367896, 'Paris', 'Prévoir preuve dimanche remplir salle intérieur quel. Étranger siège roi montrer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 'https://xsgames.co/randomusers/assets/avatars/female/75.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 'https://xsgames.co/randomusers/assets/avatars/female/60.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigitteGallet164'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('bernardpetitjean165@example.com', 'BernardPetitjean165', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Bernard', 'Petitjean', '1977-04-26', 1, '{2}', 43.699306409614465, 7.29707362325605, 'Nice', 'Feuille français clair seulement certain. Près hier mériter franc intérieur riche pendant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 'https://xsgames.co/randomusers/assets/avatars/male/59.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 'https://xsgames.co/randomusers/assets/avatars/male/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 'https://xsgames.co/randomusers/assets/avatars/male/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardPetitjean165'), 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('adélaïdeblot166@example.com', 'AdélaïdeBlot166', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Adélaïde', 'Blot', '1992-07-27', 2, '{1}', 45.74217464637155, 4.811000102580251, 'Lyon', 'Mettre un rentrer respirer cercle. Personne fois queue sombre vieil. Chant rassurer rester glisser établir éclat.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 'https://xsgames.co/randomusers/assets/avatars/female/21.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 'https://xsgames.co/randomusers/assets/avatars/female/33.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdélaïdeBlot166'), 'https://xsgames.co/randomusers/assets/avatars/female/74.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('bernardchauvin167@example.com', 'BernardChauvin167', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Bernard', 'Chauvin', '2003-03-25', 3, '{1,2,3}', 48.847533092019574, 2.3897774590196126, 'Paris', 'Prince trait résister sens. Dans madame lumière main.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 'https://xsgames.co/randomusers/assets/avatars/male/38.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernardChauvin167'), 'https://xsgames.co/randomusers/assets/avatars/male/53.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('carolinerémy168@example.com', 'CarolineRémy168', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Caroline', 'Rémy', '1991-01-14', 2, '{1}', 43.720922371418524, 7.248925330927986, 'Nice', 'Avant avant davantage désert nuage représenter voisin. Approcher menacer compter un interrompre considérer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 'https://xsgames.co/randomusers/assets/avatars/female/17.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'CarolineRémy168'), 'https://xsgames.co/randomusers/assets/avatars/female/31.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('mauricedidier169@example.com', 'MauriceDidier169', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Maurice', 'Didier', '1982-04-06', 1, '{2}', 43.7312421792084, 7.239214471263661, 'Nice', 'Journal révolution vêtir contenir. Devoir lutte accent pitié. Reste joli pendant. Demeurer avant servir matière.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MauriceDidier169'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MauriceDidier169'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MauriceDidier169'), 'https://xsgames.co/randomusers/assets/avatars/male/36.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MauriceDidier169'), 'https://xsgames.co/randomusers/assets/avatars/male/13.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('vincenttorres170@example.com', 'VincentTorres170', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Vincent', 'Torres', '1988-02-06', 1, '{2,3}', 43.72986760384267, 7.23360067613198, 'Nice', 'Seconde toile prêt chaud guerre. Nerveux revoir paysage aider. Changement lier sable parce que acheter triste.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 'https://xsgames.co/randomusers/assets/avatars/male/48.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 'https://xsgames.co/randomusers/assets/avatars/male/45.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'VincentTorres170'), 'https://xsgames.co/randomusers/assets/avatars/male/67.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('benoîtmerle171@example.com', 'BenoîtMerle171', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Benoît', 'Merle', '1985-11-22', 1, '{2}', 44.789781129186274, -0.5385416760600312, 'Bordeaux', 'Forme détail vous air corde. Non sorte bleu main révéler mériter.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BenoîtMerle171'), 'https://xsgames.co/randomusers/assets/avatars/male/30.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('audreyroussel172@example.com', 'AudreyRoussel172', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Audrey', 'Roussel', '1994-03-29', 2, '{1}', 45.75776081537708, 4.811278792997634, 'Lyon', 'Rond taille prêt. Dent fil drame longtemps rejoindre puissance. Morceau avancer rayon vêtir corde banc champ.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AudreyRoussel172'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AudreyRoussel172'), 'https://xsgames.co/randomusers/assets/avatars/female/26.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AudreyRoussel172'), 'https://xsgames.co/randomusers/assets/avatars/female/28.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('léonmorvan173@example.com', 'LéonMorvan173', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Léon', 'Morvan', '1976-03-06', 1, '{1,2}', 44.82175678441881, -0.6139572854079474, 'Bordeaux', 'Bientôt retrouver assez on. Crainte qui présent science. Médecin chacun aucun voix unique.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LéonMorvan173'), 'https://xsgames.co/randomusers/assets/avatars/male/48.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('bernadettede sousa174@example.com', 'BernadetteDe Sousa174', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Bernadette', 'De Sousa', '1988-10-18', 2, '{1}', 44.843774519791424, -0.539615458798312, 'Bordeaux', 'Fin mieux taire. Nerveux village désespoir. Terrible cheveu échapper nu empêcher travailler nouveau savoir.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 'https://xsgames.co/randomusers/assets/avatars/female/32.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 'https://xsgames.co/randomusers/assets/avatars/female/63.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 'https://xsgames.co/randomusers/assets/avatars/female/33.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BernadetteDe Sousa174'), 'https://xsgames.co/randomusers/assets/avatars/female/23.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('astridmaillard175@example.com', 'AstridMaillard175', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Astrid', 'Maillard', '1976-02-19', 2, '{1,2}', 43.58410876824815, 1.4191244060417856, 'Toulouse', 'Que précéder visite nom revenir humain repas. Campagne soir interrompre titre passion avant.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AstridMaillard175'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AstridMaillard175'), 'https://xsgames.co/randomusers/assets/avatars/female/49.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AstridMaillard175'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('andrélebon176@example.com', 'AndréLebon176', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'André', 'Lebon', '1998-03-24', 1, '{1,2,3}', 44.87746678352676, -0.5437174010047151, 'Bordeaux', 'Rapide leur troubler haute tour troisième relever. Cher vif conscience commencer pied cause.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 1);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 7);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 'https://xsgames.co/randomusers/assets/avatars/male/26.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 'https://xsgames.co/randomusers/assets/avatars/male/65.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AndréLebon176'), 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('pauljacob177@example.com', 'PaulJacob177', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Paul', 'Jacob', '1988-10-28', 1, '{2}', 44.84612004394491, -0.5459744710408921, 'Bordeaux', 'Parfois assurer durer important espérer. Jambe saluer queue rien usage grave. Encore nom or entourer fusil travailler.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 'https://xsgames.co/randomusers/assets/avatars/male/58.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 'https://xsgames.co/randomusers/assets/avatars/male/72.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 'https://xsgames.co/randomusers/assets/avatars/male/29.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'PaulJacob177'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('gilleslévy178@example.com', 'GillesLévy178', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Gilles', 'Lévy', '1976-08-13', 1, '{1,2}', 48.59197487627166, 7.727561910789529, 'Strasbourg', 'Vert faim gloire sujet rendre habiller centre seulement.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 'https://xsgames.co/randomusers/assets/avatars/male/3.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 'https://xsgames.co/randomusers/assets/avatars/male/51.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 'https://xsgames.co/randomusers/assets/avatars/male/44.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'GillesLévy178'), 'https://xsgames.co/randomusers/assets/avatars/male/66.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('anoukhubert179@example.com', 'AnoukHubert179', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Anouk', 'Hubert', '1993-04-22', 2, '{1}', 43.33547496642672, 5.418085813865201, 'Marseille', 'Plante avant en règle dangereux écrire. Erreur somme quel employer sommeil un colère.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 'https://xsgames.co/randomusers/assets/avatars/female/36.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 'https://xsgames.co/randomusers/assets/avatars/female/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AnoukHubert179'), 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('thierrydelaunay180@example.com', 'ThierryDelaunay180', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Thierry', 'Delaunay', '2003-10-18', 1, '{2}', 43.74651395970796, 7.271956534603727, 'Nice', 'Sur besoin guère précieux. Te espérer saison bon. Service mieux confondre.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ThierryDelaunay180'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryDelaunay180'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ThierryDelaunay180'), 'https://xsgames.co/randomusers/assets/avatars/male/53.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('arthurperon181@example.com', 'ArthurPeron181', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Arthur', 'Peron', '1984-11-10', 1, '{2}', 43.292025964302084, 5.327613903842673, 'Marseille', 'Réponse saluer durer absolument. Falloir grand marier. Songer son chien. Sans droit vague hasard remplacer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 'https://xsgames.co/randomusers/assets/avatars/male/61.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ArthurPeron181'), 'https://xsgames.co/randomusers/assets/avatars/male/75.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('nicolasvalentin182@example.com', 'NicolasValentin182', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Nicolas', 'Valentin', '1987-11-17', 1, '{1,2,3}', 43.56186112726916, 1.4736566138583593, 'Toulouse', 'Choix soir tête figurer court cruel. Traverser juger brusquement cas.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 'https://xsgames.co/randomusers/assets/avatars/male/12.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 'https://xsgames.co/randomusers/assets/avatars/male/40.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolasValentin182'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margaretmarion183@example.com', 'MargaretMarion183', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaret', 'Marion', '2007-09-12', 2, '{1}', 43.62112764129149, 1.4940961246584625, 'Toulouse', 'Grâce cela montagne ni. Joli descendre mort chaque traîner réel parfois.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 'https://xsgames.co/randomusers/assets/avatars/female/46.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 'https://xsgames.co/randomusers/assets/avatars/female/67.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargaretMarion183'), 'https://xsgames.co/randomusers/assets/avatars/female/9.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('louisperez184@example.com', 'LouisPerez184', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Louis', 'Perez', '1995-08-15', 1, '{1,2}', 45.779539073210536, 4.869019861486435, 'Lyon', 'Passion instant avec confier élément. Blond partout type humain différent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 'https://xsgames.co/randomusers/assets/avatars/male/66.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 'https://xsgames.co/randomusers/assets/avatars/male/50.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 'https://xsgames.co/randomusers/assets/avatars/male/21.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LouisPerez184'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('emmanuelthibault185@example.com', 'EmmanuelThibault185', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Emmanuel', 'Thibault', '1980-06-25', 3, '{1,2,3}', 43.684894653363465, 7.272002143996541, 'Nice', 'Tant profiter payer. Extraordinaire façon élever dieu aile jeter rang rare.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 'https://xsgames.co/randomusers/assets/avatars/male/11.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'EmmanuelThibault185'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('luciede sousa186@example.com', 'LucieDe Sousa186', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Lucie', 'De Sousa', '2004-10-23', 2, '{1}', 50.63058032420919, 3.0187932369972126, 'Lille', 'Vin nord ramener expérience devant direction sien. Chercher chien plein obéir lisser. Signer retirer parfaitement gens.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucieDe Sousa186'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucieDe Sousa186'), 7);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucieDe Sousa186'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucieDe Sousa186'), 'https://xsgames.co/randomusers/assets/avatars/female/20.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucieDe Sousa186'), 'https://xsgames.co/randomusers/assets/avatars/female/45.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('adèleollivier187@example.com', 'AdèleOllivier187', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Adèle', 'Ollivier', '1985-10-04', 2, '{1,2,3}', 50.65446970736838, 3.0286168326484617, 'Lille', 'Davantage perdre anglais examiner. Tapis être autre vraiment pont humain.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AdèleOllivier187'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdèleOllivier187'), 'https://xsgames.co/randomusers/assets/avatars/female/5.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdèleOllivier187'), 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdèleOllivier187'), 'https://xsgames.co/randomusers/assets/avatars/female/52.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AdèleOllivier187'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('isaacjulien188@example.com', 'IsaacJulien188', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Isaac', 'Julien', '1990-11-20', 1, '{1,2,3}', 50.57951925989361, 3.022807254204889, 'Lille', 'Le naissance rang. Renverser malheur paquet chaise où fille presser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'IsaacJulien188'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'IsaacJulien188'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'IsaacJulien188'), 'https://xsgames.co/randomusers/assets/avatars/male/19.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'IsaacJulien188'), 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'IsaacJulien188'), 'https://xsgames.co/randomusers/assets/avatars/male/6.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('honorécolin189@example.com', 'HonoréColin189', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Honoré', 'Colin', '1990-12-15', 1, '{2}', 44.85348583630151, -0.5678095851309211, 'Bordeaux', 'Éviter grave particulier assurer. Jardin rare achever remettre. Foi brûler ami sens madame vague.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'HonoréColin189'), 1);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréColin189'), 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréColin189'), 'https://xsgames.co/randomusers/assets/avatars/male/22.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréColin189'), 'https://xsgames.co/randomusers/assets/avatars/male/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'HonoréColin189'), 'https://xsgames.co/randomusers/assets/avatars/male/43.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('julienhervé190@example.com', 'JulienHervé190', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Julien', 'Hervé', '1979-03-11', 1, '{2}', 48.873099928340935, 2.3248607703631774, 'Paris', 'Continuer est souvenir dépasser.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'JulienHervé190'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienHervé190'), 'https://xsgames.co/randomusers/assets/avatars/male/17.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienHervé190'), 'https://xsgames.co/randomusers/assets/avatars/male/29.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'JulienHervé190'), 'https://xsgames.co/randomusers/assets/avatars/male/5.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('margauxchauveau191@example.com', 'MargauxChauveau191', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Margaux', 'Chauveau', '2007-12-22', 2, '{1}', 43.61546936467996, 1.4878178218728468, 'Toulouse', 'Devenir silencieux interroger musique.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 'https://xsgames.co/randomusers/assets/avatars/female/4.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MargauxChauveau191'), 'https://xsgames.co/randomusers/assets/avatars/female/71.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('lucasgaudin192@example.com', 'LucasGaudin192', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Lucas', 'Gaudin', '2006-03-06', 1, '{2}', 50.6162135150032, 3.0894803748253166, 'Lille', 'Soulever se prêt donner soldat. Appartenir mauvais cesser bientôt rejeter avance justice.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 'https://xsgames.co/randomusers/assets/avatars/male/62.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 'https://xsgames.co/randomusers/assets/avatars/male/51.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 'https://xsgames.co/randomusers/assets/avatars/male/37.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'LucasGaudin192'), 'https://xsgames.co/randomusers/assets/avatars/male/63.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('nicolepineau193@example.com', 'NicolePineau193', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Nicole', 'Pineau', '1986-12-29', 2, '{1}', 48.81976439400587, 2.3872312581182618, 'Paris', 'Palais souffrance rôle achever hôtel larme. Armée prononcer expression avec dominer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 'https://xsgames.co/randomusers/assets/avatars/female/73.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'NicolePineau193'), 'https://xsgames.co/randomusers/assets/avatars/female/27.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('rémymichel194@example.com', 'RémyMichel194', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Rémy', 'Michel', '1985-03-05', 1, '{2}', 44.811541079265304, -0.5881624805270985, 'Bordeaux', 'Lèvre fier commander événement ciel planche vers. Interroger perte choisir phrase coin argent.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'RémyMichel194'), 5);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RémyMichel194'), 'https://xsgames.co/randomusers/assets/avatars/male/59.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RémyMichel194'), 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RémyMichel194'), 'https://xsgames.co/randomusers/assets/avatars/male/2.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'RémyMichel194'), 'https://xsgames.co/randomusers/assets/avatars/male/46.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('michellemasse195@example.com', 'MichelleMasse195', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Michelle', 'Masse', '1979-11-30', 2, '{2}', 48.85805658620107, 2.3475756599787547, 'Paris', 'Réfléchir mensonge comme doigt payer parent. Séparer conscience paysan remplacer.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelleMasse195'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MichelleMasse195'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMasse195'), 'https://xsgames.co/randomusers/assets/avatars/female/3.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MichelleMasse195'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('édithduval196@example.com', 'ÉdithDuval196', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Édith', 'Duval', '1982-08-31', 2, '{1}', 43.757339483027906, 7.22685001508087, 'Nice', 'Nombre ceci continuer lèvre plante.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 10);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 9);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 'https://xsgames.co/randomusers/assets/avatars/female/70.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 'https://xsgames.co/randomusers/assets/avatars/female/11.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 'https://xsgames.co/randomusers/assets/avatars/female/16.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'ÉdithDuval196'), 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('auréliebaron197@example.com', 'AurélieBaron197', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Aurélie', 'Baron', '1986-08-20', 2, '{1}', 50.663161067546135, 3.0162045450102686, 'Lille', 'Trou composer dresser. Rapide porte bientôt fuir vieux.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 5);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 4);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 8);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 'https://xsgames.co/randomusers/assets/avatars/female/27.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'AurélieBaron197'), 'https://xsgames.co/randomusers/assets/avatars/female/16.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marcelmeyer198@example.com', 'MarcelMeyer198', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marcel', 'Meyer', '1995-01-26', 1, '{2}', 48.88445531476849, 2.365427171088612, 'Paris', 'Vin français digne pauvre affirmer. Souffrir essuyer large clef. Enfoncer chef victime livre franchir lune en étage.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 8);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 4);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 'https://xsgames.co/randomusers/assets/avatars/male/40.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 'https://xsgames.co/randomusers/assets/avatars/male/39.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 'https://xsgames.co/randomusers/assets/avatars/male/24.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MarcelMeyer198'), 'https://xsgames.co/randomusers/assets/avatars/male/4.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('brigittepayet199@example.com', 'BrigittePayet199', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Brigitte', 'Payet', '1983-03-27', 2, '{2}', 47.21796564892012, -1.5963983803783117, 'Nantes', 'Monde froid magnifique main. Franchir détail ah question poète malheur blanc.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 6);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 9);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 3);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 2);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 'https://xsgames.co/randomusers/assets/avatars/female/25.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 'https://xsgames.co/randomusers/assets/avatars/female/64.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 'https://xsgames.co/randomusers/assets/avatars/female/34.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'BrigittePayet199'), 'https://xsgames.co/randomusers/assets/avatars/female/62.jpg', FALSE);
INSERT INTO users (email, username, password, first_name, last_name, birth_date, gender_id, sexual_preferences, latitude, longitude, city, biography, status_id) VALUES ('marthejoly200@example.com', 'MartheJoly200', '$2b$12$OrnPKRP9p2krMO.oHbOfqedcP40cWYCfT39FaIuQrKD3M4fysFdqm', 'Marthe', 'Joly', '1985-06-01', 2, '{1}', 50.64787089925673, 3.0157683365001984, 'Lille', 'Lune matin remplir intérieur silencieux. Carte doucement saison élément. Seulement absence reprendre bien voiture.', 2);
INSERT INTO user_interests (user_id, interest_id) VALUES ((SELECT id FROM users WHERE username = 'MartheJoly200'), 6);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MartheJoly200'), 'https://xsgames.co/randomusers/assets/avatars/female/10.jpg', TRUE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MartheJoly200'), 'https://xsgames.co/randomusers/assets/avatars/female/73.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MartheJoly200'), 'https://xsgames.co/randomusers/assets/avatars/female/13.jpg', FALSE);
INSERT INTO images (user_id, url, is_profile_picture) VALUES ((SELECT id FROM users WHERE username = 'MartheJoly200'), 'https://xsgames.co/randomusers/assets/avatars/female/70.jpg', FALSE);