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

    this._setActive = this._setActive.bind(this);
    this._setInitActive = this._setInitActive.bind(this);
  }

  _createEl(data) {
    const {tagName, className, parentEl} = data;
    const el = document.createElement(tagName);

    el.classList.add(className);
    parentEl.append(el);

    return el;
  }

  _setStyleParams(idx, length) {
    this._cellElemsArr[idx].textContent = length.toString();
    this._cellElemsArr[idx].classList.add('minesweeper__cell_active');
  }

  _getElemsArr(arr) {
    return arr.map(item => this._cellElemsArr[item]);
  }

  _getDiffElems(arr) {
    return {
      filtredArr: arr.reduce((acc, item) => {
        if(acc.find(ind => ind === item)) {
          return acc;
        }
        return [...acc, item];
      }, [])
    };
  }

  _getSiblingsIdx(target) {
    const positions = {
      top: target - this._cellRowLength,
      right: target + 1,
      bottom: target + this._cellRowLength,
      left: target - 1
    };
    const { top, right, bottom } = positions;

    const isSide = {
      isTopSide: !(top >= 0),
      isRightSide: !(right % this._cellRowLength),
      isBottomSide: !(bottom < this._cellsArrLength),
      isLeftSide: !(target % this._cellRowLength),
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

    console.log(`is target in arr: `, this._mineElemsArr.includes(target));
    return {
      siblingsIdxArr: sideSiblingsArr.filter(item => item !== null).flat()
    }
  }

  _setEmptyCells(arr) {
    const emptyCellsArr = this._cellElemsArr.filter((item, index) => !arr.includes(index));

    this._emptyCellsDataArr = emptyCellsArr.map((item) => {
      const emptyCellIdx = this._cellElemsArr.indexOf(item);
      const { siblingsIdxArr } = this._getSiblingsIdx(emptyCellIdx);
      return {
        idx: emptyCellIdx,
        minesCounter: siblingsIdxArr.filter(item => arr.includes(item)).length,
      };
    });
  }

  _isSiblingsEmpty(target) {
    const { minesCounter } = this._emptyCellsDataArr.find(item => item.idx === target);
    return {
      targetCounter: minesCounter,
      isSiblingsEmpty: !Boolean(minesCounter)
    };
  }

  _handleCells(target = this._initCellIdx) {
    const { siblingsIdxArr } = this._getSiblingsIdx(target);
    const { isSiblingsEmpty, targetCounter } = this._isSiblingsEmpty(target);

    if(isSiblingsEmpty) {
      const emptyCellsDataArr = siblingsIdxArr.map((item) => {
        return this._emptyCellsDataArr.find(data => data.idx === item);
      });

      emptyCellsDataArr.forEach((item) => {
        const { idx, minesCounter } = item;
        if(minesCounter) {
          this._setStyleParams(idx, minesCounter);
        }
      });
    } else {
      this._setStyleParams(target, targetCounter);
    }
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
    const { filtredArr } = this._getDiffElems(idxArr);
    return {
      randidxArr: filtredArr.filter((item, index) => index < this._minesArrLength)
    }
  }

  _setElemsType() {
    const { randidxArr } = this._createRandIdxArr();

    this._mineElemsArr = this._getElemsArr(randidxArr);
    this._setEmptyCells(randidxArr);
    this._handleCells()

    /**/
    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setActive(e) {
    const { target } = e;

    if(this._mineElemsArr.length) {
      console.log(target);
      //this._handleCells(target);
      //target.removeEventListener('click', this._setActive);
    }
  }

  _setInitActive(e) {
    console.log(`isInit before: `, Boolean(this._mineElemsArr.length));
    const { target } = e;

    if(!this._mineElemsArr.length) {
      this._initCellIdx = this._cellElemsArr.indexOf(target);
      target.removeEventListener('click', this._setActive);

      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInitActive);
      });
      this._setElemsType();
    };
    console.log(`isInit after: `, Boolean(this._mineElemsArr.length));
  }

  _setEventListeners(el) {
    el.addEventListener('click', this._setActive);
  }

  _initEvents(el) {
    el.addEventListener('click', this._setInitActive);
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
