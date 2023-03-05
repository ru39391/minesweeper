import { Minecell } from './Minecell';

const wrapperEl = document.querySelector('.minesweeper__wrapper');
const mineCell = new Minecell({
  wrapperEl,
  cellClassName: 'minesweeper__cell',
  mineClassName: 'minesweeper__cell_type_mine',
  cellRowLength: 16,
  minesLength: 40
});

mineCell.init();
