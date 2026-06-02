
'use strict';

// Função para salvar o carrinho no Firestore usando compat
async function salvarCarrinhoNoFirebase(items) {
  try {
    await firebase.firestore().collection('carrinhos').add({
      itens: items,
      criadoEm: new Date()
    });
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Carrinho salvo no Firebase!', 'sucesso');
    }
  } catch (e) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Erro ao salvar no Firebase.', 'erro');
    }
  }
}

const cartList = document.getElementById('lista-carrinho');
const cartSummaryText = document.getElementById('carrinho-resumo-texto');
const totalQuantityElement = document.getElementById('resumo-quantidade');
const totalValueElement = document.getElementById('resumo-valor');
const clearCartButton = document.getElementById('btn-limpar-carrinho');
const finalizeCartButton = document.getElementById('btn-finalizar-carrinho');
const proceedToPaymentLink = document.getElementById('btn-ir-pagamento');
const toast = document.getElementById("toast-container");

function getLoggedUser() {
  return typeof window.obterUsuarioLogado === 'function' ? window.obterUsuarioLogado() : null;
}

function getCartItems() {
  if (typeof window.obterItensCarrinho !== 'function') {
    return [];
  }

  return window.obterItensCarrinho();
}

function getTotalQuantity(items) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

function parsePriceValue(price) {
  const normalizedPrice = String(price ?? '').replace(/\./g, '').replace(',', '.');
  const matchedValue = normalizedPrice.match(/r\$\s*(\d+(?:\.\d+)?)/i);

  if (!matchedValue) {
    return null;
  }

  return Number(matchedValue[1]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency'
  }).format(value);
}

function createEmptyState() {
  const user = getLoggedUser();

  if (!user) {
    return `
      <div class="carrinho-vazio">
        <div>
          <div class="carrinho-vazio__icone" aria-hidden="true">+</div>
          <h3>Faça login para usar o carrinho</h3>
          <p>Seus itens de carrinho ficam vinculados à sua conta e reaparecem após novo login.</p>
          <a href="login.html" class="btn btn--primary">Entrar</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="carrinho-vazio">
      <div>
        <div class="carrinho-vazio__icone" aria-hidden="true">+</div>
        <h3>Seu carrinho esta vazio</h3>
        <p>Adicione produtos no catalogo para montar uma lista de interesse e facilitar a solicitacao comercial da sua empresa.</p>
        <a href="catalogo.html" class="btn btn--primary">Explorar produtos</a>
      </div>
    </div>
  `;
}

function createCartItem(item) {
  const quantity = Number(item.quantity) || 1;

  return `
    <article class="carrinho-item" aria-label="${item.name}">
      <div class="carrinho-item__media" aria-hidden="true">${item.initials || 'EM'}</div>
      <div>
        <div class="carrinho-item__cabecalho">
          <div>
            <h3>${item.name}</h3>
            <p class="carrinho-item__empresa">${item.company || 'Parceiro Empr-E'}</p>
          </div>
        </div>
        <span class="carrinho-item__categoria">${item.category || 'solucao'}</span>
        <p class="carrinho-item__descricao">${item.description || 'Produto selecionado no catalogo da Empr-E.'}</p>
        <div class="carrinho-item__controles">
          <div class="carrinho-item__quantidade" aria-label="Quantidade do produto ${item.name}">
            <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade de ${item.name}">-</button>
            <span>${quantity}</span>
            <button type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade de ${item.name}">+</button>
          </div>
          <button type="button" class="carrinho-item__remove" data-action="remove" data-id="${item.id}">Remover</button>
        </div>
      </div>
      <div class="carrinho-item__aside">
        <div>
          <div class="carrinho-item__preco">${item.price || 'Sob consulta'}</div>
          <div class="carrinho-item__meta">Quantidade: ${quantity}</div>
        </div>
        <a href="catalogo.html" class="btn btn--ghost btn--sm">Ver similares</a>
      </div>
    </article>
  `;
}

function updateSummary(items) {
  const totalQuantity = getTotalQuantity(items);
  const pricedItems = items.map((item) => ({
    quantity: Number(item.quantity) || 1,
    value: parsePriceValue(item.price)
  }));
  const hasNonPricedItems = pricedItems.some((item) => item.value === null);
  const numericTotal = pricedItems.reduce((sum, item) => sum + ((item.value ?? 0) * item.quantity), 0);

  totalQuantityElement.textContent = String(totalQuantity);
  totalValueElement.textContent = hasNonPricedItems
    ? (numericTotal > 0 ? `A partir de ${formatCurrency(numericTotal)}` : 'Sob consulta')
    : formatCurrency(numericTotal);
  cartSummaryText.textContent = items.length
    ? `${totalQuantity} item(ns) selecionado(s) para revisão da sua empresa.`
    : 'Revise os itens escolhidos antes de solicitar um orçamento ou seguir para o pagamento.';
}

function bindCartActions(items) {
  cartList.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const itemId = button.getAttribute('data-id');
      const item = items.find((entry) => entry.id === itemId);

      if (!item || !itemId) {
        return;
      }

      if (action === 'increase' && typeof window.atualizarQuantidadeCarrinho === 'function') {
        window.atualizarQuantidadeCarrinho(itemId, (Number(item.quantity) || 1) + 1);
        showToast("Produto Adicionado ao Carrinho", 'Good_Toast', 800);
        renderCart();
        return;
      }

      if (action === 'decrease' && typeof window.atualizarQuantidadeCarrinho === 'function') {
        const nextQuantity = Math.max(1, (Number(item.quantity) || 1) - 1);
        window.atualizarQuantidadeCarrinho(itemId, nextQuantity);
        showToast("Produto Diminuído do Carrinho", 'Bad_Toast', 800);
        renderCart();
        return;
      }

      if (action === 'remove' && typeof window.removerItemDoCarrinho === 'function') {
        window.removerItemDoCarrinho(itemId);
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Item removido do carrinho.', 'info');
          showToast("Produto Removido do Carrinho", 'Bad_Toast', 800);
        }
        renderCart();
      }
    });
  });
}

function renderCart() {
  const items = getCartItems();

  if (!items.length) {
    cartList.innerHTML = createEmptyState();
    updateSummary([]);
    return;
  }

  cartList.innerHTML = items.map(createCartItem).join('');
  updateSummary(items);
  bindCartActions(items);
}

clearCartButton?.addEventListener('click', () => {
  if (typeof window.limparCarrinho === 'function') {
    window.limparCarrinho();
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Carrinho limpo com sucesso.', 'info');
    }
    renderCart();
  }
});


finalizeCartButton?.addEventListener('click', () => {
  if (!getLoggedUser()) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Faca login para finalizar o carrinho.', 'info');
    }
    return;
  }

  const items = getCartItems();
  if (!items.length) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Adicione itens ao carrinho antes de finalizar.', 'info');
    }
    return;
  }
  salvarCarrinhoNoFirebase(items);
});

proceedToPaymentLink?.addEventListener('click', (event) => {
  if (!getLoggedUser()) {
    event.preventDefault();

    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Faca login para seguir ao pagamento.', 'info');
    }
    return;
  }

  if (getCartItems().length) {
    return;
  }

  event.preventDefault();

  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast('Adicione itens ao carrinho antes de seguir para o pagamento.', 'info');
  }
});

renderCart();
