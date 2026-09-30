/**
 * SGAMES v1.3
 * Navegação, carrossel, catálogo dinâmico, pesquisa, filtros e ordenação.
 */

(() => {
  'use strict';

  const currentPage = document.body.dataset.page;
  const searchInput = document.querySelector('#pesquisa');
  const catalogContainers = [...document.querySelectorAll('[data-catalog]')];
  const productCatalogs = catalogContainers.filter((container) => container.dataset.catalog !== 'promocao');
  const hasProductCatalog = productCatalogs.length > 0 && typeof products !== 'undefined';

  const formatPrice = (price) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // ===== NAVEGAÇÃO =====
  document.querySelectorAll('.menu a').forEach((link) => {
    const page = link.getAttribute('href')?.replace('.html', '');
    if (page === currentPage) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // ===== CATÁLOGO =====
  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = product.type === 'jogo' ? 'produto' : 'console';
    card.dataset.productId = product.id;
    card.dataset.category = product.category;
    card.dataset.name = product.name.toLowerCase();

    const image = document.createElement('img');
    image.src = product.image;
    image.alt = `Imagem de ${product.name}`;
    image.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = product.name;

    const price = document.createElement('p');
    if (product.oldPrice) {
      price.innerHTML = `<del>${formatPrice(product.oldPrice)}</del> ${formatPrice(product.price)}`;
    } else {
      price.textContent = formatPrice(product.price);
    }

    card.append(image, title, price);
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

  const renderInitialCatalogs = () => {
    if (!hasProductCatalog) return;

    catalogContainers.forEach((container) => {
      if (container.dataset.catalog === 'promocao') {
        if (typeof promotions !== 'undefined') {
          promotions.forEach((promotion) => container.append(createPromotionCard(promotion)));
        }
        return;
      }

      const category = container.dataset.category;
      products
        .filter((product) => product.type === container.dataset.catalog && product.category === category)
        .forEach((product) => container.append(createProductCard(product)));
    });
  };

  const getCatalogType = () => productCatalogs[0]?.dataset.catalog || null;

  const categoryLabels = {
    casuais: 'Casuais',
    esportes: 'Esportes',
    corrida: 'Corrida',
    destaques: 'Destaques',
    playstation: 'PlayStation',
    xbox: 'Xbox',
    nintendo: 'Nintendo',
    headset: 'Headset',
    controle: 'Controle',
    vr: 'Óculos VR',
    mouse: 'Mouse'
  };

  const getAvailableCategories = () => {
    const type = getCatalogType();
    return [...new Set(products.filter((product) => product.type === type).map((product) => product.category))];
  };

  const createFilterToolbar = () => {
    if (!hasProductCatalog) return null;

    const toolbar = document.createElement('section');
    toolbar.className = 'catalogo-filtros';
    toolbar.setAttribute('aria-label', 'Pesquisa e filtros do catálogo');

    const searchGroup = document.createElement('div');
    searchGroup.className = 'filtro-grupo filtro-pesquisa';

    const searchLabel = document.createElement('label');
    searchLabel.htmlFor = 'filtro-pesquisa';
    searchLabel.textContent = 'Pesquisar';

    const filterSearch = document.createElement('input');
    filterSearch.type = 'search';
    filterSearch.id = 'filtro-pesquisa';
    filterSearch.placeholder = 'Nome do produto...';
    filterSearch.autocomplete = 'off';

    searchGroup.append(searchLabel, filterSearch);

    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'filtro-grupo';

    const categoryLabel = document.createElement('label');
    categoryLabel.htmlFor = 'filtro-categoria';
    categoryLabel.textContent = 'Categoria';

    const categorySelect = document.createElement('select');
    categorySelect.id = 'filtro-categoria';

    const allOption = new Option('Todas', 'todos');
    categorySelect.append(allOption);

    getAvailableCategories().forEach((category) => {
      categorySelect.append(new Option(categoryLabels[category] || category, category));
    });

    categoryGroup.append(categoryLabel, categorySelect);

    const sortGroup = document.createElement('div');
    sortGroup.className = 'filtro-grupo';

    const sortLabel = document.createElement('label');
    sortLabel.htmlFor = 'ordenacao';
    sortLabel.textContent = 'Ordenar';

    const sortSelect = document.createElement('select');
    sortSelect.id = 'ordenacao';
    [
      ['padrao', 'Mais relevantes'],
      ['nome-asc', 'Nome: A-Z'],
      ['nome-desc', 'Nome: Z-A'],
      ['preco-asc', 'Menor preço'],
      ['preco-desc', 'Maior preço']
    ].forEach(([value, label]) => sortSelect.append(new Option(label, value)));

    sortGroup.append(sortLabel, sortSelect);

    const resultCount = document.createElement('p');
    resultCount.className = 'resultado-contagem';
    resultCount.setAttribute('aria-live', 'polite');

    toolbar.append(searchGroup, categoryGroup, sortGroup, resultCount);

    const firstSection = productCatalogs[0]?.closest('section');
    firstSection?.parentElement?.insertBefore(toolbar, firstSection);

    return { toolbar, filterSearch, categorySelect, sortSelect, resultCount };
  };

  const sortProducts = (items, order) => {
    const sorted = [...items];
    if (order === 'nome-asc') sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (order === 'nome-desc') sorted.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
    if (order === 'preco-asc') sorted.sort((a, b) => a.price - b.price);
    if (order === 'preco-desc') sorted.sort((a, b) => b.price - a.price);
    return sorted;
  };

  const applyFilters = ({ query = '', category = 'todos', order = 'padrao' } = {}) => {
    if (!hasProductCatalog) return;

    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const type = getCatalogType();
    let totalVisible = 0;

    productCatalogs.forEach((container) => {
      const section = container.closest('section');
      const sectionCategory = container.dataset.category;

      const matchingProducts = products.filter((product) => {
        const sameType = product.type === type;
        const sameCategory = category === 'todos' ? true : product.category === category;
        const matchesSection = product.category === sectionCategory;
        const matchesSearch = !normalizedQuery || product.name.toLocaleLowerCase('pt-BR').includes(normalizedQuery);
        return sameType && sameCategory && matchesSection && matchesSearch;
      });

      const sortedProducts = sortProducts(matchingProducts, order);
      container.replaceChildren(...sortedProducts.map(createProductCard));
      totalVisible += sortedProducts.length;

      if (section) {
        section.hidden = sortedProducts.length === 0;
      }
    });

    const countElement = document.querySelector('.resultado-contagem');
    if (countElement) {
      countElement.textContent = `${totalVisible} ${totalVisible === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
    }
  };

  renderInitialCatalogs();

  const toolbar = createFilterToolbar();

  if (hasProductCatalog) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    const initialCategory = params.get('categoria') || 'todos';
    const initialOrder = params.get('ordem') || 'padrao';

    if (toolbar) {
      toolbar.filterSearch.value = initialQuery;
      toolbar.categorySelect.value = getAvailableCategories().includes(initialCategory) ? initialCategory : 'todos';
      toolbar.sortSelect.value = ['padrao', 'nome-asc', 'nome-desc', 'preco-asc', 'preco-desc'].includes(initialOrder)
        ? initialOrder
        : 'padrao';
    }

    const syncSearch = (value) => {
      if (searchInput) searchInput.value = value;
      if (toolbar) toolbar.filterSearch.value = value;
    };

    const updateUrl = (query, category, order) => {
      const params = new URLSearchParams(window.location.search);
      query ? params.set('q', query) : params.delete('q');
      category !== 'todos' ? params.set('categoria', category) : params.delete('categoria');
      order !== 'padrao' ? params.set('ordem', order) : params.delete('ordem');
      const queryString = params.toString();
      window.history.replaceState(null, '', queryString ? `?${queryString}` : window.location.pathname);
    };

    const updateFilters = () => {
      const query = toolbar?.filterSearch.value || searchInput?.value || '';
      const category = toolbar?.categorySelect.value || 'todos';
      const order = toolbar?.sortSelect.value || 'padrao';

      syncSearch(query);
      applyFilters({ query, category, order });
      updateUrl(query, category, order);
    };

    toolbar?.filterSearch.addEventListener('input', updateFilters);
    toolbar?.categorySelect.addEventListener('change', updateFilters);
    toolbar?.sortSelect.addEventListener('change', updateFilters);

    searchInput?.addEventListener('input', updateFilters);

    searchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        searchInput.value = '';
        updateFilters();
      }
    });

    applyFilters({ query: initialQuery, category: initialCategory, order: initialOrder });
  }

  // ===== CARROSSEL =====
  const slidesContainer = document.querySelector('.slides');
  const slides = document.querySelectorAll('.slide');

  if (!slidesContainer || slides.length <= 1) return;

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
