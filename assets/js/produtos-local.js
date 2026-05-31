// Limpa todos os produtos cadastrados temporários ao carregar a página

window.produtosMarketplaceCadastrados = [];
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
      { nome: 'Variações', imagem: '../assets/img/alerta-5.jpg' }

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
      { nome: 'Azul', imagem: '../assets/img/direcional-1.jpg' },
      { nome: 'Amarelo', imagem: '../assets/img/direcional-2.jpg' },
      { nome: 'Preto', imagem: '../assets/img/direcional-3.jpg' },
      { nome: 'Quartzo', imagem: '../assets/img/direcional-4.jpg' },
      { nome: 'Variações', imagem: '../assets/img/direcional-5.jpg' }

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
    price: 'Plano recorrente a partir de R$ 1.000/mês',
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

// Função para obter todos os produtos do marketplace (locais + cadastrados)
window.obterProdutosMarketplace = function() {
  return (window.produtosLocaisMarketplace || []).concat(window.produtosMarketplaceCadastrados || []);
};

// Função para salvar produto cadastrado pelo vendedor (apenas em memória)
window.produtosMarketplaceCadastrados = window.produtosMarketplaceCadastrados || [];
window.salvarProdutoMarketplace = function(produto) {
  window.produtosMarketplaceCadastrados.push(produto);
};

// Função para remover produto do marketplace cadastrado pelo vendedor
window.removerProdutoMarketplace = function(produtoId, sellerId) {
  window.produtosMarketplaceCadastrados = window.produtosMarketplaceCadastrados.filter(
    (p) => p.id !== produtoId || p.sellerId !== sellerId
  );
};
