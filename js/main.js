import { ClassHandler, DivElems, inferMap, toClassName } from './util/dom.js';
import { Icon, game, isAtEdge, ColEdge } from './const.js';
import { IndexList, useState } from './use-state.js';
import { usePredict } from './use-predict.js';
import { Offset, Sign } from './util/index.js';

const state = useState();
const predict = usePredict();

const inferIndexList = source => R.compose(
  IndexList,
  R.mergeRight(R.__, source),
  R.pick(['letter','angle','row','col'])
)(state);

const HandleClassOf = ({ classMapList }) => indexList => ({
  indexList,
  classMapList
});

const detectTaken = f => indexList => (
  R.compose(
    ClassHandler( f, R.flip(R.prop), R.head, ['taken'] ),
    HandleClassOf(state)
  )(indexList)
);

/** @type {function(number[]): boolean} */
const anyTaken = detectTaken(R.any);

/** @type {function(number[]): boolean} */
const allTaken = detectTaken(R.all);

const setClass = ClassHandler(R.forEach, Object.assign);
const addClass = setClass(inferMap('add'));
const delClass = setClass(inferMap('delete'));

/** 方块变形 */
function rotate() {
  togglePlayStatus();
  delClass(['show'], state);
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
      R.compose( R.not, anyTaken ),
      R.compose(
        R.not,
        R.allPass([ isAtEdge(ColEdge('left')), isAtEdge(ColEdge('right')) ])
      ),
    ]),
    inferIndexList,
    Source,
  );

  R.ifElse(
    isValid,
    R.tap(angle => (state.angle = angle)),
    state.inferPrevAngle,
  )(nextAngle);
  addClass(['show'], state);
  render(state);
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
  delClass(['show'], state);
  const nextCol = state.col + Sign(to);
  const Source = R.compose( R.zipObj(['col']), Array.of );

  const isValid = R.allPass([
    R.compose( R.not, anyTaken, inferIndexList, Source ),
    R.compose( R.not, isAtEdge(ColEdge(to)), IndexList, R.always(state) ),
  ]);

  R.when( isValid, R.tap(col => (state.col = col)) )(nextCol);
  addClass(['show'], state);
  render(state);
  freeze();
  addScore();
  togglePlayStatus();
}

function run() {
  if (R.equals('active', state.shapeStatus)) {
    delClass(['show'], state);
    ++state.row;
    addClass(['show'], state);
    render(state);
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
  if (anyTaken(nextRow)) {
    addClass(['taken'], state);

    state.nextShape(predict);
    delClass(['show'], predict);
    predict.nextShape();
    addClass(['show'], predict);

    render(predict);
    // 先别调 render(state)，因为 addScore() 消行会使形状下降
  }
}

function addScore() {
  /** @type {function(number): number[]} */
  const colsAtRow = R.compose(
    R.apply(R.range),
    R.map(R.compose( Offset(game.mapSize), R.zipObj(['row', 'col']) )),
    R.xprod(R.__, [0, game.mapSize.col]),
    Array.of
  );

  const isFullRow = R.compose( allTaken, colsAtRow );
  const fullRows = R.filter(isFullRow, R.range(0,game.mapSize.row));

  fullRows.forEach(row => {
    const cols = colsAtRow(row);

    R.compose( delClass(['show', 'taken']), HandleClassOf(state) )(cols);
    const removed = state.classMapList.splice(cols[0], cols.length);
    state.classMapList = removed.concat(state.classMapList);   
  });
  
  // 消行使形状下降
  // 重分配 state.classMapList
  // 再调 render(state)
  delClass(['show'], state);
  addClass(['show'], state);
  render(state);
  state.score += fullRows.length;
  game.scoreElem.innerText = String(state.score);
}

function gameOver() {
  if (anyTaken(state.indexList)) {
    alert('游戏结束');
    togglePlayStatus();
    game.switchElem.innerHTML = `${Icon.play} 再来`;
    game.switchElem.addEventListener('click', init, { once: true });
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

/**
 * 用类对象数组更新 className
 * @param {Pick<Main.UseRender, 'classMapList', 'squares'>} param0
 */
function render({ classMapList, squares }) {
  classMapList.forEach((set, i) => {
    squares[i].className = toClassName(set);
  })
}

const ListenerMap = {
  ArrowUp: rotate,
  ArrowRight: () => move('right'),
  ArrowLeft: () => move('left'),
  ArrowDown: run,
};

const Listener = R.propOr(R.F, R.__, ListenerMap);

const isPlaying = () => R.propEq('playing', 'playStatus', state);

function initSquares() {
  game.mainElem.innerHTML = DivElems(game.squaresNum);

  // 最后一行添加停止标识
  R.compose(
    addClass(['taken']),
    HandleClassOf(state),
    R.range
  )(
    state.squares.length - game.mapSize.col,
    state.squares.length
  );

  render(state);
}

function init() {
  state.score = 0;
  game.scoreElem.innerText = String(state.score);
  
  R.compose(
    delClass(['show']),
    HandleClassOf(predict),
    R.times(R.identity)
  )(predict.classMapList.length);

  R.compose(
    delClass(['show', 'taken']),
    HandleClassOf(state),
    R.slice(0, game.squaresNum - game.mapSize.col),
    R.times(R.identity)
  )(state.classMapList.length);
  
  state.nextShape(predict);
  addClass(['show'], state);
  render(state);
  
  predict.nextShape();
  addClass(['show'], predict);
  render(predict);
}

function main() {
  initSquares();
  game.scoreElem.innerText = String(state.score);
  game.predictElem.innerHTML = DivElems(16);
  game.switchElem.innerHTML = `${Icon.play} 开始`;
  
  game.switchElem.addEventListener('click', togglePlayStatus);
  game.switchElem.addEventListener('click', init, { once: true });
}

main();

const ListenerFrom = Key => R.compose( R.call, Listener, Key );

addEventListener('keyup', R.when( isPlaying, ListenerFrom(R.prop('code')) ));

document.querySelectorAll('.arrow > button').forEach(elem => {
  elem.addEventListener('click', R.when(
    isPlaying,
    ListenerFrom( R.path(['currentTarget', 'dataset', 'code']) )
  ));
})
