document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Предотвращение отправки формы

    // Получаем данные из полей ввода
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();

    // Сохраняем данные в localStorage
    const userData = {
        firstname: firstname,
        lastname: lastname
    };
    localStorage.setItem('userProfileData', JSON.stringify(userData));

    // Перенаправляем на страницу профиля
    window.location.href = 'Login.html';
});
