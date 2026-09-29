/**
 * SGAMES v1.1
 * Funcionalidade atual: carrossel automático da página inicial.
 */

(() => {
  'use strict';

  // Mantém a página atual destacada no menu sem duplicar essa lógica em cada HTML.
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.menu a').forEach((link) => {
    const page = link.getAttribute('href')?.replace('.html', '');
    if (page === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const slidesContainer = document.querySelector('.slides');
  const slides = document.querySelectorAll('.slide');

  // As outras páginas não possuem carrossel. Evita erros desnecessários no console.
  if (!slidesContainer || slides.length <= 1) {
    return;
  }

  let currentSlide = 0;
  const slideInterval = 5000;

  const showSlide = (index) => {
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;
  };

  const showNextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  };

  showSlide(currentSlide);
  window.setInterval(showNextSlide, slideInterval);
})();
