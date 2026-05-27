'use strict';

const searchInput = document.getElementById('campo-busca');
const categorySelect = document.getElementById('filtro-categoria');
const resultsLabel = document.getElementById('catalogo-resultado');
const catalogGrid = document.getElementById('catalogo-lista');

const products = [
  {
    id: 'rampa-modular-pro',
    initials: 'RM',
    name: 'Rampa Modular Pro',
    company: 'AcessTech Solucoes',
    category: 'mobilidade',
    categoryLabel: 'Mobilidade',
    description: 'Rampa modular para eventos, acessos temporarios e retrofit de entradas comerciais.',
    price: 'Sob consulta'
  },
  {
    id: 'piso-tatil-smart',
    initials: 'PT',
    name: 'Piso Tatil Smart',
    company: 'Klinker',
    category: 'visual',
    categoryLabel: 'Deficiencia visual',
    description: 'Sistema de sinalizacao tatil para rotas acessiveis em empresas, escolas e predios publicos.',
    price: 'A partir de R$ 890'
  },
  {
    id: 'suite-wcag-enterprise',
    initials: 'WC',
    name: 'Suite WCAG Enterprise',
    company: 'DigitalInclude',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Auditoria, monitoramento continuo e ajustes de acessibilidade para sistemas web corporativos.',
    price: 'Plano mensal'
  },
  {
    id: 'corrimao-safe-line',
    initials: 'CS',
    name: 'Corrimao Safe Line',
    company: 'Inclui Engenharia',
    category: 'mobilidade',
    categoryLabel: 'Mobilidade',
    description: 'Corrimao tecnico com instalacao rapida para rotas internas e areas de grande circulacao.',
    price: 'Sob medida'
  },
  {
    id: 'mapa-sensorial-3d',
    initials: 'MS',
    name: 'Mapa Sensorial 3D',
    company: 'Visao Ativa',
    category: 'visual',
    categoryLabel: 'Deficiencia visual',
    description: 'Mapa tatil com legenda em braille para recepcoes, halls corporativos e centros de evento.',
    price: 'Projeto personalizado'
  },
  {
    id: 'plugin-libras-flow',
    initials: 'LF',
    name: 'Plugin Libras Flow',
    company: 'Sinal Digital',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Camada de traducao em Libras, leitura assistida e ajustes de navegacao para portais B2B.',
    price: 'Licenca anual'
  }
];

function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getSelectedCategory() {
  const queryCategory = new URLSearchParams(window.location.search).get('categoria') ?? '';
  const uiCategory = categorySelect?.value ?? '';
  return uiCategory || queryCategory;
}

function getFilteredProducts() {
  const selectedCategory = getSelectedCategory();
  const searchTerm = normalizeText(searchInput?.value.trim() ?? '');

  return products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const searchableContent = normalizeText(`${product.name} ${product.company} ${product.description}`);
    const matchesSearch = !searchTerm || searchableContent.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function createProductCard(product) {
  return `
    <article class="produto-card" aria-label="${product.name} - ${product.company}">
      <div class="produto-card__media">
        <span class="produto-card__iniciais" aria-hidden="true">${product.initials}</span>
        <span class="produto-card__empresa">${product.company}</span>
      </div>
      <div class="produto-card__conteudo">
        <span class="produto-card__categoria">${product.categoryLabel}</span>
        <h3 class="produto-card__titulo">${product.name}</h3>
        <p class="produto-card__descricao">${product.description}</p>
        <div class="produto-card__rodape">
          <span class="produto-card__preco">${product.price}</span>
          <button type="button" class="btn btn--primary btn--sm" data-add-cart="${product.id}">Adicionar</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  if (!catalogGrid || !resultsLabel) {
    return;
  }

  const filteredProducts = getFilteredProducts();
  resultsLabel.textContent = `${filteredProducts.length} resultado(s)`;

  if (!filteredProducts.length) {
    catalogGrid.innerHTML = `
      <div class="catalogo__vazio">
        <div>
          <h3>Nenhum produto encontrado</h3>
          <p>Ajuste a busca ou troque a categoria para visualizar outras solucoes do marketplace.</p>
        </div>
      </div>
    `;
    return;
  }

  catalogGrid.innerHTML = filteredProducts.map(createProductCard).join('');

  catalogGrid.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-add-cart');
      const selectedProduct = products.find((product) => product.id === productId);

      if (selectedProduct && typeof window.adicionarItemAoCarrinho === 'function') {
        window.adicionarItemAoCarrinho(selectedProduct);
      }
    });
  });
}

const initialCategory = new URLSearchParams(window.location.search).get('categoria') ?? '';

if (categorySelect && initialCategory) {
  categorySelect.value = initialCategory;
}

searchInput?.addEventListener('input', renderProducts);
categorySelect?.addEventListener('change', renderProducts);

renderProducts();