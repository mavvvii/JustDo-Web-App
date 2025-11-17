import { deleteTask } from '../../api/tasks.js';
import { createApp } from 'https://unpkg.com/petite-vue?module';

export function mountDeleteTask(boardId, taskId, taskTitle, onTaskDeleted) {
  if (!taskId || !boardId || !taskTitle) {
    return;
  }

  createApp({
    taskId,
    boardId,
    taskTitle,
    errorMessage: '',
    showModal: false,
    modalTitle: '',
    modalMessage: '',
    isDeleting: false,

    closeModal() {
      this.showModal = false;
      this.closeDeleteView();
    },

    openModal(title, message) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.showModal = true;
    },

    closeDeleteView() {
      const view = document.getElementById('task-delete');
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

    async deleteTaskAction() {
      this.errorMessage = '';
      this.isDeleting = true;

      try {
        await deleteTask(this.boardId, this.taskId);

        this.isDeleting = false;

        this.openModal('Success', `Task "${this.taskTitle}" has been deleted!`);

        if (typeof onTaskDeleted === 'function') {
          await onTaskDeleted(this.taskId);
        }

        this.title = '';
        this.description = '';

      } catch (err) {
        this.isDeleting = false;
        this.openModal('Error', err.message || 'Unknown error');
      }
    },

  }).mount('#task-delete');
}
