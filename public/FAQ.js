document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        faqItem.classList.toggle('active');

        document.querySelectorAll('.faq-item').forEach((item) => {
            if (item !== faqItem && item.classList.contains('active')) {
                item.classList.remove('active');
            }
        });
    });
});
