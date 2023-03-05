import { Minecell } from './Minecell';

const mineCell = new Minecell({
  wrapperSel: '.minesweeper__wrapper',
  btnClassName: 'minesweeper__btn',
  btnSuccessClassName: 'minesweeper__btn_type_success',
  btnFailClassName: 'minesweeper__btn_type_fail',
  cellClassName: 'minesweeper__cell',
  cellMarkedClassName: 'minesweeper__cell_type_marked',
  cellSpottedClassName: 'minesweeper__cell_type_spotted',
  mineClassName: 'minesweeper__cell_type_mine',
  counterSel: '.minesweeper__counter',
  timerSel: '.minesweeper__timer',
  digitSel: '.minesweeper__digit',
  cellRowLength: 16,
  minesLength: 40
});

mineCell.init();
