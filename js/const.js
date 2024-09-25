export const Icon = {
  pause: '<svg t="1717924085723" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5499" width="12" height="12"><path d="M426.666667 138.666667v746.666666a53.393333 53.393333 0 0 1-53.333334 53.333334H266.666667a53.393333 53.393333 0 0 1-53.333334-53.333334V138.666667a53.393333 53.393333 0 0 1 53.333334-53.333334h106.666666a53.393333 53.393333 0 0 1 53.333334 53.333334z m330.666666-53.333334H650.666667a53.393333 53.393333 0 0 0-53.333334 53.333334v746.666666a53.393333 53.393333 0 0 0 53.333334 53.333334h106.666666a53.393333 53.393333 0 0 0 53.333334-53.333334V138.666667a53.393333 53.393333 0 0 0-53.333334-53.333334z" fill="#5C5C66" p-id="5500"></path></svg>',
  play: '<svg t="1717926943187" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5648" width="12" height="12"><path d="M870.2 466.333333l-618.666667-373.28a53.333333 53.333333 0 0 0-80.866666 45.666667v746.56a53.206667 53.206667 0 0 0 80.886666 45.666667l618.666667-373.28a53.333333 53.333333 0 0 0 0-91.333334z" fill="#5C5C66" p-id="5649"></path></svg>',
};

export const game = {
  get mapSize() {
    return { row: 20, col: 10 };
  },
  get predictSize() {
    return { row: 4, col: 4 };
  },
  /** 主区实际的方块数 */
  get squaresNum() {
    return (this.mapSize.row + 1) * this.mapSize.col;
  },
  /** @type {HTMLDivElement}} */
  get mainElem() {
    return document.querySelector('main');
  },
  /** @type {HTMLSpanElement} */
  get scoreElem() {
    return document.getElementById('score');
  },
  /** @type {HTMLDivElement} */
  get predictElem() {
    return document.getElementById('predict');
  },
  /** @type {HTMLButtonElement} */
  get switchElem() {
    return document.getElementById('switch');
  },
};

/** @param {number} colNum */
export const genShapeDic = colNum => ({
  L: [
    [1,colNum+1,colNum*2+1,2],
    [colNum,colNum+1,colNum+2,colNum*2+2],
    [1,colNum+1,colNum*2+1,colNum*2],
    [colNum,colNum*2,colNum*2+1,colNum*2+2],
  ],
  Z: [
    [0,colNum,colNum+1,colNum*2+1],
    [colNum+1,colNum+2,colNum*2,colNum*2+1],
    [0,colNum,colNum+1,colNum*2+1],
    [colNum+1,colNum+2,colNum*2,colNum*2+1],
  ],
  T: [
    [1,colNum,colNum+1,colNum+2],
    [1,colNum+1,colNum+2,colNum*2+1],
    [colNum,colNum+1,colNum+2,colNum*2+1],
    [1,colNum,colNum+1,colNum*2+1],
  ],
  O: [
    [0,1,colNum,colNum+1],
    [0,1,colNum,colNum+1],
    [0,1,colNum,colNum+1],
    [0,1,colNum,colNum+1],
  ],
  I: [
    [1,colNum+1,colNum*2+1,colNum*3+1],
    [colNum,colNum+1,colNum+2,colNum+3],
    [1,colNum+1,colNum*2+1,colNum*3+1],
    [colNum,colNum+1,colNum+2,colNum+3],
  ],
});

export const shapeDic = genShapeDic(game.mapSize.col);
export const perdictDic = genShapeDic(game.predictSize.col);

/** @type {function(number): HTMLDivElement} */
export const Square = i => game.squares[i];

/** @type {function(number): function(number[]): boolean} */
export const isAtEdge = R.curry(
  (colEdge, indexList) => {
    return R.any(
      R.compose(
        R.equals(colEdge),
        R.modulo(R.__, game.mapSize.col)
      ),
      indexList
    );
  }
);

/** @type {function(MoveTo): number} */
export const ColEdge = R.prop(R.__, { left: 0, right: game.mapSize.col - 1 });
