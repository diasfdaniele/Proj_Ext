'use strict';

import { auth, db, isFirebaseConfigured } from './firebase.js';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const sessionStorageKey = 'empre:usuario-logado';
const heroText = document.getElementById('conta-hero-texto');
const summaryText = document.getElementById('conta-resumo-texto');
const summaryType = document.getElementById('conta-tipo-usuario');
const totalFavorites = document.getElementById('conta-total-favoritos');
const totalInteractions = document.getElementById('conta-total-interacoes');
const favoritesText = document.getElementById('conta-favoritos-texto');
const favoritesList = document.getElementById('conta-favoritos-lista');
const interactionsText = document.getElementById('conta-interacoes-texto');
const interactionsList = document.getElementById('conta-interacoes-lista');
const loginLink = document.getElementById('conta-login-link');
const logoutButton = document.getElementById('btn-sair-conta');

function readSessionUser() {
  try {
    const parsed = JSON.parse(localStorage.getItem(sessionStorageKey) ?? 'null');
    return parsed && typeof parsed.uid === 'string' ? parsed : null;
  } catch {
    return null;
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

function requireAuthenticationState() {
  const user = readSessionUser();

  if (!user) {
    summaryType.textContent = 'Visitante';
    summaryText.textContent = 'Entre com sua conta para acessar seus favoritos e historico de interacoes.';
    heroText.textContent = 'Acesse sua conta para visualizar os produtos favoritados e o historico de relacionamento com o marketplace.';
    favoritesText.textContent = 'Seus favoritos aparecerao aqui apos o login.';
    interactionsText.textContent = 'Entre com sua conta para acompanhar suas interacoes.';
    renderEmptyState(favoritesList, 'Nenhum favorito disponivel. Faca login e favorite produtos no catalogo.');
    renderEmptyState(interactionsList, 'Nenhuma interacao disponivel. Faca login para visualizar seu historico.');
    updateSummary(0, 0);
    loginLink.hidden = false;
    logoutButton.hidden = true;
    return null;
  }

  loginLink.hidden = true;
  logoutButton.hidden = false;
  summaryType.textContent = user.role === 'administrador' ? 'Administrador' : 'Usuario comum';
  summaryText.textContent = user.role === 'administrador'
    ? `Administrador autenticado: ${user.razaoSocial || user.email}. Seus favoritos e todas as interacoes do sistema ficam visiveis abaixo.`
    : `Conta autenticada para ${user.razaoSocial || user.email}. Seus favoritos e interacoes ficam organizados abaixo.`;
  heroText.textContent = 'Gerencie seus produtos salvos e acompanhe o historico de mensagens registradas no marketplace.';
  favoritesText.textContent = 'Produtos favoritados ficam salvos no banco e reaparecem aqui.';
  interactionsText.textContent = user.role === 'administrador'
    ? 'Modo administrador: visualizacao de todas as interacoes registradas.'
    : 'Historico das suas interacoes registradas no marketplace.';
  return user;
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
    renderInteractions(interactions, isAdmin);
  } catch (error) {
    console.error(error);
    renderEmptyState(favoritesList, 'Nao foi possivel carregar os favoritos.');
    renderEmptyState(interactionsList, 'Nao foi possivel carregar as interacoes.');
    updateSummary(0, 0);
  }
}

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
