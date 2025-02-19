document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("User is not authenticated.");
      return;
    }
    
    // Функция загрузки профиля с сервера
    async function loadUserProfile() {
      try {
        const response = await fetch("https://aituwka2-0.onrender.com/api/auth/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          console.error("Failed to fetch user profile.");
          return;
        }
        const user = await response.json();
        // Обновляем поля формы профиля
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        // Обновляем имя рядом с иконкой
        document.getElementById('user-name').textContent = user.username || '';
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
  
    await loadUserProfile();
  
    // Обработчик отправки формы профиля
    document.getElementById('profile-form').addEventListener('submit', async function(event) {
      event.preventDefault();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim(); // если хотите изменить пароль
  
      // Получаем ID пользователя и токен, которые мы сохранили после логина
      const userId = localStorage.getItem('userId');
      if (!userId || !token) {
        alert("User is not authenticated.");
        return;
      }
  
      const updateData = { username, email };
      if (password) updateData.password = password;
  
      try {
        const response = await fetch(`https://aituwka2-0.onrender.com/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update profile.");
        }
        const updatedUser = await response.json();
        alert("Profile updated successfully!");
  
        // Обновляем данные в интерфейсе
        document.getElementById('user-name').textContent = updatedUser.username;
        localStorage.setItem('username', updatedUser.username);
        localStorage.setItem('email', updatedUser.email);
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating your profile.");
      }
    });
  });
  
