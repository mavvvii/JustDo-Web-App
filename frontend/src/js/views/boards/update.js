import { createApp } from 'https://unpkg.com/petite-vue?module';
import { getBoards, updateBoard } from '../../api/boards.js';
import { loadBoardsToNavbar } from './list.js';

export function mountUpdateBoard() {
  const app = {
    boards: [],
    selectedBoardID: '',
    title: '',
    description: '',
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',

    async fetchBoards() {
      try {
        const data = await getBoards();
        this.boards = data;
        this.onBoardChange();
      } catch (err) {
        // don't display raw fetch errors to users in the form; keep boards empty
        console.warn('Could not fetch boards for update view:', err);
        this.boards = [];
        this.onBoardChange();
      }
    },

    onBoardChange() {
      if (!this.selectedBoardID) {
        this.title = '';
        this.description = '';
        return;
      }
      const board = this.boards.find(b => b.id === this.selectedBoardID);
      if (board) {
        this.title = board.title || '';
        this.description = board.description || '';
      } else {
        this.title = '';
        this.description = '';
      }
    },

    closeUpdateView() {
      const view = document.getElementById('board-update');
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
      this.closeUpdateView();

    },

    async updateBoardAction() {
      try {
        this.errorMessage = '';

        if (!this.selectedBoardID) {
          this.openModal('Error', 'You have to select board!');
          return;
        }

        await updateBoard(this.selectedBoardID, this.title, this.description);

        this.openModal('Success', 'Board has been updated!');

        await loadBoardsToNavbar();

        this.title = '';
        this.description = '';
        this.selectedBoardID = '';
      } catch (err) {
        this.openModal('Error', 'Unknown error');
      }
    },
  };

  createApp(app).mount('#board-update');
  app.fetchBoards();
}
