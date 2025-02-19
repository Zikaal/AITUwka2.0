document.addEventListener('DOMContentLoaded', () => {
    // Если на странице присутствует форма регистрации, добавляем её обработчик
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', validateSignUpForm);
    }
  
    // Если на странице присутствует форма логина, добавляем её обработчик
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', validateLoginForm);
    }
  });
  
  function validateSignUpForm(event) {
  event.preventDefault();

  // Сброс сообщений об ошибках
  document.getElementById('usernameError').innerText = '';
  document.getElementById('emailError').innerText = '';
  document.getElementById('passwordError').innerText = '';
  document.getElementById('confirmPasswordError').innerText = '';

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Проверяем, существует ли элемент adminCode
  const adminCodeElement = document.getElementById('adminCode');
  const adminCode = adminCodeElement ? adminCodeElement.value.trim() : '';

  let valid = true;
  if (!username) {
    document.getElementById('usernameError').innerText = 'Username is required';
    valid = false;
  }
  if (!email) {
    document.getElementById('emailError').innerText = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('emailError').innerText = 'Invalid email format';
    valid = false;
  }
  if (!password) {
    document.getElementById('passwordError').innerText = 'Password is required';
    valid = false;
  } else if (password.length < 6) {
    document.getElementById('passwordError').innerText = 'Password must be at least 6 characters long';
    valid = false;
  }
  if (password !== confirmPassword) {
    document.getElementById('confirmPasswordError').innerText = 'Passwords do not match';
    valid = false;
  }
  if (!valid) return;

  const payload = { username, email, password };
  // Добавляем adminCode только если он присутствует и не пуст
  if (adminCode) {
    payload.adminCode = adminCode;
  }

  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      if (data.id) {
        localStorage.setItem('showWelcomeModal', 'true');
        window.location.href = 'Login.html';
      } else {
        alert(data.message);
      }
    })
    .catch(error => {
      console.error('Registration error:', error);
      alert('An error occurred during registration.');
    });
}

  
  // Функция для обработки логина
  function validateLoginForm(event) {
    event.preventDefault();
  
    // Сброс предыдущих сообщений об ошибках
    document.getElementById('emailError').innerText = '';
    document.getElementById('passwordError').innerText = '';
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    let isValid = true;
    if (!email) {
      document.getElementById('emailError').innerText = 'Email is required.';
      isValid = false;
    }
    if (!password) {
      document.getElementById('passwordError').innerText = 'Password is required.';
      isValid = false;
    }
    if (!isValid) return;
  
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && data.token) {
          // Сохраняем токен, роль и id пользователя в localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.id);
          // Перенаправляем на домашнюю страницу
          window.location.href = '/home.html';
        } else {
          document.getElementById('emailError').innerText =
            data.message || 'Invalid email or password.';
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        document.getElementById('emailError').innerText =
          'An error occurred. Please try again.';
      });
  }
  