# 🎮 SGAMES

**SGAMES** é um projeto de site de e-commerce fictício voltado para o universo gamer, desenvolvido inicialmente com **HTML, CSS e JavaScript**.

O projeto começou como um site estático acadêmico e está sendo evoluído em versões para demonstrar a progressão técnica do desenvolvimento.

## 📌 Versão atual

**v1.1 — Refatoração e organização do código**

Nesta versão, o foco foi melhorar a estrutura interna do projeto sem alterar sua proposta visual ou adicionar funcionalidades que pertencem às próximas etapas.

## ✨ O que existe atualmente

- Página inicial com banners e carrossel automático
- Catálogo de jogos
- Catálogo de consoles
- Catálogo de acessórios
- Página de contato
- Formulário de contato com validação nativa do navegador
- Navegação entre páginas
- Layout responsivo
- Identidade visual gamer

> O carrinho, a pesquisa de produtos e o envio real do formulário ainda são apenas elementos de interface. Essas funcionalidades serão implementadas em versões futuras.

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

Não há dependências de backend nesta versão.

Basta abrir `index.html` no navegador ou utilizar uma extensão como **Live Server** no Visual Studio Code.

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

### v1.3 — Carrinho

- [ ] Adicionar produtos ao carrinho
- [ ] Alterar quantidade
- [ ] Remover produtos
- [ ] Calcular total
- [ ] Persistir carrinho com `localStorage`

### v2.0 — Full Stack

- [ ] API
- [ ] Banco de dados
- [ ] Cadastro e login
- [ ] Autenticação
- [ ] Gerenciamento de produtos

## 📚 Objetivo acadêmico

O projeto tem finalidade educacional e busca aplicar, de forma progressiva, conceitos de desenvolvimento web, organização de código, interface, JavaScript e posteriormente desenvolvimento full stack.

## 📌 Status

**Em desenvolvimento.**
