const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const session = require('express-session');
const flash = require('express-flash');

const app = express(); // ✅ This was declared after session before (moved it up)

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// Home Page
app.get('/', (req, res) => {
  res.render('index');
});

// Show all students
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) throw err;
    res.render('students', { students: results, messages: req.flash() });
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
    req.flash('success', '✅ Student(s) Found!');
    res.render('students', { students: results, messages: req.flash() });
  });
});

// Add Student
app.post('/students', (req, res) => {
  const { name, email, department, roll_number } = req.body;
  db.query(
    'INSERT INTO students (name, email, department, roll_number) VALUES (?, ?, ?, ?)',
    [name, email, department, roll_number],
    (err) => {
      if (err) throw err;
      req.flash('success', '✅ Student Added!');
      res.redirect('/students');
    }
  );
});

// Student profile
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
    if (studentResults.length === 0) return res.status(404).send('Student not found');

    const student = studentResults[0];
    db.query(coursesQuery, [studentId], (err2, courseResults) => {
      if (err2) throw err2;
      res.render('student_profile', { student, courses: courseResults, messages: req.flash() });
    });
  });
});

// Show / search courses
app.get('/courses', (req, res) => {
  const { department } = req.query;
  let query = 'SELECT * FROM courses';
  const values = [];

  if (department) {
    query += ' WHERE department = ?';
    values.push(department);
  }

  db.query(query, values, (err, results) => {
    if (err) throw err;
    if (department) req.flash('success', '📚 Filtered by Department!');
    res.render('courses', { courses: results, departmentFilter: department || '', messages: req.flash() });
  });
});

// Add Course
app.post('/courses', (req, res) => {
  const { title, description, department } = req.body;
  db.query(
    'INSERT INTO courses (title, description, department) VALUES (?, ?, ?)',
    [title, description, department],
    (err) => {
      if (err) throw err;
      req.flash('success', '✅ Course Added!');
      res.redirect('/courses');
    }
  );
});

// Course Detail + Enrollments
app.get('/courses/:id', (req, res) => {
  const courseId = req.params.id;
  const courseQuery = 'SELECT * FROM courses WHERE id = ?';
  const studentsQuery = `
    SELECT students.id, students.name FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    WHERE enrollments.course_id = ?
  `;
  const allStudentsQuery = 'SELECT id, name FROM students';

  db.query(courseQuery, [courseId], (err, courseResults) => {
    if (err) throw err;
    if (courseResults.length === 0) return res.send('Course not found');
    const course = courseResults[0];

    db.query(studentsQuery, [courseId], (err2, enrolledStudents) => {
      if (err2) throw err2;
      db.query(allStudentsQuery, (err3, allStudents) => {
        if (err3) throw err3;
        res.render('course_detail', {
          course,
          enrolledStudents,
          allStudents,
          messages: req.flash()
        });
      });
    });
  });
});

// Enroll a student
app.get('/enroll', (req, res) => {
  db.query('SELECT * FROM students', (err, students) => {
    if (err) throw err;
    db.query('SELECT * FROM courses', (err2, courses) => {
      if (err2) throw err2;
      res.render('enroll', { students, courses, messages: req.flash() });
    });
  });
});

app.post('/enroll', (req, res) => {
  const { student_id, course_id } = req.body;
  db.query('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)', [student_id, course_id], (err) => {
    if (err) throw err;
    req.flash('success', '✅ Student Enrolled!');
    res.redirect('/enrollments');
  });
});

// View Enrollments
app.get('/enrollments', (req, res) => {
  const sql = `
    SELECT students.name AS student, courses.title AS course
    FROM enrollments
    JOIN students ON enrollments.student_id = students.id
    JOIN courses ON enrollments.course_id = courses.id
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render('enrollments', { enrollments: results, messages: req.flash() });
  });
});

// Delete student
app.post('/students/delete/:id', (req, res) => {
  const studentId = req.params.id;
  db.query('DELETE FROM students WHERE id = ?', [studentId], (err) => {
    if (err) throw err;
    req.flash('success', '🗑️ Student Deleted!');
    res.redirect('/students');
  });
});

// Delete course
app.post('/courses/delete/:id', (req, res) => {
  const courseId = req.params.id;
  db.query('DELETE FROM courses WHERE id = ?', [courseId], (err) => {
    if (err) throw err;
    req.flash('success', '🗑️ Course Deleted!');
    res.redirect('/courses');
  });
});

// Edit Student
app.get('/students/edit/:id', (req, res) => {
  const studentId = req.params.id;
  db.query('SELECT * FROM students WHERE id = ?', [studentId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.send('Student not found');
    res.render('edit_student', { student: results[0], messages: req.flash() });
  });
});

app.post('/students/edit/:id', (req, res) => {
  const { name, email, department } = req.body;
  const id = req.params.id;
  db.query(
    'UPDATE students SET name = ?, email = ?, department = ? WHERE id = ?',
    [name, email, department, id],
    (err) => {
      if (err) throw err;
      req.flash('success', '✏️ Student Updated!');
      res.redirect('/students/' + id);
    }
  );
});

// Edit Course
app.get('/courses/edit/:id', (req, res) => {
  const courseId = req.params.id;
  db.query('SELECT * FROM courses WHERE id = ?', [courseId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.send('Course not found');
    res.render('edit_course', { course: results[0], messages: req.flash() });
  });
});

app.post('/courses/edit/:id', (req, res) => {
  const { title, description, department } = req.body;
  const id = req.params.id;
  db.query(
    'UPDATE courses SET title = ?, description = ?, department = ? WHERE id = ?',
    [title, description, department, id],
    (err) => {
      if (err) throw err;
      req.flash('success', '✏️ Course Updated!');
      res.redirect('/courses');
    }
  );
});

// Dashboard
app.get('/dashboard', (req, res) => {
  const data = {};
  db.query('SELECT COUNT(*) AS count FROM students', (err, studentResult) => {
    if (err) throw err;
    data.studentCount = studentResult[0].count;

    db.query('SELECT COUNT(*) AS count FROM courses', (err2, courseResult) => {
      if (err2) throw err2;
      data.courseCount = courseResult[0].count;

      db.query('SELECT COUNT(*) AS count FROM enrollments', (err3, enrollResult) => {
        if (err3) throw err3;
        data.enrollmentCount = enrollResult[0].count;

        db.query('SELECT name FROM students ORDER BY id DESC LIMIT 5', (err4, latestStudents) => {
          if (err4) throw err4;
          data.latestStudents = latestStudents;

          db.query('SELECT title FROM courses ORDER BY id DESC LIMIT 5', (err5, latestCourses) => {
            if (err5) throw err5;
            data.latestCourses = latestCourses;

            const popularQuery = `
              SELECT courses.title, COUNT(*) AS count
              FROM enrollments
              JOIN courses ON enrollments.course_id = courses.id
              GROUP BY enrollments.course_id
              ORDER BY count DESC
              LIMIT 1
            `;
            db.query(popularQuery, (err6, popularResult) => {
              if (err6) throw err6;
              data.mostPopularCourse = popularResult[0]?.title || 'No enrollments yet';

              const chartQuery = `
                SELECT courses.department, COUNT(*) AS count
                FROM enrollments
                JOIN courses ON enrollments.course_id = courses.id
                GROUP BY courses.department
              `;
              db.query(chartQuery, (err7, chartResult) => {
                if (err7) throw err7;
                data.chartLabels = chartResult.map(r => r.department);
                data.chartCounts = chartResult.map(r => r.count);
                res.render('dashboard', { ...data, messages: req.flash() });
              });
            });
          });
        });
      });
    });
  });
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
