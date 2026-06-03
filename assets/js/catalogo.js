'use strict';

// Usa window.auth e window.db definidos em firebase.js
// O Firestore já é exportado de ./firebase.js, então não precisa importar diretamente aqui.

const searchInput = document.getElementById('campo-busca');
const categorySelect = document.getElementById('filtro-categoria');
const companySelect = document.getElementById('filtro-empresa');
const modalitySelect = document.getElementById('filtro-modalidade');
const resultsLabel = document.getElementById('catalogo-resultado');
const catalogGrid = document.getElementById('catalogo-lista');
const userPanel = document.getElementById('catalogo-painel-usuario');
const userPanelText = document.getElementById('catalogo-painel-texto');
const userPanelLink = document.getElementById('catalogo-painel-link');
const catalogSessionStorageKey = 'empre:usuario-logado';
const favoriteIds = new Set();
const toast = document.getElementById("toast-container");

// ESTRUTURA PARA PRODUTOS - NÃO EXCLUIR POR ENQUANTO 
const baseProducts = [
  {
    id: 'solucoes-software',
    initials: 'SS',
    name: 'Soluções de Software Acessível',
    company: 'Acessify',
    companySlug: 'acessify',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Auditoria, monitoramento continuo e ajustes de acessibilidade para sistemas web corporativos.',
    price: 'Plano recorrente a partir de R$ 1.000/mês',
    purchaseMode: 'projeto-personalizado',
    purchaseModeLabel: 'Projeto personalizado'
  }
];

function getAllProducts() {
  const sellerProducts = typeof window.obterProdutosMarketplace === 'function'
    ? window.obterProdutosMarketplace()
    : [];
  // Separa produtos locais dos cadastrados
  const produtosLocais = sellerProducts.filter(p => p.sellerId === 'local');
  const produtosCadastrados = sellerProducts.filter(p => p.sellerId !== 'local');
  // Ordem: locais, base, cadastrados
  return produtosLocais.concat(baseProducts, produtosCadastrados);
}

async function syncMarketplaceProducts() {
  if (typeof window.sincronizarProdutosMarketplace !== 'function') {
    return;
  }

  try {
    await window.sincronizarProdutosMarketplace();
  } catch (error) {
    console.error('Falha ao sincronizar produtos no catalogo:', error?.code || error?.message || error);
  }
}

function readSessionUser() {
  const sessionKey = window.sessionStorageKey || catalogSessionStorageKey;

  try {
    const parsed = JSON.parse(localStorage.getItem(sessionKey) ?? 'null');
    return parsed && typeof parsed.uid === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function resolveAccountPath() {
  return 'conta.html';
}

function getFavoriteDocumentId(userId, productId) {
  return `${userId}_${productId}`;
}

function getSelectedCategory() {
  const queryCategory = new URLSearchParams(window.location.search).get('categoria') ?? '';
  const uiCategory = categorySelect?.value ?? '';
  return uiCategory || queryCategory;
}

function getSelectedCompany() {
  return companySelect?.value ?? '';
}

function getSelectedModality() {
  return modalitySelect?.value ?? '';
}

function populateFilterOptions() {
  if (companySelect) {
    const companies = [...new Map(getAllProducts().map((product) => [product.companySlug, product.company])).entries()];
    companySelect.innerHTML = ['<option value="">Todas as empresas</option>']
      .concat(companies.map(([slug, name]) => `<option value="${slug}">${name}</option>`))
      .join('');
  }
}

function getFilteredProducts() {
  const selectedCategory = getSelectedCategory();
  const selectedCompany = getSelectedCompany();
  const selectedModality = getSelectedModality();
  const searchTerm = normalizeText(searchInput?.value.trim() ?? '');

  return getAllProducts().filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesCompany = !selectedCompany || product.companySlug === selectedCompany;
    const matchesModality = !selectedModality || product.purchaseMode === selectedModality;
    const searchableContent = normalizeText(`${product.name} ${product.company} ${product.description}`);
    const matchesSearch = !searchTerm || searchableContent.includes(searchTerm);
    return matchesCategory && matchesCompany && matchesModality && matchesSearch;
  });
}

function buildProductImageAlt(product, index = 0, total = 1) {
  const safeName = product?.name || 'produto';
  const safeCompany = product?.company || 'empresa nao informada';
  const safeCategory = product?.categoryLabel || 'categoria nao informada';
  const positionLabel = total > 1 ? ` Foto ${index + 1} de ${total}.` : '';

  return `${safeName}, empresa ${safeCompany}, categoria ${safeCategory}.${positionLabel}`;
}

function createProductCard(product) {
  const isFavorite = favoriteIds.has(product.id);
  const firstImageAlt = buildProductImageAlt(product, 0, (product.images || []).length || 1);
  return `
    <article class="produto-card" aria-label="${product.name} - ${product.company}">
      <a href="detalhe-produto.html?id=${product.id}" class="produto-card__link">
        <div class="produto-card__media">
          ${product.images && product.images.length ? `
            <div class="produto-card__carousel" data-product-id="${product.id}">
              <button type="button" class="produto-card__carousel-arrow produto-card__carousel-arrow--left" aria-label="Imagem anterior" tabindex="0">&#8592;</button>
              <img src="${product.images[0]}" alt="${firstImageAlt}" title="${firstImageAlt}" class="produto-card__imagem" loading="lazy">
              <button type="button" class="produto-card__carousel-arrow produto-card__carousel-arrow--right" aria-label="Próxima imagem" tabindex="0">&#8594;</button>
            </div>
          ` : `
            <span class="produto-card__iniciais" aria-hidden="true">${product.initials}</span>
          `}
          <span class="produto-card__empresa">${product.company}</span>
        </div>
        <div class="produto-card__conteudo">
          <span class="produto-card__categoria">${product.categoryLabel}</span>
          <h3 class="produto-card__titulo">${product.name}</h3>
          <p class="produto-card__descricao">${product.description}</p>
          <span class="produto-card__modalidade">${product.purchaseModeLabel}</span>
          <!-- Galeria removida, imagens só no topo -->
          <div class="produto-card__rodape">
            <span class="produto-card__preco">${product.price}</span>
            <div class="produto-card__acoes">
              <button type="button" class="produto-card__favorito-icon ${isFavorite ? 'produto-card__favorito-icon--ativo' : ''}" data-favorite="${product.id}" aria-pressed="${isFavorite ? 'true' : 'false'}" aria-label="${isFavorite ? 'Desfavoritar produto' : 'Favoritar produto'}" title="${isFavorite ? 'Desfavoritar' : 'Favoritar'}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
              <button type="button" class="btn btn--primary btn--sm produto-card__btn-adicionar" data-add-cart="${product.id}">Adicionar</button>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

function updateUserPanel() {
  if (!userPanel || !userPanelText || !userPanelLink) {
    return;
  }

  const user = readSessionUser();

  if (!user) {
    // Esconde o painel de sessão para visitantes
    userPanel.style.display = 'none';
    return;
  } else {
    userPanel.style.display = '';
  }

  const isAdmin = user.role === 'administrador';
  const accountType = user.accountType === 'vendedor' ? 'vendedor' : 'comprador';
  userPanelText.textContent = isAdmin
    ? `Sessao administrativa ativa para ${user.razaoSocial || user.email}. Voce visualiza todas as interacoes do catalogo e segue com perfil ${accountType}.`
    : `Sessao ${accountType} ativa para ${user.razaoSocial || user.email}. Seus favoritos, mensagens e atalhos da conta ficam vinculados ao usuario logado.`;
  userPanelLink.textContent = 'Abrir minha conta';
  userPanelLink.href = resolveAccountPath();
}

async function loadFavorites() {
  const user = readSessionUser();
  favoriteIds.clear();

  // Se não houver usuário logado, apenas renderiza os produtos normalmente
  if (!user) {
    renderProducts();
    return;
  }


  if (!window.db) {
    renderProducts();
    return;
  }

  try {
    const snapshot = await window.db.collection('favoritos').where('userId', '==', user.uid).get();
    snapshot.forEach((favoriteDoc) => {
      const favorite = favoriteDoc.data();
      if (favorite?.productId) {
        favoriteIds.add(favorite.productId);
      }
    });
  } catch (error) {
    console.error(error);
  }
  renderProducts();
}

async function toggleFavorite(productId) {
  const user = readSessionUser();

  if (!user) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Faca login para favoritar produtos.', 'info');
    }
    return;
  }

  if (!window.db) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Configure o Firebase para salvar favoritos.', 'info');
    }
    return;
  }

  const selectedProduct = getAllProducts().find((product) => product.id === productId);

  if (!selectedProduct) {
    return;
  }

  const favoriteRef = window.db.collection('favoritos').doc(getFavoriteDocumentId(user.uid, productId));

  try {
    if (favoriteIds.has(productId)) {
      await favoriteRef.delete();
      favoriteIds.delete(productId);

      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Produto removido dos favoritos.', 'info');
      }
    } else {
      await favoriteRef.set({
        category: selectedProduct.category,
        categoryLabel: selectedProduct.categoryLabel,
        company: selectedProduct.company,
        createdAt: new Date().toISOString(),
        description: selectedProduct.description,
        initials: selectedProduct.initials,
        name: selectedProduct.name,
        price: selectedProduct.price,
        productId: selectedProduct.id,
        purchaseMode: selectedProduct.purchaseMode,
        purchaseModeLabel: selectedProduct.purchaseModeLabel,
        userEmail: user.email,
        userId: user.uid,
        userRole: user.role || 'usuario-comum'
      });
      favoriteIds.add(productId);

      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Produto favoritado com sucesso.', 'sucesso');
      }
    }

    renderProducts();
  } catch (error) {
    console.error(error);

    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Nao foi possivel atualizar os favoritos.', 'erro');
    }
  }
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
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const productId = button.getAttribute('data-add-cart');
      const selectedProduct = getAllProducts().find((product) => product.id === productId);
      if (selectedProduct && typeof window.adicionarItemAoCarrinho === 'function') {
        showToast('Produto adicionado ao carrinho!', 'Good_Toast', 800);
        window.adicionarItemAoCarrinho(selectedProduct);
      }
      else{
        showToast('Erro ao adicionar o produto no carrinho!', 'Bad_Toast', 800);
        return;
      }
    });
  });

  catalogGrid.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const productId = button.getAttribute('data-favorite');
      if (productId) {
        toggleFavorite(productId);
      }
    });
  });

  attachCarouselListeners();
// Carrossel simples para imagens do produto no topo do card
function attachCarouselListeners() {
  document.querySelectorAll('.produto-card__carousel').forEach(carousel => {
    const productId = carousel.getAttribute('data-product-id');
    const product = getAllProducts().find(p => p.id === productId);
    if (!product || !product.images || product.images.length < 2) return;
    let index = 0;
    const img = carousel.querySelector('.produto-card__imagem');
    const left = carousel.querySelector('.produto-card__carousel-arrow--left');
    const right = carousel.querySelector('.produto-card__carousel-arrow--right');
    function update() {
      const imageDescription = buildProductImageAlt(product, index, product.images.length);
      img.src = product.images[index];
      img.alt = imageDescription;
      img.title = imageDescription;
    }
    left.addEventListener('click', e => {
      e.preventDefault();
      index = (index - 1 + product.images.length) % product.images.length;
      update();
    });
    right.addEventListener('click', e => {
      e.preventDefault();
      index = (index + 1) % product.images.length;
      update();
    });
  });
}
}

const initialCategory = new URLSearchParams(window.location.search).get('categoria') ?? '';

if (categorySelect && initialCategory) {
  categorySelect.value = initialCategory;
}

populateFilterOptions();
updateUserPanel();
loadFavorites();

syncMarketplaceProducts().then(() => {
  populateFilterOptions();
  renderProducts();
});

searchInput?.addEventListener('input', renderProducts);
categorySelect?.addEventListener('change', renderProducts);
companySelect?.addEventListener('change', renderProducts);
modalitySelect?.addEventListener('change', renderProducts);

renderProducts();
