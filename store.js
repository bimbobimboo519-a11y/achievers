/**
 * Simple JSON file database for the demo (no native modules required).
 * Full SQL schema is provided in schema.sql for reference / production migration.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data.json');

const defaultData = {
  users: [],
  students: [],
  staff: [],
  courses: [],
  course_registrations: [],
  results: [],
  payments: [],
  email_requests: [],
  news: [],
  announcements: [],
  _nextId: { users: 1, students: 1, staff: 1, courses: 1, course_registrations: 1, results: 1, payments: 1, email_requests: 1, news: 1, announcements: 1 }
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return JSON.parse(JSON.stringify(defaultData));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function nextId(data, table) {
  const id = data._nextId[table] || 1;
  data._nextId[table] = id + 1;
  return id;
}

function seed() {
  const data = JSON.parse(JSON.stringify(defaultData));
  const hash = bcrypt.hashSync('password123', 10);

  // Users
  data.users.push({
    id: nextId(data, 'users'),
    email: 'taiwo.boluwatife@student.achievers.edu.ng',
    password_hash: hash,
    role: 'student',
    first_name: 'Taiwo',
    last_name: 'Bolu watife',
    phone: '08012345678',
    is_first_login: 0
  });
  data.users.push({
    id: nextId(data, 'users'),
    email: 'demo.student@student.achievers.edu.ng',
    password_hash: null,
    role: 'student',
    first_name: 'Adebayo',
    last_name: 'Okoro',
    phone: '08098765432',
    is_first_login: 1
  });
  data.users.push({
    id: nextId(data, 'users'),
    email: 'staff@achievers.edu.ng',
    password_hash: hash,
    role: 'staff',
    first_name: 'Dr. Funke',
    last_name: 'Adebayo',
    phone: '08055556666',
    is_first_login: 0
  });
  data.users.push({
    id: nextId(data, 'users'),
    email: 'admin@achievers.edu.ng',
    password_hash: hash,
    role: 'admin',
    first_name: 'System',
    last_name: 'Admin',
    phone: '08000000000',
    is_first_login: 0
  });

  // Students
  data.students.push({
    id: nextId(data, 'students'),
    user_id: 1,
    matric_number: 'AU/ENG/2025/001',
    level: '100L',
    programme: 'Electrical And Electronics Engineering',
    department: 'Electrical And Electronics Engineering',
    faculty: 'Faculty of Engineering and Technology',
    entry_session: '2025/2026',
    academic_status: 'Open',
    cgpa: 0,
    ctnu: 0,
    ctcp: 0,
    enrollment_status: 'Incomplete',
    blood_group: null,
    genotype: null,
    projected_graduation: 'Est. 5 years'
  });
  data.students.push({
    id: nextId(data, 'students'),
    user_id: 2,
    matric_number: 'AU/CSC/2025/045',
    level: '100L',
    programme: 'Computer Science',
    department: 'Computer Science',
    faculty: 'Faculty of Natural and Applied Sciences',
    entry_session: '2025/2026',
    academic_status: 'Open',
    cgpa: 0,
    ctnu: 0,
    ctcp: 0,
    enrollment_status: 'Incomplete',
    blood_group: 'O+',
    genotype: 'AA',
    projected_graduation: 'Est. 4 years'
  });

  // Staff
  data.staff.push({
    id: nextId(data, 'staff'),
    user_id: 3,
    staff_id: 'AU/STF/2019/012',
    designation: 'Senior Lecturer',
    department: 'Computer Science',
    faculty: 'Faculty of Natural and Applied Sciences',
    employment_date: '2019-09-01'
  });

  // Courses
  const courses = [
    ['MTH101', 'Elementary Mathematics I', 3, 'First', '100L', 'Electrical And Electronics Engineering'],
    ['PHY101', 'General Physics I', 3, 'First', '100L', 'Electrical And Electronics Engineering'],
    ['CHM101', 'General Chemistry I', 3, 'First', '100L', 'Electrical And Electronics Engineering'],
    ['GST101', 'Use of English I', 2, 'First', '100L', 'General Studies'],
    ['GST103', 'Nigerian Peoples and Culture', 2, 'First', '100L', 'General Studies'],
    ['CSC101', 'Introduction to Computer Science', 3, 'First', '100L', 'Electrical And Electronics Engineering'],
    ['EEE101', 'Introduction to Electrical Engineering', 2, 'First', '100L', 'Electrical And Electronics Engineering'],
    ['MTH102', 'Elementary Mathematics II', 3, 'Second', '100L', 'Electrical And Electronics Engineering'],
    ['PHY102', 'General Physics II', 3, 'Second', '100L', 'Electrical And Electronics Engineering'],
    ['CHM102', 'General Chemistry II', 3, 'Second', '100L', 'Electrical And Electronics Engineering'],
    ['GST102', 'Use of English II', 2, 'Second', '100L', 'General Studies'],
    ['GST104', 'Philosophy and Logic', 2, 'Second', '100L', 'General Studies'],
    ['CSC102', 'Introduction to Programming', 3, 'Second', '100L', 'Electrical And Electronics Engineering'],
    ['EEE102', 'Electrical Circuits', 2, 'Second', '100L', 'Electrical And Electronics Engineering'],
    ['CSC103', 'Discrete Mathematics', 3, 'First', '100L', 'Computer Science'],
    ['CSC104', 'Computer Hardware', 2, 'Second', '100L', 'Computer Science']
  ];
  courses.forEach(([code, title, units, semester, level, department]) => {
    data.courses.push({ id: nextId(data, 'courses'), code, title, units, semester, level, department });
  });

  // News
  const newsItems = [
    {
      title: '19th Matriculation Ceremony',
      slug: '19th-matriculation-ceremony',
      excerpt: 'Achievers University, Owo, proudly hosts its 19th Matriculation Ceremony on 30 January 2026.',
      content: 'Achievers University, Owo, proudly hosts its 19th Matriculation Ceremony, Date: 30 Jan 2026, marking a significant academic milestone as new students are formally admitted into the University. The event will be held at the University Auditorium.',
      category: 'Events',
      is_featured: 1,
      published_at: '2026-01-15T10:00:00'
    },
    {
      title: 'ACHIEVERS UNIVERSITY WARNS APPLICANTS AGAINST ADMISSION FRAUDSTERS',
      slug: 'warns-against-admission-fraudsters',
      excerpt: 'Urges Public to Verify Admission Information Before Making Payments',
      content: 'The Management of Achievers University, Owo, has warned prospective students, parents and the general public to be wary of fraudsters who pose as admission agents. All payments should only be made through the official portals.',
      category: 'Announcement',
      is_featured: 1,
      published_at: '2026-09-02T09:00:00'
    },
    {
      title: 'Post UTME Screening for MBBS Programme',
      slug: 'post-utme-mbbs-screening',
      excerpt: 'Post UTME screening test for Admission into MBBS Programme shall hold on Friday 18th Sept 2026',
      content: 'Candidates who applied for Medicine and Surgery (MBBS) are invited for the Post-UTME screening exercise scheduled for Friday, 18th September 2026 at the University Campus, Owo.',
      category: 'Admissions',
      is_featured: 0,
      published_at: '2026-09-03T08:00:00'
    },
    {
      title: 'Full NUC Accreditation for Seven Programmes',
      slug: 'nuc-accreditation-seven-programmes',
      excerpt: 'Achievers University secures full NUC accreditation for seven academic programmes.',
      content: 'Achievers University has received full accreditation for seven academic programmes from the National Universities Commission (NUC). Full accreditation is valid for five years.',
      category: 'Academics',
      is_featured: 1,
      published_at: '2026-04-29T12:00:00'
    },
    {
      title: 'Admissions Open for 2026/2027 Academic Session',
      slug: 'admissions-open-2026-2027',
      excerpt: 'Applications for undergraduate and postgraduate programmes are now open.',
      content: 'Achievers University invites suitably qualified candidates to apply for admission into its various undergraduate and postgraduate programmes for the 2026/2027 academic session. JAMB cut-off is 150 for most programmes.',
      category: 'Admissions',
      is_featured: 1,
      published_at: '2026-05-10T10:00:00'
    }
  ];
  newsItems.forEach(n => {
    data.news.push({ id: nextId(data, 'news'), ...n });
  });

  // Announcements
  data.announcements.push({
    id: nextId(data, 'announcements'),
    title: 'Resumption for 2025/2026 Session',
    content: 'The 2025/2026 academic session resumes on Monday, 12th October 2025. All students are expected to complete course registration within the first two weeks.',
    audience: 'Students',
    created_at: new Date().toISOString()
  });
  data.announcements.push({
    id: nextId(data, 'announcements'),
    title: 'Hostel Allocation Open',
    content: 'Returning students can now apply for hostel accommodation via the student portal.',
    audience: 'Students',
    created_at: new Date().toISOString()
  });

  // Sample payment
  data.payments.push({
    id: nextId(data, 'payments'),
    student_id: 1,
    payment_type: 'Acceptance Fee',
    amount: 50000,
    session: '2025/2026',
    status: 'Paid',
    reference: 'AU-ACC-2025-001',
    paid_at: '2025-09-15T14:30:00',
    created_at: '2025-09-15T14:30:00'
  });
  data.payments.push({
    id: nextId(data, 'payments'),
    student_id: 1,
    payment_type: 'School Fees',
    amount: 450000,
    session: '2025/2026',
    status: 'Pending',
    reference: 'AU-SF-2025-001',
    paid_at: null,
    created_at: new Date().toISOString()
  });

  save(data);
  console.log('✅ Database seeded successfully!');
  console.log('Demo accounts:');
  console.log('  Student: taiwo.boluwatife@student.achievers.edu.ng / password123');
  console.log('  First-login: demo.student@student.achievers.edu.ng (create password)');
  console.log('  Staff: staff@achievers.edu.ng / password123');
  return data;
}

module.exports = { load, save, nextId, seed, DB_PATH };
