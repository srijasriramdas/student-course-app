// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Home Page
app.get('/', (req, res) => {
  res.render('index');
});

// Show all students
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) throw err;
    res.render('students', { students: results });
  });
});

// Search students by department or roll number
app.get('/students/search', (req, res) => {
  const { department, roll_number } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (department) {
    sql += ' AND department LIKE ?';
    params.push(`%${department}%`);
  }
  if (roll_number) {
    sql += ' AND roll_number LIKE ?';
    params.push(`%${roll_number}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) throw err;
    res.render('students', { students: results });
  });
});

// Add student (with department and roll_number)
app.post('/students', (req, res) => {
  const { name, email, department, roll_number } = req.body;
  db.query(
    'INSERT INTO students (name, email, department, roll_number) VALUES (?, ?, ?, ?)',
    [name, email, department, roll_number],
    (err) => {
      if (err) throw err;
      res.redirect('/students');
    }
  );
});

// View student profile by ID
app.get('/students/:id', (req, res) => {
  const studentId = req.params.id;

  const studentQuery = 'SELECT * FROM students WHERE id = ?';
  const coursesQuery = `
    SELECT courses.title FROM enrollments
    JOIN courses ON enrollments.course_id = courses.id
    WHERE enrollments.student_id = ?
  `;

  db.query(studentQuery, [studentId], (err, studentResults) => {
    if (err) throw err;

    if (studentResults.length === 0) {
      return res.status(404).send('Student not found');
    }

    const student = studentResults[0];

    db.query(coursesQuery, [studentId], (err2, courseResults) => {
      if (err2) throw err2;
      res.render('student_profile', { student, courses: courseResults });
    });
  });
});


// Show all courses
// Browse and filter courses
app.get('/courses', (req, res) => {
  const { department } = req.query;

  let query = 'SELECT * FROM courses';
  let values = [];

  if (department) {
    query += ' WHERE department = ?';
    values.push(department);
  }

  db.query(query, values, (err, results) => {
    if (err) throw err;
    res.render('courses', { courses: results, departmentFilter: department || '' });
  });
});


// Add a new course
// Add a new course with department
app.post('/courses', (req, res) => {
  const { title, description, department } = req.body;
  db.query(
    'INSERT INTO courses (title, description, department) VALUES (?, ?, ?)',
    [title, description, department],
    (err) => {
      if (err) throw err;
      res.redirect('/courses');
    }
  );
});



// Show form to enroll a student in a course
app.get('/enroll', (req, res) => {
  db.query('SELECT * FROM students', (err, students) => {
    if (err) throw err;
    db.query('SELECT * FROM courses', (err2, courses) => {
      if (err2) throw err2;
      res.render('enroll', { students, courses });
    });
  });
});

// Handle enrollment form submission
app.post('/enroll', (req, res) => {
  const { student_id, course_id } = req.body;
  db.query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id], (err) => {
    if (err) throw err;
    res.redirect('/enrollments');
  });
});

// View all enrollments
app.get('/enrollments', (req, res) => {
  const sql = `
    SELECT students.name AS student, courses.title AS course
    FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    JOIN courses ON enrollments.course_id = courses.id
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render('enrollments', { enrollments: results });
  });
});

// Filter courses by department
app.get('/courses/search', (req, res) => {
  const { department } = req.query;

  let sql = 'SELECT * FROM courses';
  const params = [];

  if (department) {
    sql += ' WHERE department LIKE ?';
    params.push(`%${department}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) throw err;
    res.render('courses', { courses: results });
  });
});

// Delete student by ID
app.post('/students/delete/:id', (req, res) => {
  const studentId = req.params.id;
  db.query('DELETE FROM students WHERE id = ?', [studentId], (err) => {
    if (err) throw err;
    res.redirect('/students');
  });
});

// Delete course by ID
app.post('/courses/delete/:id', (req, res) => {
  const courseId = req.params.id;
  db.query('DELETE FROM courses WHERE id = ?', [courseId], (err) => {
    if (err) throw err;
    res.redirect('/courses');
  });
});


app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
