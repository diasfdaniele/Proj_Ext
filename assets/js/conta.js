'use strict';

import { auth, db } from './firebase.js';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const sessionStorageKey = 'empre:usuario-logado';
const heroText = document.getElementById('conta-hero-texto');
const summaryText = document.getElementById('conta-resumo-texto');
const totalFavorites = document.getElementById('conta-total-favoritos');
const totalInteractions = document.getElementById('conta-total-interacoes');
const favoritesText = document.getElementById('conta-favoritos-texto');
const favoritesList = document.getElementById('conta-favoritos-lista');
const cartText = document.getElementById('conta-carrinho-texto');
const cartList = document.getElementById('conta-carrinho-lista');
const interactionsText = document.getElementById('conta-interacoes-texto');
const interactionsList = document.getElementById('conta-interacoes-lista');
const logoutButton = document.getElementById('btn-sair-conta');
const sellerShell = document.getElementById('conta-vendedor-shell');
const sellerText = document.getElementById('conta-vendedor-texto');
const sellerProductList = document.getElementById('conta-produtos-lista');
const sellerProductForm = document.getElementById('produto-form');
const sellerProductStatus = document.getElementById('produto-status');

function readSessionUser() {
  try {
    const parsed = JSON.parse(localStorage.getItem(sessionStorageKey) ?? 'null');
    return parsed && typeof parsed.uid === 'string'
      ? {
          accountType: parsed.accountType === 'vendedor' ? 'vendedor' : 'comprador',
          ...parsed
        }
      : null;
  } catch {
    return null;
  }
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function readCartItems() {
  return typeof window.obterItensCarrinho === 'function' ? window.obterItensCarrinho() : [];
}

function readSellerProducts() {
  const user = readSessionUser();

  if (!user || typeof window.obterProdutosMarketplace !== 'function') {
    return [];
  }

  return window.obterProdutosMarketplace().filter((product) => product.sellerId === user.uid);
}

function renderEmptyState(target, message) {
  if (!target) {
    return;
  }

  target.innerHTML = `
    <div class="conta-vazio">
      <p>${message}</p>
    </div>
  `;
}

function updateSummary(favoritesCount, interactionsCount) {
  totalFavorites.textContent = String(favoritesCount);
  totalInteractions.textContent = String(interactionsCount);
}

function requireAuthenticationState() {
  const user = readSessionUser();

  if (!user) {
    summaryText.textContent = 'Entre com sua conta para acessar seus favoritos e historico de interacoes.';
    heroText.textContent = 'Acesse sua conta para visualizar seus produtos favoritos, carrinho, historico e recursos personalizados do marketplace.';
    favoritesText.textContent = 'Seus favoritos aparecerao aqui apos o login.';
    cartText.textContent = 'Entre com sua conta para acompanhar o carrinho e continuar sua compra.';
    interactionsText.textContent = 'Entre com sua conta para acompanhar suas interacoes.';
    renderEmptyState(favoritesList, 'Nenhum favorito disponivel. Faca login e favorite produtos no catalogo.');
    renderEmptyState(cartList, 'Nenhum item disponivel. Faca login e adicione produtos ao carrinho.');
    renderEmptyState(interactionsList, 'Nenhuma interacao disponivel. Faca login para visualizar seu historico.');
    updateSummary(0, 0);
    logoutButton.hidden = true;
    sellerShell.hidden = true;
    return null;
  }

  logoutButton.hidden = false;
  summaryText.textContent = user.accountType === 'vendedor'
    ? `Conta de vendedor ativa para ${user.razaoSocial || user.email}. Alem dos favoritos e interacoes, voce pode gerenciar seus produtos de venda.`
    : `Conta de comprador ativa para ${user.razaoSocial || user.email}. Seus favoritos, carrinho e interacoes ficam organizados abaixo.`;
  heroText.textContent = user.accountType === 'vendedor'
    ? 'Gerencie sua vitrine, acompanhe contatos recebidos e continue comprando pelo marketplace quando precisar.'
    : 'Acompanhe seus produtos favoritos, carrinho atual e o historico de relacionamento com o marketplace.';
  favoritesText.textContent = 'Produtos favoritados ficam salvos no banco e reaparecem aqui.';
  cartText.textContent = user.accountType === 'vendedor'
    ? 'Mesmo como vendedor, voce continua com acesso ao seu carrinho e ao fluxo de compra.'
    : 'Itens atuais do carrinho e atalhos para finalizar a compra.';
  interactionsText.textContent = user.role === 'administrador'
    ? 'Modo administrador: visualizacao de todas as interacoes registradas.'
    : 'Historico das suas interacoes registradas no marketplace.';
  sellerShell.hidden = user.accountType !== 'vendedor';
  return user;
}

function renderCartItems(items) {
  if (!items.length) {
    renderEmptyState(cartList, 'Seu carrinho esta vazio no momento.');
    return;
  }

  cartList.innerHTML = items.map((item) => `
    <article class="conta-favorito">
      <div class="conta-favorito__media" aria-hidden="true">${item.initials || 'PR'}</div>
      <div>
        <div class="conta-favorito__topo">
          <div>
            <h3>${item.name}</h3>
            <p class="conta-favorito__empresa">${item.company}</p>
          </div>
          <strong>${item.price}</strong>
        </div>
        <p class="conta-favorito__meta">Quantidade: ${item.quantity || 1}</p>
        <p class="conta-favorito__descricao">${item.description}</p>
        <div class="conta-favorito__acoes">
          <a href="carrinho.html" class="btn btn--outline btn--sm">Abrir carrinho</a>
          <a href="pagamento.html" class="btn btn--primary btn--sm">Ir para pagamento</a>
        </div>
      </div>
    </article>
  `).join('');
}

function renderSellerProducts(items) {
  if (!sellerProductList) {
    return;
  }

  if (!items.length) {
    renderEmptyState(sellerProductList, 'Voce ainda nao cadastrou produtos para venda.');
    return;
  }

  sellerProductList.innerHTML = items.map((item) => `
    <article class="conta-produto">
      <div class="conta-produto__topo">
        <div>
          <h3>${item.name}</h3>
          <p class="conta-favorito__empresa">${item.company}</p>
        </div>
        <strong>${item.price}</strong>
      </div>
      <p class="conta-produto__meta">${item.categoryLabel} · ${item.purchaseModeLabel}</p>
      <p class="conta-produto__descricao">${item.description}</p>
      <div class="conta-produto__acoes">
        <a href="catalogo.html" class="btn btn--outline btn--sm">Ver no catalogo</a>
        <button type="button" class="btn btn--outline btn--sm" data-remove-product="${item.id}">Remover produto</button>
      </div>
    </article>
  `).join('');

  sellerProductList.querySelectorAll('[data-remove-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const user = readSessionUser();
      const productId = button.getAttribute('data-remove-product');

      if (!user || !productId || typeof window.removerProdutoMarketplace !== 'function') {
        return;
      }

      window.removerProdutoMarketplace(productId, user.uid);
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Produto removido do painel do vendedor.', 'info');
      }
      loadAccountData();
    });
  });
}

function renderFavorites(items) {
  if (!items.length) {
    renderEmptyState(favoritesList, 'Voce ainda nao favoritou nenhum produto. Use o catalogo para salvar seus itens preferidos.');
    return;
  }

  favoritesList.innerHTML = items.map((item) => `
    <article class="conta-favorito">
      <div class="conta-favorito__media" aria-hidden="true">${item.initials || 'PR'}</div>
      <div>
        <div class="conta-favorito__topo">
          <div>
            <h3>${item.name}</h3>
            <p class="conta-favorito__empresa">${item.company}</p>
          </div>
          <strong>${item.price}</strong>
        </div>
        <p class="conta-favorito__meta">${item.categoryLabel} · ${item.purchaseModeLabel}</p>
        <p class="conta-favorito__descricao">${item.description}</p>
        <div class="conta-favorito__acoes">
          <a href="catalogo.html" class="btn btn--outline btn--sm">Ver no catalogo</a>
          <button type="button" class="btn btn--primary btn--sm" data-add-cart="${item.productId}">Adicionar ao carrinho</button>
          <button type="button" class="btn btn--outline btn--sm" data-remove-favorite="${item.productId}">Remover favorito</button>
        </div>
      </div>
    </article>
  `).join('');

  favoritesList.querySelectorAll('[data-add-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-add-cart');
      const selectedProduct = items.find((item) => item.productId === productId);

      if (selectedProduct && typeof window.adicionarItemAoCarrinho === 'function') {
        window.adicionarItemAoCarrinho({
          category: selectedProduct.category,
          company: selectedProduct.company,
          description: selectedProduct.description,
          id: selectedProduct.productId,
          initials: selectedProduct.initials,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1
        });
      }
    });
  });

  favoritesList.querySelectorAll('[data-remove-favorite]').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.getAttribute('data-remove-favorite');
      const user = readSessionUser();

      if (!productId || !user || !db || !isFirebaseConfigured) {
        return;
      }

      try {
        await deleteDoc(doc(db, 'favoritos', `${user.uid}_${productId}`));
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Favorito removido com sucesso.', 'info');
        }
        await loadAccountData();
      } catch (error) {
        console.error(error);
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Nao foi possivel remover o favorito.', 'erro');
        }
      }
    });
  });
}

function renderInteractions(items, isAdmin) {
  if (!items.length) {
    renderEmptyState(interactionsList, 'Nenhuma interacao registrada para esta conta.');
    return;
  }

  interactionsList.innerHTML = items.map((item) => `
    <article class="conta-interacao">
      <div class="conta-interacao__topo">
        <strong>${item.productName}</strong>
        <span>${new Date(item.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <p class="conta-interacao__meta">${item.interactionTypeLabel} · ${item.company}</p>
      ${isAdmin ? `<p class="conta-interacao__meta">${item.userName || item.userEmail} · ${item.userRole === 'administrador' ? 'Administrador' : 'Usuario comum'}</p>` : ''}
      <p class="conta-interacao__mensagem">${item.message}</p>
    </article>
  `).join('');
}

async function loadAccountData() {
  const user = requireAuthenticationState();

  if (!user) {
    return;
  }

  if (!isFirebaseConfigured || !db) {
    renderEmptyState(favoritesList, 'Configure o Firebase para visualizar favoritos persistidos.');
    renderEmptyState(interactionsList, 'Configure o Firebase para visualizar o historico persistido.');
    renderCartItems(readCartItems());
    if (user.accountType === 'vendedor') {
      renderSellerProducts(readSellerProducts());
    }
    updateSummary(0, 0);
    return;
  }

  const isAdmin = user.role === 'administrador';

  try {
    const favoritesSnapshot = await getDocs(query(collection(db, 'favoritos'), where('userId', '==', user.uid)));
    const favorites = favoritesSnapshot.docs
      .map((docSnapshot) => docSnapshot.data())
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    const interactionsQuery = isAdmin
      ? collection(db, 'interacoes')
      : query(collection(db, 'interacoes'), where('userId', '==', user.uid));

    const interactionsSnapshot = await getDocs(interactionsQuery);
    const interactions = interactionsSnapshot.docs
      .map((docSnapshot) => docSnapshot.data())
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    updateSummary(favorites.length, interactions.length);
    renderFavorites(favorites);
    renderCartItems(readCartItems());
    renderInteractions(interactions, isAdmin);
    if (user.accountType === 'vendedor') {
      sellerText.textContent = 'Cadastre e gerencie seus produtos para venda. Eles passam a aparecer no catalogo local sem interromper seu fluxo de compra.';
      renderSellerProducts(readSellerProducts());
    }
  } catch (error) {
    console.error(error);
    renderEmptyState(favoritesList, 'Nao foi possivel carregar os favoritos.');
    renderCartItems(readCartItems());
    renderEmptyState(interactionsList, 'Nao foi possivel carregar as interacoes.');
    if (user.accountType === 'vendedor') {
      renderSellerProducts(readSellerProducts());
    }
    updateSummary(0, 0);
  }
}

sellerProductForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const user = readSessionUser();

  if (!user || user.accountType !== 'vendedor') {
    return;
  }

  const name = document.getElementById('produto-nome')?.value.trim() ?? '';
  const category = document.getElementById('produto-categoria')?.value.trim() ?? '';
  const purchaseMode = document.getElementById('produto-modalidade')?.value.trim() ?? '';
  const price = document.getElementById('produto-preco')?.value.trim() ?? '';
  const description = document.getElementById('produto-descricao')?.value.trim() ?? '';

  if (!name || !category || !purchaseMode || !price || !description) {
    sellerProductStatus.textContent = 'Preencha todos os campos para cadastrar o produto.';
    return;
  }

  if (typeof window.salvarProdutoMarketplace !== 'function') {
    sellerProductStatus.textContent = 'Nao foi possivel cadastrar o produto agora.';
    return;
  }

  const categoryLabels = {
    mobilidade: 'Mobilidade',
    visual: 'Deficiencia visual',
    digital: 'Acessibilidade digital'
  };

  const purchaseModeLabels = {
    'compra-imediata': 'Compra imediata',
    'sob-consulta': 'Sob consulta',
    'projeto-personalizado': 'Projeto personalizado'
  };

  window.salvarProdutoMarketplace({
    category,
    categoryLabel: categoryLabels[category] ?? 'Categoria',
    company: user.razaoSocial || user.nomeResponsavel || 'Minha empresa',
    companySlug: slugify(user.razaoSocial || user.nomeResponsavel || 'minha-empresa'),
    createdAt: new Date().toISOString(),
    description,
    id: `seller-${user.uid}-${Date.now()}`,
    initials: (name.match(/\b\w/g) ?? ['P', 'R']).slice(0, 2).join('').toUpperCase(),
    name,
    price,
    purchaseMode,
    purchaseModeLabel: purchaseModeLabels[purchaseMode] ?? 'Sob consulta',
    sellerId: user.uid
  });

  sellerProductForm.reset();
  sellerProductStatus.textContent = 'Produto cadastrado com sucesso no painel do vendedor.';
  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast('Produto cadastrado no painel do vendedor.', 'sucesso');
  }
  loadAccountData();
});

logoutButton?.addEventListener('click', async () => {
  localStorage.removeItem(sessionStorageKey);

  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  }

  window.location.href = 'login.html';
});

loadAccountData();
