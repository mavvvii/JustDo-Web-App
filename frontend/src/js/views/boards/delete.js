import { createApp } from 'https://unpkg.com/petite-vue?module';
import { getBoards, deleteBoard } from '../../api/boards.js';
import { loadBoardsToNavbar } from './list.js';

export function mountDeleteBoard() {
  const app = {
    boards: [],
    selectedBoardID: '',
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',

    async fetchBoards() {
      try {
        const data = await getBoards();
        this.boards = data;
      } catch (err) {
        // don't display raw fetch errors to users in the form; keep boards empty
        console.warn('Could not fetch boards for delete view:', err);
        this.boards = [];
      }
    },

    closeDeleteView() {
      const view = document.getElementById('board-delete');
      if (view) {
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

    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.closeDeleteView();
    },

    async deleteBoardAction() {
      try {
        this.errorMessage = '';

        if (!this.selectedBoardID) {
          this.openModal('Error', 'You have to select board!');
          return;
        }

        await this.fetchBoards();
        await deleteBoard(this.selectedBoardID);

        this.openModal('Success', `Board ${this.boards.find(board => board.id === this.selectedBoardID)?.title} has been deleted!`);

        await loadBoardsToNavbar();

        this.selectedBoardID = '';

      } catch (err) {
        this.openModal('Error', err.message || 'Unknown error');
      }
    },
  };

  createApp(app).mount('#board-delete');
  app.fetchBoards();
}
