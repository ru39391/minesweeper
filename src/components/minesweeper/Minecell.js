import { CELL_ROW_LENGTH, MINES_LENGTH } from '../../js/utils/constants';

export class Minecell {
  constructor({
    wrapperSel,
    btnClassName,
    btnSuccessClassName,
    btnFailClassName,
    btnWarningClassName,
    cellClassName,
    cellMarkedClassName,
    cellSpottedClassName,
    mineClassName,
    counterSel,
    timerSel,
    digitSel,
    cellRowLength,
    minesLength
  }) {
    this._wrapperEl = document.querySelector(wrapperSel);

    this._btnClassName = btnClassName;
    this._btnSuccessClassName = btnSuccessClassName;
    this._btnFailClassName = btnFailClassName;
    this._btnWarningClassName = btnWarningClassName;
    this._togglerBtn = document.querySelector(`.${this._btnClassName}`);

    this._cellClassName = cellClassName;
    this._cellMarkedClassName = cellMarkedClassName;
    this._cellSpottedClassName = cellSpottedClassName;
    this._mineClassName = mineClassName;

    this._digitSel = digitSel;
    this._counterEl = document.querySelector(counterSel);
    this._counterDigitsArr = Array.from(this._counterEl.querySelectorAll(this._digitSel));

    this._isTimerStopped = false;
    this._timerEl = document.querySelector(timerSel);
    this._timerDigitsArr = Array.from(this._timerEl.querySelectorAll(this._digitSel));

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
    this._handleCells = this._handleCells.bind(this);
    this._setAlert = this._setAlert.bind(this);
  }

  _createEl(data) {
    const { tagName, className, parentEl, type = 'button' } = data;
    const el = document.createElement(tagName);
    el.type = type;
    el.classList.add(className);
    parentEl.append(el);

    return el;
  }

  _resetClassList(el, className = this._cellClassName) {
    const classListArr = Array.from(el.classList);

    for(let i = 0; i < classListArr.length; i++) {
      if(classListArr[i] !== className) {
        el.classList.remove(classListArr[i]);
      }
    };
  }

  _setStyleParams(idx, length, isMine = false) {
    const offsets = {
      x: Boolean(length) ? length - 1 : 1,
      y: Boolean(length) ? 1 : length
    };
    if(isMine) {
      offsets.y = 0;
    }
    const { x, y } = offsets;
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

  _getEmptyCellsDataArr(randIdxArr) {
    const emptyCellsArr = this._cellElemsArr.filter((item, index) => !randIdxArr.includes(index));

    return {
      emptyCellsDataArr: emptyCellsArr.map((item) => {
        const emptyCellIdx = this._getIdx(item);
        const { siblingsIdxArr } = this._getSiblingsIdx(emptyCellIdx);
        return {
          idx: emptyCellIdx,
          minesCounter: siblingsIdxArr.filter(item => randIdxArr.includes(item)).length,
        };
      })
    };
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

    this._emptyCellsArr.push(targetIdx);
    this._unsetEventListeners(this._getElem(targetIdx));
    this._resetClassList(this._getElem(targetIdx));
    this._setStyleParams(targetIdx, targetIdxCounter);

    if(isSiblingsEmpty) {
      const emptyCellsDataArr = siblingsIdxArr.map((item) => {
        return this._emptyCellsDataArr.find(data => data.idx === item);
      });

      emptyCellsDataArr.forEach((item) => {
        const { idx, minesCounter } = item;

        this._emptyCellsArr.push(idx);
        this._unsetEventListeners(this._getElem(idx));
        this._resetClassList(this._getElem(idx));
        this._setStyleParams(idx, minesCounter);
      });
    }
  }

  _setSuccessed() {
    const { diffItemsArr } = this._getDiffItemsArr(this._emptyCellsArr);

    if(diffItemsArr.length === this._emptyCellsCounter) {
      this._isTimerStopped = true;
      this._togglerBtn.classList.add(this._btnSuccessClassName);
      this._mineElemsArr.forEach((item) => {
        this._unsetEventListeners(item);
        this._resetClassList(item);
        this._setStyleParams(this._getIdx(item), 6, true)
      });
    };
  }

  _setFailed(elem, idx) {
    const currElIdx = this._mineElemsArr.indexOf(elem);
    const { diffItemsArr } = this._getDiffItemsArr(this._markedCellsArr);
    const markedMinesArr = this._mineElemsArr.map((item) => {
      return {
        el: item,
        isMarked: diffItemsArr.includes(item),
      }
    });

    this._resetClassList(elem);
    this._setStyleParams(idx, 7, true);

    markedMinesArr.splice(currElIdx, 1);
    markedMinesArr.forEach((item) => {
      const { el, isMarked } = item;
      const index = this._getIdx(el);

      this._resetClassList(el);
      isMarked ? this._setStyleParams(index, 8, true) : this._setStyleParams(index, 6, true);
    });

    this._cellElemsArr.forEach((item) => {
      this._unsetEventListeners(item);
    });

    this._isTimerStopped = true;
    this._togglerBtn.classList.add(this._btnFailClassName);
  }

  _setAlert(e) {
    this._togglerBtn.classList.add(this._btnWarningClassName);
  }

  _setCellOpened(e) {
    const { target } = e;
    const currCellIdx = this._getIdx(target);

    if(this._mineElemsArr.length && !this._mineElemsArr.includes(target)) {
      this._openCells(currCellIdx);
      this._setSuccessed();
    } else {
      this._setFailed(target, currCellIdx);
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
        this._markedCellsArr.push(target);
        classList.add(this._cellMarkedClassName);
        break;

      case 1:
        Object.values(checkedCellsArr).forEach((key) => {
          this[key].push(target);
        });
        classList.add(this._cellSpottedClassName);
        break;

      case 2:
        Object.values(checkedCellsArr).forEach((key) => {
          const arr = this[key].map((item) => {
            return item === target ? null : item;
          });
          this[key] = arr.filter(item => item !== null);
        });
        classList.remove(this._cellMarkedClassName);
        classList.remove(this._cellSpottedClassName);
        break;
    }
  }

  _resetCounters() {
    this._isTimerStopped = true;
    this._counterDigitsArr.concat(this._timerDigitsArr).forEach((item) => {
      setTimeout(() => {
        item.removeAttribute('style');
      }, 1000);
    });
  }

  _setDigits(digitWrappersArr, value) {
    const digitsArr = value.toString().split('');

    while (digitsArr.length < digitWrappersArr.length) {
      digitsArr.unshift('0');
    }

    digitsArr.forEach((item, index) => {
      const digit = Number(item);
      const digitOffset = Boolean(digit) ? digit - 1 : 9;
      digitWrappersArr[index].style = `--digit-offset:${digitOffset};`;
    });
  }

  _countMines() {
    const { diffItemsArr } = this._getDiffItemsArr(this._markedCellsArr);
    this._setDigits(this._counterDigitsArr, diffItemsArr.length);
  }

  _handleCells(e) {
    const { button } = e;

    this._togglerBtn.classList.remove(this._btnWarningClassName);
    if(this._mineElemsArr.length) {
      switch(button) {
        case 0:
          this._setCellOpened(e);
          break;

        case 2:
          this._markCells(e);
          this._countMines();
          break;
      }
    }
  }

  _setElemsType() {
    const { randIdxArr } = this._createRandIdxArr();
    const { emptyCellsDataArr } = this._getEmptyCellsDataArr(randIdxArr);

    this._mineElemsArr = this._getElemsArr(randIdxArr);
    this._emptyCellsDataArr = emptyCellsDataArr;

    this._openCells();
  }

  _initTimer() {
    this._isTimerStopped = false;
    let i = 0;
    const timer = setInterval(() => {
      this._setDigits(this._timerDigitsArr, i++);
      if(this._isTimerStopped) {
        clearInterval(timer);
      }
    }, 1000);
  }

  _setInit(e) {
    const { target } = e;

    if(!this._mineElemsArr.length) {
      this._initCellIdx = this._getIdx(target);
      this._setElemsType();
      this._initTimer();

      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInit);
      });
    };
  }

  _setTogglerEvtListeners() {
    this._togglerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this._reset();
    });
  }

  _unsetEventListeners(el) {
    el.removeEventListener('mousedown', this._setAlert);
    el.removeEventListener('mouseup', this._handleCells);
  }

  _setEventListeners(el) {
    el.addEventListener('mousedown', this._setAlert);
    el.addEventListener('mouseup', this._handleCells);
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

    this._cellElemsArr.forEach((item) => {
      item.remove();
      item = null;
    });
    Object.values(keysData).forEach((key) => {
      this[key] = [];
    });
    this._initCellIdx = null;
    this._resetCounters();
    this._resetClassList(this._togglerBtn, this._btnClassName);
    this.init();
  }

  init() {
    let i = 0;
    while (i < this._cellsArrLength) {
      const cellEl = this._createEl({
        tagName: 'button',
        className: this._cellClassName,
        parentEl: this._wrapperEl
      });
      this._cellElemsArr.push(cellEl);
      this._initEvents(cellEl);
      this._setEventListeners(cellEl);
      i++;
    }

    this._setTogglerEvtListeners();
  }
}
