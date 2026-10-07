/** Cliente HTTP compartilhado, com prazo de resposta e erros legíveis. */
class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  if (window.location.protocol === 'file:') {
    throw new ApiError('Inicie a loja com npm start e acesse http://localhost:3000.');
  }
  try {
    const response = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error || 'Não foi possível concluir a operação.', response.status);
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Não foi possível conectar à loja. Verifique a conexão e tente novamente.');
  }
}
