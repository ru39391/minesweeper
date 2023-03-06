import { Minecell } from './Minecell';
import {
  CELL_ROW_LENGTH,
  MINES_LENGTH,
  WRAPPER_SEL,
  BTN_CLASSNAME,
  BTN_SUCCESS_CLASSNAME,
  BTN_FAIL_CLASSNAME,
  BTN_WARNING_CLASSNAME,
  CELL_CLASSNAME,
  CELL_MARKED_CLASSNAME,
  CELL_SPOTTED_CLASSNAME,
  MINE_CLASSNAME,
  COUNTER_SEL,
  TIMER_SEL,
  DIGIT_SEL,
} from '../../js/utils/constants';

const mineCell = new Minecell({
  wrapperSel: WRAPPER_SEL,
  btnClassName: BTN_CLASSNAME,
  btnSuccessClassName: BTN_SUCCESS_CLASSNAME,
  btnFailClassName: BTN_FAIL_CLASSNAME,
  btnWarningClassName: BTN_WARNING_CLASSNAME,
  cellClassName: CELL_CLASSNAME,
  cellMarkedClassName: CELL_MARKED_CLASSNAME,
  cellSpottedClassName: CELL_SPOTTED_CLASSNAME,
  mineClassName: MINE_CLASSNAME,
  counterSel: COUNTER_SEL,
  timerSel: TIMER_SEL,
  digitSel: DIGIT_SEL,
  cellRowLength: CELL_ROW_LENGTH,
  minesLength: MINES_LENGTH
});

mineCell.init();
