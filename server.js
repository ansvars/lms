require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5001",
    methods: ["GET", "POST"]
  }
});

// Database pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'talentlms_user',
  password: process.env.DB_PASSWORD || 'AA11',
  database: process.env.DB_NAME || 'talentlms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'anshulvarshney2003@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Utility functions
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWelcomeEmail(user, password) {
  try {
    const mailOptions = {
      from: '"Anshul" <anshulvarshney2003@gmail.com>',
      to: user.email,
      subject: 'Welcome to Our Platform',
      html: `
        <h3>Welcome, ${user.firstName}</h3>
        <p>Your account has been successfully created.</p>
        <p>Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>Best regards,<br>The Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

async function logActivity(type, userId, userName, action) {
  try {
    const activityData = {
      type,
      user_name: userName,
      action
    };

    if (userId && type !== 'DELETE') {
      activityData.user_id = userId;
    }

    await pool.query(
      'INSERT INTO user_activities SET ?',
      [activityData]
    );
    
    io.emit('activity_update', { 
      type, 
      userName, 
      action, 
      time: new Date().toLocaleString() 
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(50) NOT NULL,
        lastName VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100),
        registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        lastLogin VARCHAR(50)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('LOGIN', 'ADD', 'DELETE', 'UPDATE', 'COMPLETION', 'CERTIFICATE', 'PASSED') NOT NULL,
        user_id INT NULL,
        user_name VARCHAR(100),
        action VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        doc_url TEXT NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Super Admin Login
  if (email === 'me@anshul.com' && password === 'anshul11') {
    logActivity('LOGIN', 0, 'Super Admin', 'logged in');
    return res.json({
      success: true,
      user: {
        id: 0,
        firstName: 'Super',
        lastName: 'Admin',
        email: 'me@anshul.com',
        lastLogin: new Date().toLocaleString(),
      }
    });
  }
  
  // Normal User Login
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await pool.query('UPDATE users SET lastLogin = ? WHERE id = ?', [new Date().toLocaleString(), user.id]);
    logActivity('LOGIN', user.id, `${user.firstName} ${user.lastName}`, 'logged in');
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/activities', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const [countResult] = await conn.query('SELECT COUNT(*) as count FROM user_activities');
    const activityCount = countResult[0].count;

    await conn.query('TRUNCATE TABLE user_activities');
    await conn.commit();
    conn.release();

    io.emit('activities_cleared');
    console.log(`Cleared ${activityCount} activities`);
    res.json({ 
      success: true, 
      message: `Cleared ${activityCount} activities`,
      count: activityCount 
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('Error clearing activities:', error);
    res.status(500).json({ error: 'Failed to clear activities' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/activity', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM user_activities 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [todayLogins] = await pool.query(`
      SELECT COUNT(*) as count FROM user_activities 
      WHERE type = 'LOGIN' AND DATE(created_at) = CURDATE()
    `);
    
    res.json({
      overview: {
        activeUsers: userCount[0].count,
        activeCourses: 10,
        completions: 0,
        inProgress: 0,
        assignedCourses: 0,
        trainingTime: "0:0"
      },
      timePeriods: {
        today: {
          logins: { count: todayLogins[0].count, change: "+0%", trend: "neutral" },
          activeUsers: { count: userCount[0].count, change: "+0%", trend: "neutral" },
          completions: { count: 0, change: "0%", trend: "neutral" }
        },
        yesterday: {
          logins: { count: 0, change: "-0%", trend: "neutral" },
          activeUsers: { count: 0, change: "-0%", trend: "neutral" },
          completions: { count: 0, change: "0%", trend: "neutral" }
        },
        week: {
          logins: { count: 0, change: "-0%", trend: "neutral" },
          activeUsers: { count: 0, change: "-0%", trend: "neutral" },
          completions: { count: 0, change: "-0%", trend: "neutral" }
        },
        month: {
          logins: { count: 0, change: "+0%", trend: "neutral" },
          activeUsers: { count: 0, change: "+0%", trend: "neutral" },
          completions: { count: 0, change: "+0%", trend: "neutral" }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.post('/api/users', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const password = req.body.password || generateRandomPassword();
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: password
    };

    const [result] = await conn.query(`INSERT INTO users SET ?`, [userData]);
    const [newUser] = await conn.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const userName = `${newUser[0].firstName} ${newUser[0].lastName}`;
    
    await conn.query(
      'INSERT INTO user_activities SET ?',
      { type: 'ADD', user_id: result.insertId, user_name: userName, action: 'was added to the system' }
    );

    await conn.commit();
    conn.release();

    sendWelcomeEmail(newUser[0], password);
    io.emit('user_created', newUser[0]);
    io.emit('activity_update', { 
      type: 'ADD', 
      userName, 
      action: 'was added to the system', 
      time: new Date().toLocaleString() 
    });
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('POST /api/users error:', error);
    res.status(500).json({ 
      error: error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Failed to add user',
      details: error.message
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const userId = req.params.id;
    const requiredFields = ['firstName', 'lastName', 'email'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    };

    if (req.body.password) {
      userData.password = req.body.password;
    }

    const [result] = await conn.query(
      `UPDATE users SET ? WHERE id = ?`,
      [userData, userId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser] = await conn.query('SELECT * FROM users WHERE id = ?', [userId]);
    const userName = `${updatedUser[0].firstName} ${updatedUser[0].lastName}`;
    
    await conn.query(
      'INSERT INTO user_activities SET ?',
      { type: 'UPDATE', user_id: userId, user_name: userName, action: 'profile was updated' }
    );

    await conn.commit();
    conn.release();

    io.emit('user_updated', updatedUser[0]);
    io.emit('activity_update', { 
      type: 'UPDATE', 
      userName, 
      action: 'profile was updated', 
      time: new Date().toLocaleString() 
    });
    
    res.json(updatedUser[0]);
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('PUT /api/users/:id error:', error);
    res.status(500).json({ 
      error: error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Failed to update user',
      details: error.message
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const userId = req.params.id;
    const [user] = await conn.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const userName = `${user[0].firstName} ${user[0].lastName}`;
    await conn.query(
      'INSERT INTO user_activities SET ?',
      { type: 'DELETE', user_name: userName, action: 'was deleted from the system' }
    );

    const [result] = await conn.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'User not found' });
    }

    await conn.commit();
    conn.release();

    io.emit('user_deleted', user[0]);
    io.emit('activity_update', { 
      type: 'DELETE', 
      userName, 
      action: 'was deleted from the system', 
      time: new Date().toLocaleString() 
    });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('DELETE /api/users/:id error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message
    });
  }
});

// Test Routes
app.get('/api/tests', async (req, res) => {
  try {
    const [tests] = await pool.query('SELECT * FROM tests ORDER BY created_at DESC');
    res.json(tests);
  } catch (error) {
    console.error('GET /api/tests error:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

app.get('/api/tests/:testId', async (req, res) => {
  try {
    const testId = parseInt(req.params.testId);

    // Validate testId
    if (isNaN(testId)) {
      return res.status(400).json({ error: "Invalid test ID" });
    }

    // Fetch test from database
    const [tests] = await pool.query(
      'SELECT * FROM tests WHERE id = ?',
      [testId]
    );

    if (tests.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    res.json(tests[0]);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: "Failed to fetch test" });
  }
});
app.post('/api/tests', async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const { name, docUrl } = req.body;
    
    if (!name || !docUrl) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Name and Google Doc URL are required' });
    }

    if (!docUrl.includes('docs.google.com/document/d/')) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'Invalid Google Docs URL format' });
    }

    const [result] = await conn.query(
      'INSERT INTO tests SET ?',
      { name, doc_url: docUrl }
    );

    await conn.commit();
    conn.release();

    res.status(201).json({ 
      id: result.insertId,
      name,
      docUrl,
      createdAt: new Date()
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('POST /api/tests error:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MySQL connection pool established`);
    console.log(`Socket.IO server ready`);
  });
});