CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE glucose_readings (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    reading_date DATE NOT NULL,

    slot VARCHAR(30) NOT NULL
        CHECK (
            slot IN (
                'morning_fasting',
                'after_breakfast',
                'after_lunch',
                'after_dinner'
            )
        ),

    glucose_level INTEGER NOT NULL
        CHECK (glucose_level BETWEEN 40 AND 600),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, reading_date, slot)
);