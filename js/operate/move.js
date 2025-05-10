import { IndexList } from '../use-state.js';
import { ColEdge, isAtEdge } from '../const.js';
import { useDrag } from '../hook/use-drag.js';
import { Sign } from '../util/index.js';

export function useMove(context) {
  const leftBtn = document.querySelector(`[data-code="ArrowLeft"]`);
  const rightBtn = document.querySelector(`[data-code="ArrowRight"]`);

  // --- interval start ---

  /**
   * 左右移动
   * @param {Main.MoveTo} to 
   */
  function move(to) {
    const nextCol = context.state.col + Sign(to);
    const Source = R.compose( R.zipObj(['col']), Array.of );

    const isValid = R.allPass([
      R.compose( R.not, context.anyTaken, context.inferIndexList, Source ),
      R.compose( R.not, isAtEdge(ColEdge(to)), IndexList, R.always(context.state) ),
    ]);

    R.when( isValid, R.tap(col => (context.state.col = col)) )(nextCol);
  }

  const moveLeftInterval = context.intervalStore.add(
    R.when(
      () => R.propEq('keydown', 'status', context.operateMap.ArrowLeft),
      () => {
        context.intervalStore.reset();
        move('left');
        context.onChange();
      },
    ),
    100,
    'moveLeft'
  );

  const moveRightInterval = context.intervalStore.add(
    R.when(
      () => R.propEq('keydown', 'status', context.operateMap.ArrowRight),
      () => {
        context.intervalStore.reset();
        move('right');
        context.onChange();
      },
    ),
    100,
    'moveRight'
  );

  // --- interval end ---

  function addKeyListener() {
    // 左（右）箭头=左移
    // 左右互悖
    // 按下即移动
    // 抬起即失效
    context.addKeyDown(
      () => R.propEq('keyup', 'status', context.operateMap.ArrowRight),
      () => {
        context.onKeyDown(leftBtn);
        context.operateMap.ArrowLeft.status = 'keydown';
      },
      ['ArrowLeft']
    );

    context.addKeyUp(
      R.T,
      () => {
        context.onKeyUp(leftBtn);
        context.operateMap.ArrowLeft.status = 'keyup';
        moveLeftInterval.reset();
      },
      ['ArrowLeft']
    );

    context.addKeyDown(
      () => R.propEq('keyup', 'status', context.operateMap.ArrowLeft),
      () => {
        context.onKeyDown(rightBtn);
        context.operateMap.ArrowRight.status = 'keydown';
      },
      ['ArrowRight']
    );
  
    context.addKeyUp(
      R.T,
      () => {
        context.onKeyUp(rightBtn);
        context.operateMap.ArrowRight.status = 'keyup';
        moveRightInterval.reset();
      },
      ['ArrowRight']
    );
  }

  function addPointerListener() {
    ((elem) => {
      const listenerMap = useDrag({
        elem,
        pred: () => R.propEq('keyup', 'status', context.operateMap.ArrowRight),
      });

      listenerMap.pointerdown = () => {
        context.onPointerDown(elem);
        context.operateMap.ArrowLeft.status = 'keydown';
      };

      listenerMap.pointerup = () => {
        context.onPointerUp(elem);
        context.operateMap.ArrowLeft.status = 'keyup';
        moveLeftInterval.reset();
      };
    })(leftBtn);

    ((elem) => {
      const listenerMap = useDrag({
        elem,
        pred: () => R.propEq('keyup', 'status', context.operateMap.ArrowLeft),
      });
  
      listenerMap.pointerdown = () => {
        context.onPointerDown(elem);
        context.operateMap.ArrowRight.status = 'keydown';
      };

      listenerMap.pointerup = () => {
        context.onPointerUp(elem);
        context.operateMap.ArrowRight.status = 'keyup';
        moveRightInterval.reset();
      };
    })(rightBtn);
  }

  addKeyListener();
  addPointerListener();
}
