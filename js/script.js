/**
 * SGAMES v1.4
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

  // ===== CARRINHO / LOCALSTORAGE =====
  const CART_KEY = 'sgames-cart-v1';
  let cart = loadCart();

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  const saveCart = () => localStorage.setItem(CART_KEY, JSON.stringify(cart));

  const getProduct = (id) =>
    typeof products !== 'undefined' ? products.find((product) => product.id === id) : null;

  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  const getCartTotal = () => cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  const updateCartBadge = () => {
    const count = getCartCount();
    document.querySelectorAll('.contador-carrinho').forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  };

  const addToCart = (productId) => {
    const product = getProduct(productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }

    saveCart();
    updateCartBadge();
    renderCart();
    openCart();
  };

  const changeQuantity = (productId, delta) => {
    const item = cart.find((entry) => entry.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
  };

  const removeFromCart = (productId) => {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
  };

  const createCartRoot = () => {
    const root = document.querySelector('#carrinho-root');
    if (!root) return null;

    root.innerHTML = `
      <div class="carrinho-overlay" data-cart-close></div>
      <aside class="carrinho-painel" aria-label="Carrinho de compras" aria-hidden="true">
        <header class="carrinho-cabecalho">
          <div>
            <p class="carrinho-kicker">SGAMES</p>
            <h2>Seu carrinho</h2>
          </div>
          <button class="carrinho-fechar" type="button" data-cart-close aria-label="Fechar carrinho">×</button>
        </header>
        <div class="carrinho-itens" aria-live="polite"></div>
        <footer class="carrinho-rodape">
          <div class="carrinho-total"><span>Total</span><strong>R$ 0,00</strong></div>
          <button class="botao-finalizar" type="button" disabled>Finalizar compra</button>
          <button class="botao-limpar" type="button">Limpar carrinho</button>
        </footer>
      </aside>`;

    root.querySelectorAll('[data-cart-close]').forEach((element) =>
      element.addEventListener('click', closeCart)
    );
    root.querySelector('.botao-limpar')?.addEventListener('click', () => {
      if (!cart.length) return;
      cart = [];
      saveCart();
      updateCartBadge();
      renderCart();
    });

    return root;
  };

  let cartRoot = createCartRoot();

  const openCart = () => {
    if (!cartRoot) return;
    const panel = cartRoot.querySelector('.carrinho-painel');
    cartRoot.classList.add('aberto');
    panel?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('carrinho-aberto');
  };

  function closeCart() {
    if (!cartRoot) return;
    const panel = cartRoot.querySelector('.carrinho-painel');
    cartRoot.classList.remove('aberto');
    panel?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('carrinho-aberto');
  }

  const renderCart = () => {
    if (!cartRoot) return;
    const itemsContainer = cartRoot.querySelector('.carrinho-itens');
    const totalElement = cartRoot.querySelector('.carrinho-total strong');
    const finishButton = cartRoot.querySelector('.botao-finalizar');
    const clearButton = cartRoot.querySelector('.botao-limpar');
    if (!itemsContainer || !totalElement) return;

    if (!cart.length) {
      itemsContainer.innerHTML = `
        <div class="carrinho-vazio">
          <span aria-hidden="true">🛒</span>
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione produtos para começar sua compra.</p>
        </div>`;
    } else {
      itemsContainer.replaceChildren(...cart.map((item) => {
        const product = getProduct(item.id);
        const wrapper = document.createElement('article');
        wrapper.className = 'item-carrinho';
        if (!product) return wrapper;

        const image = document.createElement('img');
        image.src = product.image;
        image.alt = '';
        image.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'item-carrinho-info';
        const title = document.createElement('h3');
        title.textContent = product.name;
        const price = document.createElement('p');
        price.textContent = formatPrice(product.price);
        info.append(title, price);

        const controls = document.createElement('div');
        controls.className = 'item-carrinho-controles';
        const decrease = document.createElement('button');
        decrease.type = 'button'; decrease.textContent = '−';
        decrease.setAttribute('aria-label', `Diminuir quantidade de ${product.name}`);
        decrease.addEventListener('click', () => changeQuantity(product.id, -1));
        const quantity = document.createElement('span');
        quantity.textContent = item.quantity;
        quantity.setAttribute('aria-label', `Quantidade: ${item.quantity}`);
        const increase = document.createElement('button');
        increase.type = 'button'; increase.textContent = '+';
        increase.setAttribute('aria-label', `Aumentar quantidade de ${product.name}`);
        increase.addEventListener('click', () => changeQuantity(product.id, 1));
        controls.append(decrease, quantity, increase);

        const remove = document.createElement('button');
        remove.type = 'button'; remove.className = 'item-carrinho-remover';
        remove.textContent = 'Remover';
        remove.addEventListener('click', () => removeFromCart(product.id));

        wrapper.append(image, info, controls, remove);
        return wrapper;
      }));
    }

    totalElement.textContent = formatPrice(getCartTotal());
    if (finishButton) finishButton.disabled = cart.length === 0;
    if (clearButton) clearButton.disabled = cart.length === 0;
  };

  const bindCartEvents = () => {
    document.querySelectorAll('.botao-carrinho').forEach((button) => {
      button.addEventListener('click', openCart);
    });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-add-cart]');
      if (button) addToCart(button.dataset.addCart);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeCart();
    });
  };

  bindCartEvents();
  updateCartBadge();
  renderCart();

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

    const actions = document.createElement('div');
    actions.className = 'produto-acoes';

    const detailsLink = document.createElement('a');
    detailsLink.className = 'botao-ver-produto';
    detailsLink.href = `produto.html?id=${encodeURIComponent(product.id)}`;
    detailsLink.textContent = 'Ver produto';
    detailsLink.setAttribute('aria-label', `Ver detalhes de ${product.name}`);

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'botao-adicionar-carrinho';
    addButton.dataset.addCart = product.id;
    addButton.textContent = 'Adicionar ao carrinho';
    addButton.setAttribute('aria-label', `Adicionar ${product.name} ao carrinho`);

    actions.append(detailsLink, addButton);
    card.append(image, title, price, actions);
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

  // ===== PÁGINA DE PRODUTO =====
  const productDetail = document.querySelector('[data-product-detail]');

  if (productDetail && typeof products !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = products.find((item) => item.id === productId);

    const setProductMessage = (title, message) => {
      productDetail.innerHTML = `
        <div class="produto-nao-encontrado">
          <span aria-hidden="true">🎮</span>
          <h1>${title}</h1>
          <p>${message}</p>
          <a class="botao-voltar-produtos" href="index.html">Voltar para a loja</a>
        </div>`;
    };

    if (!product) {
      setProductMessage('Produto não encontrado', 'O produto solicitado não existe ou não está mais disponível no catálogo.');
      document.title = 'SGAMES - Produto não encontrado';
    } else {
      const typeLabels = { jogo: 'Jogo', console: 'Console', acessorio: 'Acessório' };
      const categoryLabelsDetail = {
        casuais: 'Casuais', esportes: 'Esportes', corrida: 'Corrida', destaques: 'Destaques',
        playstation: 'PlayStation', xbox: 'Xbox', nintendo: 'Nintendo',
        headset: 'Headset', controle: 'Controle', vr: 'Óculos VR', mouse: 'Mouse'
      };
      const descriptionByType = {
        jogo: 'Encontre este título no catálogo SGAMES e confira o preço atual para sua coleção gamer.',
        console: 'Console disponível no catálogo SGAMES para completar sua experiência de jogos.',
        acessorio: 'Acessório gamer disponível no catálogo SGAMES para complementar seu setup.'
      };

      document.title = `SGAMES - ${product.name}`;
      productDetail.innerHTML = `
        <div class="produto-detalhe-imagem">
          <img src="${product.image}" alt="Imagem de ${product.name}">
        </div>
        <div class="produto-detalhe-info">
          <p class="produto-detalhe-kicker">${typeLabels[product.type] || 'Produto'} · ${categoryLabelsDetail[product.category] || product.category}</p>
          <h1>${product.name}</h1>
          <div class="produto-detalhe-preco">
            ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ''}
            <strong>${formatPrice(product.price)}</strong>
          </div>
          <p class="produto-detalhe-descricao">${product.description || descriptionByType[product.type] || 'Produto disponível no catálogo SGAMES.'}</p>
          <div class="produto-detalhe-meta">
            <span>Categoria: <strong>${categoryLabelsDetail[product.category] || product.category}</strong></span>
            <span>Disponibilidade: <strong>Em estoque</strong></span>
          </div>
          <button class="botao-detalhe-carrinho" type="button" data-add-cart="${product.id}">Adicionar ao carrinho</button>
          <a class="botao-voltar-produtos" href="${product.type === 'jogo' ? 'jogos.html' : product.type === 'console' ? 'console.html' : 'acessorios.html'}">Voltar ao catálogo</a>
        </div>`;

      const related = products
        .filter((item) => item.type === product.type && item.id !== product.id)
        .slice(0, 4);
      const relatedContainer = document.querySelector('[data-related-products]');
      if (relatedContainer) {
        related.forEach((item) => relatedContainer.append(createProductCard(item)));
      }
    }
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
