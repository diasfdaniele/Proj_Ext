'use strict';

import { auth, isFirebaseConfigured } from './firebase.js';

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

const form = document.getElementById('formulario-login');
const email = document.getElementById('campo-email');
const senha = document.getElementById('campo-senha');
const botaoEntrar = document.getElementById('btn-entrar');
const textoBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__texto');
const loadingBotaoEntrar = botaoEntrar?.querySelector('.btn-login-submit__loading');

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

    if (!isFirebaseConfigured || !auth) {
      alert('Configure o Firebase em assets/js/firebase.js antes de usar o login.');
      return;
    }

    try {
      setLoadingState(true);
      await signInWithEmailAndPassword(auth, emailValor, senhaValor);
      alert('Login realizado com sucesso.');
      window.location.href = '../index.html';
    } catch (erro) {
      console.error(erro);
      alert('Email ou senha invalidos.');
    } finally {
      setLoadingState(false);
    }
  });
}