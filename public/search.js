document.addEventListener("DOMContentLoaded", () => {
    // Находим элемент поля поиска по id
    const searchInput = document.getElementById("searchInput");
    
    if (!searchInput) {
      console.error("Search input element not found.");
      return;
    }
  
    // Функция выполнения поиска
    async function performSearch() {
      const username = searchInput.value.trim();
      console.log("Searching for:", username);
      
      // Если поле пустое — загружаем все посты
      if (username === "") {
        if (typeof fetchAllPosts === "function") {
          fetchAllPosts();
        }
        return;
      }
  
      try {
        const response = await fetch(`/api/posts/search?username=${encodeURIComponent(username)}`);
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error("Failed to search posts");
        }
        const posts = await response.json();
        console.log("Found posts:", posts);
        updatePosts(posts);
      } catch (err) {
        console.error("Search error:", err);
      }
    }
  
    // Обработчик формы поиска
    const searchForm = searchInput.closest("form");
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch();
      });
    }
  
    // Также запускаем поиск при нажатии клавиши Enter
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });
  
    // Также можно запускать поиск при изменении текста
    searchInput.addEventListener("input", performSearch);
  });
  
  // Функция обновления DOM со списком постов
  function updatePosts(posts) {
    const postsContainer = document.querySelector(".content");
    if (!postsContainer) {
      console.error("Posts container (.content) not found.");
      return;
    }
    // Сохраняем секцию для создания нового поста
    const newPostSection = document.querySelector(".new-post");
    postsContainer.innerHTML = "";
    if (newPostSection) {
      postsContainer.appendChild(newPostSection);
    }
    posts.forEach(post => {
      // Предполагается, что функция createPostElement определена глобально (например, в post.js)
      const postElement = createPostElement(post);
      postsContainer.appendChild(postElement);
      // Если функция fetchComments определена глобально, вызываем её для каждого поста
      if (typeof fetchComments === "function") {
        fetchComments(post._id, post.owner ? String(post.owner._id) : null);
      }
    });
  }
  