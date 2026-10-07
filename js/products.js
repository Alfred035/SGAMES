/** SGAMES v2.1 — catálogo carregado da API. */
let products = [];
let promotions = [];
let catalogError = '';

const catalogReady = Promise.all([
  apiRequest('/api/products'),
  apiRequest('/api/promotions')
]).then(([productResponse, promotionResponse]) => {
  if (!Array.isArray(productResponse.data) || !Array.isArray(promotionResponse.data)) {
    throw new Error('O catálogo retornou dados inválidos.');
  }
  products = productResponse.data;
  promotions = promotionResponse.data;
  return true;
}).catch(error => {
  catalogError = error.message;
  return false;
});
