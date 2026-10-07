export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function readJson(req) {
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'Envie os dados como application/json.');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    size += chunk.length;
    if (size > 16 * 1024) {
      req.resume();
      throw new HttpError(413, 'Dados enviados excedem o limite.');
    }
    chunks.push(chunk);
  }
  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new HttpError(400, 'JSON inválido.');
  }
}

// Cookies não devem autorizar ações iniciadas por outros sites.
export function verifyOrigin(req, configuredOrigin) {
  const expected = configuredOrigin || `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`;
  if (req.headers.origin !== expected || req.headers['sec-fetch-site'] === 'cross-site') {
    throw new HttpError(403, 'Origem da requisição não permitida.');
  }
}
