const fs = require('fs');
const path = require('path');

// Get the new password from command line arguments
const newPassword = process.argv[2];

if (!newPassword) {
    console.error('Please provide a new password as an argument.');
    process.exit(1);
}

// Encode the new password in Base64
const encodedPassword = Buffer.from(newPassword).toString('base64');

// Path to the script.js file inside the public folder
const scriptPath = path.join(__dirname, 'public', 'script.js');

// Read the script.js file and replace the old encoded password
fs.readFile(scriptPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading script.js:', err);
        process.exit(1);
    }

    const updatedScript = data.replace(/const encodedPassword = ".*?";/, 
        `const encodedPassword = "${encodedPassword}";`);

    fs.writeFile(scriptPath, updatedScript, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to script.js:', err);
            process.exit(1);
        }
        console.log('Password updated successfully.');
    });
});
