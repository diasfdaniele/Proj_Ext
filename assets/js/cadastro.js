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
  localStorage.setItem(window.sessionStorageKey, JSON.stringify(user));
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
    const toast = document.getElementById("toast-container");
        toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
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
    const email = readValue('email');
    const tipoConta = readValue('tipo-conta') || 'comprador';
    const perfilAcesso = readValue('perfil-acesso') || 'usuario-comum';
    const senha = readValue('senha');
    const confirmarSenha = readValue('confirmar-senha');
    const aceitouTermos = document.getElementById('aceitar-termos')?.checked ?? false;

    if (!razaoSocial || !cnpj || !tipoEmpresa || !descricao || !nomeResponsavel || !cargo || !cpf || !email || !senha) {
      showToast('Preencha os campos obrigatorios para continuar.', 'Bad_Toast');
      return;
    }

    if (senha.length < 8) {
      showToast('A senha precisa ter pelo menos 8 caracteres.', 'Bad_Toast');
      return;
    }

    if (senha !== confirmarSenha) {
      showToast('A confirmação de senha não confere.', 'Bad_Toast');
      return;
    }

    if (!aceitouTermos) {
      showToast('Aceite os termos de uso para concluir o cadastro.', 'Bad_Toast');
      return;
    }

    if (!window.auth || !window.db) {
      console.error('Firebase indisponivel na pagina de cadastro.', {
        hasAuth: !!window.auth,
        hasDb: !!window.db,
        hasFirebase: !!window.firebase
      });
      showToast('Firebase não está configurado corretamente.', 'Bad_Toast');
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

      showToast('Cadastro realizado com sucesso!', 'Good_Toast');
      window.location.href = 'login.html';
    } catch (erro) {
      console.error('Falha no cadastro de empresa:', erro?.code || erro?.message || erro);
      showToast('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.', 'Bad_Toast');
    } finally {
      setLoadingState(false);
    }
  });
}