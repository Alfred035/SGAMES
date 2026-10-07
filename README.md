# 🎮 SGAMES

Loja gamer fictícia para estudo de desenvolvimento web, com HTML, CSS, JavaScript, uma API Node.js e banco SQLite.

## Versão atual: v2.1 — Autenticação

- Cadastro com nome, e-mail e senha, login, logout e página **Minha conta**.
- Senhas protegidas com `scrypt`, salt individual e sessões persistidas no banco.
- Cookie de sessão `HttpOnly` e `SameSite=Lax`, com validade de 7 dias. Em produção, também usa `Secure`.
- Catálogo com 37 produtos, 4 promoções, pesquisa, filtro por categoria, ordenação e páginas de produto.
- Carrinho local com quantidade limitada, validação de dados salvos e sincronização entre abas.
- Navegação responsiva, foco por teclado no carrinho, estado vazio e tratamento de falhas de conexão.

O carrinho fica neste navegador, compartilhado entre contas; ele não é salvo por usuário no servidor. Checkout, pedidos, administração, recuperação de senha e confirmação de e-mail ainda não foram implementados. O formulário de contato é demonstrativo e não envia mensagens.

## Como executar

Instale **Node.js 24 ou superior** e **Git**. No terminal:

```sh
git clone https://github.com/Alfred035/SGAMES.git
cd SGAMES
npm ci
npm start
```

Acesse **http://localhost:3000** e mantenha o terminal aberto. Se já tem o projeto, execute `git pull` dentro da pasta antes de `npm ci`.

Para desenvolvimento com reinício automático do backend:

```sh
npm run dev
```

Não é necessário instalar outro serviço de banco de dados nem pacotes externos. SQLite é fornecido pelo Node. Abrir `index.html` diretamente ou usar Live Server não fornece a API; use o endereço HTTP do servidor. Se a porta estiver ocupada, encerre o servidor anterior ou altere `PORT`.

## Criar uma conta

1. Clique em **Entrar**, no cabeçalho, ou abra `/conta.html`.
2. Informe nome, e-mail e uma senha de 10 a 128 caracteres, e confirme a senha.
3. O cadastro já inicia a sessão. Recarregar ou navegar entre páginas mantém o login.
4. Em **Minha conta**, clique em **Sair da conta** para encerrar a sessão atual.

Não existe usuário padrão. O e-mail é normalizado e não pode ser repetido. Não são armazenadas senhas nem tokens de autenticação em `localStorage`.

## Configuração

As variáveis são opcionais para uso local. Para ajustá-las, copie `.env.example` para `.env` e edite. `npm start` e `npm run dev` carregam esse arquivo quando existe; variáveis já definidas no processo têm precedência.

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor |
| `HOST` | `127.0.0.1` | Interface de rede; use `0.0.0.0` para permitir conexões externas |
| `DATABASE_PATH` | `data/sgames.sqlite` no projeto | Caminho do arquivo SQLite |
| `NODE_ENV` | desenvolvimento | `production` ativa cookies `Secure` |
| `APP_ORIGIN` | Origem HTTP da requisição local | Origem exata permitida, como `https://loja.example`, sem caminho |

Para publicar com autenticação, use HTTPS via proxy reverso, configure `NODE_ENV=production` e `APP_ORIGIN` com a origem pública HTTPS. O servidor recusa iniciar em produção sem essa configuração. Ele não usa cabeçalhos encaminhados para decidir a origem; `APP_ORIGIN` define a origem aceita por trás do proxy.

## Banco de dados

Na primeira inicialização, `server/catalog.json` é importado para `data/sgames.sqlite`. O seed é aplicado uma vez em uma transação. Reiniciar não sobrescreve o catálogo.

A v2.1 cria as tabelas de usuários e sessões automaticamente, preservando o banco da v2.0. Preços são armazenados em centavos inteiros e expostos em reais na API. A sessão usa um token aleatório; apenas o hash do token fica no banco.

`data/` e `.env` são ignorados pelo Git. Preserve o banco: removê-lo apaga contas e dados locais. Para backup simples, encerre o servidor e copie o arquivo SQLite. Alterar o JSON de seed não atualiza um banco já existente.

## API

Respostas de erro usam `{ "error": "mensagem" }`. As páginas e a API são servidas na mesma origem.

| Método | Endpoint | Resposta |
| --- | --- | --- |
| GET | `/api/health` | `{ status: "ok" }` após consultar o banco |
| GET | `/api/products` | `{ data: [...], total }` |
| GET | `/api/products/:id` | `{ data: produto }` ou 404 |
| GET | `/api/promotions` | `{ data: [...], total }` |
| POST | `/api/auth/register` | `{ user }`, status 201 e cookie de sessão |
| POST | `/api/auth/login` | `{ user }` e novo cookie de sessão |
| GET | `/api/auth/me` | `{ user }` ou 401 quando não autenticado |
| POST | `/api/auth/logout` | Revoga a sessão atual e remove seu cookie |

A listagem aceita `q`, `tipo`, `categoria` e `ordem` (`padrao`, `nome-asc`, `nome-desc`, `preco-asc`, `preco-desc`). Exemplo:

```text
/api/products?tipo=console&categoria=playstation&ordem=preco-asc
```

Cadastro recebe `{ name, email, password }`; login recebe `{ email, password }`; logout recebe `{}`. Os POSTs exigem `Content-Type: application/json` e `Origin` correspondente à origem da loja, com corpo de até 16 KiB. O navegador envia o cookie e a origem automaticamente.

O servidor rejeita ações iniciadas por outros sites. Login e cadastro têm limites por IP (30) e e-mail (10) em uma janela de 15 minutos, retornando 429 e `Retry-After`. Esses limites ficam em memória e são reiniciados com o processo; esta implementação atende a uma instância do servidor. Por trás de um proxy, o limite por IP considera a conexão do proxy, sem confiar em `X-Forwarded-For` arbitrário.

## Testes

```sh
npm test
```

Os testes usam bancos temporários e verificam catálogo, pesquisa, filtros, arquivos públicos, cadastro, senhas protegidas, validação, login, rotação e revogação das sessões, expiração, cookies, origem das requisições, limite de corpo, tentativas e persistência após reabrir o banco. Eles não alteram `data/sgames.sqlite`.

Para verificar a interface, exercite cadastro, login e logout em `/conta.html`; pesquise e limpe filtros em `/jogos.html`; adicione um produto ao carrinho e recarregue. O Google Fonts é um recurso visual opcional e requer acesso a `fonts.googleapis.com` e `fonts.gstatic.com`.

## Estrutura

```text
SGAMES/
├── *.html                 # páginas da loja e conta
├── css/                   # estilos globais, componentes e conta
├── js/
│   ├── api.js             # cliente HTTP
│   ├── auth.js            # cadastro, login e sessão na interface
│   ├── products.js        # carregamento do catálogo
│   └── script.js          # catálogo, filtros, carrinho e navegação
├── server/
│   ├── index.js           # inicialização e configuração
│   ├── app.js             # servidor HTTP, API e arquivos públicos
│   ├── auth.js            # usuários, senhas e sessões
│   ├── http.js            # JSON e verificação de origem
│   ├── database.js        # banco e migrações
│   └── catalog.json       # seed inicial
├── test/                  # testes de integração
├── img/ e fonts/          # recursos visuais locais
├── .env.example           # configuração opcional
└── data/                  # banco local, ignorado pelo Git
```

## Evolução

- **v1.0:** site estático.
- **v1.1:** organização de CSS, JavaScript e navegação.
- **v1.2–v1.3:** catálogo dinâmico, pesquisa e filtros.
- **v1.4:** carrinho com `localStorage`.
- **v1.5:** página individual de produto.
- **v2.0:** API de catálogo e SQLite.
- **v2.1:** cadastro, login, sessões e logout.

Próximas etapas: recuperação de senha e confirmação de e-mail, pedidos e carrinho por usuário, autenticação para administração do catálogo.
