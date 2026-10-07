/** SGAMES v2.0 — catálogo carregado da API. */
let products = [];
let promotions = [];

const catalogReady = Promise.all([
  fetch('/api/products'),
  fetch('/api/promotions')
]).then(async (responses) => {
  if (responses.some((response) => !response.ok)) {
    throw new Error('Não foi possível carregar o catálogo.');
  }
  const [productResponse, promotionResponse] = await Promise.all(
    responses.map((response) => response.json())
  );
  products = productResponse.data;
  promotions = promotionResponse.data;
  return true;
}).catch(() => false);
