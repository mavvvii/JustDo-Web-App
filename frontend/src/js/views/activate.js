import { API_V1_BASE_URL } from './api.js';
import { createApp } from 'https://unpkg.com/petite-vue?module';

export const activateApp = {
  message: '',
  messageClass: '',
  loading: true,
  success: false,

  async activate() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const token = urlParams.get('token');

    if (!userId || !token) {
      this.message = 'Invalid activation link.';
      this.messageClass = 'text-danger';
      this.loading = false;
      return;
    }

    try {
      const response = await fetch(`${API_V1_BASE_URL}/users/profile/${userId}/activate/${token}/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        this.message = 'Your account has been activated! You can now log in.';
        this.messageClass = 'text-success';
        this.success = true;
      } else {
        const data = await response.json();
        this.message = data.detail || 'Failed to activate account.';
        this.messageClass = 'text-danger';
      }
    } catch (err) {
      console.error(err);
      this.message = 'An error occurred while activating the account.';
      this.messageClass = 'text-danger';
    } finally {
      this.loading = false;
    }
  },

  goToLogin() {
    window.location.href = 'index.html';
  }
};

// Usuwamy stary kod i eksportujemy dla load-view-handler
export function mountActivateView() {
  createApp(activateApp).mount('#activate-app');
  activateApp.activate();
}
