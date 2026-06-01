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
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Firebase não está configurado corretamente.';
      toast.classList.add('Bad_Toast');
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
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Login com Google realizado com sucesso.';
      toast.classList.add('Good_Toast');
      window.location.href = 'conta.html';
    } catch (erro) {
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Não foi possível fazer login com Google.';
      toast.classList.add('Bad_Toast');
      
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


function setLoadingState(isLoading) {
  if (!botaoEntrar || !textoBotaoEntrar || !loadingBotaoEntrar) {
    return;
  }

  botaoEntrar.disabled = isLoading;
  textoBotaoEntrar.hidden = isLoading;
  loadingBotaoEntrar.hidden = !isLoading;
}

if (form && email && senha) {
  toast.innerHTML = "";
  toast.classList.remove('Good_Toast', 'Bad_Toast');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailValor = email.value.trim();
    const senhaValor = senha.value.trim();

    if (!emailValor || !senhaValor) {
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Preencha email e senha para entrar.';
      toast.classList.add('Bad_Toast');
      return;
    }

    if (!window.auth || !window.db) {
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Firebase não está configurado corretamente.';
      toast.classList.add('Bad_Toast');
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
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
        window.location.href = 'conta.html';
      }, 3000);
      toast.innerHTML = 'Login realizado com sucesso!';
      toast.classList.add('Good_Toast');
    } catch (erro) {
      console.error(erro);
      toast.hidden = false;
        toast.innerHTML = "";
        setTimeout(() => {
        toast.hidden = true;
      }, 3000);
      toast.innerHTML = 'Email ou senha inválidos.';
      toast.classList.add('Bad_Toast');
    } finally {
      setLoadingState(false);
    }
  });
}