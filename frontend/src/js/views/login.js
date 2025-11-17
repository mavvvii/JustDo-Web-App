import { createApp } from 'https://unpkg.com/petite-vue?module';
import { loginUser } from '../api/login.js';

export function mountLoginView() {
  createApp({
    username: '',
    password: '',
    remember_me: false,
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',

    closeModal() {
      this.showModal = false;
    },

    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },

    closeLoginView() {
      const view = document.getElementById('login-app');
      if (view) {
        // play a fade-out animation (CSS class) then remove the loaded wrapper so it doesn't block the UI
        view.classList.add('fade-out');
        view.addEventListener('animationend', () => {
          const wrapper = view.closest('.loaded-view');
          if (wrapper && wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
          } else if (view.parentNode) {
            view.parentNode.removeChild(view);
          }
        }, { once: true });
      }
    },

    async login() {
      try {
        this.errorMessage = '';
        const data = await loginUser(this.username, this.password, this.remember_me);
        this.openModal(data.detail || 'Success', data.message || '');
      } catch (err) {
        this.openModal('Error', err.message || 'Unknown error');
      }
    }
  }).mount('#login-app');
}
