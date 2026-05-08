/** Empr-E – script.js
 Versão: 1.0.0 */

'use strict';

/* ESTADO GLOBAL */
const Estado = {
  altoContraste: false,
  layoutSimplificado: false,
  modoLeitura: false,
  librasAtivo: false,
  tamanhoFonte: 16,          // px base
  tamanhoFonteMin: 12,
  tamanhoFonteMax: 24,
  menuMobileAberto: false,
  itensCarrinho: 0,
};

/* UTILITÁRIOS */

/* Seleciona elemento pelo seletor CSS (atalho) */
const el = (seletor, contexto = document) => contexto.querySelector(seletor);
const els = (seletor, contexto = document) => [...contexto.querySelectorAll(seletor)];

/* Exibe uma notificação toast acessível*/
function mostrarToast(mensagem, tipo = 'padrao') {
  const container = el('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = mensagem;

  container.appendChild(toast);

  // Remove após 3 segundos
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

/*Salva preferências no localStorage*/
function salvarPreferencias() {
  try {
    const prefs = {
      altoContraste: Estado.altoContraste,
      layoutSimplificado: Estado.layoutSimplificado,
      modoLeitura: Estado.modoLeitura,
      tamanhoFonte: Estado.tamanhoFonte,
    };
    localStorage.setItem('acessify_prefs', JSON.stringify(prefs));
  } catch (e) {
    console.warn('Acessify: não foi possível salvar preferências.', e);
  }
}

/*Carrega preferências do localStorage*/
function carregarPreferencias() {
  try {
    const salvo = localStorage.getItem('acessify_prefs');
    if (!salvo) return;
    const prefs = JSON.parse(salvo);

    if (prefs.altoContraste) ativarAltoContraste(false);
    if (prefs.layoutSimplificado) ativarLayoutSimplificado(false);
    if (prefs.modoLeitura) ativarModoLeitura(false);
    if (prefs.tamanhoFonte && prefs.tamanhoFonte !== 16) {
      Estado.tamanhoFonte = prefs.tamanhoFonte;
      aplicarTamanhoFonte();
    }
  } catch (e) {
    console.warn('Acessify: erro ao carregar preferências.', e);
  }
}

/* BARRA DE ACESSIBILIDADE */

/* Ativa/desativa modo alto contraste */
function ativarAltoContraste(mostrarNotificacao = true) {
  Estado.altoContraste = !Estado.altoContraste;
  document.body.classList.toggle('modo-alto-contraste', Estado.altoContraste);

  const btn = el('#btn-contraste');
  if (btn) btn.setAttribute('aria-pressed', String(Estado.altoContraste));

  if (mostrarNotificacao) {
    const msg = Estado.altoContraste
      ? 'Modo alto contraste ativado'
      : 'Modo alto contraste desativado';
    mostrarToast(msg, 'info');
  }

  salvarPreferencias();
}

/* Aumenta o tamanho da fonte*/
function aumentarFonte() {
  if (Estado.tamanhoFonte >= Estado.tamanhoFonteMax) {
    mostrarToast('Tamanho máximo de fonte atingido', 'info');
    return;
  }
  Estado.tamanhoFonte = Math.min(Estado.tamanhoFonte + 2, Estado.tamanhoFonteMax);
  aplicarTamanhoFonte();
  mostrarToast(`Fonte aumentada: ${Estado.tamanhoFonte}px`, 'sucesso');
  salvarPreferencias();
}

/* Diminui o tamanho da fonte */
function diminuirFonte() {
  if (Estado.tamanhoFonte <= Estado.tamanhoFonteMin) {
    mostrarToast('Tamanho mínimo de fonte atingido', 'info');
    return;
  }
  Estado.tamanhoFonte = Math.max(Estado.tamanhoFonte - 2, Estado.tamanhoFonteMin);
  aplicarTamanhoFonte();
  mostrarToast(`Fonte diminuída: ${Estado.tamanhoFonte}px`, 'info');
  salvarPreferencias();
}

/*Aplica o tamanho de fonte ao :root*/
function aplicarTamanhoFonte() {
  document.documentElement.style.fontSize = `${Estado.tamanhoFonte}px`;
}

/*Ativa/desativa layout simplificad*/
function ativarLayoutSimplificado(mostrarNotificacao = true) {
  Estado.layoutSimplificado = !Estado.layoutSimplificado;
  document.body.classList.toggle('modo-simplificado', Estado.layoutSimplificado);

  const btn = el('#btn-layout');
  if (btn) btn.setAttribute('aria-pressed', String(Estado.layoutSimplificado));

  if (mostrarNotificacao) {
    const msg = Estado.layoutSimplificado
      ? 'Layout simplificado ativado'
      : 'Layout padrão restaurado';
    mostrarToast(msg, 'info');
  }

  salvarPreferencias();
}

/*Ativa/desativa modo leitura*/
function ativarModoLeitura(mostrarNotificacao = true) {
  Estado.modoLeitura = !Estado.modoLeitura;
  document.body.classList.toggle('modo-leitura', Estado.modoLeitura);

  const btn = el('#btn-leitura');
  if (btn) btn.setAttribute('aria-pressed', String(Estado.modoLeitura));

  if (mostrarNotificacao) {
    const msg = Estado.modoLeitura
      ? 'Modo leitura ativado'
      : 'Modo leitura desativado';
    mostrarToast(msg, 'info');
  }

  salvarPreferencias();
}

/*Ativa/desativa simulação VLibras*/
function ativarLibras() {
  Estado.librasAtivo = !Estado.librasAtivo;

  const widgetLibras = el('#widget-libras');
  const btn = el('#btn-libras');

  if (widgetLibras) {
    widgetLibras.hidden = !Estado.librasAtivo;
  }

  if (btn) {
    btn.setAttribute('aria-pressed', String(Estado.librasAtivo));
  }

  const msg = Estado.librasAtivo
    ? 'Tradução em Libras ativada (VLibras)'
    : 'Tradução em Libras desativada';
  mostrarToast(msg, 'info');
}

/*Inicializa todos os botões da barra de acessibilidade*/
function inicializarBarraAcessibilidade() {
  const mapeamento = {
    '#btn-contraste': ativarAltoContraste,
    '#btn-aumentar-fonte': aumentarFonte,
    '#btn-diminuir-fonte': diminuirFonte,
    '#btn-layout': ativarLayoutSimplificado,
    '#btn-leitura': ativarModoLeitura,
    '#btn-libras': ativarLibras,
  };

  Object.entries(mapeamento).forEach(([seletor, funcao]) => {
    const botao = el(seletor);
    if (botao) {
      botao.addEventListener('click', funcao);
    }
  });

  // Fechar widget Libras
  const btnFecharLibras = el('#btn-fechar-libras');
  if (btnFecharLibras) {
    btnFecharLibras.addEventListener('click', () => {
      Estado.librasAtivo = false;
      const widget = el('#widget-libras');
      if (widget) widget.hidden = true;
      const btn = el('#btn-libras');
      if (btn) btn.setAttribute('aria-pressed', 'false');
    });
  }
}

/* HEADER – COMPORTAMENTO STICKY E SCROLL */

function inicializarHeader() {
  const header = el('#header');
  if (!header) return;

  // Sombra ao rolar
  const observarScroll = () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', observarScroll, { passive: true });
  observarScroll();
}

/* MENU MOBILE */

function inicializarMenuMobile() {
  const btnMenu = el('#btn-menu-mobile');
  const menuMobile = el('#menu-mobile');
  if (!btnMenu || !menuMobile) return;

  btnMenu.addEventListener('click', () => {
    Estado.menuMobileAberto = !Estado.menuMobileAberto;
    menuMobile.hidden = !Estado.menuMobileAberto;
    btnMenu.setAttribute('aria-expanded', String(Estado.menuMobileAberto));
    btnMenu.setAttribute(
      'aria-label',
      Estado.menuMobileAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
    );

    // Animar barras do botão hamburger
    const barras = els('.btn-menu-mobile__bar', btnMenu);
    if (Estado.menuMobileAberto) {
      barras[0] && (barras[0].style.transform = 'translateY(7px) rotate(45deg)');
      barras[1] && (barras[1].style.opacity = '0');
      barras[2] && (barras[2].style.transform = 'translateY(-7px) rotate(-45deg)');
    } else {
      barras[0] && (barras[0].style.transform = '');
      barras[1] && (barras[1].style.opacity = '');
      barras[2] && (barras[2].style.transform = '');
    }
  });

  // Fechar ao clicar em links do menu
  els('.menu-mobile__link', menuMobile).forEach(link => {
    link.addEventListener('click', () => {
      Estado.menuMobileAberto = false;
      menuMobile.hidden = true;
      btnMenu.setAttribute('aria-expanded', 'false');
      const barras = els('.btn-menu-mobile__bar', btnMenu);
      barras.forEach(b => {
        b.style.transform = '';
        b.style.opacity = '';
      });
    });
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (
      Estado.menuMobileAberto &&
      !menuMobile.contains(e.target) &&
      !btnMenu.contains(e.target)
    ) {
      Estado.menuMobileAberto = false;
      menuMobile.hidden = true;
      btnMenu.setAttribute('aria-expanded', 'false');
      const barras = els('.btn-menu-mobile__bar', btnMenu);
      barras.forEach(b => {
        b.style.transform = '';
        b.style.opacity = '';
      });
    }
  });

  // Fechar com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && Estado.menuMobileAberto) {
      Estado.menuMobileAberto = false;
      menuMobile.hidden = true;
      btnMenu.setAttribute('aria-expanded', 'false');
      btnMenu.focus();
    }
  });
}

/* ANIMAÇÃO DE NÚMEROS (Hero) */

/*Anima um número do zero até o valor alvo*/
function animarNumero(elemento, alvo, duracao = 1800) {
  let inicio = null;
  const inicio_valor = 0;

  const passo = (timestamp) => {
    if (!inicio) inicio = timestamp;
    const progresso = Math.min((timestamp - inicio) / duracao, 1);

    // Easing: ease-out-quart
    const eased = 1 - Math.pow(1 - progresso, 4);
    const atual = Math.round(inicio_valor + (alvo - inicio_valor) * eased);

    elemento.textContent = atual.toLocaleString('pt-BR');

    if (progresso < 1) {
      requestAnimationFrame(passo);
    } else {
      elemento.textContent = alvo.toLocaleString('pt-BR');
    }
  };

  requestAnimationFrame(passo);
}

/* Inicia animações de números quando visíveis */
function inicializarAnimacaoNumeros() {
  const numerosEls = els('[data-target]');
  if (!numerosEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const alvo = parseInt(entry.target.dataset.target, 10);
          animarNumero(entry.target, alvo);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  numerosEls.forEach(el => observer.observe(el));
}

/* ANIMAÇÕES DE ENTRADA (Scroll) */

function inicializarAnimacoesEntrada() {
  // Adiciona classe de animação aos elementos alvo
  const seletores = [
    '.categoria-card',
    '.pilar',
    '.empresa-card',
    '.diferencial',
    '.passo',
    '.sobre__conteudo',
    '.section-header',
  ];

  seletores.forEach(seletor => {
    els(seletor).forEach((elemento, indice) => {
      elemento.classList.add('anim-entrada');
      elemento.style.transitionDelay = `${indice * 60}ms`;
    });
  });

  // Observer para ativar animações
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visivel');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  els('.anim-entrada').forEach(el => observer.observe(el));
}

/* CARRINHO */

/*Atualiza o indicador de itens no carrinho*/
function atualizarCarrinho(quantidade) {
  Estado.itensCarrinho = quantidade;
  const badge = el('#carrinho-count');
  const btnCarrinho = el('.btn-carrinho');

  if (badge) {
    badge.textContent = quantidade;
  }

  if (btnCarrinho) {
    btnCarrinho.setAttribute(
      'aria-label',
      `Ver carrinho de compras. ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`
    );
  }

  // Salvar no localStorage
  try {
    localStorage.setItem('acessify_carrinho', String(quantidade));
  } catch (e) {}
}

/*Carrega quantidade do carrinho do localStorage*/
function carregarCarrinho() {
  try {
    const qtd = parseInt(localStorage.getItem('acessify_carrinho') || '0', 10);
    if (!isNaN(qtd) && qtd > 0) {
      atualizarCarrinho(qtd);
    }
  } catch (e) {}
}

/* REPORTAR BARREIRA DE ACESSIBILIDADE */

function inicializarReportarBarreira() {
  const btn = el('#btn-reportar');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Em produção: abrir modal ou formulário
    const confirmacao = window.confirm(
      'Você quer reportar uma barreira de acessibilidade nesta página?\n\n' +
      'Ao confirmar, você será direcionado ao formulário de reporte.'
    );

    if (confirmacao) {
      mostrarToast('Obrigado! Seu reporte foi registrado e será analisado em breve.', 'sucesso');
    }
  });
}

/* NAVEGAÇÃO POR TECLADO (APRIMORADA) */

function inicializarNavegacaoTeclado() {
  // Capturar Tab para indicar uso de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('usando-teclado');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('usando-teclado');
  });
}

/* PREFERÊNCIAS DE MOVIMENTO DO SISTEMA */

function respeitarPreferenciaMovimento() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const aplicar = (mq) => {
    if (mq.matches) {
      document.body.classList.add('modo-simplificado');
      Estado.layoutSimplificado = true;
      const btn = el('#btn-layout');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }
  };

  aplicar(mediaQuery);
  mediaQuery.addEventListener('change', aplicar);
}

/* PREFERÊNCIAS DE CONTRASTE DO SISTEMA */

function respeitarPreferenciaContraste() {
  const mediaQuery = window.matchMedia('(prefers-contrast: more)');

  const aplicar = (mq) => {
    if (mq.matches && !Estado.altoContraste) {
      ativarAltoContraste(false);
    }
  };

  aplicar(mediaQuery);
  mediaQuery.addEventListener('change', aplicar);
}

/* SMOOTH SCROLL PARA ÂNCORAS INTERNAS */

function inicializarSmoothScroll() {
  els('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const destino = el(href);
      if (!destino) return;

      e.preventDefault();

      destino.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Focar no elemento de destino para acessibilidade
      if (destino.tabIndex < 0) {
        destino.tabIndex = -1;
      }
      destino.focus({ preventScroll: true });
    });
  });
}

/* ARIA LIVE REGION – ANÚNCIOS */

let regiaoAnnuncio;

function anunciar(mensagem, politesse = 'polite') {
  if (!regiaoAnnuncio) {
    regiaoAnnuncio = document.createElement('div');
    regiaoAnnuncio.setAttribute('aria-live', politesse);
    regiaoAnnuncio.setAttribute('aria-atomic', 'true');
    regiaoAnnuncio.className = 'sr-only';
    regiaoAnnuncio.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
    document.body.appendChild(regiaoAnnuncio);
  }

  // Reset e nova mensagem
  regiaoAnnuncio.textContent = '';
  setTimeout(() => {
    regiaoAnnuncio.textContent = mensagem;
  }, 100);
}

/* INICIALIZAÇÃO PRINCIPAL */

/* Inicializa todos os módulos quando o DOM estiver pronto */
function inicializar() {
  // Carregar preferências salvas primeiro
  carregarPreferencias();
  carregarCarrinho();

  // Acessibilidade e preferências do sistema
  respeitarPreferenciaMovimento();
  respeitarPreferenciaContraste();
  inicializarNavegacaoTeclado();

  // Componentes da UI
  inicializarBarraAcessibilidade();
  inicializarHeader();
  inicializarMenuMobile();
  inicializarSmoothScroll();
  inicializarReportarBarreira();

  // Animações
  inicializarAnimacaoNumeros();
  inicializarAnimacoesEntrada();

  // Anúncio de carregamento (screen readers)
  anunciar('Página Acessify carregada. Marketplace B2B de Acessibilidade.');

  console.info(
    '%c♿ Acessify %c| Plataforma construída com acessibilidade em primeiro lugar.',
    'background:#F97316;color:white;padding:2px 8px;border-radius:4px;font-weight:bold;',
    'color:#64748B;'
  );
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

/* EXPORT (para uso modular futuro) */
// window.Acessify = { mostrarToast, atualizarCarrinho, anunciar };