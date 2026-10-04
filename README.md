# Achievers University – Official Website & Student/Staff Portal (Demo)

A modern multi-page university website with full student and staff portals for **Achievers University, Owo, Ondo State, Nigeria**.

Built as a complete demo with:

- Public website (Home, About, Programmes, News, Admissions, Contact)
- Student Portal (Dashboard, Profile, Course Registration, Results, Payments, Hostel, Official Email Request)
- Staff Portal (Profile & Dashboard)
- First-time login password creation flow
- SQLite database + Node.js/Express backend
- Classic green modern university theme matching Achievers brand colours

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Initialise the database (creates demo users & sample data)
npm run init-db

# 3. Start the server
npm start
```

Open **http://localhost:3000**

---

## Demo Accounts

| Role    | Email                                              | Password     | Notes                          |
|---------|----------------------------------------------------|--------------|--------------------------------|
| Student | `taiwo.boluwatife@student.achievers.edu.ng`        | `password123`| Ready to use                   |
| Student | `demo.student@student.achievers.edu.ng`            | *(create)*   | First-login → create password  |
| Staff   | `staff@achievers.edu.ng`                           | `password123`| Staff dashboard                |
| Admin   | `admin@achievers.edu.ng`                           | `password123`|                                |

---

## Features

### Public Site
- Homepage with hero, stats, news preview
- About, Programmes, News & Press Releases, Admissions, Contact pages
- Content based on real Achievers University information

### Student Portal (inspired by typical Nigerian university portals)
- Dashboard with CGPA, CTNU, CTCP, Ledger Balance, Enrollment Status
- Medical profile incomplete warning + update
- Official email request flow
- Course registration (First & Second Semester)
- Semester results
- Pay School Fees / Hostel Fee / Acceptance Fee (demo)
- Academic profile snapshot

### Staff Portal
- Profile view
- Quick actions dashboard

### Auth
- Login with **email**
- First-time users are forced to create a password before entering the portal

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3) – full SQL schema included
- **Auth**: express-session + bcryptjs
- **Theme**: Deep green (#004C23 / #006400) + light green accent (#C2E1A9)

---

## Project Structure

```
achievers-university/
├── package.json
├── server.js              # Express app + API routes
├── db/
│   ├── schema.sql         # Full SQL schema
│   ├── init.js            # Seed script
│   └── achievers.db       # Created after npm run init-db
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   ├── index.html
│   ├── login.html
│   ├── about.html
│   ├── programmes.html
│   ├── news.html
│   ├── admissions.html
│   ├── contact.html
│   ├── student/dashboard.html
│   └── staff/dashboard.html
└── README.md
```

---

## Notes

- This is a **demo / educational** project. Payment processing is simulated.
- All course, fee and student data is sample data.
- For production you would add proper payment gateway, email service, stronger security, etc.

© 2026 – Demo for Achievers University, Owo.
```
