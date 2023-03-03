export class Minecell {
  constructor({
    wrapperEl,
    cellClassName,
    mineClassName,
    cellSideLength,
    minesLength
  }) {
    this._wrapperEl = wrapperEl;
    this._cellClassName = cellClassName;
    this._mineClassName = mineClassName;

    this._initCellIndex = null;
    this._cellElemsArr = [];
    this._cellSideLength = cellSideLength;
    this._cellsArrLength = Math.pow(this._cellSideLength, 2);

    this._mineElemsArr = [];
    this._minesArrLength = minesLength;

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

  _removeEqElems(arr) {
    const filtredArr = arr.reduce((acc, item) => {
      if(acc.find(ind => ind === item)) {
        return acc;
      }
      return [...acc, item];
    }, []);

    console.log(arr.length, filtredArr.length, filtredArr.filter((item, index) => index < this._minesArrLength).length);

    /*
    console.log(array.map((item, index) => {
    }));
    */

    return filtredArr;
  }

  _getSinbings(target) {
    const positions = {
      top: target - this._cellSideLength,
      right: target + 1,
      bottom: target + this._cellSideLength,
      left: target - 1
    };
    const { top, right, bottom, left } = positions;

    const isSide = {
      isTopSide: !(top >= 0),
      isRightSide: !(right % this._cellSideLength),
      isBottomSide: !(bottom < this._cellsArrLength),
      isLeftSide: !(target % this._cellSideLength),
    };
    const { isTopSide, isRightSide, isBottomSide, isLeftSide } = isSide;

    const siblingsData = {
      topSiblings: isTopSide ? !isTopSide : [top - 1, top, top + 1],
      rightSiblings: isRightSide ? !isRightSide : right,
      bottomSiblings: isBottomSide ? !isBottomSide : [bottom - 1, bottom, bottom + 1],
      leftSiblings: isLeftSide ? !isLeftSide : left
    };

    console.log(Object.values(isSide).map((item, index) => {
      return item ? !item : Object.values(siblingsData)[index];
    }));
  }

  _setRandIndexArr() {
    const multiplier = this._cellsArrLength - 1;
    const indexArr = [];
    let i = 0;
    while (i < this._cellsArrLength) {
      indexArr.push(Math.round(Math.random() * multiplier));
      i++;
    }

    const initCellIndex = indexArr.indexOf(this._initCellIndex);
    if(initCellIndex >= 0) {
      indexArr.splice(initCellIndex, 1);
    }

    console.log(initCellIndex);
    console.log(this._initCellIndex);
    return this._removeEqElems(indexArr).filter((item, index) => index < this._minesArrLength);
  }

  _setElemsType() {
    this._mineElemsArr = this._setRandIndexArr().map(item => this._cellElemsArr[item]);
    this._getSinbings(this._initCellIndex);


    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setInitActive(e) {
    console.log(`1: ${this._isInit}`);
    const { target } = e;

    if(!this._isInit) {
      this._isInit = !this._isInit;
      this._initCellIndex = this._cellElemsArr.indexOf(target);
      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInitActive);
      });
      this._setElemsType();
    };
    console.log(`2: ${this._isInit}`);
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
