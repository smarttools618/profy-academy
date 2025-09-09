document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Simple hardcoded authentication for demonstration
    if (username === 'admin' && password === 'password') {
        sessionStorage.setItem('loggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMessage.style.display = 'block';
    }
});
