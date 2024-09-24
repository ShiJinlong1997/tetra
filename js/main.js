import * as _ from './tool.js';
import { Icon, game, isAtEdge, ColEdge } from './const.js';
import { IndexList, useState } from './use-state.js';
import { usePredict } from './use-predict.js';

const state = useState();
const predict = usePredict();

const inferIndexList = source => R.compose(
  IndexList,
  R.mergeRight(R.__, source),
  R.pick(['letter','angle','row','col'])
)(state);

/** @type {function(number[]): boolean} */
const isTaken = R.any(
  index => state.classNameList[index].has('taken')
);

function initSquares() {
  game.mainElem.innerHTML = _.DivElems(game.squaresNum);

  // 最后一行添加停止标识
  R.compose(
    R.forEach(elem => {
      const index = R.indexOf(elem, game.squares);
      state.classNameList[index].add('taken');
    }),
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
  // 假设
  // 这次 inferNextAngle() 判定为 invalid，
  // 闭包的 i 已变化，
  // 这次 inferNextAngle() 判定为 valid，
  // i 就不是期望值，所以 invalid 需要 inferPrevAngle()
  const nextAngle = state.inferNextAngle();
  const Source = R.compose( R.zipObj(['angle']), Array.of );

  // 一组方块中的小方块不可能又有在最左边，又有在最右边的
  const isValid = R.compose(
    R.allPass([
      R.compose( R.not, isTaken ),
      R.compose( R.not, R.allPass([ isAtEdge(ColEdge('left')), isAtEdge(ColEdge('right')) ]) ),
    ]),
    inferIndexList,
    Source,
  );

  R.ifElse(
    isValid,
    R.tap(angle => (state.angle = angle)),
    state.inferPrevAngle,
  )(nextAngle);
  draw();
  render();
  freeze();
  addScore();
  togglePlayStatus();
}

/**
 * 左右移动
 * @param {Main.MoveTo} to 
 */
function move(to) {
  togglePlayStatus();
  undraw();
  const nextCol = state.col + _.Sign(to);
  const Source = R.compose( R.zipObj(['col']), Array.of );

  const isValid = R.allPass([
    R.compose( R.not, isTaken, inferIndexList, Source ),
    R.compose( R.not, isAtEdge(ColEdge(to)), IndexList, R.always(state) ),
  ]);

  R.when( isValid, R.tap(col => (state.col = col)) )(nextCol);
  draw();
  render();
  freeze();
  addScore();
  togglePlayStatus();
}

function undraw() {
  state.indexList.forEach(index => {
    state.classNameList[index].delete('show');
  });
}

function draw() {
  state.indexList.forEach(index => {
    state.classNameList[index].add('show');
  });
}

function run() {
  if (R.equals('active', state.shapeStatus)) {
    undraw()
    ++state.row;
    draw();
    render();
    state.toggleShapeStatus();
  } else {
    freeze();
    addScore();
    gameOver();
    state.toggleShapeStatus();
  }
}

function freeze() {
  const nextRow = R.map(R.add(game.mapSize.col), state.indexList);
  if (isTaken(nextRow)) {
    state.indexList.forEach(index => {
      state.classNameList[index].add('taken')
    });
    
    predict.indexList.forEach(index => {
      predict.classNameList[index].clear();
    });
    state.nextShape(predict);
    predict.nextShape();
    
    predict.indexList.forEach(index => {
      predict.classNameList[index].add('show');
    });
    renderPredict();
  }
}

function addScore() {
  /** @type {function(number): number[]} */
  const colsAtRow = R.compose(
    R.apply(R.range),
    R.map(R.compose( _.Offset(game.mapSize), R.zipObj(['row', 'col']) )),
    R.xprod(R.__, [0, game.mapSize.col]),
    Array.of
  );

  const isFullRow = R.compose(
    R.all(index => state.classNameList[index].has('taken')),
    colsAtRow
  );

  // [ ] filter() 换成 transduce()
  const fullRows = R.filter(isFullRow, R.range(0,game.mapSize.row));

  fullRows.forEach(row => {
    const cols = colsAtRow(row);
    const removed = state.classNameList.splice(cols[0], cols.length);
    removed.forEach(set => set.clear());
    state.classNameList = removed.concat(state.classNameList);
  });

  // freeze() 更新了 indexList 后，消行会让形状下降，所以先别 render()
  undraw();
  draw();
  render();
  state.score += fullRows.length;
  game.scoreElem.innerText = String(state.score);
}

function gameOver() {  
  if (isTaken(state.indexList)) {
    alert('游戏结束');
    togglePlayStatus();
    game.switchElem.innerHTML = `${Icon.play} 开始`;
  }
}

function togglePlayStatus() {
  state.togglePlayStatus();
  const playing = isPlaying();

  game.switchElem.innerHTML = playing ? `${Icon.pause} 暂停` : `${Icon.play} 继续`;
  game.switchElem.className = state.playStatus;

  playing
    ? state.timerId = setInterval(run, 500)
    : clearInterval(state.timerId);
}

function render() {
  state.classNameList.forEach((set, i) => {
    game.squares[i].className = _.toClassName(set);
  })
}

function renderPredict() {
  predict.classNameList.forEach((set, i) => {
    game.predictElem.children[i].className = _.toClassName(set);
  });
}

const Handler = R.propOr(R.F, R.__, {
  KeyP: togglePlayStatus,
  ArrowUp: rotate,
  ArrowRight: () => move('right'),
  ArrowLeft: () => move('left'),
  ArrowDown: run,
});

const isPlaying = () => R.propEq('playing', 'playStatus', state);

function main() {
  initSquares();
  game.scoreElem.innerText = String(state.score);
  game.predictElem.innerHTML = _.DivElems(16);
  game.switchElem.innerHTML = `${Icon.play} 开始`;
  
  game.switchElem.addEventListener('click', togglePlayStatus);
  game.switchElem.addEventListener('click', () => {
    predict.indexList.forEach(index => {
      predict.classNameList[index].add('show');
    });
    draw();
    render();
    renderPredict();

    addEventListener('keyup', R.when(
      isPlaying,
      R.compose( R.call, Handler, R.prop('code') )
    ));

    const handlers = [
      rotate,
      () => move('left'),
      run,
      () => move('right'),
    ];
    document.querySelectorAll('.arrow > button').forEach((elem, i) => {
      elem.addEventListener('click', R.when( isPlaying, handlers[i] ));
    });
  }, { once: true });
}

main();
