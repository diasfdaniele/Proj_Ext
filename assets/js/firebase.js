
// Firebase compatível com uso via CDN (firebase-compat)
// Certifique-se de incluir os scripts CDN no HTML:
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyC-YG19WRKIUFE__7608NYqrrehSWr8Zd0",
  authDomain: "empr-e.firebaseapp.com",
  projectId: "empr-e",
  storageBucket: "empr-e.appspot.com",
  messagingSenderId: "196840931732",
  appId: "1:196840931732:web:d316628d34006a8e37cf81"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore();
window.auth = firebase.auth();
window.marketplaceAdmin = Object.freeze({
  email: 'administrador@admin.com',
  password: 'Admin1234',
  displayName: 'Administrador Empr-E'
});

window.isMarketplaceAdminCredentials = function(email, password) {
  return String(email || '').trim().toLowerCase() === window.marketplaceAdmin.email
    && String(password || '') === window.marketplaceAdmin.password;
};

window.isMarketplaceAdminEmail = function(email) {
  return String(email || '').trim().toLowerCase() === window.marketplaceAdmin.email;
};

window.buildMarketplaceAdminSession = function(uid = 'admin-administrador@admin.com') {
  return {
    accountType: 'administrador',
    email: window.marketplaceAdmin.email,
    nomeResponsavel: window.marketplaceAdmin.displayName,
    razaoSocial: 'Empr-E Administracao',
    role: 'administrador',
    uid
  };
};

