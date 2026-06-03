# Empr-E

Projeto de marketplace B2B focado em produtos e soluções de acessibilidade.

## O que já está desenvolvido

- Página inicial com seções institucionais e navegação completa.
- Fluxo de autenticação (login e cadastro).
- Catálogo de produtos.
- Carrinho e tela de pagamento.
- Área Minha Conta com histórico, favoritos e interações.
- Integração com Firebase (Auth, Firestore e Hosting).
- Estrutura de banco SQL para estudo/modelagem em `bancoSQL/`.

## Páginas principais

- `index.html`
- `pages/login.html`
- `pages/cadastro.html`
- `pages/catalogo.html`
- `pages/carrinho.html`
- `pages/pagamento.html`
- `pages/conta.html`
- `pages/detalhe-produto.html`

## Acessibilidade (status atual)

Foram aplicadas melhorias importantes para adequação ao WCAG:

- Ajustes de contraste em componentes críticos.
- Revisão de uso de ARIA em elementos de layout.
- Inclusão/revisão de skip links.
- Padronização de textos alternativos em imagens.
- Aviso em links que abrem nova guia.

## Tecnologias usadas

- HTML, CSS e JavaScript (vanilla)
- Firebase (Authentication, Firestore, Hosting)
- Bootstrap (CSS)

## Rodando o projeto

Instalar dependências:

```bash
npm install
```

Deploy no Firebase:

```bash
firebase deploy
```

## Observação

Este repositório está em evolução contínua. A base funcional já está pronta e os ajustes atuais estão focados em acabamento visual, consistência de navegação e conformidade de acessibilidade.