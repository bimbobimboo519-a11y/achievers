-- Achievers University Portal Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'admin')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_first_login INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  matric_number TEXT UNIQUE,
  level TEXT DEFAULT '100L',
  programme TEXT,
  department TEXT,
  faculty TEXT,
  entry_session TEXT DEFAULT '2025/2026',
  academic_status TEXT DEFAULT 'Open',
  cgpa REAL DEFAULT 0.0,
  ctnu REAL DEFAULT 0.0,
  ctcp REAL DEFAULT 0.0,
  enrollment_status TEXT DEFAULT 'Incomplete',
  blood_group TEXT,
  genotype TEXT,
  hostel TEXT,
  projected_graduation TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  staff_id TEXT UNIQUE,
  designation TEXT,
  department TEXT,
  faculty TEXT,
  employment_date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  units INTEGER NOT NULL,
  semester TEXT CHECK(semester IN ('First', 'Second')),
  level TEXT,
  department TEXT
);

CREATE TABLE IF NOT EXISTS course_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  session TEXT DEFAULT '2025/2026',
  semester TEXT,
  status TEXT DEFAULT 'Registered',
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE(student_id, course_id, session, semester)
);

CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  session TEXT,
  semester TEXT,
  score REAL,
  grade TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  payment_type TEXT NOT NULL, -- school_fees, hostel, acceptance, etc.
  amount REAL NOT NULL,
  session TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Paid, Failed
  reference TEXT UNIQUE,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS email_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  requested_email TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  image_url TEXT,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_featured INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  audience TEXT DEFAULT 'All', -- All, Students, Staff
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
