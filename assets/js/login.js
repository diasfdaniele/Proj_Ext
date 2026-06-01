// 'use strict';
// Versão compatível com Firebase compat (CDN)
// Firebase já está inicializado via firebase.js
// Usa window.firebase

// Usa auth e db globais definidos em firebase.js
const googleLoginButton = document.getElementById('btn-google-login');
const toast = document.getElementById("toast-container");

        
// Login com Google (compat)
if (googleLoginButton) {
  googleLoginButton.addEventListener('click', async () => {
    if (!window.auth || !window.db) {
      showToast('Firebase não está configurado corretamente.', 'Bad_Toast');
      return;
    }
    try {
      setLoadingState(true);
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await window.auth.signInWithPopup(provider);
      const user = result.user;
      // Busca perfil adicional no Firestore, se existir
      let profile = {};
      try {
        const profileSnapshot = await window.db.collection('usuarios').doc(user.uid).get();
        if (profileSnapshot.exists) {
          profile = profileSnapshot.data();
        }
      } catch {}
      const role = profile.role || 'usuario-comum';
      saveUserSession({
        accountType: profile.sellerType ?? 'comprador',
        email: user.email,
        nomeResponsavel: profile.nomeResponsavel ?? user.displayName ?? '',
        razaoSocial: profile.razaoSocial ?? '',
        role,
        uid: user.uid
      });
      showToast('Login com Google realizado com sucesso.', 'Good_Toast');
      window.location.href = 'conta.html';
    } catch (erro) {
      showToast('Não foi possível fazer login com Google.', 'Bad_Toast');
      
    } finally {
      setLoadingState(false);
    }
  });
}

const form = document.getElementById('formulario-login');
const email = document.getElementById('campo-email');
const senha = document.getElementById('campo-senha');
const botaoEntrar = document.getElementById('btn-entrar');
const textoBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__texto');
const loadingBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__loading');
const loginSessionStorageKey = 'empre:usuario-logado';

function showToast(message, type = 'Bad_Toast', hideDelay = 3000) {
  if (!toast) {
    return;
  }

  toast.hidden = false;
  toast.innerHTML = '';
  toast.classList.remove('Good_Toast', 'Bad_Toast');
  toast.classList.add(type);
  toast.textContent = message;

  setTimeout(() => {
    toast.hidden = true;
  }, hideDelay);
}

function normalizeRole(value) {
  return value === 'administrador' ? 'administrador' : 'usuario-comum';
}

function saveUserSession(user) {
  const sessionKey = window.sessionStorageKey || loginSessionStorageKey;
  localStorage.setItem(sessionKey, JSON.stringify(user));
}


function setLoadingState(isLoading) {
  if (!botaoEntrar || !textoBotaoEntrar || !loadingBotaoEntrar) {
    return;
  }

  botaoEntrar.disabled = isLoading;
  textoBotaoEntrar.hidden = isLoading;
  loadingBotaoEntrar.hidden = !isLoading;
}

if (form && email && senha) {
  if (toast) {
    toast.innerHTML = '';
    toast.classList.remove('Good_Toast', 'Bad_Toast');
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailValor = email.value.trim();
    const senhaValor = senha.value.trim();

    if (!emailValor || !senhaValor) {
      showToast('Preencha email e senha para entrar.', 'Bad_Toast');
      return;
    }

    if (!window.auth || !window.db) {
      showToast('Firebase não está configurado corretamente.', 'Bad_Toast');
      return;
    }

    try {
      setLoadingState(true);
      // Login compatível
      const credential = await window.auth.signInWithEmailAndPassword(emailValor, senhaValor);
      // Buscar perfil adicional no Firestore compat
      let profile = {};
      try {
        const profileSnapshot = await window.db.collection('usuarios').doc(credential.user.uid).get();
        if (profileSnapshot.exists) {
          profile = profileSnapshot.data();
        }
      } catch {}
      const role = normalizeRole(profile.role);

      saveUserSession({
        accountType: profile.sellerType ?? 'comprador',
        email: credential.user.email ?? emailValor,
        nomeResponsavel: profile.nomeResponsavel ?? '',
        razaoSocial: profile.razaoSocial ?? '',
        role,
        uid: credential.user.uid
      });
      showToast('Login realizado com sucesso!', 'Good_Toast');
      setTimeout(() => {
        window.location.href = 'conta.html';
      }, 3000);
    } catch (erro) {
      console.error(erro);
      showToast('Email ou senha inválidos.', 'Bad_Toast');
    } finally {
      setLoadingState(false);
    }
  });
}