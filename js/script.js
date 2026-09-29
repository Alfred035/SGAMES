/**
 * SGAMES v1.2
 * Navegação, carrossel e renderização do catálogo.
 */

(() => {
  'use strict';

  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.menu a').forEach((link) => {
    const page = link.getAttribute('href')?.replace('.html', '');
    if (page === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = product.type === 'jogo' ? 'produto' : 'console';

    const image = document.createElement('img');
    image.src = product.image;
    image.alt = `Imagem de ${product.name}`;
    image.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = product.name;

    card.append(image, title);

    const price = document.createElement('p');
    if (product.oldPrice) {
      price.innerHTML = `<del>${formatPrice(product.oldPrice)}</del> ${formatPrice(product.price)}`;
    } else {
      price.textContent = formatPrice(product.price);
    }
    card.append(price);

    return card;
  };

  const createPromotionCard = (promotion) => {
    const card = document.createElement('article');
    card.className = 'promo';

    const image = document.createElement('img');
    image.src = promotion.image;
    image.alt = `Imagem de ${promotion.name}`;
    image.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = promotion.name;
    card.append(image, title);

    if (promotion.price) {
      const price = document.createElement('p');
      price.innerHTML = promotion.oldPrice
        ? `<del>${formatPrice(promotion.oldPrice)}</del> ${formatPrice(promotion.price)}`
        : formatPrice(promotion.price);
      card.append(price);
    }

    return card;
  };

  const renderCatalog = () => {
    if (typeof products === 'undefined') return;

    document.querySelectorAll('[data-catalog]').forEach((container) => {
      const catalogType = container.dataset.catalog;
      const category = container.dataset.category;

      if (catalogType === 'promocao') {
        if (typeof promotions !== 'undefined') {
          promotions.forEach((promotion) => container.append(createPromotionCard(promotion)));
        }
        return;
      }

      const filteredProducts = products.filter((product) =>
        product.type === catalogType && product.category === category
      );

      filteredProducts.forEach((product) => container.append(createProductCard(product)));
    });
  };

  renderCatalog();

  const slidesContainer = document.querySelector('.slides');
  const slides = document.querySelectorAll('.slide');

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
