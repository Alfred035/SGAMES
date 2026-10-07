/** Autenticação independente do catálogo. A sessão fica em cookie HttpOnly. */
const authReady = (async () => {
  'use strict';
  const links = document.querySelectorAll('[data-account-link]');
  const loading = document.querySelector('[data-account-loading]');
  const guest = document.querySelector('[data-auth-guest]');
  const profile = document.querySelector('[data-auth-profile]');
  const status = document.querySelector('#auth-status');
  let user = null;

  function showStatus(message, error = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('erro', error);
  }

  function render() {
    links.forEach(link => {
      link.textContent = user ? 'Minha conta' : 'Entrar';
      link.setAttribute('aria-label', user ? `Minha conta: ${user.name}` : 'Entrar ou criar uma conta');
      if (document.body.dataset.page === 'conta') link.setAttribute('aria-current', 'page');
    });
    if (loading) loading.hidden = true;
    if (guest) guest.hidden = Boolean(user);
    if (profile) profile.hidden = !user;
    if (user) {
      document.querySelector('[data-user-name]')?.replaceChildren(document.createTextNode(user.name));
      document.querySelector('[data-user-email]')?.replaceChildren(document.createTextNode(user.email));
      const date = document.querySelector('[data-user-date]');
      if (date) date.textContent = new Date(user.createdAt).toLocaleDateString('pt-BR');
    }
  }

  try {
    user = (await apiRequest('/api/auth/me')).user;
  } catch (error) {
    if (error.status !== 401) showStatus(error.message, true);
  }
  render();

  // Atualiza uma aba que ficou aberta quando a sessão foi encerrada em outra aba.
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    window.location.reload();
  });

  document.querySelectorAll('[data-auth-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(form));
      if (form.dataset.authForm === 'register' && values.password !== values.confirmPassword) {
        showStatus('As senhas não coincidem.', true);
        form.querySelector('[name="confirmPassword"]').focus();
        return;
      }
      const button = form.querySelector('[type="submit"]');
      const label = button.textContent;
      button.disabled = true;
      button.textContent = 'Aguarde…';
      form.setAttribute('aria-busy', 'true');
      showStatus('');
      try {
        user = (await apiRequest(`/api/auth/${form.dataset.authForm}`, { method: 'POST', body: { name: values.name, email: values.email, password: values.password } })).user;
        form.reset();
        render();
        showStatus(form.dataset.authForm === 'register' ? 'Conta criada. Boas-vindas à SGAMES!' : 'Você entrou na sua conta.');
        document.querySelector('#perfil-titulo')?.focus();
      } catch (error) {
        showStatus(error.message, true);
      } finally {
        button.disabled = false;
        button.textContent = label;
        form.removeAttribute('aria-busy');
      }
    });
  });

  document.querySelector('[data-logout]')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', body: {} });
      user = null;
      render();
      showStatus('Você saiu da sua conta.');
      document.querySelector('#login-email')?.focus();
    } catch (error) {
      showStatus(error.message, true);
    } finally {
      button.disabled = false;
    }
  });

  document.querySelectorAll('[data-show-password]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.showPassword);
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.textContent = visible ? 'Ocultar' : 'Mostrar';
      button.setAttribute('aria-pressed', String(visible));
    });
  });
  return user;
})();
