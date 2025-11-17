import { createApp } from 'https://unpkg.com/petite-vue?module';
import { updateTask } from '../../api/tasks.js';

export function mountUpdateTask(boardId, task, onUpdateCallback) {
  if (!boardId || !task) {
    return;
  }

  const app = {
    title: task.title || '',
    description: task.description || '',
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',

    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.title = '';
      this.description = '';

      this.closeUpdateView();
    },

    async taskUpdateAction() {
      try {
        this.errorMessage = '';

        if (!this.title.trim()) {
          this.errorMessage = 'Title cannot be empty';
          return;
        }

        await updateTask(boardId, task.id, this.title, this.description);

        this.openModal('Success', `Task ${task.title} has been updated!`);

        if (onUpdateCallback) onUpdateCallback(task.id, this.title, this.description);
      } catch (err) {
        this.openModal('Error', 'Failed to update task: ' + err.message);
      }
    },

    closeUpdateView() {
      const view = document.getElementById('task-update');
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
  };

  const vueApp = createApp(app);
  vueApp.mount('#task-update');
}
