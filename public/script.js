document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const enteredPassword = document.getElementById('password').value;
    const message = document.getElementById('message');

    // Obfuscated password (e.g., Base64 encoded)
    const encodedPassword = "RmFsbDIwMjRMYWIz"; // Password encoded in Base64
    const validPassword = atob(encodedPassword); // Decode the password

    if (enteredPassword === validPassword) {
        message.textContent = "Login successful!";
        message.style.color = "green";
        sessionStorage.setItem('authenticated', true);
        window.location.href = "protected.html";
    } else {
        message.textContent = "Incorrect password. Please try again.";
        message.style.color = "red";
    }
});