import { Minecell } from './Minecell';

const wrapperEl = document.querySelector('.minesweeper__wrapper');
const mineCell = new Minecell({
  wrapperEl,
  btnClassName: 'minesweeper__btn',
  btnSuccessClassName: 'minesweeper__btn_type_success',
  btnFailClassName: 'minesweeper__btn_type_fail',
  cellClassName: 'minesweeper__cell',
  cellMarkedClassName: 'minesweeper__cell_type_marked',
  cellSpottedClassName: 'minesweeper__cell_type_spotted',
  mineClassName: 'minesweeper__cell_type_mine',
  cellRowLength: 16,
  minesLength: 40
});

mineCell.init();
