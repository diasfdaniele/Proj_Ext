'use strict';

import { auth, db, isFirebaseConfigured } from './firebase.js';

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

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

    if (!isFirebaseConfigured || !auth || !db) {
      alert('Configure o Firebase em assets/js/firebase.js antes de usar o login.');
      return;
    }

    try {
      setLoadingState(true);
      const credential = await signInWithEmailAndPassword(auth, emailValor, senhaValor);
      const profileSnapshot = await getDoc(doc(db, 'usuarios', credential.user.uid));

      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const role = normalizeRole(profile.role);

      saveUserSession({
        email: credential.user.email ?? emailValor,
        nomeResponsavel: profile.nomeResponsavel ?? '',
        razaoSocial: profile.razaoSocial ?? '',
        role,
        uid: credential.user.uid
      });

      alert('Login realizado com sucesso.');
      window.location.href = role === 'administrador' ? 'catalogo.html?painel=admin' : 'catalogo.html';
    } catch (erro) {
      console.error(erro);
      alert('Email ou senha invalidos.');
    } finally {
      setLoadingState(false);
    }
  });
}