// 'use strict';
// Versão compatível com Firebase compat (CDN)
// Firebase já está inicializado via firebase.js
// Usa window.firebase

// Usa auth e db globais definidos em firebase.js
const googleLoginButton = document.getElementById('btn-google-login');
// Login com Google (compat)
if (googleLoginButton) {
  googleLoginButton.addEventListener('click', async () => {
    if (!window.auth || !window.db) {
      alert('Firebase não está configurado corretamente.');
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
      alert('Login com Google realizado com sucesso.');
      window.location.href = 'conta.html';
    } catch (erro) {
      console.error(erro);
      alert('Não foi possível fazer login com Google.');
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
// Usa window.sessionStorageKey global

function normalizeRole(value) {
  return value === 'administrador' ? 'administrador' : 'usuario-comum';
}

function saveUserSession(user) {
  localStorage.setItem(sessionStorageKey, JSON.stringify(user));
}

function mostrarMensagemLoginSucesso() {
  if (typeof window.mostrarToast === 'function') {
    window.mostrarToast('Login realizado com sucesso!', 'sucesso');
  } else {
    alert('Login realizado com sucesso!');
  }
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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailValor = email.value.trim();
    const senhaValor = senha.value.trim();

    if (!emailValor || !senhaValor) {
      alert('Preencha email e senha para entrar.');
      return;
    }

    if (!window.auth || !window.db) {
      alert('Firebase não está configurado corretamente.');
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

      mostrarMensagemLoginSucesso();
      setTimeout(() => {
        window.location.href = 'conta.html';
      }, 900);
    } catch (erro) {
      console.error(erro);
      alert('Email ou senha invalidos.');
    } finally {
      setLoadingState(false);
    }
  });
}