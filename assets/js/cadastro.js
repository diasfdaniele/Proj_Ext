/* Empr-E – cadastro.js */

'use strict';

/* FUNÇÕES DE MÁSCARA
   Formatam o valor enquanto o usuário digita

/* Máscara de CNPJ: 00.000.000/0000-00 */
function mascaraCNPJ(valor) {
  // Remove tudo que não é número
  valor = valor.replace(/\D/g, '');

  // Aplica a máscara progressivamente
  if (valor.length > 2)  valor = valor.slice(0,2)  + '.' + valor.slice(2);
  if (valor.length > 6)  valor = valor.slice(0,6)  + '.' + valor.slice(6);
  if (valor.length > 10) valor = valor.slice(0,10) + '/' + valor.slice(10);
  if (valor.length > 15) valor = valor.slice(0,15) + '-' + valor.slice(15);

  // Limita ao tamanho máximo
  return valor.slice(0, 18);
}

/*Máscara de CPF: 000.000.000-00 */
function mascaraCPF(valor) {
  valor = valor.replace(/\D/g, '');

  if (valor.length > 3) valor = valor.slice(0,3) + '.' + valor.slice(3);
  if (valor.length > 7) valor = valor.slice(0,7) + '.' + valor.slice(7);
  if (valor.length > 11) valor = valor.slice(0,11) + '-' + valor.slice(11);

  return valor.slice(0, 14);
}

/* Máscara de telefone: (00) 00000-0000 */
function mascaraTelefone(valor) {
  valor = valor.replace(/\D/g, '');

  if (valor.length > 0)  valor = '(' + valor;
  if (valor.length > 3)  valor = valor.slice(0,3) + ') ' + valor.slice(3);
  if (valor.length > 10) valor = valor.slice(0,10) + '-' + valor.slice(10);

  return valor.slice(0, 15);
}

/* FUNÇÕES DE VALIDAÇÃO
   Cada função retorna true se válido, false se inválido */

function validarCNPJ(valor) {
  // Remove formatação e checa se tem 14 dígitos
  const numeros = valor.replace(/\D/g, '');
  return numeros.length === 14;
}

function validarCPF(valor) {
  const numeros = valor.replace(/\D/g, '');
  return numeros.length === 11;
}

function validarEmail(valor) {
  // Verificação simples de formato de e-mail
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim());
}

function validarSenha(valor) {
  return valor.length >= 8;
}

/* FUNÇÕES DE FEEDBACK VISUAL
   Mostram ou escondem o erro em cada campo  */

/**
 * Marca um campo como inválido e exibe mensagem de erro
 * @param {HTMLElement} grupo   - .campo-grupo
 * @param {string}      erroId  - id do span de erro
 * @param {string}      mensagem
 */
function mostrarErro(grupo, erroId, mensagem) {
  var spanErro = document.getElementById(erroId);
  var input    = grupo.querySelector('.campo-input');

  grupo.classList.add('invalido');
  grupo.classList.remove('valido');

  if (input)    input.setAttribute('aria-invalid', 'true');
  if (spanErro) {
    spanErro.textContent = mensagem;
    spanErro.hidden = false;
  }
}

/* Marca um campo como válido e esconde o erro */
function mostrarValido(grupo, erroId) {
  var spanErro = document.getElementById(erroId);
  var input    = grupo.querySelector('.campo-input');

  grupo.classList.remove('invalido');
  grupo.classList.add('valido');

  if (input)    input.setAttribute('aria-invalid', 'false');
  if (spanErro) {
    spanErro.textContent = '';
    spanErro.hidden = true;
  }
}

/* Limpa estado de um campo (sem válido nem inválido) */
function limparEstado(grupo, erroId) {
  var spanErro = document.getElementById(erroId);
  var input    = grupo.querySelector('.campo-input');

  grupo.classList.remove('invalido', 'valido');

  if (input)    input.setAttribute('aria-invalid', 'false');
  if (spanErro) {
    spanErro.textContent = '';
    spanErro.hidden = true;
  }
}

/* INDICADOR DE ETAPAS
   Atualiza visualmente os círculos de progresso */

/**
 * Marca as etapas conforme o progresso
 * @param {number} etapaAtual - 1, 2 ou 3
 */
function atualizarEtapas(etapaAtual) {
  for (var i = 1; i <= 3; i++) {
    var etapa = document.getElementById('etapa-' + i);
    if (!etapa) continue;

    etapa.classList.remove('etapa--ativa', 'etapa--concluida');
    etapa.removeAttribute('aria-current');

    if (i < etapaAtual) {
      // Etapas anteriores = concluídas
      etapa.classList.add('etapa--concluida');
    } else if (i === etapaAtual) {
      // Etapa atual = ativa
      etapa.classList.add('etapa--ativa');
      etapa.setAttribute('aria-current', 'step');
    }
  }

  // Linhas entre etapas
  var linhas = document.querySelectorAll('.etapa__linha');
  linhas.forEach(function(linha, index) {
    if (index < etapaAtual - 1) {
      linha.classList.add('etapa__linha--ativa');
    } else {
      linha.classList.remove('etapa__linha--ativa');
    }
  });
}

/* INICIALIZAÇÃO DAS MÁSCARAS */

function inicializarMascaras() {
  // CNPJ
  var campoCNPJ = document.getElementById('cnpj');
  if (campoCNPJ) {
    campoCNPJ.addEventListener('input', function() {
      this.value = mascaraCNPJ(this.value);
    });
  }

  // CPF
  var campoCPF = document.getElementById('cpf');
  if (campoCPF) {
    campoCPF.addEventListener('input', function() {
      this.value = mascaraCPF(this.value);
    });
  }

  // Telefone
  var campoTelefone = document.getElementById('telefone');
  if (campoTelefone) {
    campoTelefone.addEventListener('input', function() {
      this.value = mascaraTelefone(this.value);
    });
  }
}

/* CONTADOR DE CARACTERES */

function inicializarContador() {
  var textarea  = document.getElementById('descricao');
  var contador  = document.getElementById('descricao-contador');
  var limite    = 500;

  if (!textarea || !contador) return;

  textarea.addEventListener('input', function() {
    var total = this.value.length;
    contador.textContent = total + '/' + limite;

    // Muda a cor ao se aproximar do limite
    contador.classList.remove('quase-limite', 'no-limite');
    if (total >= limite) {
      contador.classList.add('no-limite');
    } else if (total >= limite * 0.85) {
      contador.classList.add('quase-limite');
    }
  });
}

/* MOSTRAR / OCULTAR SENHA */

function inicializarBotoesSenha() {
  var botoes = document.querySelectorAll('.btn-ver-senha');

  botoes.forEach(function(botao) {
    botao.addEventListener('click', function() {
      var alvoId = this.getAttribute('data-alvo');
      var input  = document.getElementById(alvoId);
      if (!input) return;

      var visivel = input.type === 'text';

      // Alterna o tipo do input
      input.type = visivel ? 'password' : 'text';

      // Atualiza aria-pressed
      this.setAttribute('aria-pressed', visivel ? 'false' : 'true');
      this.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');

      // Alterna os ícones
      var iconeOculta  = this.querySelector('.icone-oculta');
      var iconeVisivel = this.querySelector('.icone-visivel');
      if (iconeOculta)  iconeOculta.hidden  = !visivel;
      if (iconeVisivel) iconeVisivel.hidden = visivel;
    });
  });
}

/* Feedback imediato enquanto o usuário preenche */

function inicializarValidacaoBlur() {

  // Razão social
  var razaoSocial = document.getElementById('razao-social');
  if (razaoSocial) {
    razaoSocial.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'razao-social-erro', 'A razão social é obrigatória.');
      } else {
        mostrarValido(grupo, 'razao-social-erro');
      }
    });
  }

  // CNPJ
  var cnpj = document.getElementById('cnpj');
  if (cnpj) {
    cnpj.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'cnpj-erro', 'O CNPJ é obrigatório.');
      } else if (!validarCNPJ(this.value)) {
        mostrarErro(grupo, 'cnpj-erro', 'CNPJ inválido. Verifique os 14 dígitos.');
      } else {
        mostrarValido(grupo, 'cnpj-erro');
      }
    });
  }

  // Tipo de empresa
  var tipoEmpresa = document.getElementById('tipo-empresa');
  if (tipoEmpresa) {
    tipoEmpresa.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value) {
        mostrarErro(grupo, 'tipo-empresa-erro', 'Selecione o tipo de empresa.');
      } else {
        mostrarValido(grupo, 'tipo-empresa-erro');
      }
    });
  }

  // Categoria
  var categoria = document.getElementById('categoria');
  if (categoria) {
    categoria.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value) {
        mostrarErro(grupo, 'categoria-erro', 'Selecione a categoria principal.');
      } else {
        mostrarValido(grupo, 'categoria-erro');
      }
    });
  }

  // Descrição
  var descricao = document.getElementById('descricao');
  if (descricao) {
    descricao.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'descricao-erro', 'A descrição da empresa é obrigatória.');
      } else if (this.value.trim().length < 30) {
        mostrarErro(grupo, 'descricao-erro', 'Descreva com pelo menos 30 caracteres.');
      } else {
        mostrarValido(grupo, 'descricao-erro');
      }
    });
  }

  // Nome do responsável
  var nomeResp = document.getElementById('nome-responsavel');
  if (nomeResp) {
    nomeResp.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'nome-responsavel-erro', 'O nome do responsável é obrigatório.');
      } else if (this.value.trim().split(' ').length < 2) {
        mostrarErro(grupo, 'nome-responsavel-erro', 'Informe o nome completo.');
      } else {
        mostrarValido(grupo, 'nome-responsavel-erro');
      }
    });
  }

  // Cargo
  var cargo = document.getElementById('cargo');
  if (cargo) {
    cargo.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'cargo-erro', 'O cargo é obrigatório.');
      } else {
        mostrarValido(grupo, 'cargo-erro');
      }
    });
  }

  // CPF
  var cpf = document.getElementById('cpf');
  if (cpf) {
    cpf.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'cpf-erro', 'O CPF é obrigatório.');
      } else if (!validarCPF(this.value)) {
        mostrarErro(grupo, 'cpf-erro', 'CPF inválido. Verifique os 11 dígitos.');
      } else {
        mostrarValido(grupo, 'cpf-erro');
      }
    });
  }

  // E-mail
  var email = document.getElementById('email');
  if (email) {
    email.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value.trim()) {
        mostrarErro(grupo, 'email-erro', 'O e-mail é obrigatório.');
      } else if (!validarEmail(this.value)) {
        mostrarErro(grupo, 'email-erro', 'Informe um e-mail válido.');
      } else {
        mostrarValido(grupo, 'email-erro');
      }
    });
  }

  // Senha
  var senha = document.getElementById('senha');
  if (senha) {
    senha.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      if (!this.value) {
        mostrarErro(grupo, 'senha-erro', 'A senha é obrigatória.');
      } else if (!validarSenha(this.value)) {
        mostrarErro(grupo, 'senha-erro', 'A senha precisa ter pelo menos 8 caracteres.');
      } else {
        mostrarValido(grupo, 'senha-erro');
      }
    });
  }

  // Confirmar senha
  var confirmarSenha = document.getElementById('confirmar-senha');
  if (confirmarSenha) {
    confirmarSenha.addEventListener('blur', function() {
      var grupo = this.closest('.campo-grupo');
      var senhaValor = document.getElementById('senha') ? document.getElementById('senha').value : '';
      if (!this.value) {
        mostrarErro(grupo, 'confirmar-senha-erro', 'Confirme sua senha.');
      } else if (this.value !== senhaValor) {
        mostrarErro(grupo, 'confirmar-senha-erro', 'As senhas não coincidem.');
      } else {
        mostrarValido(grupo, 'confirmar-senha-erro');
      }
    });
  }
}

/* ATUALIZAÇÃO VISUAL DAS ETAPAS (conforme campos preenchidos) */

function inicializarProgressoEtapas() {
  // Campos de cada etapa
  var camposEtapa1 = ['razao-social', 'cnpj', 'tipo-empresa', 'categoria', 'descricao'];
  var camposEtapa2 = ['nome-responsavel', 'cargo', 'cpf'];
  var camposEtapa3 = ['email', 'senha', 'confirmar-senha'];

  function verificarEtapa(ids) {
    // Retorna true se todos os campos obrigatórios da etapa estiverem válidos
    return ids.every(function(id) {
      var grupo = document.getElementById(id);
      if (!grupo) return true;
      var campoPai = grupo.closest('.campo-grupo');
      return campoPai && campoPai.classList.contains('valido');
    });
  }

  function atualizarProgresso() {
    var etapa1ok = verificarEtapa(camposEtapa1);
    var etapa2ok = verificarEtapa(camposEtapa2);

    if (etapa1ok && etapa2ok) {
      atualizarEtapas(3);
    } else if (etapa1ok) {
      atualizarEtapas(2);
    } else {
      atualizarEtapas(1);
    }
  }

  // Verifica o progresso ao sair de qualquer campo
  var todosOsCampos = camposEtapa1.concat(camposEtapa2).concat(camposEtapa3);
  todosOsCampos.forEach(function(id) {
    var campo = document.getElementById(id);
    if (campo) {
      campo.addEventListener('blur', atualizarProgresso);
    }
  });
}

/* ENVIO DO FORMULÁRIO */

function inicializarEnvio() {
  var form    = document.getElementById('formulario-cadastro');
  var btnEnviar = document.getElementById('btn-cadastrar');
  if (!form || !btnEnviar) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o envio padrão enquanto validamos

    // Campos obrigatórios e suas mensagens
    var camposObrigatorios = [
      { id: 'razao-social',      erroId: 'razao-social-erro',     msg: 'A razão social é obrigatória.' },
      { id: 'cnpj',             erroId: 'cnpj-erro',             msg: 'O CNPJ é obrigatório.' },
      { id: 'tipo-empresa',      erroId: 'tipo-empresa-erro',     msg: 'Selecione o tipo de empresa.' },
      { id: 'categoria',         erroId: 'categoria-erro',        msg: 'Selecione a categoria.' },
      { id: 'descricao',         erroId: 'descricao-erro',        msg: 'A descrição é obrigatória.' },
      { id: 'nome-responsavel',  erroId: 'nome-responsavel-erro', msg: 'O nome do responsável é obrigatório.' },
      { id: 'cargo',             erroId: 'cargo-erro',            msg: 'O cargo é obrigatório.' },
      { id: 'cpf',               erroId: 'cpf-erro',              msg: 'O CPF é obrigatório.' },
      { id: 'email',             erroId: 'email-erro',            msg: 'O e-mail é obrigatório.' },
      { id: 'senha',             erroId: 'senha-erro',            msg: 'A senha é obrigatória.' },
      { id: 'confirmar-senha',   erroId: 'confirmar-senha-erro',  msg: 'Confirme sua senha.' },
    ];

    var temErro = false;
    var primeiroErro = null;

    // Valida cada campo
    camposObrigatorios.forEach(function(item) {
      var campo = document.getElementById(item.id);
      if (!campo) return;

      var grupo = campo.closest('.campo-grupo');
      var valor = campo.value.trim();

      if (!valor) {
        mostrarErro(grupo, item.erroId, item.msg);
        if (!primeiroErro) primeiroErro = campo;
        temErro = true;
      }
    });

    // Validações específicas (formato)
    var cnpjCampo = document.getElementById('cnpj');
    if (cnpjCampo && cnpjCampo.value && !validarCNPJ(cnpjCampo.value)) {
      mostrarErro(cnpjCampo.closest('.campo-grupo'), 'cnpj-erro', 'CNPJ inválido.');
      if (!primeiroErro) primeiroErro = cnpjCampo;
      temErro = true;
    }

    var emailCampo = document.getElementById('email');
    if (emailCampo && emailCampo.value && !validarEmail(emailCampo.value)) {
      mostrarErro(emailCampo.closest('.campo-grupo'), 'email-erro', 'E-mail inválido.');
      if (!primeiroErro) primeiroErro = emailCampo;
      temErro = true;
    }

    var senhaCampo = document.getElementById('senha');
    if (senhaCampo && senhaCampo.value && !validarSenha(senhaCampo.value)) {
      mostrarErro(senhaCampo.closest('.campo-grupo'), 'senha-erro', 'Senha muito curta.');
      if (!primeiroErro) primeiroErro = senhaCampo;
      temErro = true;
    }

    var confirmarCampo = document.getElementById('confirmar-senha');
    if (confirmarCampo && senhaCampo && confirmarCampo.value !== senhaCampo.value) {
      mostrarErro(confirmarCampo.closest('.campo-grupo'), 'confirmar-senha-erro', 'As senhas não coincidem.');
      if (!primeiroErro) primeiroErro = confirmarCampo;
      temErro = true;
    }

    // Termos de uso
    var termos = document.getElementById('aceitar-termos');
    if (termos && !termos.checked) {
      var grupoTermos = termos.closest('.campo-grupo');
      mostrarErro(grupoTermos, 'termos-erro', 'Você precisa aceitar os termos para continuar.');
      if (!primeiroErro) primeiroErro = termos;
      temErro = true;
    }

    // Se tem erro, foca no primeiro e para
    if (temErro) {
      if (primeiroErro) primeiroErro.focus();
      if (typeof mostrarToast === 'function') {
        mostrarToast('Corrija os campos destacados e tente novamente.', 'padrao');
      }
      return;
    }

    // === Tudo OK: mostra loading e simula envio ===
    var btnTexto   = btnEnviar.querySelector('.btn-texto');
    var btnLoading = btnEnviar.querySelector('.btn-loading');

    btnEnviar.setAttribute('aria-busy', 'true');
    btnEnviar.disabled = true;
    if (btnTexto)   btnTexto.hidden   = true;
    if (btnLoading) btnLoading.hidden = false;

    /*
     * INTEGRAÇÃO COM BANCO DE DADOS
     * ─────────────────────────────
     * Quando tiver o back-end pronto, substitua o setTimeout abaixo por:
     *
     *   fetch('cadastro.php', {
     *     method: 'POST',
     *     body: new FormData(form)
     *   })
     *   .then(function(res) { return res.json(); })
     *   .then(function(dados) {
     *     if (dados.sucesso) {
     *       window.location.href = 'painel.html';
     *     } else {
     *       mostrarToast(dados.mensagem, 'padrao');
     *     }
     *   });
     *
     * O PHP lê $_POST['razao_social'], $_POST['cnpj'], etc.
     * e faz o INSERT na sua tabela de empresas.
     */
    setTimeout(function() {
      if (typeof mostrarToast === 'function') {
        mostrarToast('Conta criada com sucesso! Redirecionando...', 'sucesso');
      }

      atualizarEtapas(3); // Marca todas as etapas como concluídas visualmente

      setTimeout(function() {
        window.location.href = 'painel.html';
      }, 1500);
    }, 2000);
  });
}

/*INICIALIZAÇÃO — executa tudo quando a página carrega */

function inicializar() {
  inicializarMascaras();
  inicializarContador();
  inicializarBotoesSenha();
  inicializarValidacaoBlur();
  inicializarProgressoEtapas();
  inicializarEnvio();
}

// Aguarda o HTML estar completamente carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}