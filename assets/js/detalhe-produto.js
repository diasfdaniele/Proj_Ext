// Script para página de detalhes do produto
// Lê o id do produto da URL, busca no catálogo e exibe detalhes

function getAllProductsDetalhe() {
  // Mesma lógica do catalogo.js
  const produtosLocais = window.produtosLocaisMarketplace || [];
  const produtosCadastrados = window.produtosMarketplaceCadastrados || [];
  const baseProducts = window.baseProducts || [];
  return [...baseProducts, ...produtosLocais, ...produtosCadastrados];
}

function getVariationNameByImage(produto, imageUrl) {
  if (!produto?.variations || !Array.isArray(produto.variations)) {
    return '';
  }

  const match = produto.variations.find((variation) => variation?.imagem === imageUrl);
  return match?.nome || '';
}

function getVariationByImage(produto, imageUrl) {
  if (!produto?.variations || !Array.isArray(produto.variations)) {
    return null;
  }

  return produto.variations.find((variation) => variation?.imagem === imageUrl) || null;
}

function buildDetailImageAlt(produto, imageUrl, index = 0, total = 1) {
  const safeName = produto?.name || 'produto';
  const safeCompany = produto?.company || 'empresa nao informada';
  const safeCategory = produto?.categoryLabel || 'categoria nao informada';
  const variationName = getVariationNameByImage(produto, imageUrl);
  const variationLabel = variationName ? ` Variacao ${variationName}.` : '';
  const positionLabel = total > 1 ? ` Foto ${index + 1} de ${total}.` : '';

  return `${safeName}, empresa ${safeCompany}, categoria ${safeCategory}.${variationLabel}${positionLabel}`;
}

function renderDetalheProduto() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const produto = getAllProductsDetalhe().find(p => p.id === id);
  const container = document.getElementById('produto-detalhe');
  if (!produto) {
    container.innerHTML = '<div class="produto-detalhe__vazio"><h2>Produto nao encontrado</h2><p>Volte ao catalogo para continuar navegando.</p></div>';
    return;
  }

  const images = Array.isArray(produto.images) && produto.images.length ? produto.images : [];
  let currentImage = images[0] || (produto.variations?.[0]?.imagem ?? '');
  let currentVariation = getVariationByImage(produto, currentImage) || (produto.variations?.[0] ?? null);

  const thumbnails = images.map((img, i) => {
    const variation = getVariationByImage(produto, img);
    const label = variation?.nome || `Imagem ${i + 1}`;
    const imageAlt = buildDetailImageAlt(produto, img, i, images.length);
    return `
      <button type="button" class="produto-detalhe__thumb${img === currentImage ? ' produto-detalhe__thumb--ativo' : ''}" data-thumb-image="${img}" aria-label="Visualizar ${label}">
        <img src="${img}" alt="${imageAlt}" title="${imageAlt}" loading="lazy" />
      </button>
    `;
  }).join('');

  const variationButtons = Array.isArray(produto.variations) && produto.variations.length
    ? `
      <div class="produto-detalhe__variacoes-label">Variações disponiveis</div>
      ${produto.variations.map((variation) => `
        <button type="button" class="btn-variacao${currentVariation?.nome === variation.nome ? ' btn-variacao--ativa' : ''}" data-variation-name="${variation.nome}" data-variation-image="${variation.imagem}" aria-label="Selecionar variação ${variation.nome}">${variation.nome}</button>
      `).join('')}
    `
    : '';

  container.innerHTML = `
    <div class="produto-detalhe__galeria">
      <div class="produto-detalhe__imagem-principal-wrap">
        <img id="produto-detalhe-imagem-principal" src="${currentImage}" alt="${buildDetailImageAlt(produto, currentImage, 0, images.length || 1)}" title="${buildDetailImageAlt(produto, currentImage, 0, images.length || 1)}" class="produto-detalhe__imagem-principal" />
      </div>
      ${thumbnails ? `<div class="produto-detalhe__thumbs">${thumbnails}</div>` : ''}
    </div>
    <div class="produto-detalhe__info">
      <div class="produto-detalhe__breadcrumb">
        <a href="catalogo.html" class="btn btn--ghost btn--sm">Voltar ao catalogo</a>
      </div>
      <span class="produto-detalhe__categoria">${produto.categoryLabel || 'Marketplace Empr-E'}</span>
      <h2 class="produto-detalhe__titulo">${produto.name}</h2>
      <p class="produto-detalhe__empresa">Fornecedor: ${produto.company || 'Parceiro Empr-E'}</p>
      ${variationButtons ? `<div class="produto-detalhe__variacoes">${variationButtons}</div>` : ''}
      <p class="produto-detalhe__descricao">${produto.description}</p>
      <div class="produto-detalhe__resumo">
        <div class="produto-detalhe__painel">
          <span class="produto-detalhe__painel-label">Preco</span>
          <div class="produto-detalhe__preco">${produto.price || 'Sob consulta'}</div>
        </div>
        <div class="produto-detalhe__painel">
          <span class="produto-detalhe__painel-label">Modalidade</span>
          <div class="produto-detalhe__modalidade">${produto.purchaseModeLabel || 'Sob consulta'}</div>
        </div>
      </div>
      <div class="produto-detalhe__vendedor"><strong>Vendedor:</strong> ${produto.company || 'Parceiro Empr-E'}</div>
      <div class="produto-detalhe__acoes">
        <button class="btn btn--primary" id="btn-adicionar-carrinho">Adicionar ao carrinho</button>
        <a href="carrinho.html" class="btn btn--outline produto-detalhe__btn-secundario">Ver carrinho</a>
      </div>
    </div>
  `;

  const mainImage = container.querySelector('#produto-detalhe-imagem-principal');
  const thumbButtons = Array.from(container.querySelectorAll('[data-thumb-image]'));
  const variationBtns = Array.from(container.querySelectorAll('[data-variation-image]'));

  function syncActiveState(selectedImage, selectedVariationName = '') {
    const total = images.length || 1;
    const selectedIndex = Math.max(0, images.indexOf(selectedImage));
    const imageDescription = buildDetailImageAlt(produto, selectedImage, selectedIndex, total);

    if (mainImage && selectedImage) {
      mainImage.src = selectedImage;
      mainImage.alt = imageDescription;
      mainImage.title = imageDescription;
    }

    thumbButtons.forEach((button) => {
      const isActive = button.getAttribute('data-thumb-image') === selectedImage;
      button.classList.toggle('produto-detalhe__thumb--ativo', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    variationBtns.forEach((button) => {
      const isActive = button.getAttribute('data-variation-name') === selectedVariationName;
      button.classList.toggle('btn-variacao--ativa', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  thumbButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedImage = button.getAttribute('data-thumb-image');
      currentImage = selectedImage || currentImage;
      currentVariation = getVariationByImage(produto, currentImage) || currentVariation;
      syncActiveState(currentImage, currentVariation?.nome || '');
    });
  });

  variationBtns.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedImage = button.getAttribute('data-variation-image') || currentImage;
      const selectedVariationName = button.getAttribute('data-variation-name') || '';
      currentImage = selectedImage;
      currentVariation = { nome: selectedVariationName, imagem: selectedImage };
      syncActiveState(currentImage, selectedVariationName);
    });
  });

  syncActiveState(currentImage, currentVariation?.nome || '');

  container.querySelector('#btn-adicionar-carrinho').addEventListener('click', () => {
    if (typeof window.adicionarItemAoCarrinho === 'function') {
      window.adicionarItemAoCarrinho({
        ...produto,
        selectedImage: currentImage || null,
        selectedVariationImage: currentImage || null,
        selectedVariation: currentVariation?.nome || ''
      });
    }
  });
}

// Expor baseProducts globalmente para detalhe
importedBase = window.baseProducts;
window.baseProducts = window.baseProducts || [];

// Executa ao carregar
window.addEventListener('DOMContentLoaded', renderDetalheProduto);
