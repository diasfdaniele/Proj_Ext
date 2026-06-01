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
    const tipoConta = readValue('tipo-conta') || 'comprador';
    const perfilAcesso = readValue('perfil-acesso') || 'usuario-comum';
    const email = readValue('email');
    const senha = readValue('senha');
    const confirmarSenha = readValue('confirmar-senha');
    const aceitouTermos = document.getElementById('aceitar-termos')?.checked ?? false;

    if (!razaoSocial || !cnpj || !tipoEmpresa || !categoria || !descricao || !nomeResponsavel || !cargo || !cpf || !email || !senha) {
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'Preencha os campos obrigatorios para continuar.';
      return;
    }

    if (senha.length < 8) {
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'A senha precisa ter pelo menos 8 caracteres.';
      return;
    }

    if (senha !== confirmarSenha) {
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'A confirmacao de senha nao confere.';
      return;
    }

    if (!aceitouTermos) {
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'Aceite os termos de uso para concluir o cadastro.';
      return;
    }

    if (!window.auth || !window.db) {
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'Firebase não está configurado corretamente.';
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

      
      toast.classList.add("Good_Toast");
      toast.innerHTML = 'Empresa cadastrada com sucesso!';
      window.location.href = 'login.html';
    } catch (erro) {
      console.error(erro);
      toast.classList.add("Bad_Toast");
      toast.innerHTML = 'Nao foi possivel concluir o cadastro. Verifique os dados e tente novamente.';
    } finally {
      setLoadingState(false);
    }
  });
}