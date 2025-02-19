document.addEventListener('DOMContentLoaded', () => {
    loadPickedButtons();
    initButtons();
});

function loadPickedButtons() {
    // Получаем сохраненные кнопки из localStorage, если их нет - возвращаем пустой массив
    const storedPickedButtons = JSON.parse(localStorage.getItem('pickedButtons') || '[]');

    // Проверяем, является ли storedPickedButtons массивом
    if (!Array.isArray(storedPickedButtons)) {
        console.error('storedPickedButtons is not an array:', storedPickedButtons);
        return;
    }

    // Проходим по всем кнопкам "Interested" и устанавливаем их состояние
    document.querySelectorAll('.interested').forEach(button => {
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

function savePickedButtons() {
    // Сохраняем ID кнопок, которые имеют класс "picked"
    const pickedButtons = Array.from(document.querySelectorAll('.interested'))
        .filter(button => button.classList.contains('picked'))
        .map(button => button.getAttribute('data-id'));

    // Сохраняем массив ID в localStorage
    localStorage.setItem('pickedButtons', JSON.stringify(pickedButtons));
}

function initButtons() {
    // Добавляем обработчик событий на каждую кнопку "Interested"
    document.querySelectorAll('.interested').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Переключаем класс "picked" и изменяем текст кнопки
            const isPicked = button.classList.toggle('picked');
            button.textContent = isPicked ? 'Picked' : 'Interested';

            // Сохраняем текущее состояние кнопок
            savePickedButtons();
        });
    });
}

