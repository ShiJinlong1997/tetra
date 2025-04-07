import { ClassHandler, DivElems, inferMap, toClassName } from './util/dom.js';
import { Icon, game, isAtEdge, ColEdge } from './const.js';
import { IndexList, useState } from './use-state.js';
import { usePredict } from './use-predict.js';
import { Offset, Sign } from './util/index.js';
import { useKeyboard } from './hook/use-keyboard.js';
import { useInterval } from './hook/use-interval.js';

const { addAllowDefault, addKeyDown, addKeyUp, operateMap, reestOperateMap, listenShortcutKey } = useKeyboard(['ArrowUp','ArrowRight','ArrowLeft','ArrowDown']);
const state = useState();
const predict = usePredict();

const NextIndexList = R.map(R.add(game.mapSize.col));

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

/** 方块旋转 */
function rotate() {
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
  // addClass(['show'], state);
  // render(state);
  freeze(isNeedTakenFalled(state.indexList));
  addScore();
  gameOver();
}

/**
 * 左右移动
 * @param {Main.MoveTo} to 
 */
function move(to) {
  const nextCol = state.col + Sign(to);
  const Source = R.compose( R.zipObj(['col']), Array.of );

  const isValid = R.allPass([
    R.compose( R.not, anyTaken, inferIndexList, Source ),
    R.compose( R.not, isAtEdge(ColEdge(to)), IndexList, R.always(state) ),
  ]);

  R.when( isValid, R.tap(col => (state.col = col)) )(nextCol);
}

/** @type {function(Main.UseRender['indexList']): boolean} */
const isNeedTakenFalled = R.compose( anyTaken, NextIndexList );

const { addInterval, resetAllInterval } = useInterval();

const natureFallFrame = addInterval(
  R.when(
    () => R.compose( R.all(R.propEq('keyup', 'status')), R.values )(operateMap),
    () => {
      // 若下一行能去则去
      // 否则固化
      R.ifElse(
        isNeedTakenFalled,
        () => {
          freeze(true);
          addScore();
          gameOver();
        },
        () => (state.row += 1),
      )(state.indexList);
    }
  ),
  500
);

const arrowUpFrame = addInterval(
  R.when(
    () => R.where(
      {
        status: R.equals('keydown'),
        accept: Boolean,
      },
      operateMap.ArrowUp
    ),
    () => {
      operateMap.ArrowUp.accept = false;
      resetAllInterval();
      rotate();
    }
  ),    
  0
);

const arrowDownFrame = addInterval(
  R.when(
    () => R.all(Boolean, [
      R.propEq('keydown', 'status', operateMap.ArrowDown),
      R.compose(
        R.not,
        anyTaken,
        NextIndexList,
        (state.indexList)
      )
    ]),
    () => {
      state.row += 1;
      freeze(isNeedTakenFalled(state.indexList));
      addScore();
      gameOver();
    }
  ),
  100
);

const arrowLeftFrame = addInterval(
  R.when(
    () => R.propEq('keydown', 'status', operateMap.ArrowLeft),
    () => {
      resetAllInterval();
      move('left');
    },
  ),
  100
);

const arrowRightFrame = addInterval(
  R.when(
    () => R.propEq('keydown', 'status', operateMap.ArrowRight),
    () => {
      resetAllInterval();
      move('right');
    },
  ),
  100
);

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
  
  R.forEach(
    R.apply(R.__, [elapsed]),
    [
      natureFallFrame.go,
      arrowUpFrame.go,
      arrowDownFrame.go,
      arrowLeftFrame.go,
      arrowRightFrame.go
    ],
  );

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
  resetAllInterval();
  reestOperateMap();
  
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
  initSquares();
  game.scoreElem.innerText = String(state.score);
  game.predictElem.innerHTML = DivElems(16);
  game.switchElem.innerHTML = `${Icon.play} 开始`;
  
  game.switchElem.addEventListener('click', togglePlayStatus);
  game.switchElem.addEventListener('click', init, { once: true });

  listenShortcutKey();
  R.forEach(
    addAllowDefault,
    R.map(R.propEq(R.__, 'key', R.__), ['F5','F11','F12'])
  );
  const isKeyUp = key => R.propEq('keyup', 'status', operateMap[key]);

  // 上箭头=旋转
  // 按下即旋转，但仅此一次
  // 抬起再接受下一次按下
  addKeyDown(
    () => isKeyUp('ArrowDown'),
    () => (operateMap.ArrowUp.status = 'keydown'),
    ['ArrowUp']
  );

  addKeyUp(
    R.T,
    () => {
      operateMap.ArrowUp.status = 'keyup';
      operateMap.ArrowUp.accept = true;
    },
    ['ArrowUp']
  );

  // 下箭头=下降
  // 长按即生效
  // 抬起即失效
  addKeyDown(
    () => isKeyUp('ArrowUp'),
    () => (operateMap.ArrowDown.status = 'keydown'),
    ['ArrowDown']
  );

  addKeyUp(
    R.T,
    () => (operateMap.ArrowDown.status = 'keyup'),
    ['ArrowDown']
  );

  // 左（右）箭头=左移
  // 左右互悖
  // 按下即移动
  // 抬起即失效
  addKeyDown(
    () => isKeyUp('ArrowRight'),
    () => (operateMap.ArrowLeft.status = 'keydown'),
    ['ArrowLeft']
  );

  addKeyUp(
    R.T,
    () => (operateMap.ArrowLeft.status = 'keyup'),
    ['ArrowLeft']
  );

  addKeyDown(
    () => isKeyUp('ArrowRight'),
    () => (operateMap.ArrowRight.status = 'keydown'),
    ['ArrowRight']
  );

  addKeyUp(
    R.T,
    () => (operateMap.ArrowRight.status = 'keyup'),
    ['ArrowRight']
  );
}

main();
