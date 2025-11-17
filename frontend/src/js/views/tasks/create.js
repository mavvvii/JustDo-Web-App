import { createTask } from '../../api/tasks.js';
import { createApp } from 'https://unpkg.com/petite-vue?module';

export function mountCreateTask(board_id, onTaskCreated) {
  // If caller didn't pass board_id, try to recover from global activeBoard
  if (!board_id) {
    board_id = window.activeBoard?.id;
  }

  // If still missing, remove the loaded template (to avoid showing raw mustache bindings)
  // and show a native alert so the user knows to open a board first.
  if (!board_id) {
    const viewElement = document.getElementById('task-create');
    if (viewElement) {
      const wrapper = viewElement.closest('.loaded-view');
      if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      else if (viewElement.parentNode) viewElement.parentNode.removeChild(viewElement);
    }
    // fallback notification
    alert('No board selected. Open a board before creating a task.');
    return;
  }

  createApp({
    title: '',
    description: '',
    board_id,
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',

    closeModal() {
      this.showModal = false;
      this.closeCreateView();
    },

    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },

    closeCreateView() {
      const view = document.getElementById('task-create');
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

    async createTaskAction() {
      try {
        this.errorMessage = '';

        if (!this.title.trim()) {
          this.errorMessage = 'Title is required';
          return;
        }

        const response = await createTask(board_id, this.title, this.description);

        this.openModal('Success', `Task "${this.title}" has been created!`);

        if (typeof onTaskCreated === 'function') {
          onTaskCreated(response);
        }

        this.title = '';
        this.description = '';

      } catch (err) {
        this.openModal('Error', err.message || 'Unknown error');
      }
    },

  }).mount('#task-create');
}
