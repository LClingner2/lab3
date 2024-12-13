const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize messages storage
const messagesFilePath = path.join(__dirname, 'messages.json');

// Ensure messages file exists
if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([]));
}

// Define a basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get messages
app.get('/api/messages', (req, res) => {
  const messages = JSON.parse(fs.readFileSync(messagesFilePath));
  res.json(messages);
});

// API route to add a message
app.post('/api/messages', (req, res) => {
  const newMessage = req.body.message;
  if (!newMessage) {
    return res.status(400).json({ error: 'Message text is required.' });
  }
  const messages = JSON.parse(fs.readFileSync(messagesFilePath));
  messages.push({ id: Date.now(), text: newMessage });
  fs.writeFileSync(messagesFilePath, JSON.stringify(messages));
  res.status(201).json({ message: 'Message added successfully.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Instructions for deployment:
// 1. Create a 'public' folder and place your HTML, CSS, and JS files there.
// 2. Add a 'Procfile' in the root directory with the following content:
//    web: node index.js
// 3. Initialize a Git repository and commit your files.
// 4. Use Heroku CLI to create a new app and deploy:
//    - heroku login
//    - heroku create
//    - git push heroku main
