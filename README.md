🎓 Student-Course Management System

A full-stack web application for managing students and courses using Node.js, Express, MySQL, and EJS. This app provides a user-friendly dashboard for adding, updating, and deleting students and courses with powerful search and visualization features.

---

🔧 Tech Stack

🔙 Backend
- **Node.js** – Server-side runtime
- **Express.js** – Web framework for routing and middleware
- **MySQL** – Relational database to store student and course info
- **body-parser** – Middleware to parse form data

🌐 Frontend
- **EJS** – Template engine to generate dynamic HTML
- **HTML/CSS** – Markup and styling
- **Vanilla JavaScript** – Client-side interactivity
- **Chart.js** – Data visualization on dashboard

---

✨ Features

- Add/Search/Edit/Delete students and courses
- Dashboard view with charts (bar/pie) using Chart.js
- Responsive UI with dark mode toggle
- Department filters and fuzzy search
- Clean URL routing and dynamic rendering via EJS

---

📁 Project Structure

```
student-course-app/
├── app.js               # Express server & routing logic
├── db.js                # MySQL database connection
├── public/              # Static assets (CSS, JS, icons)
├── views/               # EJS templates (pages)
├── package.json         # Node.js dependencies
└── README.md            # Project info
```

---

🚀 Getting Started

Prerequisites:
- Node.js & npm installed
- MySQL installed & configured

Setup Instructions:

1. Clone the repo:
   ```bash
   git clone https://github.com/srijasriramdas/student-course-app.git
   cd student-course-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE student_course;
   ```
   Then run the provided SQL schema if available (or manually create the required tables).

4. Configure DB credentials in `db.js`.

5. Start the app:
   ```bash
   node app.js
   ```

6. Open your browser:
   ```
   http://localhost:3000
   ```

---

🙌 Contributors

Made  by [Srija Sriramdas](https://github.com/srijasriramdas)
