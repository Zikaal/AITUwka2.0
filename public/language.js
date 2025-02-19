document.addEventListener('DOMContentLoaded', function() {
    // Function to apply the selected language
    function applyLanguage(selectedLanguage) {
        const translatableElements = document.querySelectorAll('[data-en], [data-ru]');
        
        translatableElements.forEach(element => {
            let textContent, placeholder;

            switch (selectedLanguage) {
                case 'en':
                    textContent = element.getAttribute('data-en');
                    placeholder = element.getAttribute('data-en');
                    break;
                case 'ru':
                    textContent = element.getAttribute('data-ru');
                    placeholder = element.getAttribute('data-ru');
                    break;
                default:
                    break;
            }

            if (textContent) {
                element.textContent = textContent;
            }

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (placeholder) {
                    element.placeholder = placeholder;
                }
            }
        });
    }

    // Set the language on page load
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en'; 
    const languageSelect = document.getElementById('language');

    if (languageSelect) {
        languageSelect.value = savedLanguage;
        applyLanguage(savedLanguage); // Apply language content
    } else {
        console.error("Language select element not found.");
    }

    // Event listener for language change
    if (languageSelect) {
        languageSelect.addEventListener('change', function () {
            const selectedLanguage = this.value;
            localStorage.setItem('selectedLanguage', selectedLanguage); 
            applyLanguage(selectedLanguage); // Update content based on selected language
        });
    }
});
