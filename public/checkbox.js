document.addEventListener('DOMContentLoaded', function () {
    const themeToggleCheckbox = document.getElementById('themeToggleCheckbox');
    const body = document.body;
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    const modal = document.querySelector('.modal'); 
    const contactForm = document.querySelector('#contactForm'); 
    const aboutButton = document.querySelector('.about_button'); 

    function applyNightMode(isNightMode) {
        body.classList.toggle('night-mode', isNightMode);
        header.classList.toggle('night-mode', isNightMode);
        sidebar.classList.toggle('night-mode', isNightMode);
        modal.classList.toggle('night-mode', isNightMode); 
        contactForm.classList.toggle('night-mode', isNightMode);
        aboutButton.classList.toggle('night-mode', isNightMode);
        themeToggleCheckbox.checked = isNightMode;
    }

    const savedTheme = localStorage.getItem('nightMode');
    if (savedTheme === 'true') {
        applyNightMode(true);
    }

    themeToggleCheckbox.addEventListener('change', function () {
        const isChecked = themeToggleCheckbox.checked;
        applyNightMode(isChecked);

        localStorage.setItem('nightMode', isChecked);
    });
});


