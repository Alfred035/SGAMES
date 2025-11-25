// Lógica do carrossel automático
let index = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

function showNextSlide() {
    index++;
    if (index >= totalSlides) {
        index = 0;
    }
    updateCarousel();
}

function updateCarousel() {
    const newTransformValue = -index * 100;
    document.querySelector('.slides').style.transform = `translateX(${newTransformValue}%)`;
}

// Mudar de slide automaticamente a cada 5 segundos
setInterval(showNextSlide, 5000);
