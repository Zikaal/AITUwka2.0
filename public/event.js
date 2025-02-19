const buttons = document.querySelectorAll('.event-button');

function loadPickedButtons() {
    const storedPickedButtons = JSON.parse(localStorage.getItem('pickedButtons')) || [];

    buttons.forEach(button => {
        const buttonId = button.getAttribute('data-id');
        if (storedPickedButtons.includes(buttonId)) {
            button.classList.add('picked');
            button.textContent = 'Picked'; 
        } else {
            button.classList.remove('picked');
            button.textContent = 'Interested'; 
        }
    });
}

// Сохранение состояния кнопок
function savePickedButtons() {
    const pickedButtons = [...buttons]
        .filter(button => button.classList.contains('picked'))
        .map(button => button.getAttribute('data-id'));
    localStorage.setItem('pickedButtons', JSON.stringify(pickedButtons));
}

buttons.forEach(button => {
    button.addEventListener('click', function() {
        const isPicked = this.classList.toggle('picked');
        
        if (isPicked) {
            this.textContent = 'Picked';
            alert('Your request has been sent!');
            fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Button clicked!',
                    body: 'This button was clicked!',
                    userId: 1
                })
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error(error));
        } else {
            this.textContent = 'Interested';
            alert('Cancelled!');
            fetch('https://jsonplaceholder.typicode.com/posts/1', {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => console.log('Cancelled', data))
            .catch(error => console.error(error));
        }

        savePickedButtons();
    });
});

loadPickedButtons();
