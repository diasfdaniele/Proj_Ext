
'use strict';

const paymentForm = document.getElementById('pagamento-form');
const paymentList = document.getElementById('pagamento-lista');
const paymentSummaryText = document.getElementById('pagamento-resumo-texto');
const paymentAlert = document.getElementById('pagamento-alerta');
const paymentTotalItems = document.getElementById('pagamento-total-itens');
const paymentImmediateItems = document.getElementById('pagamento-itens-imediatos');
const paymentTotalValue = document.getElementById('pagamento-total-valor');
const submitButton = document.getElementById('btn-confirmar-pagamento');
const paymentMethodSelect = document.getElementById('metodo');
const installmentsSelect = document.getElementById('parcelas');
const pixPanel = document.getElementById('painel-pix');
const cardPanel = document.getElementById('painel-cartao');
const boletoPanel = document.getElementById('painel-boleto');
const pixQrImage = document.getElementById('pix-qr-image');
const pixCodeField = document.getElementById('pix-code');
const copyPixButton = document.getElementById('btn-copiar-pix');
const cepInput = document.getElementById('cep');
const cepStatus = document.getElementById('cep-status');
const orderHistoryStorageKey = 'empre:historico-pedidos';
const addressFields = {
  bairro: document.getElementById('bairro'),
  cidade: document.getElementById('cidade'),
  complemento: document.getElementById('complemento'),
  estado: document.getElementById('estado'),
  logradouro: document.getElementById('logradouro')
};
const cardFields = [
  document.getElementById('cartao-numero'),
  document.getElementById('cartao-nome'),
  document.getElementById('cartao-validade'),
  document.getElementById('cartao-cvv')
].filter(Boolean);

function getCartItems() {
  if (typeof window.obterItensCarrinho !== 'function') {
    return [];
  }

  return window.obterItensCarrinho();
}

function getTotalQuantity(items) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

function parsePrice(value) {
  const normalized = String(value || '').match(/(\d+[\d\.,]*)/);

  if (!normalized) {
    return null;
  }

  const currency = normalized[1].replace(/\./g, '').replace(',', '.');
  const amount = Number.parseFloat(currency);
  return Number.isFinite(amount) ? amount : null;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function sanitizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function getLoggedUser() {
  const storageKey = window.sessionStorageKey;

  if (!storageKey) {
    return null;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLoggedUser(user) {
  const storageKey = window.sessionStorageKey;

  if (!storageKey || !user) {
    return;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(user));
  } catch {
  }
}

function setInputValueIfEmpty(fieldId, value) {
  const field = document.getElementById(fieldId);
  const safeValue = String(value || '').trim();

  if (!field || !safeValue) {
    return;
  }

  if (!String(field.value || '').trim()) {
    field.value = safeValue;
  }
}

async function fetchUserProfileByUid(uid) {
  if (!uid || !window.db) {
    return null;
  }

  try {
    const snapshot = await window.db.collection('usuarios').doc(uid).get();
    return snapshot.exists ? snapshot.data() : null;
  } catch (error) {
    console.error('Falha ao buscar perfil do usuário para pré-preenchimento:', error?.code || error?.message || error);
    return null;
  }
}

async function preloadCompanyDataFromLogin() {
  const loggedUser = getLoggedUser() || {};
  const currentAuthUser = window.auth?.currentUser || null;
  const uid = loggedUser.uid || currentAuthUser?.uid || null;

  let firestoreProfile = null;
  const isMissingData = !loggedUser.razaoSocial || !loggedUser.cnpj || !loggedUser.email;

  if (uid && isMissingData) {
    firestoreProfile = await fetchUserProfileByUid(uid);
  }

  const mergedUser = {
    ...loggedUser,
    cnpj: loggedUser.cnpj || firestoreProfile?.cnpj || null,
    email: loggedUser.email || currentAuthUser?.email || firestoreProfile?.email || null,
    nomeResponsavel: loggedUser.nomeResponsavel || firestoreProfile?.nomeResponsavel || null,
    razaoSocial: loggedUser.razaoSocial || firestoreProfile?.razaoSocial || null,
    uid
  };

  if (uid) {
    saveLoggedUser(mergedUser);
  }

  setInputValueIfEmpty('empresa', mergedUser.razaoSocial);
  setInputValueIfEmpty('cnpj', mergedUser.cnpj);
  setInputValueIfEmpty('email', mergedUser.email);
  setInputValueIfEmpty('responsavel', mergedUser.nomeResponsavel);
}

function buildOrderItems(items) {
  return items.map((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = parsePrice(item.price);
    return {
      categoria: item.category || null,
      empresa: item.company || null,
      id: item.id || null,
      nome: item.name || 'Item sem nome',
      precoTexto: item.price || 'Sob consulta',
      precoUnitario: unitPrice,
      quantidade: quantity,
      subtotal: unitPrice === null ? null : unitPrice * quantity,
      variacao: item.selectedVariation || null,
      variacaoImagem: item.selectedVariationImage || item.selectedImage || null
    };
  });
}

function buildOrderAddress() {
  return {
    bairro: addressFields.bairro?.value?.trim() || '',
    cep: cepInput?.value?.trim() || '',
    cidade: addressFields.cidade?.value?.trim() || '',
    complemento: addressFields.complemento?.value?.trim() || '',
    estado: addressFields.estado?.value?.trim() || '',
    logradouro: addressFields.logradouro?.value?.trim() || '',
    numero: document.getElementById('numero')?.value?.trim() || ''
  };
}

function buildOrderPayload(items, method) {
  const loggedUser = getLoggedUser();
  const normalizedMethod = method || 'checkout';
  const orderItems = buildOrderItems(items);
  const pricedItems = orderItems.filter((item) => typeof item.precoUnitario === 'number');
  const totalEstimado = pricedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const userEmail = String(document.getElementById('email')?.value?.trim() || loggedUser?.email || '').trim();
  const userUid = loggedUser?.uid || window.auth?.currentUser?.uid || null;

  return {
    cliente: {
      accountType: loggedUser?.accountType || null,
      email: userEmail || null,
      nomeEmpresa: document.getElementById('empresa')?.value?.trim() || loggedUser?.razaoSocial || null,
      nomeResponsavel: document.getElementById('responsavel')?.value?.trim() || loggedUser?.nomeResponsavel || null,
      role: loggedUser?.role || null,
      uid: userUid
    },
    clienteEmail: userEmail || null,
    clienteUid: userUid,
    cnpj: document.getElementById('cnpj')?.value?.trim() || null,
    criadoEm: new Date().toISOString(),
    endereco: buildOrderAddress(),
    itens: orderItems,
    metodoPagamento: normalizedMethod,
    observacoes: document.getElementById('observacoes')?.value?.trim() || '',
    parcelamento: installmentsSelect?.value || '1x',
    possuiItensSobConsulta: orderItems.some((item) => item.precoUnitario === null),
    referenciaPix: normalizedMethod === 'pix' ? (pixCodeField?.value || null) : null,
    status: 'simulado',
    totalEstimado,
    userEmail: userEmail || null,
    userId: userUid,
    uid: userUid
  };
}

async function saveOrderToFirestore(payload) {
  if (!window.db || !window.firebase) {
    return null;
  }

  const payloadWithServerTime = {
    ...payload,
    criadoEmServer: window.firebase.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await window.db.collection('pedidos').add(payloadWithServerTime);
  return docRef.id;
}

function saveOrderToLocalHistory(payload, orderId) {
  const localOrder = {
    ...payload,
    id: orderId || `local-${Date.now()}`,
    origem: orderId ? 'firestore' : 'local'
  };

  try {
    const raw = localStorage.getItem(orderHistoryStorageKey);
    const parsed = JSON.parse(raw || '[]');
    const current = Array.isArray(parsed) ? parsed : [];
    const next = [...current, localOrder].slice(-100);
    localStorage.setItem(orderHistoryStorageKey, JSON.stringify(next));
  } catch {
    // Nao interrompe o checkout se o historico local falhar.
  }
}

function buildPixCode(items) {
  const total = items.reduce((sum, item) => sum + (parsePrice(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const totalLabel = total > 0 ? formatCurrency(total) : 'A_CONFIRMAR';
  const company = (document.getElementById('empresa')?.value || 'EMPRE SOLUCOES').toUpperCase().slice(0, 25);
  const timestamp = Date.now();
  return `PIX|EMPRE-E|${company}|TOTAL:${totalLabel}|PEDIDO:${timestamp}|SIMULACAO`;
}

function updatePixSimulation(items) {
  if (!pixCodeField || !pixQrImage) {
    return;
  }

  const payload = buildPixCode(items);
  pixCodeField.value = payload;
  pixQrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}`;
}

function setCardFieldRequirements(isRequired) {
  cardFields.forEach((field) => {
    field.required = isRequired;
    field.disabled = !isRequired;
  });
}

function updatePaymentMethodState(items = getCartItems()) {
  const method = paymentMethodSelect?.value || '';
  const isPix = method === 'pix';
  const isCard = method === 'cartao';
  const isBoleto = method === 'boleto';

  if (pixPanel) {
    pixPanel.hidden = !isPix;
  }

  if (cardPanel) {
    cardPanel.hidden = !isCard;
  }

  if (boletoPanel) {
    boletoPanel.hidden = !isBoleto;
  }

  if (installmentsSelect) {
    installmentsSelect.disabled = !isCard;
  }

  setCardFieldRequirements(isCard);

  if (submitButton) {
    submitButton.textContent = isPix
      ? 'Confirmar pagamento PIX'
      : isCard
        ? 'Simular pagamento com cartão'
        : isBoleto
          ? 'Solicitar emissão de boleto'
          : 'Confirmar compra';
  }

  if (isPix) {
    updatePixSimulation(items);
  }
}

async function fetchAddressByCep(rawCep) {
  const cep = sanitizeDigits(rawCep);

  if (cep.length !== 8) {
    if (cepStatus) {
      cepStatus.textContent = 'Informe um CEP com 8 dígitos para buscar o endereço.';
    }
    return;
  }

  if (cepStatus) {
    cepStatus.textContent = 'Buscando endereco pelo CEP informado...';
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (!response.ok || data.erro) {
      throw new Error('CEP não encontrado');
    }

    if (addressFields.logradouro) {
      addressFields.logradouro.value = data.logradouro || '';
    }
    if (addressFields.bairro) {
      addressFields.bairro.value = data.bairro || '';
    }
    if (addressFields.cidade) {
      addressFields.cidade.value = data.localidade || '';
    }
    if (addressFields.estado) {
      addressFields.estado.value = data.uf || '';
    }
    if (addressFields.complemento && !addressFields.complemento.value) {
      addressFields.complemento.value = data.complemento || '';
    }

    if (cepStatus) {
      cepStatus.textContent = 'Endereço preenchido a partir do CEP. Revise e complemente o número.';
    }
  } catch {
    if (cepStatus) {
      cepStatus.textContent = 'Não foi possível localizar esse CEP. Preencha o endereço manualmente.';
    }
  }
}

function createEmptyState() {
  return `
    <div class="pagamento-vazio">
      <h3>Nenhum item pronto para checkout</h3>
      <p>Volte ao catálogo, escolha produtos e retorne para concluir a compra.</p>
      <a href="catalogo.html" class="btn btn--primary">Explorar produtos</a>
    </div>
  `;
}

function createPaymentItem(item) {
  const quantity = Number(item.quantity) || 1;
  const variationLabel = item.selectedVariation ? `<div class="pagamento-item__meta">Variação: ${item.selectedVariation}</div>` : '';

  return `
    <article class="pagamento-item" aria-label="${item.name}">
      <div class="pagamento-item__media" aria-hidden="true">${item.initials || 'EM'}</div>
      <div>
        <div class="pagamento-item__nome">${item.name}</div>
        <div class="pagamento-item__empresa">${item.company || 'Parceiro Empr-E'}</div>
        <div class="pagamento-item__meta">Quantidade: ${quantity}</div>
        ${variationLabel}
      </div>
      <div class="pagamento-item__preco">${item.price || 'Sob consulta'}</div>
    </article>
  `;
}

function updateSummary(items) {
  const totalItems = getTotalQuantity(items);
  const immediateItems = items.filter((item) => parsePrice(item.price) !== null);
  const consultiveItems = items.length - immediateItems.length;
  const estimatedTotal = immediateItems.reduce((sum, item) => sum + (parsePrice(item.price) || 0) * (Number(item.quantity) || 1), 0);

  paymentTotalItems.textContent = String(totalItems);
  paymentImmediateItems.textContent = String(immediateItems.length);
  paymentTotalValue.textContent = estimatedTotal > 0 ? formatCurrency(estimatedTotal) : 'A confirmar';

  if (paymentSummaryText) {
    paymentSummaryText.textContent = items.length
      ? `${totalItems} item(ns) carregados do carrinho para este checkout.`
      : 'Seus itens de checkout serão exibidos aqui.';
  }

  if (paymentAlert) {
    paymentAlert.hidden = consultiveItems === 0;
  }
}

function renderCheckout() {
  const items = getCartItems();

  if (!items.length) {
    if (paymentList) {
      paymentList.innerHTML = createEmptyState();
    }
    updateSummary([]);
    if (submitButton) {
      submitButton.disabled = true;
    }
    updatePaymentMethodState([]);
    return;
  }

  if (paymentList) {
    paymentList.innerHTML = items.map(createPaymentItem).join('');
  }

  if (submitButton) {
    submitButton.disabled = false;
  }

  updateSummary(items);
  updatePaymentMethodState(items);
}

paymentForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const items = getCartItems();

  if (!items.length) {
    if (typeof window.mostrarToast === 'function') {
      window.showToast('Adicione itens ao carrinho antes de seguir para o pagamento.', 'Bad_Toast');
    }
    return;
  }

  if (!paymentForm.reportValidity()) {
    return;
  }

  const method = paymentMethodSelect?.value || 'checkout';
  const payload = buildOrderPayload(items, method);
  let orderId = null;

  try {
    orderId = await saveOrderToFirestore(payload);

    if (orderId && typeof window.mostrarToast === 'function') {
      window.showToast(`Pedido registrado com sucesso (ID: ${orderId}).`, 'Good_Toast');
    }
  } catch (error) {
    console.error('Falha ao salvar pedido:', error?.code || error?.message || error);

    if (typeof window.mostrarToast === 'function') {
      window.showToast('Pedido processado localmente. Não foi possível registrar no Firebase agora.', 'Bad_Toast');
    }
  }

  saveOrderToLocalHistory(payload, orderId);

  if (typeof window.mostrarToast === 'function') {
    window.showToast(
      method === 'pix'
        ? 'Pagamento PIX simulado com sucesso!'
        : method === 'cartao'
          ? 'Transação de cartão simulada com sucesso!'
          : 'Fluxo de boleto preparado com sucesso!',
      'Good_Toast'
    );
  }

  if (typeof window.limparCarrinho === 'function') {
    window.limparCarrinho();
  }

  window.setTimeout(() => {
    window.location.href = 'carrinho.html';
  }, 1200);
});

paymentMethodSelect?.addEventListener('change', () => {
  updatePaymentMethodState();
});

copyPixButton?.addEventListener('click', async () => {
  if (!pixCodeField?.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(pixCodeField.value);
    if (typeof window.mostrarToast === 'function') {
      window.showToast('Código PIX copiado para a área de transferência.', 'Good_Toast');
    }
  } catch {
    pixCodeField.select();
    document.execCommand('copy');
    if (typeof window.mostrarToast === 'function') {
      window.showToast('Código PIX copiado para a área de transferência.', 'Good_Toast');
    }
  }
});

cepInput?.addEventListener('blur', () => {
  fetchAddressByCep(cepInput.value);
});

renderCheckout();
preloadCompanyDataFromLogin();
