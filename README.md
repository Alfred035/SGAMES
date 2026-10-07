# 🎮 SGAMES

**SGAMES** é um projeto de site de e-commerce fictício voltado para o universo gamer, desenvolvido inicialmente com **HTML, CSS e JavaScript**.

O projeto começou como um site estático acadêmico e está sendo evoluído em versões para demonstrar a progressão técnica do desenvolvimento.

## 📌 Versão atual

**v2.0 — API + banco de dados (primeira etapa)**

O catálogo e as promoções são persistidos em SQLite e consultados por uma API Node.js. As páginas HTML são servidas pelo mesmo backend. Login, pedidos e gerenciamento administrativo ainda não foram implementados.

## ✨ O que existe atualmente

- Página inicial com banners e carrossel automático
- Catálogo de jogos gerado dinamicamente
- Catálogo de consoles gerado dinamicamente
- Catálogo de acessórios gerado dinamicamente
- Promoções geradas dinamicamente
- Página de contato
- Formulário de contato com validação nativa do navegador
- Navegação entre páginas
- Layout responsivo
- Identidade visual gamer

> O catálogo agora vem da API. Pesquisa, filtros, página de produto e carrinho estão disponíveis; o carrinho continua persistido no navegador com localStorage.

## 🧹 Alterações da v1.1

### CSS

O arquivo de estilos deixou de concentrar toda a implementação em um único bloco e passou a ser dividido por responsabilidade:

```text
css/
├── base.css         # reset, variáveis, tipografia e estilos globais
├── components.css   # header, menu, cards, contato, footer etc.
├── responsive.css   # regras para diferentes tamanhos de tela
└── style.css        # ponto de entrada dos estilos
```

Também foram criadas **variáveis CSS** para cores, bordas, sombras e transições, reduzindo repetição e facilitando alterações futuras.

### JavaScript

O código do carrossel foi reorganizado para:

- evitar execução desnecessária em páginas sem carrossel;
- utilizar escopo isolado com IIFE;
- utilizar `const` e `let` de forma consistente;
- separar a função de exibição do slide da troca automática;
- manter o código preparado para novas funcionalidades.

O JavaScript também identifica automaticamente a página atual e aplica `aria-current="page"` ao item correspondente do menu.

### HTML

- Adicionado `data-page` ao `<body>` para identificação da página.
- Conteúdo principal das páginas foi agrupado em `<main>` quando aplicável.
- Script passou a ser carregado com `defer` de forma padronizada.
- Navegação recebeu estado visual para a página atual.
- Estrutura e indentação foram padronizadas.

## 🔄 Alterações da v1.2

A principal mudança desta versão foi retirar os produtos diretamente do HTML e centralizar seus dados em `js/products.js`.

### Catálogo centralizado

Cada produto agora é representado por um objeto com informações como:

```javascript
{
  id: 'gta-v',
  name: 'Grand Theft Auto V Enhanced',
  price: 149.90,
  image: 'img/gtaV.png',
  type: 'jogo',
  category: 'destaques'
}
```

O HTML passa a definir apenas **onde** o catálogo será exibido:

```html
<div class="produtos catalogo" data-catalog="jogo" data-category="destaques"></div>
```

O JavaScript filtra os dados pela categoria e cria os cards automaticamente. Isso reduz repetição de HTML e deixa a manutenção do catálogo centralizada.

### Separação de responsabilidades

```text
js/
├── products.js   # dados dos produtos e promoções
└── script.js     # renderização, navegação e carrossel
```

### Formatação de preços

Os valores numéricos são armazenados como números e formatados para Real brasileiro no momento da renderização. Preços promocionais também podem possuir `oldPrice`.

## 🗂️ Estrutura do projeto

```text
SGAMES/
│
├── index.html
├── jogos.html
├── console.html
├── acessorios.html
├── contato.html
│
├── css/
│   ├── base.css
│   ├── components.css
│   ├── responsive.css
│   └── style.css
│
├── js/
│   └── script.js
│
├── fonts/
│   └── koho-v18-latin-regular.woff2
│
├── img/
│   ├── banners
│   ├── jogos
│   ├── consoles
│   ├── acessórios
│   └── outros recursos visuais
│
└── README.md
```

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Git / GitHub

## ▶️ Como executar

Requer **Node.js 24 ou superior**, com SQLite nativo. Não há pacotes externos nem serviço de banco separado.

```sh
npm ci
npm start
```

Abra o site na porta **3000** do servidor. Para reiniciar automaticamente ao modificar o backend, use `npm run dev`. Abrir o HTML diretamente ou usar Live Server não fornece a API necessária nesta versão.

```sh
npm test
```

O teste de integração usa um banco temporário e verifica a API, pesquisa, filtros, preços, persistência e isolamento de arquivos internos.

### Banco de dados

Na primeira inicialização, o backend cria `data/sgames.sqlite` e importa 37 produtos e 4 promoções de `server/catalog.json`. O seed é aplicado uma vez, dentro de uma transação; reiniciar não sobrescreve os dados. Os valores monetários são armazenados em centavos inteiros e expostos em reais na API.

`data/` é ignorado pelo Git. Faça backup do banco antes de removê-lo. Alterar o JSON de seed não atualiza um banco já existente.

Variáveis opcionais: `PORT` (padrão `3000`), `HOST` (padrão `127.0.0.1`) e `DATABASE_PATH` (caminho do arquivo SQLite). Para acesso por outra máquina, configure `HOST=0.0.0.0` no ambiente de execução.

### API v2.0

| Método | Endpoint | Resultado |
| --- | --- | --- |
| GET | `/api/health` | Estado da aplicação e conexão com o banco |
| GET | `/api/products` | `{ data: [...], total }` |
| GET | `/api/products/:id` | `{ data: produto }` ou 404 |
| GET | `/api/promotions` | `{ data: [...], total }` |

A listagem aceita `q`, `tipo`, `categoria` e `ordem` (`padrao`, `nome-asc`, `nome-desc`, `preco-asc`, `preco-desc`). Exemplo: `/api/products?tipo=console&categoria=playstation&ordem=preco-asc`.

Esta primeira etapa oferece consultas públicas. Ainda não há endpoints de escrita, autenticação, checkout ou pedidos. As páginas carregam o catálogo pela API e exibem uma mensagem com opção de tentar novamente quando o backend falha.

## 🧭 Roadmap

### v1.0 — Site estático

- [x] Estrutura inicial do site
- [x] Catálogo visual
- [x] Navegação entre páginas
- [x] Carrossel de banners
- [x] Responsividade básica

### v1.1 — Refatoração e organização

- [x] Organização do CSS por responsabilidade
- [x] Variáveis CSS
- [x] JavaScript organizado
- [x] Estrutura HTML padronizada
- [x] Navegação com página atual identificada
- [x] Melhorias de acessibilidade

### v1.2 — Catálogo dinâmico

- [ ] Centralizar produtos em JavaScript
- [ ] Renderizar cards dinamicamente
- [ ] Implementar pesquisa
- [ ] Implementar filtros
- [ ] Implementar ordenação

### v1.4 — Carrinho

- [ ] Adicionar produtos ao carrinho
- [ ] Alterar quantidade
- [ ] Remover produtos
- [ ] Calcular total
- [ ] Persistir carrinho com `localStorage`

### v2.0 — Full Stack

- [x] API de consulta do catálogo
- [x] Banco de dados SQLite
- [ ] Cadastro e login
- [ ] Autenticação
- [ ] Gerenciamento de produtos

## 📚 Objetivo acadêmico

O projeto tem finalidade educacional e busca aplicar, de forma progressiva, conceitos de desenvolvimento web, organização de código, interface, JavaScript e posteriormente desenvolvimento full stack.

## 📌 Status

**Em desenvolvimento.**

## v1.4 — Pesquisa e filtros

A versão 1.3 adiciona interação ao catálogo sem alterar a arquitetura estática do projeto.

### Novidades

- Pesquisa de produtos por nome.
- Filtro por categoria.
- Ordenação por nome e preço.
- Contador de resultados encontrados.
- Estado vazio quando nenhum produto corresponde aos filtros.
- Filtros sincronizados com a URL usando os parâmetros `q`, `categoria` e `ordem`.
- Pesquisa do cabeçalho integrada ao catálogo da página atual.
- Layout dos filtros adaptado para telas menores.

### Exemplos de URL

```text
jogos.html?q=cyber
console.html?categoria=playstation
acessorios.html?categoria=headset&ordem=preco-asc
```


## v1.5 — Página de produto

- Página individual em `produto.html?id=<produto>`
- Informações do produto, preço e categoria
- Botão para adicionar diretamente ao carrinho
- Produtos relacionados
- Tratamento para produto inexistente
- Integração com o carrinho e `localStorage` da v1.4
