'use strict';



const heroText = document.getElementById('conta-hero-texto');
const heroTitle = document.getElementById('conta-titulo');
const summaryText = document.getElementById('conta-resumo-texto');
const totalFavorites = document.getElementById('conta-total-favoritos');
const totalInteractions = document.getElementById('conta-total-interacoes');
const favoritesText = document.getElementById('conta-favoritos-texto');
const favoritesList = document.getElementById('conta-favoritos-lista');
const cartText = document.getElementById('conta-carrinho-texto');
const cartList = document.getElementById('conta-carrinho-lista');
const purchasesText = document.getElementById('conta-compras-texto');
const purchasesList = document.getElementById('conta-compras-lista');
const interactionsText = document.getElementById('conta-interacoes-texto');
const interactionsList = document.getElementById('conta-interacoes-lista');
const logoutButton = document.getElementById('btn-sair-conta');
const topLogoutButton = document.getElementById('btn-sair-topo');
const mobileLogoutButton = document.getElementById('btn-sair-conta-mobile');
const sellerShell = document.getElementById('conta-vendedor-shell');
const sellerText = document.getElementById('conta-vendedor-texto');
const sellerProductList = document.getElementById('conta-produtos-lista');
const sellerProductForm = document.getElementById('produto-form');
const sellerProductStatus = document.getElementById('produto-status');
const orderHistoryStorageKey = 'empre:historico-pedidos';
const accountSessionStorageKey = 'empre:usuario-logado';

function getPurchasesTextElement() {
  return purchasesText || document.getElementById('conta-compras-texto');
}

function ensurePurchasesListElement() {
  const existing = document.getElementById('conta-compras-lista');
  if (existing) {
    return existing;
  }

  const interactionsSection = document.querySelector('section[aria-labelledby="conta-interacoes-titulo"]');
  const parent = interactionsSection?.parentElement;

  if (!parent) {
    return null;
  }

  const purchasesSection = document.createElement('section');
  purchasesSection.className = 'conta-shell conta-shell--secundario';
  purchasesSection.setAttribute('aria-labelledby', 'conta-compras-titulo');
  purchasesSection.innerHTML = `
    <div class="conta-shell__header">
      <div>
        <h2 id="conta-compras-titulo" class="conta-shell__titulo">Histórico de compras</h2>
        <p id="conta-compras-texto" class="conta-shell__subtitulo">Acompanhe aqui seus pedidos simulados e finalizados.</p>
      </div>
      <a href="pagamento.html" class="btn btn--ghost">Novo pagamento</a>
    </div>
    <div id="conta-compras-lista" class="conta-interacoes-lista" aria-live="polite"></div>
  `;

  parent.insertBefore(purchasesSection, interactionsSection);
  return purchasesSection.querySelector('#conta-compras-lista');
}

function readSessionUser() {
  const sessionKey = window.sessionStorageKey || accountSessionStorageKey;

  try {
    const parsed = JSON.parse(localStorage.getItem(sessionKey) ?? 'null');
    return parsed && typeof parsed.uid === 'string'
      ? {
          accountType: (parsed.accountType === 'vendedor' || parsed.accountType === 'quero-vender') ? 'vendedor' : 'comprador',
          ...parsed
        }
      : null;
  } catch {
    return null;
  }
}

function writeSessionUser(user) {
  if (!user || !user.uid) {
    return;
  }

  const sessionKey = window.sessionStorageKey || accountSessionStorageKey;

  try {
    localStorage.setItem(sessionKey, JSON.stringify(user));
  } catch {
    // Ignora falha local para nao quebrar a renderizacao da conta.
  }
}

function normalizeAccountType(value) {
  return (value === 'vendedor' || value === 'quero-vender') ? 'vendedor' : 'comprador';
}

async function getCurrentAuthUser() {
  const auth = window.auth;

  if (!auth || typeof auth.onAuthStateChanged !== 'function') {
    return null;
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise((resolve) => {
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      unsubscribe();
      resolve(null);
    }, 2000);

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve(firebaseUser || null);
    });
  });
}

async function hydrateSessionFromFirebaseAuth() {
  if (readSessionUser()) {
    return readSessionUser();
  }

  const firebaseUser = await getCurrentAuthUser();

  if (!firebaseUser) {
    return null;
  }

  let profile = null;

  if (window.db) {
    try {
      const profileSnapshot = await window.db.collection('usuarios').doc(firebaseUser.uid).get();
      profile = profileSnapshot.exists ? profileSnapshot.data() : null;
    } catch (error) {
      console.error('Falha ao reidratar sessao da conta:', error?.code || error?.message || error);
    }
  }

  const hydratedUser = {
    accountType: normalizeAccountType(profile?.sellerType),
    email: firebaseUser.email || profile?.email || '',
    nomeResponsavel: profile?.nomeResponsavel || firebaseUser.displayName || '',
    razaoSocial: profile?.razaoSocial || '',
    role: profile?.role === 'administrador' ? 'administrador' : 'usuario-comum',
    uid: firebaseUser.uid
  };

  writeSessionUser(hydratedUser);
  return hydratedUser;
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

function readLocalOrders(userId, userEmail) {
  if (!userId && !userEmail) {
    return [];
  }

  try {
    const raw = localStorage.getItem(orderHistoryStorageKey);
    const parsed = JSON.parse(raw ?? '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalizedEmail = String(userEmail || '').trim().toLowerCase();

    return parsed.filter((order) => isOrderOwnedByUser(order, userId, normalizedEmail));
  } catch {
    return [];
  }
}

function extractOrderUserId(order) {
  return order?.cliente?.uid || order?.userId || order?.clienteUid || order?.uid || null;
}

function extractOrderEmail(order) {
  return String(
    order?.cliente?.email || order?.userEmail || order?.clienteEmail || order?.email || ''
  ).trim().toLowerCase();
}

function normalizeComparableText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function extractOrderCompanyName(order) {
  return normalizeComparableText(
    order?.cliente?.nomeEmpresa || order?.nomeEmpresa || order?.empresa || ''
  );
}

function extractOrderResponsibleName(order) {
  return normalizeComparableText(
    order?.cliente?.nomeResponsavel || order?.nomeResponsavel || order?.responsavel || ''
  );
}

function isOrderOwnedByUser(order, userId, normalizedEmail) {
  const orderUserId = extractOrderUserId(order);
  const orderEmail = extractOrderEmail(order);
  return (userId && orderUserId === userId) || (normalizedEmail && orderEmail === normalizedEmail);
}

function isOrderOwnedByProfile(order, user) {
  const userCompany = normalizeComparableText(user?.razaoSocial || '');
  const userResponsible = normalizeComparableText(user?.nomeResponsavel || user?.nome || '');

  if (!userCompany && !userResponsible) {
    return false;
  }

  const orderCompany = extractOrderCompanyName(order);
  const orderResponsible = extractOrderResponsibleName(order);

  return (userCompany && orderCompany && orderCompany === userCompany)
    || (userResponsible && orderResponsible && orderResponsible === userResponsible);
}

function collectOwnedPurchasesFromSnapshot(snapshot, userId, normalizedEmail, user) {
  const purchases = [];
  const profileFallback = [];

  snapshot.forEach((docSnapshot) => {
    const data = docSnapshot.data() || {};

    if (!isOrderOwnedByUser(data, userId, normalizedEmail)) {
      if (isOrderOwnedByProfile(data, user)) {
        profileFallback.push({
          id: docSnapshot.id,
          ...data
        });
      }
      return;
    }

    purchases.push({
      id: docSnapshot.id,
      ...data
    });
  });

  return purchases.length ? purchases : profileFallback;
}

function resolveUserIdentifiers(user) {
  const authUser = window.auth?.currentUser || null;
  return {
    uid: user?.uid || authUser?.uid || null,
    email: String(user?.email || authUser?.email || '').trim().toLowerCase()
  };
}

function getOrderTimestamp(order) {
  const rawServerDate = order?.criadoEmServer;

  if (rawServerDate && typeof rawServerDate.toDate === 'function') {
    return rawServerDate.toDate().getTime();
  }

  const rawDate = order?.criadoEm;
  const parsed = rawDate ? new Date(rawDate).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatOrderDate(order) {
  const timestamp = getOrderTimestamp(order);
  return timestamp ? new Date(timestamp).toLocaleString('pt-BR') : 'Data nao informada';
}

function formatOrderValue(order) {
  const total = Number(order?.totalEstimado);
  return Number.isFinite(total) && total > 0
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
    : 'A confirmar';
}

function resolvePaymentMethodLabel(method) {
  if (method === 'pix') {
    return 'PIX';
  }
  if (method === 'cartao') {
    return 'Cartao';
  }
  if (method === 'boleto') {
    return 'Boleto';
  }
  return 'Checkout';
}

function mergeOrders(firestoreOrders, localOrders) {
  const merged = new Map();

  [...localOrders, ...firestoreOrders].forEach((order) => {
    const fallbackKey = [
      order?.cliente?.uid || 'anonimo',
      order?.criadoEm || '',
      order?.metodoPagamento || '',
      String(order?.totalEstimado || '')
    ].join('|');
    const key = order?.id || fallbackKey;

    merged.set(key, {
      ...order,
      id: order?.id || key
    });
  });

  return Array.from(merged.values()).sort((first, second) => getOrderTimestamp(second) - getOrderTimestamp(first));
}

function readSellerProducts() {
  const user = readSessionUser();

  if (!user || typeof window.obterProdutosMarketplace !== 'function') {
    return [];
  }

  return window.obterProdutosMarketplace().filter((product) => product.sellerId === user.uid);
}

async function syncMarketplaceProductsFromFirestore() {
  if (typeof window.sincronizarProdutosMarketplace !== 'function') {
    return;
  }

  try {
    await window.sincronizarProdutosMarketplace();
  } catch (error) {
    console.error('Falha ao sincronizar produtos na conta:', error?.code || error?.message || error);
  }
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

function renderPurchaseHistory(items) {
  const purchasesTarget = ensurePurchasesListElement();

  if (!purchasesTarget) {
    return;
  }

  if (!items.length) {
    renderEmptyState(purchasesTarget, 'Nenhuma compra registrada ainda. Finalize um pagamento para ver o historico aqui.');
    return;
  }

  purchasesTarget.innerHTML = items.map((item) => {
    const orderItems = Array.isArray(item.itens) ? item.itens : [];
    const firstItems = orderItems
      .slice(0, 3)
      .map((entry) => entry?.nome || entry?.name || 'Item')
      .join(', ');
    const extraItems = orderItems.length > 3 ? ` +${orderItems.length - 3} item(ns)` : '';

    return `
      <article class="conta-interacao">
        <div class="conta-interacao__topo">
          <strong>Pedido ${item.id ? `#${String(item.id).slice(0, 8)}` : 'simulado'}</strong>
          <span>${formatOrderDate(item)}</span>
        </div>
        <p class="conta-interacao__meta">${resolvePaymentMethodLabel(item.metodoPagamento)} · ${item.status || 'simulado'} · Total ${formatOrderValue(item)}</p>
        <p class="conta-interacao__mensagem">${firstItems || 'Itens nao informados'}${extraItems}</p>
      </article>
    `;
  }).join('');
}

function requireAuthenticationState() {
  const user = readSessionUser();
  const purchasesTextElement = getPurchasesTextElement();
  const purchasesTarget = ensurePurchasesListElement();

  if (!user) {
    summaryText.textContent = 'Entre com sua conta para acessar seus favoritos e histórico de interações.';
    heroText.textContent = 'Acesse sua conta para visualizar seus produtos favoritos, carrinho, histórico e recursos personalizados.';
    if (heroTitle) heroTitle.textContent = 'Minha conta';
    favoritesText.textContent = 'Seus favoritos aparecerão aqui após o login.';
    cartText.textContent = 'Entre com sua conta para acompanhar o carrinho e continuar sua compra.';
    if (purchasesTextElement) {
      purchasesTextElement.textContent = 'Entre com sua conta para visualizar seu historico de compras.';
    }
    interactionsText.textContent = 'Entre com sua conta para acompanhar suas interações.';
    renderEmptyState(favoritesList, 'Nenhum favorito disponível. Faça login e favorite produtos no catálogo.');
    renderEmptyState(cartList, 'Nenhum item disponível. Faça login e adicione produtos ao carrinho.');
    if (purchasesTarget) {
      renderEmptyState(purchasesTarget, 'Nenhuma compra disponivel. Entre para visualizar seu historico.');
    }
    renderEmptyState(interactionsList, 'Nenhuma interação disponível. Faça login para visualizar seu histórico.');
    updateSummary(0, 0);
    logoutButton.hidden = true;
    if (topLogoutButton) {
      topLogoutButton.hidden = true;
    }
    if (mobileLogoutButton) {
      mobileLogoutButton.hidden = true;
    }
    sellerShell.hidden = true;
    return null;
  }

  logoutButton.hidden = false;
  if (topLogoutButton) {
    topLogoutButton.hidden = false;
  }
  if (mobileLogoutButton) {
    mobileLogoutButton.hidden = false;
  }
  // Preferência: nome do usuário, depois razão social, depois email
  let nomeUsuario = user.nome || user.displayName || user.razaoSocial || user.email || 'Usuário';
  if (heroTitle) heroTitle.textContent = `Olá, ${nomeUsuario}`;
  summaryText.textContent = user.accountType === 'vendedor'
    ? `Conta de vendedor ativa para ${user.razaoSocial || user.email}. Gerencie suas vendas, compras e interações.`
    : `Conta de comprador ativa para ${user.razaoSocial || user.email}. Seus favoritos, carrinho e interações ficam organizados abaixo.`;
  heroText.textContent = user.accountType === 'vendedor'
    ? 'Anuncie seus produtos, acompanhe suas vendas e compre de outros vendedores. Tudo em um só lugar.'
    : 'Acompanhe seus produtos favoritos, carrinho e interações.';
  favoritesText.textContent = 'Produtos favoritados ficam salvos no banco e reaparecem aqui.';
  cartText.textContent = user.accountType === 'vendedor'
    ? 'Mesmo como vendedor, voce continua com acesso ao seu carrinho e ao fluxo de compra.'
    : 'Itens atuais do carrinho e atalhos para finalizar a compra.';
  if (purchasesTextElement) {
    purchasesTextElement.textContent = user.accountType === 'vendedor'
      ? 'Pedidos simulados realizados com sua conta aparecem abaixo para acompanhamento.'
      : 'Pedidos simulados e finalizados aparecem aqui automaticamente.';
  }
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
      ${(item.images && item.images.length) ? `<div class="conta-produto__galeria">${item.images.map(img => `<img src="${img}" alt="Imagem do produto" style="max-width:80px; margin:2px; border-radius:6px;">`).join('')}</div>` : ''}
      <div class="conta-produto__acoes">
        <a href="catalogo.html" class="btn btn--outline btn--sm">Ver no catalogo</a>
        <button type="button" class="btn btn--outline btn--sm" data-remove-product="${item.id}">Remover produto</button>
      </div>
    </article>
  `).join('');

  sellerProductList.querySelectorAll('[data-remove-product]').forEach((button) => {
    button.addEventListener('click', async () => {
      const user = readSessionUser();
      const productId = button.getAttribute('data-remove-product');

      if (!user || !productId || typeof window.removerProdutoMarketplace !== 'function') {
        return;
      }

      if (typeof window.removerProdutoMarketplaceNoFirestore === 'function') {
        try {
          await window.removerProdutoMarketplaceNoFirestore(productId);
        } catch (error) {
          console.error('Falha ao remover produto no Firestore:', error?.code || error?.message || error);
        }
      }

      window.removerProdutoMarketplace(productId, user.uid);
      await syncMarketplaceProductsFromFirestore();
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
          <button type="button" class="conta-favorito__heart conta-favorito__heart--ativo" data-toggle-favorite="${item.productId}" aria-pressed="true" aria-label="Desfavoritar produto" title="Desfavoritar">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
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

  favoritesList.querySelectorAll('[data-toggle-favorite]').forEach((button) => {
    button.addEventListener('click', async () => {
      const productId = button.getAttribute('data-toggle-favorite');
      const user = readSessionUser();

      const firestoreDb = window.db || null;

      if (!productId || !user || !firestoreDb) {
        return;
      }

      try {
        await firestoreDb.collection('favoritos').doc(`${user.uid}_${productId}`).delete();
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
  let user = readSessionUser();

  if (!user) {
    user = await hydrateSessionFromFirebaseAuth();
  }

  user = requireAuthenticationState();
  const firestoreDb = window.db || null;
  const identifiers = resolveUserIdentifiers(user);

  if (!user) {
    return;
  }

  await syncMarketplaceProductsFromFirestore();

  if (!firestoreDb) {
    renderEmptyState(favoritesList, 'Configure o Firebase para visualizar favoritos persistidos.');
    renderEmptyState(interactionsList, 'Configure o Firebase para visualizar o historico persistido.');
    renderCartItems(readCartItems());
    renderPurchaseHistory(readLocalOrders(identifiers.uid, identifiers.email));
    if (user.accountType === 'vendedor') {
      renderSellerProducts(readSellerProducts());
    }
    updateSummary(0, 0);
    return;
  }

  const isAdmin = user.role === 'administrador';

  let favorites = [];
  let interactions = [];
  let firestorePurchases = [];

  try {
    const favoritesSnapshot = await firestoreDb.collection('favoritos').where('userId', '==', user.uid).get();
    favoritesSnapshot.forEach((doc) => favorites.push(doc.data()));
    favorites.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  } catch (error) {
    console.error('Falha ao carregar favoritos:', error?.code || error?.message || error);
  }

  try {
    let interactionsSnapshot;
    if (isAdmin) {
      interactionsSnapshot = await firestoreDb.collection('interacoes').get();
    } else {
      interactionsSnapshot = await firestoreDb.collection('interacoes').where('userId', '==', user.uid).get();
    }

    interactionsSnapshot.forEach((doc) => interactions.push(doc.data()));
    interactions.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  } catch (error) {
    console.error('Falha ao carregar interacoes:', error?.code || error?.message || error);
  }

  try {
    const allPurchasesSnapshot = await firestoreDb.collection('pedidos').get();
    firestorePurchases = collectOwnedPurchasesFromSnapshot(
      allPurchasesSnapshot,
      identifiers.uid,
      identifiers.email,
      user
    );
  } catch (error) {
    console.error('Falha ao carregar pedidos:', error?.code || error?.message || error);
  }

  const purchaseHistory = mergeOrders(firestorePurchases, readLocalOrders(identifiers.uid, identifiers.email));

  if (!purchaseHistory.length) {
    console.info('Nenhum pedido localizado para a conta atual.', {
      email: identifiers.email,
      uid: identifiers.uid
    });
  }

  updateSummary(favorites.length, interactions.length);
  renderFavorites(favorites);
  renderCartItems(readCartItems());
  renderPurchaseHistory(purchaseHistory);
  renderInteractions(interactions, isAdmin);
  if (user.accountType === 'vendedor') {
    sellerText.textContent = 'Cadastre e gerencie seus produtos para venda. Eles passam a aparecer no catalogo local sem interromper seu fluxo de compra.';
    renderSellerProducts(readSellerProducts());
  }
}

sellerProductForm?.addEventListener('submit', async (event) => {
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

  const novoProduto = {
    ativo: true,
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
  };

  window.salvarProdutoMarketplace(novoProduto);

  if (typeof window.salvarProdutoMarketplaceNoFirestore === 'function') {
    try {
      await window.salvarProdutoMarketplaceNoFirestore(novoProduto);
    } catch (error) {
      console.error('Falha ao salvar produto no Firestore:', error?.code || error?.message || error);
    }
  }

  await syncMarketplaceProductsFromFirestore();

  sellerProductForm.reset();
  sellerProductStatus.textContent = 'Produto cadastrado com sucesso no painel do vendedor.';
  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast('Produto cadastrado no painel do vendedor.', 'sucesso');
  }
  loadAccountData();
});

logoutButton?.addEventListener('click', async () => {
  await logoutCurrentUser();
});

topLogoutButton?.addEventListener('click', async () => {
  await logoutCurrentUser();
});

mobileLogoutButton?.addEventListener('click', async () => {
  await logoutCurrentUser();
});

async function logoutCurrentUser() {
  const sessionKey = window.sessionStorageKey || accountSessionStorageKey;
  localStorage.removeItem(sessionKey);

  if (window.auth && typeof window.auth.signOut === 'function') {
    try {
      await window.auth.signOut();
    } catch (error) {
      console.error(error);
    }
  }

  window.location.href = 'login.html';
}

loadAccountData();
