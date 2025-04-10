import { useDrag } from '../hook/use-drag.js';
import { isAtEdge, ColEdge } from '../const.js';

export function useRotate(context) {
  // --- interval start ---

  /** 方块旋转 */
  function rotate() {
    // 假设
    // 这次 inferNextAngle() 判定为 invalid，
    // 闭包的 i 已变化，
    // 这次 inferNextAngle() 判定为 valid，
    // i 就不是期望值，所以 invalid 需要 inferPrevAngle()
    const nextAngle = context.state.inferNextAngle();
    const Source = R.compose( R.zipObj(['angle']), Array.of );
  
    // 一组方块中的小方块不可能又有在最左边，又有在最右边的
    const isValid = R.compose(
      R.allPass([
        R.compose( R.not, context.anyTaken ),
        R.compose(
          R.not,
          R.allPass([ isAtEdge(ColEdge('left')), isAtEdge(ColEdge('right')) ])
        ),
      ]),
      context.inferIndexList,
      Source,
    );
  
    R.ifElse(
      isValid,
      R.tap(angle => (context.state.angle = angle)),
      context.state.inferPrevAngle,
    )(nextAngle);
    // addClass(['show'], context.state);
    // render(context.state);
    context.freeze(context.isNeedTakenFalled(context.state.indexList));
    context.addScore();
    context.gameOver();
  }

  context.intervalStore.add(
    R.when(
      () => R.where(
        {
          status: R.equals('keydown'),
          accept: Boolean,
        },
        context.operateMap.ArrowUp
      ),
      () => {
        context.operateMap.ArrowUp.accept = false;
        context.intervalStore.reset();
        rotate();
      }
    ),    
    0,
    'rotate'
  );

  // --- interval end ---

  function addKeyListener() {
    // 上箭头=旋转
    // 按下即旋转，但仅此一次
    // 抬起再接受下一次按下
    context.addKeyDown(
      () => R.propEq('keyup', 'status', context.operateMap.ArrowDown),
      () => (context.operateMap.ArrowUp.status = 'keydown'),
      ['ArrowUp']
    );

    context.addKeyUp(
      R.T,
      () => {
        context.operateMap.ArrowUp.status = 'keyup';
        context.operateMap.ArrowUp.accept = true;
      },
      ['ArrowUp']
    );
  }

  function addPointerListenere() {
    const listenerMap = useDrag({
      elem: document.querySelector(`[data-code="ArrowUp"]`),
      pred: () => R.propEq('keyup', 'status', context.operateMap.ArrowDown),
    });

    listenerMap.pointerdown = () => (context.operateMap.ArrowUp.status = 'keydown');
    
    listenerMap.pointerup = () => {
      context.operateMap.ArrowUp.status = 'keyup';
      context.operateMap.ArrowUp.accept = true;
      context.intervalStore.reset();
    };
  }
  
  addKeyListener();
  addPointerListenere();
}
