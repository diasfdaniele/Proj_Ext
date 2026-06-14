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



function normalizeRole(value) {
  return value === 'administrador' ? 'administrador' : 'usuario-comum';
}

function isAdminCredentials(emailValue, passwordValue) {
  return typeof window.isMarketplaceAdminCredentials === 'function'
    ? window.isMarketplaceAdminCredentials(emailValue, passwordValue)
    : false;
}

function buildAdminUserSession() {
  if (typeof window.buildMarketplaceAdminSession === 'function') {
    return window.buildMarketplaceAdminSession();
  }

  return {
    accountType: 'administrador',
    email: 'administrador@admin.com',
    nomeResponsavel: 'Administrador Empr-E',
    razaoSocial: 'Empr-E Administracao',
    role: 'administrador',
    uid: 'admin-administrador@admin.com'
  };
}

async function saveAdminProfileToFirestore(userSession) {
  if (!window.db || !userSession?.uid) {
    return;
  }

  await window.db.collection('usuarios').doc(userSession.uid).set({
    cargo: 'Administracao',
    categoria: 'plataforma',
    cnpj: '00000000000000',
    cpf: '00000000000',
    criadoEm: new Date().toISOString(),
    descricao: 'Conta administrativa da plataforma Empr-E.',
    email: userSession.email,
    nomeResponsavel: userSession.nomeResponsavel,
    perfil: 'administrador',
    razaoSocial: userSession.razaoSocial,
    role: 'administrador',
    sellerType: 'administrador',
    site: 'https://empr-e.web.app',
    telefone: '',
    tipoEmpresa: 'administracao',
    uid: userSession.uid
  }, { merge: true });
}

async function tryPersistAdminAuth(emailValue, passwordValue) {
  if (!window.auth) {
    return null;
  }

  try {
    const credential = await window.auth.signInWithEmailAndPassword(emailValue, passwordValue);
    return credential?.user || null;
  } catch (error) {
    if (error?.code !== 'auth/user-not-found' && error?.code !== 'auth/invalid-credential' && error?.code !== 'auth/wrong-password' && error?.code !== 'auth/invalid-login-credentials') {
      throw error;
    }
  }

  try {
    const credential = await window.auth.createUserWithEmailAndPassword(emailValue, passwordValue);
    if (credential?.user && typeof credential.user.updateProfile === 'function') {
      await credential.user.updateProfile({ displayName: window.marketplaceAdmin?.displayName || 'Administrador Empr-E' });
    }
    return credential?.user || null;
  } catch (error) {
    if (error?.code !== 'auth/email-already-in-use') {
      throw error;
    }

    return null;
  }
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

    if (isAdminCredentials(emailValor, senhaValor)) {
      try {
        setLoadingState(true);
        let authUser = null;

        try {
          authUser = await tryPersistAdminAuth(emailValor, senhaValor);
        } catch (error) {
          console.warn('Nao foi possivel persistir o admin no Firebase Auth:', error?.code || error?.message || error);
        }

        if (authUser && window.db) {
          const adminSession = buildAdminUserSession(authUser.uid);
          await saveAdminProfileToFirestore(adminSession);
          saveUserSession(adminSession);
        } else {
          if (window.auth && typeof window.auth.signOut === 'function') {
            try {
              await window.auth.signOut();
            } catch {}
          }

          const adminSession = buildAdminUserSession();
          await saveAdminProfileToFirestore(adminSession);
          saveUserSession(adminSession);
        }
        showToast('Login administrativo realizado com sucesso.', 'Good_Toast');
        setTimeout(() => {
          window.location.href = 'conta.html';
        }, 800);
      } catch (erro) {
        console.error(erro);
        showToast('Nao foi possivel acessar a conta administrativa.', 'Bad_Toast');
      } finally {
        setLoadingState(false);
      }
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