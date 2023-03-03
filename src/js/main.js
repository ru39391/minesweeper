import '../../vendor/fonts.scss';
import '../styles/main.scss';

import { Minecell } from './Minecell';

const wrapperEl = document.querySelector('.minesweeper__wrapper');
const mineCell = new Minecell({
  wrapperEl,
  cellClassName: 'minesweeper__cell',
  mineClassName: 'minesweeper__cell_type_mine',
  cellSideLength: 16,
  minesLength: 40
});
//console.log(mineCell);
mineCell.init();
