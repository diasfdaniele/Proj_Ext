'use strict';

const cartSessionStorageKey = 'empre:usuario-logado';
const cartCollectionName = 'carrinhos';

function resolveFirestoreDb() {
  if (window.db) {
    return window.db;
  }

  if (window.firebase && typeof window.firebase.firestore === 'function') {
    try {
      window.db = window.firebase.firestore();
      return window.db;
    } catch (error) {
      console.error('Carrinho: no firestore.', error?.code || error?.message || error);
    }
  }

  return null;
}

function sanitizeCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && typeof item.id === 'string')
    .map((item) => ({
      category: String(item.category || ''),
      categoryLabel: String(item.categoryLabel || ''),
      company: String(item.company || ''),
      description: String(item.description || ''),
      id: String(item.id),
      initials: String(item.initials || ''),
      name: String(item.name || 'Produto'),
      price: String(item.price || 'Sob consulta'),
      purchaseModeLabel: String(item.purchaseModeLabel || ''),
      quantity: Math.max(1, Number(item.quantity) || 1),
      selectedImage: String(item.selectedImage || ''),
      selectedVariation: String(item.selectedVariation || ''),
      selectedVariationImage: String(item.selectedVariationImage || '')
    }));
}

// FIREBASE: salva carrinho usando window.db
async function salvarCarrinhoNoFirebase(items) {
  try {
    const user = getLoggedUser() || window.auth?.currentUser || null;
    const cleanItems = sanitizeCartItems(items);

    if (!user?.uid) {
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Faça login para sincronizar o carrinho.', 'info');
      }
      return;
    }

    if (!cleanItems.length) {
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Nenhum item válido para salvar no Firebase.', 'info');
      }
      return;
    }

    if (typeof window.sincronizarCarrinhoNoFirestore === 'function') {
      const synced = await window.sincronizarCarrinhoNoFirestore(cleanItems, user);

      if (!synced) {
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Não foi possível sincronizar o carrinho agora.', 'erro');
        }
        return;
      }

      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Carrinho sincronizado com sucesso!', 'sucesso');
      }
      return;
    }

    const firestoreDb = resolveFirestoreDb();

    if (!firestoreDb) {
      console.error('Carrinho: Firestore indisponível na página.');
      if (typeof window.mostrarToast === 'function') {
        window.mostrarToast('Firebase indisponível no carrinho. Recarregue a página.', 'erro');
      }
      return;
    }

    const payload = {
      itens: cleanItems,
      uid: user.uid,
      email: user?.email || null,
      status: 'pendente',
      criadoEm: new Date().toISOString()
    };

    if (window.firebase?.firestore?.FieldValue?.serverTimestamp) {
      payload.criadoEmServer = window.firebase.firestore.FieldValue.serverTimestamp();
    }

    await firestoreDb.collection(cartCollectionName).doc(user.uid).set(payload, { merge: true });
    console.log('Carrinho salvo no Firebase! Coleção:', cartCollectionName, 'ID:', user.uid);

    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Carrinho salvo com sucesso!', 'sucesso');
    }

  } catch (e) {
    // Loga o erro real no console para facilitar debug
    console.error('Erro ao salvar carrinho no Firebase:', e?.code, e?.message || e);

    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast(`Erro ao salvar: ${e?.message || 'falha inesperada'}`, 'erro');
    }
  }
}

// SELETORES DOM 
const cartList              = document.getElementById('lista-carrinho');
const cartSummaryText       = document.getElementById('carrinho-resumo-texto');
const totalQuantityElement  = document.getElementById('resumo-quantidade');
const totalValueElement     = document.getElementById('resumo-valor');
const clearCartButton       = document.getElementById('btn-limpar-carrinho');
const finalizeCartButton    = document.getElementById('btn-finalizar-carrinho');
const proceedToPaymentLink  = document.getElementById('btn-ir-pagamento');

// USUÁRIO LOGADO 
function getLoggedUser() {
  try {
    const chave = window.sessionStorageKey || cartSessionStorageKey;
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

// ITENS DO CARRINHO 
function getCartItems() {
  if (typeof window.obterItensCarrinho !== 'function') {
    return [];
  }
  return window.obterItensCarrinho();
}

// CÁLCULOS 
function getTotalQuantity(items) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

function parsePriceValue(price) {
  const normalizedPrice = String(price ?? '').replace(/\./g, '').replace(',', '.');
  const matchedValue = normalizedPrice.match(/r\$\s*(\d+(?:\.\d+)?)/i);
  if (!matchedValue) return null;
  return Number(matchedValue[1]);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    currency: 'BRL',
    style: 'currency'
  }).format(value);
}

// ESTADO VAZIO 
function createEmptyState() {
  const user = getLoggedUser();

  if (!user) {
    return `
      <div class="carrinho-vazio">
        <div>
          <div class="carrinho-vazio__icone" aria-hidden="true">+</div>
          <h3>Faça login para usar o carrinho</h3>
          <p>Os itens adicionados no carrinho aparecerão aqui após o login.</p>
          <a href="login.html" class="btn btn--primary">Entrar</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="carrinho-vazio">
      <div>
        <div class="carrinho-vazio__icone" aria-hidden="true">+</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Explore o catálogo e adicione produtos ao seu carrinho.</p>
        <a href="catalogo.html" class="btn btn--primary">Explorar produtos</a>
      </div>
    </div>
  `;
}

// CARD DE ITEM 
function createCartItem(item) {
  const quantity = Number(item.quantity) || 1;
  const variationLabel = item.selectedVariation
    ? `<div class="carrinho-item__meta">Variação: ${item.selectedVariation}</div>`
    : '';

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
        <span class="carrinho-item__categoria">${item.category || 'solução'}</span>
        <p class="carrinho-item__descricao">${item.description || 'Produto selecionado no catálogo da Empr-E.'}</p>
        ${variationLabel}
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

// RESUMO 
function updateSummary(items) {
  const totalQuantity   = getTotalQuantity(items);
  const pricedItems     = items.map((item) => ({
    quantity: Number(item.quantity) || 1,
    value: parsePriceValue(item.price)
  }));
  const hasNonPricedItems = pricedItems.some((item) => item.value === null);
  const numericTotal      = pricedItems.reduce(
    (sum, item) => sum + ((item.value ?? 0) * item.quantity), 0
  );

  totalQuantityElement.textContent = String(totalQuantity);
  totalValueElement.textContent = hasNonPricedItems
    ? (numericTotal > 0 ? `A partir de ${formatCurrency(numericTotal)}` : 'Sob consulta')
    : formatCurrency(numericTotal);

  cartSummaryText.textContent = items.length
    ? `${totalQuantity} item(ns) selecionado(s)`
    : 'Revise os itens escolhidos antes de solicitar um orçamento ou seguir para o pagamento.';
}

// AÇÕES DOS BOTÕES DO ITEM (aumentar, diminuir, remover) 
function bindCartActions(items) {
  cartList.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action');
      const itemId = button.getAttribute('data-id');
      const item   = items.find((entry) => entry.id === itemId);

      if (!item || !itemId) return;

      if (action === 'increase' && typeof window.atualizarQuantidadeCarrinho === 'function') {
        window.atualizarQuantidadeCarrinho(itemId, (Number(item.quantity) || 1) + 1);
        showToast('Produto Adicionado ao Carrinho', 'Good_Toast', 800);
        renderCart();
        return;
      }

      if (action === 'decrease' && typeof window.atualizarQuantidadeCarrinho === 'function') {
        const nextQuantity = Math.max(1, (Number(item.quantity) || 1) - 1);
        window.atualizarQuantidadeCarrinho(itemId, nextQuantity);
        showToast('Produto Diminuído do Carrinho', 'Bad_Toast', 800);
        renderCart();
        return;
      }

      if (action === 'remove' && typeof window.removerItemDoCarrinho === 'function') {
        window.removerItemDoCarrinho(itemId);
        showToast('Produto Removido do Carrinho', 'Bad_Toast', 800);
        if (typeof window.mostrarToast === 'function') {
          window.mostrarToast('Item removido do carrinho.', 'info');
        }
        renderCart();
      }
    });
  });
}

// RENDERIZAÇÃO PRINCIPAL
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

// LIMPAR CARRINHO 
clearCartButton?.addEventListener('click', () => {
  if (typeof window.limparCarrinho === 'function') {
    window.limparCarrinho();
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Carrinho limpo com sucesso.', 'info');
    }
    renderCart();
  }
});

//  FINALIZAR / SALVAR NO FIREBASE 
finalizeCartButton?.addEventListener('click', async () => {
  const items = getCartItems();

  if (!items.length) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Adicione itens ao carrinho antes de finalizar.', 'info');
    }
    return;
  }

  const user = getLoggedUser();

  if (!user) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Faça login para finalizar o carrinho.', 'info');
    }
    return;
  }

  await salvarCarrinhoNoFirebase(items);
});

// IR PARA PAGAMENTO 
proceedToPaymentLink?.addEventListener('click', (event) => {
  const user = getLoggedUser();

  if (!user) {
    event.preventDefault();
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Faça login para seguir ao pagamento.', 'info');
    }
    return;
  }

  if (!getCartItems().length) {
    event.preventDefault();
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Adicione itens ao carrinho antes de seguir para o pagamento.', 'info');
    }
  }
});

// INICIALIZAÇÃO 
renderCart();