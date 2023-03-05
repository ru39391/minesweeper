import { CELL_ROW_LENGTH, MINES_LENGTH } from './utils/constants';

export class Minecell {
  constructor({
    wrapperEl,
    cellClassName,
    mineClassName,
    cellRowLength,
    minesLength
  }) {
    this._wrapperEl = wrapperEl;
    this._cellClassName = cellClassName;
    this._mineClassName = mineClassName;

    this._initCellIdx = null;
    this._cellElemsArr = [];
    this._cellRowLength = Boolean(cellRowLength) ? Number(cellRowLength) : Number(CELL_ROW_LENGTH);
    this._cellsArrLength = Math.pow(this._cellRowLength, 2);

    this._mineElemsArr = [];
    this._minesArrLength = Boolean(minesLength) ? Number(minesLength) : Number(MINES_LENGTH);

    this._emptyCellsDataArr = [];

    this._setCellHandled = this._setCellHandled.bind(this);
    this._setInit = this._setInit.bind(this);
  }

  _createEl(data) {
    const {tagName, className, parentEl} = data;
    const el = document.createElement(tagName);

    el.classList.add(className);
    parentEl.append(el);

    return el;
  }

  _setStyleParams(idx, length) {
    this._cellElemsArr[idx].textContent = length > 0 ? length.toString() : '';
    this._cellElemsArr[idx].classList.add('minesweeper__cell_active');
  }

  _getElem(idx) {
    return this._cellElemsArr.find((item, index) => index === idx);
  }

  _getElemsArr(idxArr) {
    return idxArr.map(item => this._cellElemsArr[item]);
  }

  _getDiffIdxArr(idxArr) {
    return {
      filtredArr: idxArr.reduce((acc, item) => {
        if(acc.find(ind => ind === item)) {
          return acc;
        }
        return [...acc, item];
      }, [])
    };
  }

  _createRandIdxArr() {
    const multiplier = this._cellsArrLength - 1;
    const idxArr = [];
    let i = 0;
    while (i < this._cellsArrLength) {
      idxArr.push(Math.round(Math.random() * multiplier));
      i++;
    }

    const initCellIdx = idxArr.indexOf(this._initCellIdx);
    if(idxArr.includes(this._initCellIdx)) {
      idxArr.splice(initCellIdx, 1);
    }

    console.log(`init index`, this._initCellIdx);
    console.log(`init index in rand arr: `, initCellIdx);
    const { filtredArr } = this._getDiffIdxArr(idxArr);
    return {
      randIdxArr: filtredArr.filter((item, index) => index < this._minesArrLength)
    }
  }

  _getSiblingsIdx(targetIdx) {
    const positions = {
      top: targetIdx - this._cellRowLength,
      right: targetIdx + 1,
      bottom: targetIdx + this._cellRowLength,
      left: targetIdx - 1
    };
    const { top, right, bottom } = positions;

    const isSide = {
      isTopSide: !(top >= 0),
      isRightSide: !(right % this._cellRowLength),
      isBottomSide: !(bottom < this._cellsArrLength),
      isLeftSide: !(targetIdx % this._cellRowLength),
    };
    const { isRightSide, isLeftSide } = isSide;

    const filtredSiblings = (siblingsArr) => {
      return siblingsArr.filter((item, index, arr) => {
        if(isRightSide) {
          return index !== arr.length - 1;
        } else if(isLeftSide) {
          return index !== 0;
        }
        return arr;
      });
    };

    const getSiblings = (data, index, siblings) => {
      return Object.values(data)[index] ? null : siblings
    };

    const sideSiblingsArr = Object.values(positions).map((item, index) => {
      return [0,2].includes(index) ? getSiblings(isSide, index, filtredSiblings([item - 1, item, item + 1])) : getSiblings(isSide, index, item);
    });

    return {
      siblingsIdxArr: sideSiblingsArr.filter(item => item !== null).flat()
    }
  }

  _setEmptyCells(randIdxArr) {
    const emptyCellsArr = this._cellElemsArr.filter((item, index) => !randIdxArr.includes(index));

    this._emptyCellsDataArr = emptyCellsArr.map((item) => {
      const emptyCellIdx = this._cellElemsArr.indexOf(item);
      const { siblingsIdxArr } = this._getSiblingsIdx(emptyCellIdx);
      return {
        idx: emptyCellIdx,
        minesCounter: siblingsIdxArr.filter(item => randIdxArr.includes(item)).length,
      };
    });
  }

  _isSiblingsEmpty(targetIdx) {
    const { minesCounter } = this._emptyCellsDataArr.find(item => item.idx === targetIdx);
    return {
      targetIdxCounter: minesCounter,
      isSiblingsEmpty: !Boolean(minesCounter)
    };
  }

  _handleCells(targetIdx = this._initCellIdx) {
    const { siblingsIdxArr } = this._getSiblingsIdx(targetIdx);
    const { isSiblingsEmpty, targetIdxCounter } = this._isSiblingsEmpty(targetIdx);

    this._setStyleParams(targetIdx, targetIdxCounter);
    this._getElem(targetIdx).removeEventListener('click', this._setCellHandled);

    if(isSiblingsEmpty) {
      const emptyCellsDataArr = siblingsIdxArr.map((item) => {
        return this._emptyCellsDataArr.find(data => data.idx === item);
      });

      emptyCellsDataArr.forEach((item) => {
        const { idx, minesCounter } = item;
        this._setStyleParams(idx, minesCounter);
        this._getElem(idx).removeEventListener('click', this._setCellHandled);
      });
    }
  }

  _setElemsType() {
    const { randIdxArr } = this._createRandIdxArr();

    this._mineElemsArr = this._getElemsArr(randIdxArr);
    this._setEmptyCells(randIdxArr);
    this._handleCells()

    /**/
    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setCellHandled(e) {
    const { target } = e;

    if(this._mineElemsArr.length && !this._mineElemsArr.includes(target)) {
      const currCellIdx = this._cellElemsArr.indexOf(target);
      this._handleCells(currCellIdx);
      console.log('empty cell');
    } else {
      console.log('mine');
    }
  }

  _setInit(e) {
    console.log(`isInit before: `, Boolean(this._mineElemsArr.length));
    const { target } = e;

    if(!this._mineElemsArr.length) {
      this._initCellIdx = this._cellElemsArr.indexOf(target);
      this._setElemsType();

      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInit);
      });
    };
    console.log(`isInit after: `, Boolean(this._mineElemsArr.length));
  }

  _setEventListeners(el) {
    el.addEventListener('click', this._setCellHandled);
  }

  _initEvents(el) {
    el.addEventListener('click', this._setInit);
  }

  init() {
    let i = 0;
    while (i < this._cellsArrLength) {
      const cellEl = this._createEl({
        tagName: 'div',
        className: this._cellClassName,
        parentEl: this._wrapperEl
      });
      cellEl.textContent = i.toString();
      this._cellElemsArr.push(cellEl);
      this._initEvents(cellEl);
      this._setEventListeners(cellEl);
      i++;
    }
  }
}
