
'use strict';

// Importa o firebase.js para uso futuro de integração de pagamentos reais
import { db } from './firebase.js';
// (Se desejar salvar pagamentos no Firestore, importar e usar funções do Firestore aqui)

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
        ? 'Simular pagamento com cartao'
        : isBoleto
          ? 'Solicitar emissao de boleto'
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
      cepStatus.textContent = 'Informe um CEP com 8 digitos para buscar o endereco.';
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
      throw new Error('CEP nao encontrado');
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
      cepStatus.textContent = 'Endereco preenchido a partir do CEP. Revise e complemente o numero.';
    }
  } catch {
    if (cepStatus) {
      cepStatus.textContent = 'Nao foi possivel localizar esse CEP. Preencha o endereco manualmente.';
    }
  }
}

function createEmptyState() {
  return `
    <div class="pagamento-vazio">
      <h3>Nenhum item pronto para checkout</h3>
      <p>Volte ao catalogo, escolha produtos e retorne para concluir a compra.</p>
      <a href="catalogo.html" class="btn btn--primary">Explorar produtos</a>
    </div>
  `;
}

function createPaymentItem(item) {
  const quantity = Number(item.quantity) || 1;

  return `
    <article class="pagamento-item" aria-label="${item.name}">
      <div class="pagamento-item__media" aria-hidden="true">${item.initials || 'EM'}</div>
      <div>
        <div class="pagamento-item__nome">${item.name}</div>
        <div class="pagamento-item__empresa">${item.company || 'Parceiro Empr-E'}</div>
        <div class="pagamento-item__meta">Quantidade: ${quantity}</div>
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

  paymentSummaryText.textContent = items.length
    ? `${totalItems} item(ns) carregados do carrinho para este checkout.`
    : 'Seus itens de checkout serao exibidos aqui.';

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

paymentForm?.addEventListener('submit', (event) => {
  event.preventDefault();

  const items = getCartItems();

  if (!items.length) {
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Adicione itens ao carrinho antes de seguir para o pagamento.', 'info');
    }
    return;
  }

  if (!paymentForm.reportValidity()) {
    return;
  }

  const method = paymentMethodSelect?.value || 'checkout';

  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast(
      method === 'pix'
        ? 'Pagamento PIX simulado com sucesso. Em producao, conecte a um PSP ou gateway com cobranca real.'
        : method === 'cartao'
          ? 'Transacao de cartao simulada com sucesso. Para teste real, use sandbox de um gateway.'
          : 'Fluxo de boleto preparado com sucesso. Em producao, gere o titulo pelo financeiro ou gateway.',
      'sucesso'
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
      window.mostrarToast('Codigo PIX copiado para a area de transferencia.', 'sucesso');
    }
  } catch {
    pixCodeField.select();
    document.execCommand('copy');
    if (typeof window.mostrarToast === 'function') {
      window.mostrarToast('Codigo PIX copiado para a area de transferencia.', 'sucesso');
    }
  }
});

cepInput?.addEventListener('blur', () => {
  fetchAddressByCep(cepInput.value);
});

renderCheckout();
