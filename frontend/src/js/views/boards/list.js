import { createApp } from 'https://unpkg.com/petite-vue?module';
import { getBoards } from '../../api/boards.js';

export function mountBoardList() {
  createApp({
    boards: [],

    goToDetail(id) {
      const board = this.boards.find(b => b.id === id);
      if (board) {
        window.activeBoard = board;
        window.loadView(`./forms/boards/detail.html?id=${id}`);
      }
    }
  }).mount('#board-list');
}

export async function loadBoardsToNavbar() {
  const nav = document.getElementById('board-nav');
  nav.innerHTML = '';
  const header = document.getElementById('dashboard-header');
  if (header) header.style.display = '';

  try {
    const boards = await getBoards();

    if (!boards || boards.length === 0) {
      // no boards - leave navbar empty and hide header
      nav.innerHTML = '';
      if (header) header.style.display = 'none';
      return;
    }

    boards.forEach(board => {
      const btn = document.createElement('button');

      btn.textContent = board.title;
      btn.className = 'board-nav-pill';

      btn.onclick = () => {
        window.activeBoard = board;
        window.loadView(`./forms/boards/detail.html?id=${board.id}`);
      };

      nav.appendChild(btn);
    });

  } catch (err) {
    // on error, don't show anything in navbar and hide header
    nav.innerHTML = '';
    if (header) header.style.display = 'none';
  }
}
