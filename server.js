const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { load, save, nextId, seed } = require('./db/store');

const app = express();
const PORT = process.env.PORT || 3000;

let db = load();
if (!db.users || db.users.length === 0) {
  db = seed();
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'achievers-university-demo-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized. Please login.' });
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.userId || !roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  db = load();
  const user = db.users.find(u => u.email === email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  if (user.is_first_login === 1 || !user.password_hash) {
    return res.json({ firstLogin: true, email: user.email, message: 'First login detected. Please create your password.' });
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.email = user.email;
  req.session.name = user.first_name + ' ' + user.last_name;
  let profile = null;
  if (user.role === 'student') profile = db.students.find(s => s.user_id === user.id);
  else if (user.role === 'staff') profile = db.staff.find(s => s.user_id === user.id);
  res.json({
    success: true,
    user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, name: user.first_name + ' ' + user.last_name },
    profile
  });
});

app.post('/api/auth/set-password', (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match or missing fields' });
  }
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  db = load();
  const user = db.users.find(u => u.email === email.toLowerCase().trim());
  if (!user || (user.is_first_login !== 1 && user.password_hash)) {
    return res.status(400).json({ error: 'Invalid request or password already set' });
  }
  user.password_hash = bcrypt.hashSync(password, 10);
  user.is_first_login = 0;
  save(db);
  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.email = user.email;
  req.session.name = user.first_name + ' ' + user.last_name;
  let profile = null;
  if (user.role === 'student') profile = db.students.find(s => s.user_id === user.id);
  res.json({
    success: true,
    message: 'Password created successfully',
    user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, name: user.first_name + ' ' + user.last_name },
    profile
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
  db = load();
  const user = db.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  let profile = null;
  if (user.role === 'student') profile = db.students.find(s => s.user_id === user.id);
  else if (user.role === 'staff') profile = db.staff.find(s => s.user_id === user.id);
  res.json({ user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name }, profile });
});

app.get('/api/student/dashboard', requireAuth, requireRole('student'), (req, res) => {
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  if (!student) return res.status(404).json({ error: 'Student profile not found' });
  const user = db.users.find(u => u.id === req.session.userId);
  const regs = db.course_registrations.filter(r => r.student_id === student.id && r.session === '2025/2026');
  const firstCourses = regs.filter(r => {
    const c = db.courses.find(x => x.id === r.course_id);
    return c && c.semester === 'First';
  });
  const secondCourses = regs.filter(r => {
    const c = db.courses.find(x => x.id === r.course_id);
    return c && c.semester === 'Second';
  });
  const firstUnits = firstCourses.reduce((s, r) => s + (db.courses.find(c => c.id === r.course_id)?.units || 0), 0);
  const secondUnits = secondCourses.reduce((s, r) => s + (db.courses.find(c => c.id === r.course_id)?.units || 0), 0);
  const payments = db.payments.filter(p => p.student_id === student.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const outstanding = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const pendingInvoices = payments.filter(p => p.status === 'Pending').length;
  const lastPayment = payments.find(p => p.status === 'Paid');
  const emailReq = db.email_requests.filter(e => e.student_id === student.id).sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))[0];
  const medicalIncomplete = !student.blood_group || !student.genotype;
  res.json({
    user: { first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone },
    student,
    courseReg: {
      first: { courses: firstCourses.length, units: firstUnits, maxUnits: 18, maxCourses: 11 },
      second: { courses: secondCourses.length, units: secondUnits, maxUnits: 17, maxCourses: 9 }
    },
    payments: { list: payments, totalPaid, outstanding, pendingInvoices, lastPayment: lastPayment ? lastPayment.paid_at : null },
    emailRequest: emailReq || null,
    medicalIncomplete
  });
});

app.get('/api/student/courses', requireAuth, requireRole('student'), (req, res) => {
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  const available = db.courses.filter(c => c.level === student.level && (c.department === student.department || c.department === 'General Studies'));
  const registered = db.course_registrations
    .filter(r => r.student_id === student.id && r.session === '2025/2026')
    .map(r => {
      const c = db.courses.find(x => x.id === r.course_id);
      return { ...c, status: r.status, registered_at: r.registered_at };
    });
  res.json({ available, registered });
});

app.post('/api/student/register-course', requireAuth, requireRole('student'), (req, res) => {
  const { courseId } = req.body;
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const exists = db.course_registrations.find(r => r.student_id === student.id && r.course_id === courseId && r.session === '2025/2026');
  if (exists) return res.status(400).json({ error: 'Already registered' });
  db.course_registrations.push({
    id: nextId(db, 'course_registrations'),
    student_id: student.id,
    course_id: courseId,
    session: '2025/2026',
    semester: course.semester,
    status: 'Registered',
    registered_at: new Date().toISOString()
  });
  save(db);
  res.json({ success: true, message: 'Registered for ' + course.code });
});

app.post('/api/student/drop-course', requireAuth, requireRole('student'), (req, res) => {
  const { courseId } = req.body;
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  db.course_registrations = db.course_registrations.filter(r => !(r.student_id === student.id && r.course_id === courseId && r.session === '2025/2026'));
  save(db);
  res.json({ success: true });
});

app.get('/api/student/results', requireAuth, requireRole('student'), (req, res) => {
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  const results = db.results.filter(r => r.student_id === student.id).map(r => {
    const c = db.courses.find(x => x.id === r.course_id);
    return { ...r, code: c?.code, title: c?.title, units: c?.units };
  });
  res.json({ results, cgpa: student.cgpa });
});

app.post('/api/student/pay', requireAuth, requireRole('student'), (req, res) => {
  const { paymentType, amount } = req.body;
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  const ref = 'AU-' + (paymentType || 'PAY').substring(0, 3).toUpperCase() + '-' + Date.now();
  db.payments.push({
    id: nextId(db, 'payments'),
    student_id: student.id,
    payment_type: paymentType,
    amount: amount || 0,
    session: '2025/2026',
    status: 'Paid',
    reference: ref,
    paid_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  });
  db.payments.forEach(p => {
    if (p.student_id === student.id && p.payment_type === paymentType && p.status === 'Pending') p.status = 'Paid';
  });
  save(db);
  res.json({ success: true, reference: ref, message: 'Payment successful (demo)' });
});

app.post('/api/student/request-email', requireAuth, requireRole('student'), (req, res) => {
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  const user = db.users.find(u => u.id === req.session.userId);
  const suggested = user.first_name.toLowerCase() + '.' + user.last_name.toLowerCase().replace(/\s/g, '') + '@student.achievers.edu.ng';
  db.email_requests.push({
    id: nextId(db, 'email_requests'),
    student_id: student.id,
    requested_email: suggested,
    status: 'Pending',
    requested_at: new Date().toISOString()
  });
  save(db);
  res.json({ success: true, email: suggested, message: 'Official email request submitted. You will be notified once processed.' });
});

app.post('/api/student/update-medical', requireAuth, requireRole('student'), (req, res) => {
  const { blood_group, genotype } = req.body;
  db = load();
  const student = db.students.find(s => s.user_id === req.session.userId);
  if (student) {
    student.blood_group = blood_group;
    student.genotype = genotype;
    save(db);
  }
  res.json({ success: true });
});

app.get('/api/staff/dashboard', requireAuth, requireRole('staff', 'admin'), (req, res) => {
  db = load();
  const staff = db.staff.find(s => s.user_id === req.session.userId);
  const user = db.users.find(u => u.id === req.session.userId);
  res.json({ user: { first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone }, staff });
});

app.get('/api/news', (req, res) => {
  db = load();
  res.json(db.news.sort((a, b) => new Date(b.published_at) - new Date(a.published_at)));
});

app.get('/api/news/:slug', (req, res) => {
  db = load();
  const item = db.news.find(n => n.slug === req.params.slug);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.get('/api/announcements', (req, res) => {
  db = load();
  res.json(db.announcements);
});

app.listen(PORT, () => {
  console.log('');
  console.log('Achievers University Portal running at http://localhost:' + PORT);
  console.log('  Student: taiwo.boluwatife@student.achievers.edu.ng / password123');
  console.log('  First-login: demo.student@student.achievers.edu.ng (create password)');
  console.log('  Staff: staff@achievers.edu.ng / password123');
  console.log('');
});
