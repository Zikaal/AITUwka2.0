
let clickSound = new Audio('audio/click.mp3');
document.getElementById('secretBtn').addEventListener('click', function() {
    clickSound.play();  
});

document.getElementById('secretBtn').addEventListener('click', function() {
    const santa = document.getElementById('santa');
    santa.style.display = 'block'; 
    santa.style.left = '-300px'; 

    setTimeout(() => {
        santa.style.left = '120vw'; 
        setTimeout(() => {
            santa.style.display = 'none'; 
    }, 8000); 
    }, 100);
});


const modal = document.getElementById('myModal'); 
const openFormBtn = document.getElementById('openFormBtn');
const closeFormBtn = document.getElementById('closeFormBtn');
const form = document.getElementById('contactForm');

        
openFormBtn.onclick = function() {
    modal.style.display = "block";
}

closeFormBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


function handleFormSubmit(event, callback) {
    event.preventDefault(); 

    const formData = new FormData(form); 

    fetch('https://jsonplaceholder.typicode.com/posts', { 
        method: 'POST', 
        body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Success:', data);
        alert('Your submission was successful!');
        form.reset(); 
        if (callback) callback(null, data); 
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error); 
        if (callback) callback(error); 
    });

    modal.style.display = "none"; 
}

form.onsubmit = function(event) {
    handleFormSubmit(event, function(error, data) {
        if (error) {
            console.error('Callback Error:', error);
        } else {
            console.log('Callback Data:', data);
        }
    });
};
