'use strict';

import { auth, db } from './firebase.js';
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

const searchInput = document.getElementById('campo-busca');
const categorySelect = document.getElementById('filtro-categoria');
const companySelect = document.getElementById('filtro-empresa');
const modalitySelect = document.getElementById('filtro-modalidade');
const resultsLabel = document.getElementById('catalogo-resultado');
const catalogGrid = document.getElementById('catalogo-lista');
const userPanel = document.getElementById('catalogo-painel-usuario');
const userPanelText = document.getElementById('catalogo-painel-texto');
const userPanelLink = document.getElementById('catalogo-painel-link');
const sessionStorageKey = 'empre:usuario-logado';
const favoriteIds = new Set();

const baseProducts = [
  {
    id: 'rampa-modular-pro',
    initials: 'RM',
    name: 'Rampa Modular Pro',
    company: 'AcessTech Solucoes',
    companySlug: 'acesstech-solucoes',
    category: 'mobilidade',
    categoryLabel: 'Mobilidade',
    description: 'Rampa modular para eventos, acessos temporarios e retrofit de entradas comerciais.',
    price: 'Sob consulta',
    purchaseMode: 'sob-consulta',
    purchaseModeLabel: 'Sob consulta'
  },
  {
    id: 'piso-tatil-smart',
    initials: 'PT',
    name: 'Piso Tatil Smart',
    company: 'Klinker',
    companySlug: 'klinker',
    category: 'visual',
    categoryLabel: 'Deficiencia visual',
    description: 'Sistema de sinalizacao tatil para rotas acessiveis em empresas, escolas e predios publicos.',
    price: 'A partir de R$ 890',
    purchaseMode: 'compra-imediata',
    purchaseModeLabel: 'Compra imediata'
  },
  {
    id: 'suite-wcag-enterprise',
    initials: 'WC',
    name: 'Suite WCAG Enterprise',
    company: 'DigitalInclude',
    companySlug: 'digitalinclude',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Auditoria, monitoramento continuo e ajustes de acessibilidade para sistemas web corporativos.',
    price: 'Plano mensal',
    purchaseMode: 'projeto-personalizado',
    purchaseModeLabel: 'Projeto personalizado'
  },
  {
    id: 'corrimao-safe-line',
    initials: 'CS',
    name: 'Corrimao Safe Line',
    company: 'Inclui Engenharia',
    companySlug: 'inclui-engenharia',
    category: 'mobilidade',
    categoryLabel: 'Mobilidade',
    description: 'Corrimao tecnico com instalacao rapida para rotas internas e areas de grande circulacao.',
    price: 'Sob medida',
    purchaseMode: 'projeto-personalizado',
    purchaseModeLabel: 'Projeto personalizado'
  },
  {
    id: 'mapa-sensorial-3d',
    initials: 'MS',
    name: 'Mapa Sensorial 3D',
    company: 'Visao Ativa',
    companySlug: 'visao-ativa',
    category: 'visual',
    categoryLabel: 'Deficiencia visual',
    description: 'Mapa tatil com legenda em braille para recepcoes, halls corporativos e centros de evento.',
    price: 'Projeto personalizado',
    purchaseMode: 'projeto-personalizado',
    purchaseModeLabel: 'Projeto personalizado'
  },
  {
    id: 'plugin-libras-flow',
    initials: 'LF',
    name: 'Plugin Libras Flow',
    company: 'Sinal Digital',
    companySlug: 'sinal-digital',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Camada de traducao em Libras, leitura assistida e ajustes de navegacao para portais B2B.',
    price: 'Licenca anual',
    purchaseMode: 'compra-imediata',
    purchaseModeLabel: 'Compra imediata'
  }
];

function getAllProducts() {
  const sellerProducts = typeof window.obterProdutosMarketplace === 'function'
    ? window.obterProdutosMarketplace()
    : [];

  return baseProducts.concat(sellerProducts);
}

function readSessionUser() {
  try {
    const parsed = JSON.parse(localStorage.getItem(sessionStorageKey) ?? 'null');
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

function createProductCard(product) {
  const isFavorite = favoriteIds.has(product.id);

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
        <span class="produto-card__modalidade">${product.purchaseModeLabel}</span>
        <div class="produto-card__rodape">
          <span class="produto-card__preco">${product.price}</span>
          <div class="produto-card__acoes">
            <button type="button" class="btn btn--outline btn--sm produto-card__favorito ${isFavorite ? 'produto-card__favorito--ativo' : ''}" data-favorite="${product.id}" aria-pressed="${isFavorite ? 'true' : 'false'}">${isFavorite ? 'Favoritado' : 'Favoritar'}</button>
            <button type="button" class="btn btn--primary btn--sm" data-add-cart="${product.id}">Adicionar</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function updateUserPanel() {
  if (!userPanel || !userPanelText || !userPanelLink) {
    return;
  }

  const user = readSessionUser();

  if (!user) {
    userPanelText.textContent = 'Compradores salvam favoritos e mensagens. Vendedores tambem podem gerenciar produtos pela area Minha conta.';
    userPanelLink.textContent = 'Entrar para acessar';
    userPanelLink.href = 'login.html';
    return;
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

  if (!user || !isFirebaseConfigured || !db) {
    renderProducts();
    return;
  }

  try {
    const snapshot = await getDocs(query(collection(db, 'favoritos'), where('userId', '==', user.uid)));

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

  if (!isFirebaseConfigured || !db) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Configure o Firebase para salvar favoritos.', 'info');
    }
    return;
  }

  const selectedProduct = getAllProducts().find((product) => product.id === productId);

  if (!selectedProduct) {
    return;
  }

  const favoriteRef = doc(db, 'favoritos', getFavoriteDocumentId(user.uid, productId));

  try {
    if (favoriteIds.has(productId)) {
      await deleteDoc(favoriteRef);
      favoriteIds.delete(productId);

      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Produto removido dos favoritos.', 'info');
      }
    } else {
      await setDoc(favoriteRef, {
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
        userRole: user.role
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
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-add-cart');
      const selectedProduct = getAllProducts().find((product) => product.id === productId);

      if (selectedProduct && typeof window.adicionarItemAoCarrinho === 'function') {
        window.adicionarItemAoCarrinho(selectedProduct);
      }
    });
  });

  catalogGrid.querySelectorAll('[data-favorite]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-favorite');

      if (productId) {
        toggleFavorite(productId);
      }
    });
  });
}

const initialCategory = new URLSearchParams(window.location.search).get('categoria') ?? '';

if (categorySelect && initialCategory) {
  categorySelect.value = initialCategory;
}

populateFilterOptions();
updateUserPanel();
loadFavorites();

searchInput?.addEventListener('input', renderProducts);
categorySelect?.addEventListener('change', renderProducts);
companySelect?.addEventListener('change', renderProducts);
modalitySelect?.addEventListener('change', renderProducts);

renderProducts();
