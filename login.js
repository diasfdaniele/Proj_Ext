/**
 * ACESSIFY – login.js
 * Funcionalidades específicas da tela de login
 * Complementa: script.js (global)
 * Padrão: WCAG 2.1 AA | Modular | Comentado
 */

'use strict';

/* ============================================================
   ESTADO LOCAL DO LOGIN
   ============================================================ */
const LoginEstado = {
  emailValido: false,
  senhaValida: false,
  senhaVisivel: false,
  submetendo: false,
  tentativas: 0,
  maxTentativas: 5,
};

/* ============================================================
   UTILITÁRIOS LOCAIS
   (Complementam os utilitários globais do script.js)
   ============================================================ */

/**
 * Seleciona elemento pelo seletor (atalho local)
 */
const $ = (seletor, ctx = document) => ctx.querySelector(seletor);

/**
 * Exibe mensagem de erro em um campo de forma acessível
 * @param {HTMLElement} grupo - .campo-grupo
 * @param {string} mensagem - Texto do erro
 * @param {string} erroId  - ID do span de erro
 */
function exibirErro(grupo, mensagem, erroId) {
  if (!grupo) return;

  const spanErro = $(`#${erroId}`);
  const input = grupo.querySelector('.campo-input');

  grupo.classList.add('invalido');
  grupo.classList.remove('valido');

  if (input) {
    input.setAttribute('aria-invalid', 'true');
  }

  if (spanErro) {
    spanErro.textContent = mensagem;
    spanErro.hidden = false;
  }
}

/**
 * Limpa estado de erro de um campo
 * @param {HTMLElement} grupo
 * @param {string} erroId
 */
function limparErro(grupo, erroId) {
  if (!grupo) return;

  const spanErro = $(`#${erroId}`);
  const input = grupo.querySelector('.campo-input');

  grupo.classList.remove('invalido');

  if (input) {
    input.setAttribute('aria-invalid', 'false');
  }

  if (spanErro) {
    spanErro.textContent = '';
    spanErro.hidden = true;
  }
}

/**
 * Marca um campo como válido visualmente
 * @param {HTMLElement} grupo
 */
function marcarValido(grupo) {
  if (!grupo) return;
  grupo.classList.add('valido');
  grupo.classList.remove('invalido');
}

/**
 * Exibe toast usando a função global do script.js,
 * com fallback caso o script.js não tenha carregado ainda.
 */
function toast(mensagem, tipo = 'padrao') {
  if (typeof mostrarToast === 'function') {
    mostrarToast(mensagem, tipo);
  } else {
    console.info(`[Toast] ${tipo}: ${mensagem}`);
  }
}

/* ============================================================
   VALIDAÇÕES
   ============================================================ */

/**
 * Valida formato de e-mail
 * @param {string} valor
 * @returns {boolean}
 */
function validarEmail(valor) {
  // RFC 5322 simplificado — adequado para UX
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(valor.trim());
}

/**
 * Valida senha (mínimo 8 caracteres no login)
 * @param {string} valor
 * @returns {boolean}
 */
function validarSenha(valor) {
  return valor.length >= 8;
}

/**
 * Calcula nível de força da senha (1–4)
 * @param {string} senha
 * @returns {number}
 */
function calcularForcaSenha(senha) {
  let pontos = 0;

  if (senha.length >= 8)  pontos++;
  if (senha.length >= 12) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;

  // Normaliza para 1-4
  if (pontos <= 1) return 1;
  if (pontos === 2) return 2;
  if (pontos === 3) return 3;
  return 4;
}

/**
 * Retorna texto descritivo da força da senha
 * @param {number} nivel
 * @returns {string}
 */
function textoForcaSenha(nivel) {
  const textos = {
    1: 'Fraca',
    2: 'Regular',
    3: 'Boa',
    4: 'Forte',
  };
  return textos[nivel] || '';
}

/* ============================================================
   CAMPO E-MAIL – VALIDAÇÃO EM TEMPO REAL
   ============================================================ */

function inicializarCampoEmail() {
  const input   = $('#campo-email');
  const grupo   = $('#grupo-email');
  if (!input || !grupo) return;

  // Valida ao sair do campo (blur)
  input.addEventListener('blur', () => {
    const valor = input.value.trim();

    if (!valor) {
      exibirErro(grupo, 'O e-mail corporativo é obrigatório.', 'email-erro');
      LoginEstado.emailValido = false;
      return;
    }

    if (!validarEmail(valor)) {
      exibirErro(grupo, 'Informe um e-mail válido. Ex: empresa@dominio.com.br', 'email-erro');
      LoginEstado.emailValido = false;
      return;
    }

    limparErro(grupo, 'email-erro');
    marcarValido(grupo);
    LoginEstado.emailValido = true;
  });

  // Limpa erro enquanto digita (após primeiro erro)
  input.addEventListener('input', () => {
    if (grupo.classList.contains('invalido')) {
      const valor = input.value.trim();
      if (validarEmail(valor)) {
        limparErro(grupo, 'email-erro');
        marcarValido(grupo);
        LoginEstado.emailValido = true;
      }
    }
  });
}

/* ============================================================
   CAMPO SENHA – VALIDAÇÃO + FORÇA + MOSTRAR/OCULTAR
   ============================================================ */

function inicializarCampoSenha() {
  const input   = $('#campo-senha');
  const grupo   = $('#grupo-senha');
  const btnVer  = $('#btn-mostrar-senha');
  const iconeOculta  = $('#icone-senha-oculta');
  const iconeVisivel = $('#icone-senha-visivel');
  if (!input || !grupo) return;

  // Validação ao sair do campo
  input.addEventListener('blur', () => {
    const valor = input.value;

    if (!valor) {
      exibirErro(grupo, 'A senha é obrigatória.', 'senha-erro');
      LoginEstado.senhaValida = false;
      return;
    }

    if (!validarSenha(valor)) {
      exibirErro(grupo, 'A senha deve ter pelo menos 8 caracteres.', 'senha-erro');
      LoginEstado.senhaValida = false;
      return;
    }

    limparErro(grupo, 'senha-erro');
    marcarValido(grupo);
    LoginEstado.senhaValida = true;
  });

  // Limpa erro enquanto digita
  input.addEventListener('input', () => {
    const valor = input.value;

    if (grupo.classList.contains('invalido') && validarSenha(valor)) {
      limparErro(grupo, 'senha-erro');
      marcarValido(grupo);
      LoginEstado.senhaValida = true;
    }
  });

  // Botão mostrar/ocultar senha
  if (btnVer) {
    btnVer.addEventListener('click', () => {
      LoginEstado.senhaVisivel = !LoginEstado.senhaVisivel;

      input.type = LoginEstado.senhaVisivel ? 'text' : 'password';
      btnVer.setAttribute('aria-pressed', String(LoginEstado.senhaVisivel));
      btnVer.setAttribute(
        'aria-label',
        LoginEstado.senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'
      );

      // Alterna ícones
      if (iconeOculta && iconeVisivel) {
        iconeOculta.hidden  = LoginEstado.senhaVisivel;
        iconeVisivel.hidden = !LoginEstado.senhaVisivel;
      }

      // Foco de volta ao input após toggle
      input.focus();
    });
  }
}

/* ============================================================
   LEMBRAR-ME – PERSISTÊNCIA
   ============================================================ */

function inicializarLembrarMe() {
  const checkbox   = $('#lembrar-me');
  const inputEmail = $('#campo-email');
  if (!checkbox) return;

  // Restaurar estado salvo
  try {
    const emailSalvo     = localStorage.getItem('acessify_email_lembrado');
    const lembrarSalvo   = localStorage.getItem('acessify_lembrar') === 'true';

    if (lembrarSalvo && emailSalvo) {
      checkbox.checked = true;
      if (inputEmail) {
        inputEmail.value = emailSalvo;
        // Marcar visualmente como válido se o e-mail salvo for válido
        const grupoEmail = $('#grupo-email');
        if (grupoEmail && validarEmail(emailSalvo)) {
          marcarValido(grupoEmail);
          LoginEstado.emailValido = true;
        }
      }
    }
  } catch (e) {
    console.warn('Acessify Login: erro ao restaurar preferência lembrar-me.', e);
  }

  // Salvar preferência ao mudar
  checkbox.addEventListener('change', () => {
    try {
      if (!checkbox.checked) {
        localStorage.removeItem('acessify_email_lembrado');
        localStorage.removeItem('acessify_lembrar');
      } else {
        localStorage.setItem('acessify_lembrar', 'true');
      }
    } catch (e) {}
  });
}

/* ============================================================
   SUBMISSÃO DO FORMULÁRIO
   ============================================================ */

function inicializarFormulario() {
  const form          = $('#formulario-login');
  const btnEntrar     = $('#btn-entrar');
  const btnTexto      = btnEntrar?.querySelector('.btn-login-submit__texto');
  const btnLoading    = btnEntrar?.querySelector('.btn-login-submit__loading');
  const statusAnuncio = $('#btn-entrar-status');
  const inputEmail    = $('#campo-email');
  const inputSenha    = $('#campo-senha');
  const lembrarMe     = $('#lembrar-me');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Bloquear envio duplicado
    if (LoginEstado.submetendo) return;

    // Verificar bloqueio por tentativas
    if (LoginEstado.tentativas >= LoginEstado.maxTentativas) {
      toast('Muitas tentativas. Aguarde alguns minutos e tente novamente.', 'padrao');
      return;
    }

    // Forçar validação de todos os campos
    const emailValor = inputEmail?.value.trim() || '';
    const senhaValor = inputSenha?.value || '';

    let temErro = false;

    const grupoEmail = $('#grupo-email');
    const grupoSenha = $('#grupo-senha');

    // Validar e-mail
    if (!emailValor) {
      exibirErro(grupoEmail, 'O e-mail corporativo é obrigatório.', 'email-erro');
      temErro = true;
    } else if (!validarEmail(emailValor)) {
      exibirErro(grupoEmail, 'Informe um e-mail válido.', 'email-erro');
      temErro = true;
    } else {
      limparErro(grupoEmail, 'email-erro');
      marcarValido(grupoEmail);
    }

    // Validar senha
    if (!senhaValor) {
      exibirErro(grupoSenha, 'A senha é obrigatória.', 'senha-erro');
      temErro = true;
    } else if (!validarSenha(senhaValor)) {
      exibirErro(grupoSenha, 'A senha deve ter pelo menos 8 caracteres.', 'senha-erro');
      temErro = true;
    } else {
      limparErro(grupoSenha, 'senha-erro');
      marcarValido(grupoSenha);
    }

    // Focar no primeiro campo com erro
    if (temErro) {
      const primeiroErro = form.querySelector('.campo-grupo.invalido .campo-input');
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    // --- Iniciar loading ---
    LoginEstado.submetendo = true;

    if (btnTexto)    btnTexto.hidden  = true;
    if (btnLoading)  btnLoading.hidden = false;
    if (btnEntrar) {
      btnEntrar.setAttribute('aria-busy', 'true');
      btnEntrar.disabled = true;
    }
    if (statusAnuncio) {
      statusAnuncio.textContent = 'Verificando suas credenciais...';
    }

    // Simula chamada de API (substituir por fetch real em produção)
    await simularLogin(emailValor, senhaValor);

    // --- Finalizar loading ---
    LoginEstado.submetendo = false;

    if (btnTexto)    btnTexto.hidden  = false;
    if (btnLoading)  btnLoading.hidden = true;
    if (btnEntrar) {
      btnEntrar.removeAttribute('aria-busy');
      btnEntrar.disabled = false;
    }
  });
}

/**
 * Simulação de autenticação
 * Em produção: substituir por fetch('/api/auth/login', {...})
 */
async function simularLogin(email, senha) {
  const lembrarMe      = $('#lembrar-me');
  const statusAnuncio  = $('#btn-entrar-status');

  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 1600));

  // DEMO: credenciais de teste
  const CREDENCIAL_EMAIL = 'empresa@acessify.com.br';
  const CREDENCIAL_SENHA = 'Acesso@2025';

  if (email === CREDENCIAL_EMAIL && senha === CREDENCIAL_SENHA) {
    // Sucesso
    if (statusAnuncio) {
      statusAnuncio.textContent = 'Login realizado com sucesso. Redirecionando...';
    }

    // Salvar lembrar-me
    if (lembrarMe?.checked) {
      try {
        localStorage.setItem('acessify_email_lembrado', email);
        localStorage.setItem('acessify_lembrar', 'true');
      } catch (e) {}
    }

    toast('Login realizado! Redirecionando para o painel…', 'sucesso');

    // Redirecionar após pequena pausa (UX)
    setTimeout(() => {
      window.location.href = 'painel.html';
    }, 1200);

  } else {
    // Erro de credenciais
    LoginEstado.tentativas++;

    const restantes = LoginEstado.maxTentativas - LoginEstado.tentativas;
    let mensagemErro = 'E-mail ou senha incorretos. Verifique suas credenciais.';

    if (restantes <= 2 && restantes > 0) {
      mensagemErro += ` Você tem ${restantes} tentativa(s) restante(s).`;
    } else if (restantes <= 0) {
      mensagemErro = 'Conta temporariamente bloqueada por excesso de tentativas. Aguarde 5 minutos.';
    }

    if (statusAnuncio) {
      statusAnuncio.textContent = mensagemErro;
    }

    toast(mensagemErro, 'padrao');

    // Focar no campo e-mail para corrigir
    const inputEmail = $('#campo-email');
    if (inputEmail) {
      inputEmail.focus();
      inputEmail.select();
    }
  }
}

/* ============================================================
   ATALHOS DE TECLADO ESPECÍFICOS DO LOGIN
   ============================================================ */

function inicializarAtalhosTeclado() {
  const form = $('#formulario-login');
  if (!form) return;

  // Enter em qualquer campo submete o formulário
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
      const botaoSubmit = $('#btn-entrar');
      if (botaoSubmit) botaoSubmit.click();
    }
  });
}

/* ============================================================
   AUTOPREENCHIMENTO – DETECTAR E ESTILIZAR
   ============================================================ */

function inicializarDeteccaoAutoFill() {
  // Corrige problema visual de autofill em browsers
  const inputs = document.querySelectorAll('.campo-input');

  inputs.forEach(input => {
    // Animar label quando campo está preenchido por autofill
    input.addEventListener('animationstart', (e) => {
      if (e.animationName === 'onAutoFillStart') {
        input.closest('.campo-grupo')?.classList.add('preenchido');
      }
    });
  });
}

/* ============================================================
   INICIALIZAÇÃO DO MÓDULO DE LOGIN
   ============================================================ */

function inicializarLogin() {
  inicializarCampoEmail();
  inicializarCampoSenha();
  inicializarLembrarMe();
  inicializarFormulario();
  inicializarAtalhosTeclado();
  inicializarDeteccaoAutoFill();

  // Foco automático no campo e-mail ao carregar
  // (só se não tiver valor pré-preenchido para não atrapalhar)
  const inputEmail = $('#campo-email');
  if (inputEmail && !inputEmail.value) {
    // Pequeno delay para garantir que o script.js terminou
    setTimeout(() => inputEmail.focus(), 200);
  }

  console.info(
    '%c🔐 Acessify Login %c| Módulo de autenticação carregado.',
    'background:#1E3A8A;color:white;padding:2px 8px;border-radius:4px;font-weight:bold;',
    'color:#64748B;'
  );
}

/* ============================================================
   AGUARDAR DOM
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarLogin);
} else {
  inicializarLogin();
}