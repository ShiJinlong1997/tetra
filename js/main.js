import { ClassHandler, DivElems, inferMap, toClassName } from './util/dom.js';
import { Icon, game } from './const.js';
import { IndexList, useState } from './use-state.js';
import { usePredict } from './use-predict.js';
import { Offset, Sign } from './util/index.js';
import { useKeyboard } from './hook/use-keyboard.js';
import { useInterval } from './hook/use-interval.js';
import { useMove } from './operate/move.js';
import { useFall } from './operate/fall.js';
import { useRotate } from './operate/rotate.js';

const { addAllowDefault, addKeyDown, addKeyUp, OperateMap, reestOperateMap, listenShortcutKey } = useKeyboard();
const operateMap = OperateMap(['ArrowUp','ArrowRight','ArrowLeft','ArrowDown']);
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

const NextIndexList = R.map(R.add(game.mapSize.col));

/** @type {function(Main.UseRender['indexList']): boolean} */
const isNeedTakenFalled = R.compose( anyTaken, NextIndexList );

const setClass = ClassHandler(R.forEach, Object.assign);
const addClass = setClass(inferMap('add'));
const delClass = setClass(inferMap('delete'));

const intervalStore = useInterval();

/**
 * 动画帧 callback
 * @param {number} timestamp 
 */
function run(timestamp) {
  // 时刻检测是因为左右下三按键想快速响应
  // 唯独自然下降的需要间隔
  game.timerId = requestAnimationFrame(run);
  const elapsed = timestamp - game.lastTime;
  game.lastTime = timestamp;
  
  delClass(['show'], state);
  intervalStore.go(elapsed);
  addClass(['show'], state);
  render(state);
}

/**
 * 使当前形状定身
 * @param {boolean} pred 判断形状是否需要定身
 */
function freeze(cond) {
  if (cond) {
    addClass(['taken', 'show'], state);
  
    state.nextShape(predict);
    delClass(['show'], predict);
    predict.nextShape();
    addClass(['show'], predict);
  
    render(predict);
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
  const playing = R.propEq('playing', 'playStatus', state);

  game.switchElem.innerHTML = playing ? `${Icon.pause} 暂停` : `${Icon.play} 继续`;
  game.switchElem.className = state.playStatus;
  
  playing ? run(game.lastTime) : cancelAnimationFrame(game.timerId);
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

/** 点击开始按钮被调用 */
function init() {
  intervalStore.reset();
  reestOperateMap(operateMap);
  
  state.score = 0;
  game.lastTime = 0;
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
  const context = { state, operateMap, intervalStore, addKeyDown, addKeyUp, freeze, addScore, gameOver, inferIndexList, NextIndexList, isNeedTakenFalled, anyTaken };
  useFall(context);
  useMove(context);
  useRotate(context);

  initSquares();
  game.scoreElem.innerText = String(state.score);
  game.predictElem.innerHTML = DivElems(16);
  game.switchElem.innerHTML = `${Icon.play} 开始`;
  
  game.switchElem.addEventListener('click', init, { once: true });
  game.switchElem.addEventListener('click', togglePlayStatus);

  listenShortcutKey();
  R.forEach(
    addAllowDefault,
    R.map(R.propEq(R.__, 'key', R.__), ['F5','F11','F12'])
  );
}

main();
