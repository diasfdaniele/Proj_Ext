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
    container.innerHTML = '<h2>Produto não encontrado</h2>';
    return;
  }

  // Galeria de imagens
  let galeria = '';
  if (produto.images && produto.images.length) {
    galeria = `<div class="produto-detalhe__galeria">${produto.images.map((img, i) => `
      <img src="${img}" alt="${buildDetailImageAlt(produto, img, i, produto.images.length)}" title="${buildDetailImageAlt(produto, img, i, produto.images.length)}" class="produto-detalhe__imagem" style="max-width:320px; margin:4px; border-radius:8px;">
    `).join('')}</div>`;
  }

  // Variações
  let variacoes = '';
  if (produto.variations && produto.variations.length) {
    variacoes = `<div class="produto-detalhe__variacoes"><strong>Variações:</strong> ${produto.variations.map(v => `<button class="btn-variacao" data-img="${v.imagem}" aria-label="Selecionar variação ${v.nome}">${v.nome}</button>`).join(' ')}</div>`;
  }

  // Info vendedor
  let vendedor = produto.company ? `<div class="produto-detalhe__vendedor"><strong>Vendedor:</strong> ${produto.company}</div>` : '';

  container.innerHTML = `
    <h1 class="produto-detalhe__titulo">${produto.name}</h1>
    ${galeria}
    ${variacoes}
    <p class="produto-detalhe__descricao">${produto.description}</p>
    <div class="produto-detalhe__preco"><strong>Preço:</strong> ${produto.price}</div>
    <div class="produto-detalhe__modalidade"><strong>Modalidade:</strong> ${produto.purchaseModeLabel || ''}</div>
    ${vendedor}
    <button class="btn btn--primary" id="btn-adicionar-carrinho">Adicionar ao carrinho</button>
  `;

  // Troca imagem principal ao clicar na variação
  container.querySelectorAll('.btn-variacao').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.getAttribute('data-img');
      const galeriaDiv = container.querySelector('.produto-detalhe__galeria');
      if (galeriaDiv && img) {
        const imageDescription = buildDetailImageAlt(produto, img, 0, 1);
        galeriaDiv.innerHTML = `<img src="${img}" alt="${imageDescription}" title="${imageDescription}" class="produto-detalhe__imagem" style="max-width:320px; margin:4px; border-radius:8px;">`;
      }
    });
  });

  // Adicionar ao carrinho
  container.querySelector('#btn-adicionar-carrinho').addEventListener('click', () => {
    if (typeof window.adicionarItemAoCarrinho === 'function') {
      window.adicionarItemAoCarrinho(produto);
      alert('Produto adicionado ao carrinho!');
    }
  });
}

// Expor baseProducts globalmente para detalhe
importedBase = window.baseProducts;
window.baseProducts = window.baseProducts || [];

// Executa ao carregar
window.addEventListener('DOMContentLoaded', renderDetalheProduto);
