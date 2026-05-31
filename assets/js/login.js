'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Configuração do Firebase (copie do seu firebase.js se necessário)
const firebaseConfig = {
  apiKey: "AIzaSyC-YG19WRKIUFE__7608NYqrrehSWr8Zd0",
  authDomain: "empr-e.firebaseapp.com",
  projectId: "empr-e",
  storageBucket: "empr-e.appspot.com",
  messagingSenderId: "196840931732",
  appId: "1:196840931732:web:d316628d34006a8e37cf81"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleLoginButton = document.getElementById('btn-google-login');
// Login com Google
if (googleLoginButton) {
  googleLoginButton.addEventListener('click', async () => {
    if (!auth || !db) {
      alert('Firebase não está configurado corretamente.');
      return;
    }
    try {
      setLoadingState(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Busca perfil adicional no Firestore, se existir
      let profile = {};
      try {
        const profileSnapshot = await getDoc(doc(db, 'usuarios', user.uid));
        if (profileSnapshot.exists()) {
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
import { doc, getDoc } from 'firebase/firestore';

const form = document.getElementById('formulario-login');
const email = document.getElementById('campo-email');
const senha = document.getElementById('campo-senha');
const botaoEntrar = document.getElementById('btn-entrar');
const textoBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__texto');
const loadingBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__loading');
const sessionStorageKey = 'empre:usuario-logado';

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

    if (!auth || !db) {
      alert('Firebase não está configurado corretamente.');
      return;
    }

    try {
      setLoadingState(true);
      const credential = await signInWithEmailAndPassword(auth, emailValor, senhaValor);
      const profileSnapshot = await getDoc(doc(db, 'usuarios', credential.user.uid));

      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
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