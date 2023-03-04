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

    this._isInit = false;
    this._setInitActive = this._setInitActive.bind(this);
  }

  _createEl(data) {
    const {tagName, className, parentEl} = data;
    const el = document.createElement(tagName);

    el.classList.add(className);
    parentEl.append(el);

    return el;
  }

  _getElemsArr(arr) {
    return arr.map(item => this._cellElemsArr[item]);
  }

  _getDiffElems(arr) {
    //console.log(arr.length, filtredArr.length, filtredArr.filter((item, index) => index < this._minesArrLength).length);
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
    //console.log(sideSiblingsArr.filter(item => item !== null).flat());
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

    /**/
    this._emptyCellsDataArr.forEach((item) => {
      const { idx, minesCounter } = item;
      if(minesCounter) {
        this._cellElemsArr[idx].textContent = minesCounter.toString();
        this._cellElemsArr[idx].style = `color:#000;background-color:#ccc;`;
      }
    });
  }

  _isSiblingsEmpty(target = this._initCellIdx) {
    const { minesCounter } = this._emptyCellsDataArr.find(item => item.idx === target);
    return !Boolean(minesCounter);
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
    this._isSiblingsEmpty();

    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setInitActive(e) {
    console.log(`isInit before: `, this._isInit);
    const { target } = e;

    if(!this._isInit) {
      this._isInit = !this._isInit;
      this._initCellIdx = this._cellElemsArr.indexOf(target);
      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInitActive);
      });
      this._setElemsType();
    };
    console.log(`isInit after: `, this._isInit);
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
      i++;
    }
  }
}
