// lib/db.js
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDb = async () => {
  try {
    // Users table
    await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      user_type VARCHAR(20) CHECK (user_type IN ('student', 'employer', 'admin')),
      full_name VARCHAR(255),
      phone VARCHAR(50),
      bio TEXT,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
    `);

    // Students profile
    await pool.query(`
    CREATE TABLE student_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      institution VARCHAR(255),
      degree VARCHAR(100),
      field_of_study VARCHAR(255),
      graduation_year INTEGER,
      skills TEXT[],
      resume_url VARCHAR(500),
      experience TEXT
  )
    `);

    // Employers profile
    await pool.query(`
    CREATE TABLE employer_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      company_name VARCHAR(255),
      industry VARCHAR(255),
      company_size VARCHAR(100),
      website VARCHAR(255)
  )
    `);

    // Jobs table
    await pool.query(`
    CREATE TABLE jobs (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      requirements JSONB,
      location VARCHAR(255),
      job_type VARCHAR(50),
      salary_range VARCHAR(100),
      is_active BOOLEAN DEFAULT true,
      is_approved BOOLEAN DEFAULT false,
      is_promoted BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
    `);

    // Applications table
    await pool.query(`
    CREATE TABLE applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id),
      student_id INTEGER REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'pending',
      match_score INTEGER,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )  
    `);

    // Subscriptions table

    await pool.query(`
    CREATE TABLE subscriptions (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER REFERENCES users(id),
      plan_type VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP
  )
    `);

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
};

initDb();

export default pool;
