import * as _ from './tool.js';

/** @typedef {'left' | 'right'} MoveTo */

const game = {
  get mapSize() {
    return { row: 20, col: 10 };
  },
  get predictSize() {
   return { row: 4, col: 4 };
  },
  /** @type {HTMLDivElement}} */
  get mainElem() {
    return document.querySelector('main');
  },
  /** @type {HTMLDivElement[]} */
  get squares() {
    return Array.from(this.mainElem.children);
  },
  /** @type {HTMLDivElement} */
  get predictElem() {
    return document.getElementById('predict');
  },
  /** @type {HTMLDivElement[]} */
  get predictSquares() {
    return Array.from(this.predictElem.children);
  },
  /** @type {HTMLButtonElement} */
  get switchElem() {
    return document.getElementById('switch');
  },
};

/** @type {function(MoveTo): number} */
const EdgeValue = R.prop(R.__, { left: 0, right: game.mapSize.col - 1 });

/** @type {function(MoveTo): { left: -1; right: 1; }[MoveTo]} */
const Sign = R.prop(R.__, { left: -1, right: 1 });

const shapeDic = {
  L: [
    [1,game.mapSize.col+1,game.mapSize.col*2+1,2],
    [game.mapSize.col,game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col*2+2],
    [1,game.mapSize.col+1,game.mapSize.col*2+1,game.mapSize.col*2],
    [game.mapSize.col,game.mapSize.col*2,game.mapSize.col*2+1,game.mapSize.col*2+2],
  ],
  Z: [
    [0,game.mapSize.col,game.mapSize.col+1,game.mapSize.col*2+1],
    [game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col*2,game.mapSize.col*2+1],
    [0,game.mapSize.col,game.mapSize.col+1,game.mapSize.col*2+1],
    [game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col*2,game.mapSize.col*2+1],
  ],
  T: [
    [1,game.mapSize.col,game.mapSize.col+1,game.mapSize.col+2],
    [1,game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col*2+1],
    [game.mapSize.col,game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col*2+1],
    [1,game.mapSize.col,game.mapSize.col+1,game.mapSize.col*2+1],
  ],
  O: [
    [0,1,game.mapSize.col,game.mapSize.col+1],
    [0,1,game.mapSize.col,game.mapSize.col+1],
    [0,1,game.mapSize.col,game.mapSize.col+1],
    [0,1,game.mapSize.col,game.mapSize.col+1],
  ],
  I: [
    [1,game.mapSize.col+1,game.mapSize.col*2+1,game.mapSize.col*3+1],
    [game.mapSize.col,game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col+3],
    [1,game.mapSize.col+1,game.mapSize.col*2+1,game.mapSize.col*3+1],
    [game.mapSize.col,game.mapSize.col+1,game.mapSize.col+2,game.mapSize.col+3],
  ],
};

/** @type {function(number): HTMLDivElement} */
const Square = i => game.squares[i];

/** @type {function(number[]): boolean} */
const isTaken = R.any(
  R.compose( _.operateClassList('contains', ['taken']), Square )
);

/** @type {function(number,number[]): boolean} */
const isAtEdge = (edgeValue, indexList) => {
  return R.any(
    R.compose(
      R.equals(edgeValue),
      R.modulo(R.__, game.mapSize.col)
    ),
    indexList
  );
};

/** @type {function(number,number[]): boolean} */
const isOverEdge = R.any(
  R.anyPass([
    R.lt(R.__, 0),
    R.gt(R.__, game.mapSize.col)
  ])
);

const state = {
  score: 0,
  timerId: -1,
  /** @type {'playing' | 'paused'} */
  playStatus: 'paused',
  togglePlayStatus() {
    this.playStatus = 'playing' == this.playStatus ? 'paused' : 'playing';
  },
  angle: 0,
  /** @type {keyof typeof shapeDic} */
  letter: _.RndLetter(shapeDic),
  get shape() {
    return shapeDic[this.letter][this.angle];
  },
  position: {
    row: 0,
    col: game.mapSize.col / 2 - 1,
  },
  get row() {
    return this.position.row;
  },
  get col() {
    return this.position.col;
  },
  get offset() {
    return this.row * game.mapSize.col + this.col;
  },
  /** @type {number[]} */
  get indexList() {
    return this.shape.map(R.add(this.offset));
  },
  predictIndexList(payload) {
    /** @type {{ letter: keyof typeof shapeDic; angle: number; }} */
    const o = Object.assign(R.pick(['letter','angle','row','col'],this), payload);
    const shape = shapeDic[o.letter][o.angle];
    const offset = o.row * game.mapSize.col + o.col;
    return shape.map(R.add(offset));
  },
  reset() {
    this.letter = _.RndLetter(shapeDic);
    this.position.row = 0;
    this.position.col = game.mapSize.col / 2 - 1;
  },
};

function initSquares() {
  const squaresNum = (game.mapSize.row + 1) * game.mapSize.col;
  game.mainElem.innerHTML = R.compose( R.join(''), R.repeat('<div></div>') )(squaresNum);
  
  // 最后一行添加停止标识
  R.compose(
    R.forEach(_.operateClassList('add', ['taken'])),
    R.slice(
      game.squares.length - game.mapSize.col,
      game.squares.length
    )
  )(game.squares);
}

/** 方块变形 */
function rotate() {
  togglePlayStatus();
  undraw();
  const nextAngle = _.cyclic(shapeDic[state.letter], state.angle);
  console.log(JSON.stringify(state.predictIndexList({ angle: nextAngle })));
  R.when(
    R.allPass([
      angle => R.not( isTaken(state.predictIndexList({ angle })) ),
      angle => R.not( isOverEdge(EdgeValue('left'), state.predictIndexList({ angle })) ),
      angle => R.not( isOverEdge(EdgeValue('right'), state.predictIndexList({ angle })) ),
    ]),
    R.tap(angle => (state.angle = angle))
  )(nextAngle);
  draw();
  togglePlayStatus();
}

/**
 * 左右移动
 * @param {MoveTo} to 
 */
function move(to) {
  togglePlayStatus();
  undraw();
  const nextCol = state.col + Sign(to);
  R.when(
    R.allPass([
      col => R.not( isTaken(state.predictIndexList({ col })) ),
      () => R.not( isAtEdge(EdgeValue(to), state.indexList) ),
    ]),
    R.tap(col => (state.position.col = col))
  )(nextCol);
  draw();
  togglePlayStatus();
}

function undraw() {
  state.indexList.forEach(R.compose(
    _.operateClassList('remove', ['show']),
    Square
  ));
}

function draw() {
  state.indexList.forEach(
    R.compose(
      _.operateClassList('add', ['show']),
      Square
    )
  );
}

function run() {
  undraw()
  ++state.position.row;
  draw();
  freeze();
  addScore();
  gameOver();
}

function freeze() {
  const squaresNextRow = R.map(R.add(game.mapSize.col), state.indexList);
  if (isTaken(squaresNextRow)) {
    state.indexList.forEach(
      R.compose( _.operateClassList('add', ['taken']), Square )
    );
    state.reset();
    draw();
  }
}

function addScore() {
  const colIndexListAtRow = R.compose(
    R.apply(R.range),
    R.converge(R.pair, [R.identity, R.add(game.mapSize.col)]),
    R.multiply(game.mapSize.col)
  );

  const isFullRow = R.compose(
    R.all(R.compose( _.operateClassList('contains', ['taken']), Square )),
    colIndexListAtRow
  );

  const fullRowIndexList = R.filter(isFullRow, R.range(0,game.mapSize.row));

  // 遍历行
  // const squaresRemoved = state.indexList.splice(i, game.mapSize.col);
  // squares = squaresRemoved.concat(squares)
  // squares.forEach(elem => grid.appendChild(elem))

  fullRowIndexList.forEach(
    R.compose(
      // R.compose( () => game.mapSize.row * game.mapSize.col + game.mapSize.col, R.range(0) ),
      R.forEach(R.compose( _.operateClassList('remove', ['taken', 'show']), Square )),
      colIndexListAtRow,
    )
  );

  // 下降
  state.score += fullRowIndexList.length;
  document.getElementById('score').innerText = String(state.score);
}

function gameOver() {
  if (isTaken(state.indexList)) {
    alert('游戏结束')
    state.playStatus = 'paused';
    clearInterval(state.timerId);
  }
}

function togglePlayStatus() {
  state.togglePlayStatus();

  game.switchElem.innerHTML = 'playing' == state.playStatus
    ? '<svg t="1717924085723" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5499" width="12" height="12"><path d="M426.666667 138.666667v746.666666a53.393333 53.393333 0 0 1-53.333334 53.333334H266.666667a53.393333 53.393333 0 0 1-53.333334-53.333334V138.666667a53.393333 53.393333 0 0 1 53.333334-53.333334h106.666666a53.393333 53.393333 0 0 1 53.333334 53.333334z m330.666666-53.333334H650.666667a53.393333 53.393333 0 0 0-53.333334 53.333334v746.666666a53.393333 53.393333 0 0 0 53.333334 53.333334h106.666666a53.393333 53.393333 0 0 0 53.333334-53.333334V138.666667a53.393333 53.393333 0 0 0-53.333334-53.333334z" fill="#5C5C66" p-id="5500"></path></svg> 暂停'
    : '<svg t="1717926943187" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5648" width="12" height="12"><path d="M870.2 466.333333l-618.666667-373.28a53.333333 53.333333 0 0 0-80.866666 45.666667v746.56a53.206667 53.206667 0 0 0 80.886666 45.666667l618.666667-373.28a53.333333 53.333333 0 0 0 0-91.333334z" fill="#5C5C66" p-id="5649"></path></svg> 继续';
  
  'playing' == state.playStatus
    ? state.timerId = setInterval(run, 500)
    : clearInterval(state.timerId);
}

const Action = R.propOr(R.T, R.__, {
  KeyP: togglePlayStatus,
  ArrowUp: rotate,
  ArrowRight: () => move('right'),
  ArrowLeft: () => move('left'),
  ArrowDown: run,
});

function main() {
  initSquares();
  draw();

  game.switchElem.addEventListener('click', togglePlayStatus);
  // game.switchElem.addEventListener('click', () => {
    addEventListener('keyup', R.when(
      // () => 'playing' == state.playStatus,
      R.T,
      R.compose( R.call, Action, R.prop('code') )
    ));
  // }, { once: true });

}

main();
