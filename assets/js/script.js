// Toast acessível e reutilizável
window.mostrarToast = function (mensagem, tipo = 'info', tempo = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('tabindex', '0');
  toast.innerText = mensagem;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast--hide');
    setTimeout(() => toast.remove(), 400);
  }, tempo);
};
'use strict';

const menuMobile = document.getElementById("menu-mobile");
const btnMenu = document.getElementById("btn-menu-mobile");
const scriptSessionStorageKey = 'empre:usuario-logado';

function closeMobileMenuByLinkClick(event) {
  const target = event.target;

  if (!target || !target.closest('.menu-mobile__link')) {
    return;
  }

  if (!menuMobile || !btnMenu) {
    return;
  }

  menuMobile.hidden = true;
  btnMenu.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-aberto');
}

document.addEventListener('click', closeMobileMenuByLinkClick);

const body = document.body;
const root = document.documentElement;
const header = document.getElementById('header');
const menuButton = document.getElementById('btn-menu-mobile');
const mobileMenu = document.getElementById('menu-mobile');
const btnContraste = document.getElementById('btn-contraste');
const btnAumentarFonte = document.getElementById('btn-aumentar-fonte');
const btnDiminuirFonte = document.getElementById('btn-diminuir-fonte');
const btnLayout = document.getElementById('btn-layout');
const btnLeitura = document.getElementById('btn-leitura');
const btnLibras = document.getElementById('btn-libras');
const widgetLibras = document.getElementById('widget-libras');
const fecharLibras = document.getElementById('btn-fechar-libras');
const toastContainer = document.getElementById('toast-container');
const btnReportar = document.getElementById('btn-reportar');
const carrinhoBadges = [
  document.getElementById('carrinho-count'),
  document.getElementById('quantidadeCarrinho')
].filter(Boolean);
// Usa window.sessionStorageKey global

const storageKeys = {
  carrinho: 'empre:carrinho',
  carrinhoItens: 'empre:carrinho-itens',
  contraste: 'empre:contraste',
  fonte: 'empre:fonte',
  layout: 'empre:layout',
  leitura: 'empre:leitura',
  produtosMarketplace: 'empre:produtos-marketplace'
};

let tamanhoFonte = Number(localStorage.getItem(storageKeys.fonte)) || 16;

function getSessionStorageKey() {
  return window.sessionStorageKey || scriptSessionStorageKey;
}

function getUserCartStorageKeys(user) {
  const uid = user?.uid;

  if (!uid) {
    return {
      countKey: storageKeys.carrinho,
      itemsKey: storageKeys.carrinhoItens,
      uid: null
    };
  }

  return {
    countKey: `${storageKeys.carrinho}:${uid}`,
    itemsKey: `${storageKeys.carrinhoItens}:${uid}`,
    uid
  };
}

function readSessionUser() {
  const sessionKey = getSessionStorageKey();

  try {
    const parsed = JSON.parse(localStorage.getItem(sessionKey) ?? 'null');
    return parsed && typeof parsed.uid === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function resolveInternalPagePath(fileName) {
  const currentPath = window.location.pathname.toLowerCase();
  const insidePagesFolder = currentPath.includes('/pages/');
  return insidePagesFolder ? fileName : `pages/${fileName}`;
}

function updateAuthLinks() {
  const user = readSessionUser();
  const accountPath = resolveInternalPagePath('conta.html');
  const loginPath = resolveInternalPagePath('login.html');
  const currentPath = (window.location.pathname || '').toLowerCase();
  const isIndexPage = currentPath === '/' || currentPath.endsWith('/index.html');

  const accountLinks = document.querySelectorAll('.header__actions a[href$="login.html"], .menu-mobile a[href$="login.html"], .header__actions a[href$="conta.html"], .menu-mobile a[href$="conta.html"]');

  accountLinks.forEach((link) => {
    if (isIndexPage) {
      link.href = loginPath;
      link.textContent = 'Entrar';
      link.setAttribute('aria-label', 'Acessar login');
      return;
    }

    if (user) {
      link.href = accountPath;
      link.textContent = 'Minha conta';
      link.setAttribute('aria-label', 'Acessar minha conta');
      return;
    }

    link.href = loginPath;
    link.textContent = 'Entrar';
    link.setAttribute('aria-label', 'Acessar login');
  });

  ensureQuickLinks(user);
}

function createQuickButton(id, text, className = 'btn btn--outline btn-link-facil') {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = id;
  button.className = className;
  button.textContent = text;
  return button;
}

function resolveHomePath(fragment) {
  const currentPath = window.location.pathname.toLowerCase();
  const insidePagesFolder = currentPath.includes('/pages/');

  if (!fragment) {
    return insidePagesFolder ? '../index.html' : 'index.html';
  }

  return insidePagesFolder ? `../index.html#${fragment}` : `index.html#${fragment}`;
}

function logoutCurrentUser() {
  const sessionKey = getSessionStorageKey();
  localStorage.removeItem(sessionKey);

  const finalizeLogout = () => {
    window.location.href = resolveInternalPagePath('login.html');
  };

  if (window.auth && typeof window.auth.signOut === 'function') {
    window.auth.signOut().finally(finalizeLogout);
    return;
  }

  finalizeLogout();
}

function ensureQuickLinks(user) {
  const mainContent = document.getElementById('conteudo-principal') || document.querySelector('main');
  const legacyFixedLinks = document.getElementById('topo-links-fixos-global');
  const currentPath = (window.location.pathname || '').toLowerCase();
  const isIndexPage = currentPath === '/' || currentPath.endsWith('/index.html');
  const isLoginPage = body.classList.contains('pagina-login');

  if (legacyFixedLinks) {
    legacyFixedLinks.remove();
  }

  const headerActions = document.querySelector('.header__actions');

  if (headerActions) {
    let headerLogoutButton = headerActions.querySelector('#btn-sair-header-global');

    if (!headerLogoutButton) {
      headerLogoutButton = createQuickButton('btn-sair-header-global', 'Sair', 'btn btn-header-sair-discreto');
      const accountLink = headerActions.querySelector('a[href$="conta.html"], a[href$="login.html"]');

      if (accountLink && accountLink.nextSibling) {
        headerActions.insertBefore(headerLogoutButton, accountLink.nextSibling);
      } else {
        headerActions.appendChild(headerLogoutButton);
      }
    }

    headerLogoutButton.hidden = isIndexPage || !user;
    headerLogoutButton.onclick = logoutCurrentUser;
  }

  if (!mainContent) {
    return;
  }

  if (isLoginPage) {
    const loginTopActions = mainContent.querySelector('.topo-acoes-conteudo');
    if (loginTopActions) {
      loginTopActions.remove();
    }
    return;
  }

  let wrapper = mainContent.querySelector('.topo-acoes-conteudo');

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'container topo-acoes-conteudo';
    wrapper.innerHTML = `
      <div class="topo-acoes-conteudo__inner" role="navigation" aria-label="Acoes da pagina">
        <div class="topo-acoes-conteudo__esquerda">
          <button type="button" id="btn-voltar-conteudo-global" class="btn btn--outline btn-link-facil">Voltar</button>
        </div>
      </div>
    `;

    mainContent.prepend(wrapper);
  }

  const canGoBack = !isIndexPage && window.history.length > 1;

  const backButton = wrapper.querySelector('#btn-voltar-conteudo-global');

  if (backButton) {
    backButton.hidden = !canGoBack;
    backButton.onclick = () => {
      window.history.back();
    };
  }


}

function readCartItems() {
  const user = readSessionUser();

  if (!user) {
    return [];
  }

  const { itemsKey } = getUserCartStorageKeys(user);

  try {
    const storedItems = JSON.parse(localStorage.getItem(itemsKey) ?? '[]');
    const isCurrentKeyEmpty = !Array.isArray(storedItems) || storedItems.length === 0;

    // Migra carrinho legado global para o carrinho vinculado ao usuário atual.
    if (isCurrentKeyEmpty) {
      const legacyItems = JSON.parse(localStorage.getItem(storageKeys.carrinhoItens) ?? '[]');
      if (Array.isArray(legacyItems) && legacyItems.length > 0) {
        localStorage.setItem(itemsKey, JSON.stringify(legacyItems));
        localStorage.removeItem(storageKeys.carrinhoItens);
      }
    }

    const scopedItems = JSON.parse(localStorage.getItem(itemsKey) ?? '[]');

    if (!Array.isArray(scopedItems)) {
      return [];
    }

    return scopedItems.filter((item) => item && typeof item.id === 'string');
  } catch {
    return [];
  }
}

function readMarketplaceProducts() {
  try {
    const storedItems = JSON.parse(localStorage.getItem(storageKeys.produtosMarketplace) ?? '[]');

    if (!Array.isArray(storedItems)) {
      return [];
    }

    return storedItems.filter((item) => item && typeof item.id === 'string' && typeof item.sellerId === 'string');
  } catch {
    return [];
  }
}

function saveMarketplaceProducts(items) {
  localStorage.setItem(storageKeys.produtosMarketplace, JSON.stringify(items));
}

function saveMarketplaceProduct(product) {
  if (!product || typeof product.id !== 'string') {
    return;
  }

  const items = readMarketplaceProducts();
  const existingIndex = items.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    items[existingIndex] = product;
  } else {
    items.push(product);
  }

  saveMarketplaceProducts(items);
}

function removeMarketplaceProduct(productId, sellerId) {
  const items = readMarketplaceProducts().filter((item) => !(item.id === productId && item.sellerId === sellerId));
  saveMarketplaceProducts(items);
}

let itensCarrinho = 0;

function setPressedState(button, isPressed) {
  if (!button) {
    return;
  }

  button.setAttribute('aria-pressed', String(isPressed));
}

function getEffectiveFontSize(value) {
  const bonusModoLeitura = body.classList.contains('modo-leitura') ? 2 : 0;
  return Math.max(14, Math.min(24, value + bonusModoLeitura));
}

function applyFontSize(value) {
  tamanhoFonte = Math.max(14, Math.min(22, value));
  root.style.setProperty('--tamanho-fonte-base', `${getEffectiveFontSize(tamanhoFonte)}px`);
  localStorage.setItem(storageKeys.fonte, String(tamanhoFonte));
}

function getToastRoot() {
  if (toastContainer) {
    return toastContainer;
  }

  
  const fallback = document.createElement('div');
  fallback.className = 'toast-container';
  document.body.appendChild(fallback);
  return fallback;
}

function mostrarToast(texto, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.textContent = texto;

  const root = getToastRoot();
  root.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}



function updateCartCount(nextValue) {
  const user = readSessionUser();
  const { countKey } = getUserCartStorageKeys(user);

  itensCarrinho = Math.max(0, nextValue);
  if (user) {
    localStorage.setItem(countKey, String(itensCarrinho));
  }

  carrinhoBadges.forEach((badge) => {
    badge.textContent = String(itensCarrinho);
  });
}

function syncCartCountFromItems() {
  const items = readCartItems();
  const totalItems = items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
  updateCartCount(totalItems);
  return items;
}

function saveCartItems(items) {
  const user = readSessionUser();

  if (!user) {
    return;
  }

  const { itemsKey } = getUserCartStorageKeys(user);
  localStorage.setItem(itemsKey, JSON.stringify(items));
  syncCartCountFromItems();
}


function showToast(message, type = 'Bad_Toast', hideDelay = 3000) {
  if (!toast) {
    return;
  }

  
  toast.hidden = false;
  toast.innerHTML = '';
  toast.classList.remove('Good_Toast', 'Bad_Toast');
  toast.classList.add(type);
  toast.textContent = message;

  setTimeout(() => {
    toast.hidden = true;
  }, hideDelay);
}

function addCartItem(product) {
  if (!product || typeof product.id !== 'string') {
    return;
  }

  if (!readSessionUser()) {
    showToast('Faca login para usar o carrinho.', 'Bad_Toast');
    return;
  }

  const items = readCartItems();
  const existingItem = items.find((item) => item.id === product.id);
  const selectedVariation = typeof product.selectedVariation === 'string' ? product.selectedVariation.trim() : '';
  const selectedImage = typeof product.selectedImage === 'string' ? product.selectedImage : '';
  const selectedVariationImage = typeof product.selectedVariationImage === 'string' ? product.selectedVariationImage : selectedImage;

  if (existingItem) {
    existingItem.quantity = (Number(existingItem.quantity) || 1) + 1;
    if (selectedVariation) {
      existingItem.selectedVariation = selectedVariation;
    }
    if (selectedImage) {
      existingItem.selectedImage = selectedImage;
    }
    if (selectedVariationImage) {
      existingItem.selectedVariationImage = selectedVariationImage;
    }
  } else {
    items.push({
      category: product.category ?? '',
      categoryLabel: product.categoryLabel ?? product.category ?? '',
      company: product.company ?? '',
      description: product.description ?? '',
      id: product.id,
      initials: product.initials ?? '',
      name: product.name ?? 'Produto',
      price: product.price ?? 'Sob consulta',
      purchaseModeLabel: product.purchaseModeLabel ?? '',
      quantity: 1,
      selectedImage,
      selectedVariationImage,
      selectedVariation
    });
  }

  saveCartItems(items);
}

function removeCartItem(productId) {
  const filteredItems = readCartItems().filter((item) => item.id !== productId);
  saveCartItems(filteredItems);
}

function updateCartItemQuantity(productId, quantity) {
  const items = readCartItems();
  const targetItem = items.find((item) => item.id === productId);

  if (!targetItem) {
    return;
  }

  const safeQuantity = Math.max(1, Number(quantity) || 1);
  targetItem.quantity = safeQuantity;
  saveCartItems(items);
}

function clearCart() {
  if (!readSessionUser()) {
    updateCartCount(0);
    return;
  }

  saveCartItems([]);
}

function toggleBodyMode(button, className, storageKey) {
  const isActive = body.classList.toggle(className);
  setPressedState(button, isActive);
  localStorage.setItem(storageKey, String(isActive));
  return isActive;
}

function closeMobileMenu() {
  if (!menuButton || !mobileMenu) {
    return;
  }

  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
}

function attachPasswordToggle(button, input) {
  if (!button || !input) {
    return;
  }

  button.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(isPassword));
    button.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');

    const hiddenIcon = button.querySelector('.icone-oculta');
    const visibleIcon = button.querySelector('.icone-visivel');

    if (hiddenIcon && visibleIcon) {
      hiddenIcon.hidden = isPassword;
      visibleIcon.hidden = !isPassword;
    }
  });
}

body.classList.toggle('modo-alto-contraste', localStorage.getItem(storageKeys.contraste) === 'true');
body.classList.toggle('modo-simplificado', localStorage.getItem(storageKeys.layout) === 'true');
body.classList.toggle('modo-leitura', localStorage.getItem(storageKeys.leitura) === 'true');

setPressedState(btnContraste, body.classList.contains('modo-alto-contraste'));
setPressedState(btnLayout, body.classList.contains('modo-simplificado'));
setPressedState(btnLeitura, body.classList.contains('modo-leitura'));
applyFontSize(tamanhoFonte);
syncCartCountFromItems();
updateAuthLinks();

if (btnContraste) {
  btnContraste.addEventListener('click', () => {
    const ativo = toggleBodyMode(btnContraste, 'modo-alto-contraste', storageKeys.contraste);
    mostrarToast(ativo ? 'Modo alto contraste ativado.' : 'Modo alto contraste desativado.');
  });
}

if (btnLayout) {
  btnLayout.addEventListener('click', () => {
    const ativo = toggleBodyMode(btnLayout, 'modo-simplificado', storageKeys.layout);
    mostrarToast(ativo ? 'Layout simplificado ativado.' : 'Layout simplificado desativado.');
  });
}

if (btnLeitura) {
  btnLeitura.addEventListener('click', () => {
    const ativo = toggleBodyMode(btnLeitura, 'modo-leitura', storageKeys.leitura);
    applyFontSize(tamanhoFonte);
    mostrarToast(ativo ? 'Modo leitura ativado.' : 'Modo leitura desativado.');
  });
}

if (btnAumentarFonte) {
  btnAumentarFonte.addEventListener('click', () => {
    applyFontSize(tamanhoFonte + 1);
  });
}

if (btnDiminuirFonte) {
  btnDiminuirFonte.addEventListener('click', () => {
    applyFontSize(tamanhoFonte - 1);
  });
}

if (btnLibras && widgetLibras) {
  btnLibras.addEventListener('click', () => {
    const isOpen = widgetLibras.hidden;
    widgetLibras.hidden = !isOpen;
    setPressedState(btnLibras, isOpen);
    mostrarToast(isOpen ? 'Widget de Libras ativado.' : 'Widget de Libras desativado.', isOpen ? 'sucesso' : 'info');
  });
}

if (fecharLibras && widgetLibras) {
  fecharLibras.addEventListener('click', () => {
    widgetLibras.hidden = true;
    setPressedState(btnLibras, false);
  });
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.hidden = expanded;
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
      closeMobileMenu();
    }
  });
}

if (header) {
  const syncHeaderShadow = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };

  syncHeaderShadow();
  window.addEventListener('scroll', syncHeaderShadow, { passive: true });
}

document.querySelectorAll('.btn-ver-senha').forEach((button) => {
  const target = button.getAttribute('data-alvo');

  if (!target) {
    return;
  }

  attachPasswordToggle(button, document.getElementById(target));
});

attachPasswordToggle(document.getElementById('btn-mostrar-senha'), document.getElementById('campo-senha'));

if (btnReportar) {
  btnReportar.addEventListener('click', () => {
    mostrarToast('Canal de acessibilidade registrado. Use o contato no rodape para detalhar a barreira.', 'sucesso');
  });
}

window.atualizarCarrinho = (delta = 1) => {
  updateCartCount(itensCarrinho + delta);
  mostrarToast('Item adicionado ao carrinho.', 'sucesso');
};

window.adicionarItemAoCarrinho = (product) => {
  addCartItem(product);
  mostrarToast('Item adicionado ao carrinho.', 'sucesso');
};

window.obterItensCarrinho = readCartItems;
window.removerItemDoCarrinho = removeCartItem;
window.atualizarQuantidadeCarrinho = updateCartItemQuantity;
window.limparCarrinho = clearCart;
window.mostrarToast = mostrarToast;
window.obterUsuarioLogado = readSessionUser;
window.obterProdutosMarketplace = readMarketplaceProducts;
window.salvarProdutoMarketplace = saveMarketplaceProduct;
window.removerProdutoMarketplace = removeMarketplaceProduct;