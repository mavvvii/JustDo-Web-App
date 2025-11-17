import { createApp } from 'https://unpkg.com/petite-vue?module';
import { registerUser } from '../api/register.js';

export function mountRegisterView() {
  createApp({
    username: '',
    email: '',
    password: '',
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

    closeRegisterView() {
      const view = document.getElementById('register-app');
      if (view) {
        // animate then remove the loaded wrapper to avoid leaving a full-screen overlay
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

    async register() {
      try {
        this.errorMessage = '';
        const data = await registerUser(this.username, this.email, this.password);
        this.openModal(data.detail || 'Sukces', data.message || '');
      } catch (err) {
        this.openModal('Błąd', err.message || 'Nieznany błąd');
      }
    }
  }).mount('#register-app');
}
