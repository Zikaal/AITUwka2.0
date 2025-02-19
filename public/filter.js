document.addEventListener("DOMContentLoaded", function () {
    const categoryLinks = document.querySelectorAll(".dropdown-item");
    const marketItems = document.querySelectorAll(".market-item");

    function applyFilter(category) {
        marketItems.forEach(item => {
            if (category === "all" || item.getAttribute("data-category") === category) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    }

    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
        applyFilter(savedCategory);
    } else {
        applyFilter("all"); 
    }

    categoryLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const category = event.target.getAttribute("data-category");

            localStorage.setItem("selectedCategory", category);

            applyFilter(category);
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const buyButtons = document.querySelectorAll(".btn-primary");

    buyButtons.forEach(button => {
        button.addEventListener("click", () => {
            const notification = button.nextElementSibling; 
            notification.style.display = "block"; 

            const purchaseData = {
                item: button.getAttribute("id"), 
                message: "Product have been purchased"
            };

            fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    });
});