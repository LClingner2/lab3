const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for authentication
app.use(session({
  secret: 'securePasswordKey',
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize messages storage for team members
const messagesDir = path.join(__dirname, 'messages');
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}

// Ensure each team member has a JSON file for messages
const teamMembers = ['logan', 'joey', 'doug', 'elijah'];
teamMembers.forEach(member => {
  const memberFilePath = path.join(messagesDir, `${member}.json`);
  if (!fs.existsSync(memberFilePath)) {
    fs.writeFileSync(memberFilePath, JSON.stringify([]));
  }
});

// Define a route for each team member
teamMembers.forEach(member => {
  app.get(`/${member}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${member}.html`));
  });

  app.get(`/${member}Protected`, (req, res) => {
    if (!req.session.isAuthenticated) {
      return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', `${member}Protected.html`));
  });

  // API route to get messages for a specific member
  app.get(`/api/messages/${member}`, (req, res) => {
    const memberFilePath = path.join(messagesDir, `${member}.json`);
    if (!fs.existsSync(memberFilePath)) {
      return res.status(404).json({ error: `Messages for ${member} not found.` });
    }
    const messages = JSON.parse(fs.readFileSync(memberFilePath));
    res.json(messages);
  });

  // API route to add a message for a specific member
  app.post(`/api/messages/${member}`, (req, res) => {
    const newMessage = req.body.message;
    if (!newMessage) {
      return res.status(400).json({ error: 'Message text is required.' });
    }
    const memberFilePath = path.join(messagesDir, `${member}.json`);
    if (!fs.existsSync(memberFilePath)) {
      return res.status(404).json({ error: `Messages for ${member} not found.` });
    }
    const messages = JSON.parse(fs.readFileSync(memberFilePath));
    const timestamp = new Date().toISOString();
    messages.push({ id: Date.now(), text: newMessage });
    fs.writeFileSync(memberFilePath, JSON.stringify(messages));
    res.status(201).json({ message: 'Message added successfully.' });
  });
});

// Login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login authentication
app.post('/login', (req, res) => {
  const { password } = req.body;
  const correctPassword = 'securepassword'; // Replace with your secure password
  if (password === correctPassword) {
    req.session.isAuthenticated = true;
    res.redirect('/protected');
  } else {
    res.status(401).send('Incorrect password. Please try again.');
  }
});

// Protected content route
app.get('/protected', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Define a basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Instructions for deployment:
// 1. Create a 'public' folder and place your HTML, CSS, and JS files there.
//    Add member-specific HTML files: logan.html, loganProtected.html, member2.html, etc.
//    Add login.html and protected.html.
// 2. Add a 'Procfile' in the root directory with the following content:
//    web: node index.js
// 3. Initialize a Git repository and commit your files.
// 4. Use Heroku CLI to create a new app and deploy:
//    - heroku login
//    - heroku create
//    - git push heroku main
