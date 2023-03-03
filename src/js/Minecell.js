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

    this._cellElemsArr = [];
    this._cellsArrLength = Math.pow(cellSideLength, 2);

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

  _filterRandIndexArr(arr) {
    const filtredArr = arr.reduce((acc, item) => {
      if(acc.find(ind => ind === item)) {
        return acc;
      }
      return [...acc, item];
    }, []);

    console.log(arr.length, filtredArr.length, filtredArr.filter((item, index) => index < this._minesArrLength).length);

    return filtredArr.filter((item, index) => index < this._minesArrLength);
  }

  _setRandIndexArr() {
    const multiplier = this._cellsArrLength - 1;
    const indexArr = [];
    let i = 0;
    while (i < this._cellsArrLength) {
      indexArr.push(Math.round(Math.random() * multiplier));
      i++;
    }

    return this._filterRandIndexArr(indexArr);
  }

  _setMineElems() {
    this._mineElemsArr = this._setRandIndexArr().map(item => this._cellElemsArr[item]);
    this._mineElemsArr.forEach((item) => {
      item.classList.add(this._mineClassName);
    });
  }

  _setInitActive(e) {
    console.log(`1: ${this._isInit}`);
    if(!this._isInit) {
      this._setMineElems();
      this._isInit = !this._isInit;
      this._cellElemsArr.forEach((item) => {
        item.removeEventListener('click', this._setInitActive);
      });
    };
    console.log(`2: ${this._isInit}`);
  }

  _setEventListeners(el) {
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
      this._cellElemsArr.push(cellEl);
      this._setEventListeners(cellEl);
      i++;
    }
  }
}
