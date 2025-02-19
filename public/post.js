document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const currentUserId = localStorage.getItem("userId");
  
    // Создание нового поста
    async function createPost(postData) {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post.");
      }
      return await response.json();
    }
  
    document.getElementById("post-form").addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const title = document.querySelector(".post-title").value.trim();
      const content = document.querySelector(".post-textarea").value.trim();
  
      if (!title || !content) {
        alert("Title and content cannot be empty.");
        return;
      }
  
      try {
        await createPost({ title, content });
        document.querySelector(".post-title").value = "";
        document.querySelector(".post-textarea").value = "";
        alert("Post created successfully!");
        fetchAllPosts();
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while creating the post.");
      }
    });
  
    // Создание элемента поста с кнопками редактирования/удаления и секцией комментариев
    function createPostElement(post) {
      const postElement = document.createElement("section");
      postElement.classList.add("post", "mb-3");
      postElement.setAttribute("data-id", post._id);
      postElement.innerHTML = `
        <div class="post-display">
          <h2 class="post-title-display">${post.title}</h2>
          <p class="post-content-display">${post.content}</p>
          <p class="post-author">By: ${post.owner ? post.owner.username : 'Unknown'}</p>
          <hr>
          <div class="post-actions mt-2">
            <button class="action-btn btn-primary btn-sm" onclick="toggleCommentSection('${post._id}')">Comment</button>
            ${
                (role === "admin" || (post.owner && String(post.owner._id) === currentUserId))
                  ? `<button class="edit-btn btn-secondary btn-sm" onclick="editPost('${post._id}')">Edit</button>`
                  : ""
              }
            ${
                (role === "admin" || (post.owner && String(post.owner._id) === currentUserId))
                  ? `<button class="delete-btn btn-danger btn-sm" onclick="deletePost('${post._id}')">Delete</button>`
                  : ""
              }
          </div>
        </div>
        <div class="post-edit-form" style="display:none;"></div>
        <div class="comment-section" id="comments-${post._id}" style="display: none;">
          <textarea class="comment-textarea form-control mb-2" placeholder="Write a comment..."></textarea>
          <button class="post-comment btn btn-primary btn-sm" onclick="postComment('${post._id}', '${post.owner ? String(post.owner._id) : ""}')">Post Comment</button>
          <div class="comments-list"></div>
        </div>
      `;
      return postElement;
    }
    window.createPostElement = createPostElement;
  
    // Inline редактирование поста (без prompt)
    window.editPost = function(postId) {
      const postElement = document.querySelector(`section.post[data-id="${postId}"]`);
      if (!postElement) return;
  
      const displayDiv = postElement.querySelector(".post-display");
      const editFormDiv = postElement.querySelector(".post-edit-form");
  
      // Текущие значения
      const currentTitle = displayDiv.querySelector(".post-title-display").textContent;
      const currentContent = displayDiv.querySelector(".post-content-display").textContent;
  
      // Форма редактирования
      editFormDiv.innerHTML = `
        <input type="text" class="edit-title form-control mb-2" placeholder="Edit Title" value="${currentTitle}">
        <textarea class="edit-content form-control mb-2" placeholder="Edit Content">${currentContent}</textarea>
        <button class="save-edit btn btn-success btn-sm">Save</button>
        <button class="cancel-edit btn btn-secondary btn-sm">Cancel</button>
      `;
      displayDiv.style.display = "none";
      editFormDiv.style.display = "block";
  
      editFormDiv.querySelector(".save-edit").addEventListener("click", async () => {
        const newTitleInput = editFormDiv.querySelector(".edit-title");
        const newContentInput = editFormDiv.querySelector(".edit-content");
  
        // Если поле пустое, оставляем старое значение
        const newTitle = newTitleInput.value.trim() || currentTitle;
        const newContent = newContentInput.value.trim() || currentContent;
  
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title: newTitle, content: newContent })
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update post.");
          }
          // Обновляем отображение
          displayDiv.querySelector(".post-title-display").textContent = newTitle;
          displayDiv.querySelector(".post-content-display").textContent = newContent;
          editFormDiv.style.display = "none";
          displayDiv.style.display = "block";
        } catch (error) {
          console.error("Error updating post:", error);
          alert("An error occurred while updating the post.");
        }
      });
  
      editFormDiv.querySelector(".cancel-edit").addEventListener("click", () => {
        editFormDiv.style.display = "none";
        displayDiv.style.display = "block";
      });
    };
  
    // Удаление поста (доступно администратору)
    window.deletePost = async function(postId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete post.");
        }
        fetchAllPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("An error occurred while deleting the post.");
      }
    };
  
    // Получение и отображение всех постов
    async function fetchAllPosts() {
      try {
        const response = await fetch("http://localhost:3000/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts.");
        }
        const posts = await response.json();
        const postsContainer = document.querySelector(".content");
        const newPostSection = document.querySelector(".new-post");
        postsContainer.innerHTML = "";
        postsContainer.appendChild(newPostSection);
  
        posts.forEach(post => {
          const postElement = createPostElement(post);
          postsContainer.appendChild(postElement);
          fetchComments(post._id, post.owner ? String(post.owner._id) : null);
        });
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    window.fetchAllPosts = fetchAllPosts;
  
    window.toggleCommentSection = function(postId) {
      const commentSection = document.getElementById(`comments-${postId}`);
      commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
    };
  
    // Добавление комментария к посту
    window.postComment = async function(postId, postOwnerId) {
      const commentTextarea = document.querySelector(`#comments-${postId} .comment-textarea`);
      const commentText = commentTextarea.value.trim();
      if (!commentText) {
        alert("Comment cannot be empty.");
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText })
        });
        if (!response.ok) {
          throw new Error("Failed to post comment.");
        }
        commentTextarea.value = "";
        fetchComments(postId, postOwnerId);
      } catch (error) {
        console.error("Error posting comment:", error);
        alert("An error occurred while posting the comment.");
      }
    };
  
    // Получение комментариев для поста с возможностью inline-редактирования
    async function fetchComments(postId, postOwnerId) {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`);
        if (!response.ok) {
          throw new Error("Failed to fetch comments.");
        }
        const comments = await response.json();
        const commentsList = document.querySelector(`#comments-${postId} .comments-list`);
        commentsList.innerHTML = "";
        comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("comment");
            commentElement.setAttribute("data-comment-id", comment._id);
        
            const commentTextElem = document.createElement("p");
            commentTextElem.classList.add("comment-text");
            commentTextElem.textContent = comment.text;
            commentElement.appendChild(commentTextElem);
  
          // Редактирование комментария: если админ или владелец комментария
          if (role === "admin" || (comment.owner && String(comment.owner._id) === currentUserId)) {
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit Comment";
            // Добавим класс для удобства поиска
            editBtn.className = "btn btn-secondary btn-sm edit-comment-btn";
            // При клике вызываем функцию inline-редактирования
            editBtn.onclick = () => editCommentInline(postId, comment._id, postOwnerId);
            commentElement.appendChild(editBtn);
          }
          // Удаление комментария: если админ или владелец поста (для своих постов)
          if (role === "admin" || (postOwnerId && postOwnerId === currentUserId)) {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete Comment";
            deleteBtn.className = "btn btn-danger btn-sm";
            deleteBtn.onclick = () => deleteComment(postId, comment._id, postOwnerId);
            commentElement.appendChild(deleteBtn);
          }
          commentsList.appendChild(commentElement);
        });
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }
  
    // Inline редактирование комментария без prompt
    window.editCommentInline = function(postId, commentId, postOwnerId) {
      const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
      if (!commentElement) return;

      const editBtn = commentElement.querySelector(".edit-comment-btn");
      if (editBtn) {
        editBtn.style.display = "none";
    }
  
      const commentTextElem = commentElement.querySelector(".comment-text");
      const currentText = commentTextElem.textContent;
  
      const editForm = document.createElement("div");
      editForm.innerHTML = `
        <input type="text" class="edit-comment-input form-control mb-2" value="${currentText}">
        <button class="save-comment-edit btn btn-success btn-sm">Save</button>
        <button class="cancel-comment-edit btn btn-secondary btn-sm">Cancel</button>
      `;
      commentTextElem.style.display = "none";
      commentElement.appendChild(editForm);
  
      editForm.querySelector(".save-comment-edit").addEventListener("click", async () => {
        const inputField = editForm.querySelector(".edit-comment-input");
        const newText = inputField.value.trim() || currentText;
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments/${commentId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: newText })
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update comment.");
          }
          commentTextElem.textContent = newText;
          cleanupEditForm();
        } catch (error) {
          console.error("Error editing comment:", error);
          alert("An error occurred while editing the comment.");
        }
      });
  
      editForm.querySelector(".cancel-comment-edit").addEventListener("click", cleanupEditForm);
  
      function cleanupEditForm() {
        editForm.remove();
        commentTextElem.style.display = "block";
        if (editBtn) {
            // Возвращаем кнопку "Edit Comment" после окончания редактирования
            editBtn.style.display = "inline-block";
          }
      }
    };
  
    // Удаление комментария
    window.deleteComment = async function(postId, commentId, postOwnerId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments/${commentId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete comment.");
        }
        fetchComments(postId, postOwnerId);
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("An error occurred while deleting the comment.");
      }
    };
  
    fetchAllPosts();
  });
  