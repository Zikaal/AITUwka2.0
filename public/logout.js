document.getElementById('logout-btn').addEventListener('click', logout);

function logout() {
    // Удаляем все данные пользователя из localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    alert('You have been logged out.');
    window.location.href = 'Login.html';
}
