export const game = {
  timerId: -1,
  lastTime: 0,
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
  /** @type {HTMLDivElement} */
  get stageElem() {
    return document.getElementById('stage');
  }
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
