const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize messages storage for team members
const messagesDir = path.join(__dirname, 'messages');
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}

// Ensure each team member has a JSON file for messages
const teamMembers = ['logan', 'member2', 'member3', 'member4'];
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

  // API route to get messages for a specific member
  app.get(`/api/messages/${member}`, (req, res) => {
    const memberFilePath = path.join(messagesDir, `${member}.json`);
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
    const messages = JSON.parse(fs.readFileSync(memberFilePath));
    messages.push({ id: Date.now(), text: newMessage });
    fs.writeFileSync(memberFilePath, JSON.stringify(messages));
    res.status(201).json({ message: 'Message added successfully.' });
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
//    Add member-specific HTML files: member1.html, member2.html, etc.
// 2. Add a 'Procfile' in the root directory with the following content:
//    web: node index.js
// 3. Initialize a Git repository and commit your files.
// 4. Use Heroku CLI to create a new app and deploy:
//    - heroku login
//    - heroku create
//    - git push heroku main
