# Empr-E

Este projeto foi elaborado como parte integrante das atividades desenvolvidas no Projeto de Extensão proposto aos alunos do 3o Semestre do Curso de Tecnologia em Análise e Desenvolvimento de Sistemas, do IFSP - Campinas, que visa aplicar os conhecimentos adquiridos em sala de aula nas disciplinas de Desenvolvimento Web 1, Banco de Dados 2, Introdução à Administração e Interação Humano-Computador, num contexto prático e real.

## Link de acesso
https://empr-e.web.app/

## Sobre o Projeto

A Empr-E é um marketplace B2B desenvolvido para conectar empresas comprometidas com a inclusão. Ela busca atender tanto as empresas que buscam soluções de acessibilidade quanto as fornecedoras especializadas em produtos e serviços inclusivos.

Essa proposta surge da necessidade de centralizar a oferta de recursos voltados à inclusão e acessibilidade, facilitando a busca, comparação e aquisição desses produtos por organizações que desejam promover ambientes mais inclusivos.

Mais do que um marketplace, a Empr-E foi concebida com foco em acessibilidade digital, usabilidade e experiência do usuário, seguindo princípios do Design Universal e diretrizes internacionais de acessibilidade, como a WCAG 2.1.


## Objetivos

A Empr-E busca:

1- Facilitar o acesso de empresas a produtos e soluções de acessibilidade;
2- Conectar fornecedores especializados aos seus potenciais compradores;
3- Promover a inclusão por meio da tecnologia;
4- Entregar uma experiência digital acessível para diferentes perfis de usuários;
5- Disponibilizar uma plataforma centralizada, intuitiva, segura e eficiente para negociações B2B.

## Funcionalidades

Atualmente o sistema possui:

### Área Institucional

- Página inicial com apresentação da plataforma;
- Informações sobre a proposta da empresa;
- Seções de destaque e navegação completa.

### Autenticação

- Cadastro de usuários;
- Login de usuários;
- Integração com Firebase Authentication.

### Catálogo de Produtos

- Listagem e pesquisa de produtos;
- Filtragem de resultados;
- Página de detalhes dos produtos.

### Processo de Compra

- Adição de produtos ao carrinho;
- Gerenciamento do carrinho;
- Fluxo de compra estruturado com simulação de pagamento.

### Área do Usuário

- Minha Conta;
- Histórico de pedidos;
- Lista de favoritos;
- Gerenciamento de informações pessoais.

### Administração de Dados

- Integração com Firestore;
- Estrutura de banco SQL para modelagem e estudos;
- Organização de dados voltada para expansão futura da plataforma.

## Acessibilidade

A acessibilidade é um dos pilares centrais do projeto. Durante o desenvolvimento foram aplicadas diversas práticas alinhadas às recomendações WCAG 2.1 e aos princípios de Design Universal, tais como estrutura HTML semântica, contraste adequado, layout responsivo, entre outros recursos de acessibilidade. O objetivo é garantir que a plataforma possa ser utilizada pelo maior número possível de pessoas, independentemente de suas limitações ou necessidades específicas.

## Tecnologias Utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript
- Bootstrap

### Back-end e Serviços

- Firebase Authentication
- Firebase Firestore
- Firebase Hosting

### Banco de Dados

- Modelagem SQL
- Firestore (NoSQL)

### Ferramentas de Desenvolvimento

- Git
- GitHub
- Visual Studio Code

## Estrutura do Projeto

```text
Empr-E/
│
├── index.html
│
├── assets/
|   ── css/
|   │   ├── login.css
|   │   ├── cadastro.css
|   │   ├── catalogo.css
|   │   ├── detalhe-produto.css
|   │   ├── carrinho.css
|   │   ├── catalogo-ajuste-imaagem.css
|   │   ├── catalogo-carousel.css
|   │   ├── pagamento.css
|   │   ├── style.css
|   |   ├── toast.css
|   │   └── conta.css
|   │
|   ── js/
|   │   ├── cadastro.js
|   │   ├── firebase.js
|   │   ├── catalogo.js
|   │   ├── detalhe-produto.js
|   │   ├── carrinho.js
|   │   ├── login.js
|   │   ├── pagamento.js
|   │   ├── produtos-local.js
|   |   ├── script.js
|   │   └── conta.js
│   |
|   ── img/
|   |
├── pages/
|      ├── login.html
|      ├── cadastro.html
|      ├── catalogo.html
|      ├── detalhe-produto.html
|      ├── carrinho.html
|      ├── pagamento.html
|      ├── institucional.html
|      └── conta.html
│
├── bancoSQL/
│
└── firebase/
```

## Páginas Principais

| Página | Descrição |
|----------|------------|
| Home | Apresentação da plataforma |
| Login | Autenticação de usuários |
| Cadastro | Registro de novos usuários |
| Catálogo | Consulta aos produtos |
| Detalhe do Produto | Informações detalhadas |
| Carrinho | Gerenciamento de compras |
| Pagamento | Finalização da compra |
| Minha Conta | Área pessoal do usuário |

## Como Executar o Projeto

### Instalar dependências

```bash
npm install
```

### Executar localmente

```bash
firebase serve
```

ou

```bash
npm start
```

(caso exista script configurado)

### Realizar deploy

```bash
firebase deploy
```

## Banco de Dados

A pasta `bancoSQL/` contém a modelagem relacional utilizada para estudos e documentação do sistema.

Entre as principais entidades modeladas estão:

- Usuários
- Empresas
- Produtos
- Categorias
- Pedidos
- Itens do Pedido
- Favoritos
- Carrinho
- Avaliações

A aplicação utiliza o Firebase Firestore como banco principal durante o desenvolvimento.

## Equipe

Projeto desenvolvido por estudantes do curso de Análise e Desenvolvimento de Sistemas como atividade acadêmica interdisciplinar de extensão.

## Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.

Todos os direitos pertencem aos respectivos autores.