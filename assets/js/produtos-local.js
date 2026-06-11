const marketplaceStorageKey = 'empre:produtos-marketplace';
const marketplaceCollectionName = 'produtos_marketplace';
const marketplaceHiddenStorageKey = 'empre:produtos-ocultos';

function readMarketplaceProductsFromStorage() {
  try {
    const raw = localStorage.getItem(marketplaceStorageKey);
    const parsed = JSON.parse(raw || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.sellerId === 'string');
  } catch {
    return [];
  }
}

function saveMarketplaceProductsToStorage(items) {
  localStorage.setItem(marketplaceStorageKey, JSON.stringify(items));
}

function readHiddenMarketplaceProductIds() {
  try {
    const raw = localStorage.getItem(marketplaceHiddenStorageKey);
    const parsed = JSON.parse(raw || '[]');

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => typeof item === 'string');
  } catch {
    return [];
  }
}

function saveHiddenMarketplaceProductIds(ids) {
  localStorage.setItem(marketplaceHiddenStorageKey, JSON.stringify(ids));
}

function isHiddenMarketplaceProduct(productId) {
  return readHiddenMarketplaceProductIds().includes(productId);
}

function hideMarketplaceProduct(productId) {
  if (!productId) {
    return;
  }

  const hiddenIds = new Set(readHiddenMarketplaceProductIds());
  hiddenIds.add(productId);
  saveHiddenMarketplaceProductIds(Array.from(hiddenIds));
}

function unhideMarketplaceProduct(productId) {
  const hiddenIds = readHiddenMarketplaceProductIds().filter((id) => id !== productId);
  saveHiddenMarketplaceProductIds(hiddenIds);
}

function mergeMarketplaceProducts(localItems, remoteItems) {
  const merged = new Map();
  const hiddenIds = new Set(readHiddenMarketplaceProductIds());

  [...localItems, ...remoteItems].forEach((item) => {
    if (!item || typeof item.id !== 'string' || item.sellerId === 'local' || hiddenIds.has(item.id)) {
      return;
    }

    merged.set(item.id, item);
  });

  return Array.from(merged.values());
}
// Lista de produtos locais pré-cadastrados com múltiplas imagens
window.produtosLocaisMarketplace = [
  {
    id: 'piso-tátil-alerta',
    initials: 'PTA',
    name: 'Piso Tátil de Alerta',
    company: 'Klinker',
    companySlug: 'klinker',
    category: 'deficiencia-visual',
    categoryLabel: 'Deficiência Visual',
    description: 'Piso tátil de alerta para orientação de pessoas com deficiência visual. Tem a função de alertar possíveis obstáculos, como desníveis, situações de risco permanente, mudanças de direção, opções de percurso, acessos às edificações, início e término de degraus, escadas, rampas, entre outros.',
    price: 'R$ 25,00/peça',
    purchaseMode: 'compra-imediata',
    purchaseModeLabel: 'Compra imediata',
    sellerId: 'local',
    images: [
      '../assets/img/alerta-1.jpg',
      '../assets/img/alerta-2.jpg',
      '../assets/img/alerta-3.jpg',
      '../assets/img/alerta-4.jpg',
      '../assets/img/alerta-5.jpg'
    ],
    variations: [
      { nome: 'Azul', imagem: '../assets/img/alerta-1.jpg' },
      { nome: 'Amarelo', imagem: '../assets/img/alerta-2.jpg' },
      { nome: 'Preto', imagem: '../assets/img/alerta-3.jpg' },
      { nome: 'Quartzo', imagem: '../assets/img/alerta-4.jpg' },
      { nome: 'Aleatório', imagem: '../assets/img/alerta-5.jpg' }

    ]
  },
  {
    id: 'piso-tátil-direcional',
    initials: 'PT',
    name: 'Piso Tátil Direcional',
    company: 'Klinker',
    companySlug: 'klinker',
    category: 'deficiencia-visual',
    categoryLabel: 'Deficiência Visual',
    description: 'Piso tátil direcional para orientação de pessoas com deficiência visual. Tem a função de orientar e direcionar uma rota acessível, indicando o sentido de deslocamento das pessoas.',
    price: 'R$ 25,00/peça',
    purchaseMode: 'compra-imediata',
    purchaseModeLabel: 'Compra imediata',
    sellerId: 'local',
    images: [
      '../assets/img/direcional-1.jpg',
      '../assets/img/direcional-2.jpg',
      '../assets/img/direcional-3.jpg',
      '../assets/img/direcional-4.jpg',
      '../assets/img/direcional-5.jpg'
    ],
    variations: [
      { nome: 'Amarelo', imagem: '../assets/img/direcional-1.jpg' },
      { nome: 'Azul', imagem: '../assets/img/direcional-2.jpg' },
      { nome: 'Preto', imagem: '../assets/img/direcional-3.jpg' },
      { nome: 'Quartzo', imagem: '../assets/img/direcional-4.jpg' },
      { nome: 'Aleatório', imagem: '../assets/img/direcional-5.jpg' }

    ]
  },
    {
    id: 'solucoes-software',
    initials: 'SS',
    name: 'Soluções de Software Acessível',
    company: 'Acessify',
    companySlug: 'acessify',
    category: 'digital',
    categoryLabel: 'Acessibilidade digital',
    description: 'Auditoria, monitoramento continuo e ajustes de acessibilidade para sistemas web corporativos.',
    price: 'Planos a partir de R$ 1.000/mês',
    purchaseMode: 'projeto-personalizado',
    purchaseModeLabel: 'Projeto personalizado',
    sellerId: 'local',
    images: [
      '../assets/img/acessify-logo.png'
    ],
    variations: [
      { nome: 'Logo', imagem: '../assets/img/acessify-logo.png' },
    ]
}

];

// Produtos cadastrados por vendedores (persistidos em localStorage)
window.produtosMarketplaceCadastrados = readMarketplaceProductsFromStorage().filter((item) => item.sellerId !== 'local');

// Função para obter todos os produtos do marketplace (locais + cadastrados)
window.obterProdutosMarketplace = function() {
  const hiddenIds = new Set(readHiddenMarketplaceProductIds());
  return (window.produtosLocaisMarketplace || [])
    .concat(window.produtosMarketplaceCadastrados || [])
    .filter((item) => item && typeof item.id === 'string' && !hiddenIds.has(item.id));
};

// Função para salvar produto cadastrado pelo vendedor
window.salvarProdutoMarketplace = function(produto) {
  if (!produto || typeof produto.id !== 'string') {
    return;
  }

  const items = readMarketplaceProductsFromStorage().filter((item) => item.sellerId !== 'local');
  const index = items.findIndex((item) => item.id === produto.id);

  if (index >= 0) {
    items[index] = produto;
  } else {
    items.push(produto);
  }

  window.produtosMarketplaceCadastrados = items;
  saveMarketplaceProductsToStorage(items);
};

// Função para remover produto do marketplace cadastrado pelo vendedor
window.removerProdutoMarketplace = function(produtoId, sellerId) {
  const items = readMarketplaceProductsFromStorage().filter(
    (p) => p.id !== produtoId || p.sellerId !== sellerId
  );

  window.produtosMarketplaceCadastrados = items;
  saveMarketplaceProductsToStorage(items);
};

window.removerProdutoMarketplacePorId = function(produtoId) {
  if (!produtoId) {
    return;
  }

  const items = readMarketplaceProductsFromStorage().filter((item) => item.id !== produtoId);
  window.produtosMarketplaceCadastrados = items;
  saveMarketplaceProductsToStorage(items);
};

window.removerProdutosMarketplacePorSellerId = function(sellerId) {
  if (!sellerId) {
    return;
  }

  const items = readMarketplaceProductsFromStorage().filter((item) => item.sellerId !== sellerId);
  window.produtosMarketplaceCadastrados = items;
  saveMarketplaceProductsToStorage(items);
};

window.ocultarProdutoMarketplace = function(produtoId) {
  hideMarketplaceProduct(produtoId);
  window.removerProdutoMarketplacePorId(produtoId);
};

window.excluirProdutoMarketplaceComoAdmin = async function(produtoId) {
  if (!produtoId) {
    return;
  }

  if (typeof window.removerProdutoMarketplaceNoFirestore === 'function') {
    try {
      await window.removerProdutoMarketplaceNoFirestore(produtoId);
    } catch (error) {
      console.error('Falha ao excluir produto no Firestore:', error?.code || error?.message || error);
    }
  }

  window.ocultarProdutoMarketplace(produtoId);
};

window.sincronizarProdutosMarketplace = async function() {
  if (!window.db) {
    return window.produtosMarketplaceCadastrados || [];
  }

  try {
    const snapshot = await window.db.collection(marketplaceCollectionName).get();
    const remoteItems = [];

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data && data.sellerId && data.sellerId !== 'local') {
        remoteItems.push({ id: docSnapshot.id, ...data });
      }
    });

    const localItems = readMarketplaceProductsFromStorage().filter((item) => item.sellerId !== 'local');
    const mergedItems = mergeMarketplaceProducts(localItems, remoteItems);

    window.produtosMarketplaceCadastrados = mergedItems;
    saveMarketplaceProductsToStorage(mergedItems);
    return mergedItems;
  } catch (error) {
    console.error('Falha ao sincronizar produtos do marketplace:', error?.code || error?.message || error);
    return window.produtosMarketplaceCadastrados || [];
  }
};

window.salvarProdutoMarketplaceNoFirestore = async function(produto) {
  if (!produto || typeof produto.id !== 'string' || !window.db) {
    return null;
  }

  const payload = {
    ...produto,
    atualizadoEm: new Date().toISOString()
  };

  await window.db.collection(marketplaceCollectionName).doc(produto.id).set(payload);
  return produto.id;
};

window.removerProdutoMarketplaceNoFirestore = async function(produtoId) {
  if (!produtoId || !window.db) {
    return;
  }

  await window.db.collection(marketplaceCollectionName).doc(produtoId).delete();
};
