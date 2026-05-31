// Firebase já está inicializado via firebase.js
// Usa window.auth e window.db

const formCadastro = document.getElementById('formulario-cadastro');
const botaoCadastro = document.getElementById('btn-cadastrar');
const textoBotaoCadastro = botaoCadastro?.querySelector('.btn-texto');
const loadingBotaoCadastro = botaoCadastro?.querySelector('.btn-loading');
// Usa window.sessionStorageKey global

function readValue(id) {
  return document.getElementById(id)?.value.trim() ?? '';
}

function readOptionalValue(id) {
  return readValue(id);
}

function saveUserSession(user) {
  localStorage.setItem(sessionStorageKey, JSON.stringify(user));
}

function setLoadingState(isLoading) {
  if (!botaoCadastro || !textoBotaoCadastro || !loadingBotaoCadastro) {
    return;
  }

  botaoCadastro.disabled = isLoading;
  textoBotaoCadastro.hidden = isLoading;
  loadingBotaoCadastro.hidden = !isLoading;
}

if (formCadastro) {
  formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const razaoSocial = readValue('razao-social');
    const cnpj = readValue('cnpj');
    const tipoEmpresa = readValue('tipo-empresa');
    const categoria = readValue('categoria');
    const telefone = readOptionalValue('telefone');
    const site = readOptionalValue('site');
    const descricao = readValue('descricao');
    const nomeResponsavel = readValue('nome-responsavel');
    const cargo = readValue('cargo');
    const cpf = readValue('cpf');
    const tipoConta = readValue('tipo-conta') || 'comprador';
    const perfilAcesso = readValue('perfil-acesso') || 'usuario-comum';
    const email = readValue('email');
    const senha = readValue('senha');
    const confirmarSenha = readValue('confirmar-senha');
    const aceitouTermos = document.getElementById('aceitar-termos')?.checked ?? false;

    if (!razaoSocial || !cnpj || !tipoEmpresa || !categoria || !descricao || !nomeResponsavel || !cargo || !cpf || !email || !senha) {
      alert('Preencha os campos obrigatorios para continuar.');
      return;
    }

    if (senha.length < 8) {
      alert('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('A confirmacao de senha nao confere.');
      return;
    }

    if (!aceitouTermos) {
      alert('Aceite os termos de uso para concluir o cadastro.');
      return;
    }

    if (!window.auth || !window.db) {
      alert('Firebase não está configurado corretamente.');
      return;
    }

    try {
      setLoadingState(true);

      const credential = await window.auth.createUserWithEmailAndPassword(email, senha);

      const userProfile = {
        cargo,
        categoria,
        cnpj,
        cpf,
        criadoEm: new Date().toISOString(),
        descricao,
        email,
        nomeResponsavel,
        perfil: 'empresa',
        razaoSocial,
        sellerType: tipoConta,
        role: perfilAcesso,
        site,
        telefone,
        tipoEmpresa,
        uid: credential.user.uid
      };

      await window.db.collection('usuarios').doc(credential.user.uid).set(userProfile);

      saveUserSession({
        accountType: tipoConta,
        email,
        nomeResponsavel,
        razaoSocial,
        role: perfilAcesso,
        uid: credential.user.uid
      });

      document.getElementById("mensagem").classList.remove("hidden");
      setTimeout(() => {
        document.getElementById("mensagem").classList.add("hidden");
    }, 3000);

      window.location.href = 'login.html';
    } catch (erro) {
      console.error(erro);
      alert('Nao foi possivel concluir o cadastro. Verifique os dados e tente novamente.');
    } finally {
      setLoadingState(false);
    }
  });
}