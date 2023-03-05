import { CELL_ROW_LENGTH, MINES_LENGTH } from '../../js/utils/constants';

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

    this._emptyCellsCounter = this._cellsArrLength - this._minesArrLength;
    this._emptyCellsArr = [];
    this._emptyCellsDataArr = [];

    this._markedCellsArr = [];
    this._spottedCellsArr = [];

    this._setInit = this._setInit.bind(this);
    this._setCellOpened = this._setCellOpened.bind(this);
    this._setCellMarked = this._setCellMarked.bind(this);
  }

  _createEl(data) {
    const {tagName, className, parentEl} = data;
    const el = document.createElement(tagName);

    el.classList.add(className);
    parentEl.append(el);

    return el;
  }

  _setStyleParams(idx, length) {
    const offsets = {
      x: Boolean(length) ? length - 1 : 1,
      y: Boolean(length) ? 1 : length
    };
    const { x, y} = offsets;
    this._cellElemsArr[idx].style = `--cell-offset-x:${x};--cell-offset-y:${y};`;
  }

  _getIdx(el) {
    return this._cellElemsArr.indexOf(el);
  }

  _getIdxArr(elsArr) {
    return elsArr.map(item => this._getIdx(item));
  }

  _getElem(idx) {
    return this._cellElemsArr[idx];
  }

  _getElemsArr(idxArr) {
    return idxArr.map(item => this._cellElemsArr[item]);
  }

  _getDiffItemsArr(itemsArr) {
    return {
      diffItemsArr: itemsArr.reduce((acc, item) => {
        if(acc.find(accItem => accItem === item)) {
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
    const { diffItemsArr } = this._getDiffItemsArr(idxArr);
    return {
      randIdxArr: diffItemsArr.filter((item, index) => index < this._minesArrLength)
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
      const emptyCellIdx = this._getIdx(item);
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

  _openCells(targetIdx = this._initCellIdx) {
    const { siblingsIdxArr } = this._getSiblingsIdx(targetIdx);
    const { isSiblingsEmpty, targetIdxCounter } = this._isSiblingsEmpty(targetIdx);

    this._setStyleParams(targetIdx, targetIdxCounter);
    this._emptyCellsArr.push(targetIdx);
    this._getElem(targetIdx).removeEventListener('click', this._setCellOpened);
    this._getElem(targetIdx).removeEventListener('mousedown', this._setCellMarked);

    if(isSiblingsEmpty) {
      const emptyCellsDataArr = siblingsIdxArr.map((item) => {
        return this._emptyCellsDataArr.find(data => data.idx === item);
      });

      emptyCellsDataArr.forEach((item) => {
        const { idx, minesCounter } = item;
        this._setStyleParams(idx, minesCounter);

        this._emptyCellsArr.push(idx);
        this._getElem(idx).removeEventListener('click', this._setCellOpened);
        this._getElem(idx).removeEventListener('mousedown', this._setCellMarked);
      });
    }

    /**/
    const { diffItemsArr } = this._getDiffItemsArr(this._emptyCellsArr);
    console.log(diffItemsArr.length, this._emptyCellsCounter, diffItemsArr.length === this._emptyCellsCounter);
    if(diffItemsArr.length === this._emptyCellsCounter) {
      alert('!!!!!!!!!!!!!!!!');
    };
  }

  _setElemsType() {
    const { randIdxArr } = this._createRandIdxArr();

    this._mineElemsArr = this._getElemsArr(randIdxArr);
    this._setEmptyCells(randIdxArr);
    this._openCells()

    /**/
    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setCellOpened(e) {
    const { target } = e;

    if(this._mineElemsArr.length && !this._mineElemsArr.includes(target)) {
      const currCellIdx = this._getIdx(target);
      this._openCells(currCellIdx);

      //console.log('empty cell');
    } else {
      console.log('mine');
    }
  }

  _markCells(e) {
    const { target } = e;
    const classList = target.classList;
    const checkedCounter = this._markedCellsArr.filter(item => item === target).length;
    const checkedCellsArr = {
      markedCellsKey: '_markedCellsArr',
      spottedCellsKey: '_spottedCellsArr'
    }

    target.oncontextmenu = () => {
      return false;
    };

    switch(checkedCounter) {
      case 0:
        //console.log(targetIdx, 'установили флажок');
        this._markedCellsArr.push(target);

        classList.add('minesweeper__cell_type_marked');
        break;

      case 1:
        //console.log(targetIdx, 'установили вопрос');
        Object.values(checkedCellsArr).forEach((key) => {
          this[key].push(target);
        });

        classList.add('minesweeper__cell_type_spotted');
        break;

      case 2:
        //console.log(targetIdx, 'сняли выделение');
        Object.values(checkedCellsArr).forEach((key) => {
          const arr = this[key].map((item) => {
            return item === target ? null : item;
          });
          this[key] = arr.filter(item => item !== null);
        });

        classList.remove('minesweeper__cell_type_marked');
        classList.remove('minesweeper__cell_type_spotted');

        break;
    }

    const { diffItemsArr } = this._getDiffItemsArr(this._markedCellsArr);
    document.querySelector('h1').textContent = diffItemsArr.length;

    //console.log(this._getIdxArr(this._markedCellsArr), this._getIdxArr(this._spottedCellsArr), checkedCounter);
  }

  _setCellMarked(e) {
    const { button } = e;

    if(this._mineElemsArr.length) {
      switch(button) {
        case 0:
          this._setCellOpened(e);
          break;

        case 2:
          this._markCells(e);
          //console.log('button', button);
          break;
      }
    }
  }

  _setInit(e) {
    console.log(`isInit before: `, Boolean(this._mineElemsArr.length));
    const { target } = e;

    if(!this._mineElemsArr.length) {
      this._initCellIdx = this._getIdx(target);
      this._setElemsType();

      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInit);
      });
    };
    console.log(`isInit after: `, Boolean(this._mineElemsArr.length));
  }

  _setEventListeners(el) {
    el.addEventListener('click', this._setCellOpened);
    el.addEventListener('mousedown', this._setCellMarked);
  }

  _initEvents(el) {
    el.addEventListener('click', this._setInit);
  }

  _reset() {
    const keysData = {
      cellElemsArr: '_cellElemsArr',
      mineElemsArr: '_mineElemsArr',
      emptyCellsArr: '_emptyCellsArr',
      emptyCellsDataArr: '_emptyCellsDataArr',
      markedCellsArr: '_markedCellsArr',
      spottedCellsArr: '_spottedCellsArr',
    };

    this._initCellIdx = null;
    Object.values(keysData).forEach((key) => {
      this[key] = [];
      console.log(this);
    });
  }

  init() {
    let i = 0;
    while (i < this._cellsArrLength) {
      const cellEl = this._createEl({
        tagName: 'div',
        className: this._cellClassName,
        parentEl: this._wrapperEl
      });
      this._cellElemsArr.push(cellEl);
      this._initEvents(cellEl);
      this._setEventListeners(cellEl);
      i++;
    }
  }
}
