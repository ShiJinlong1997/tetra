import { useDrag } from '../hook/use-drag.js';


export function useFall(context) {
  const elem = document.querySelector(`[data-code="ArrowDown"]`);

  // --- interval start ---

  const autoFall = R.when(
    () => R.compose( R.all(R.propEq('keyup', 'status')), R.values )(context.operateMap),
    () => {
      // 若下一行能去则去
      // 否则固化
      R.ifElse(
        context.isNeedTakenFallen,
        context.onTaken,
        () => (context.state.row += 1),
      )(context.state.indexList);
    }
  );

  const manualFall = R.when(
    () => R.all(Boolean, [
      R.propEq('keydown', 'status', context.operateMap.ArrowDown),
      R.compose(
        R.not,
        context.anyTaken,
        context.NextIndexList,
      )(context.state.indexList)
    ]),
    () => {
      // 不同于自动下落
      // 主动下落后判断是否需要固化
      context.state.row += 1;
      context.onChange();
    }
  );

  context.intervalStore.add(autoFall, 500, 'autoFall');
  const manualFallInterval = context.intervalStore.add(manualFall, 100, 'manualFall');

  // --- interval end ---

  function addKeyListener() {
    // 下箭头=下降
    // 长按即生效
    // 抬起即失效
    context.addKeyDown(
      () => R.propEq('keyup', 'status', context.operateMap.ArrowUp),
      () => {
        context.onKeyDown(elem);
        context.operateMap.ArrowDown.status = 'keydown';
      },
      ['ArrowDown']
    );

    context.addKeyUp(
      R.T,
      () => {
        context.onKeyUp(elem);
        context.operateMap.ArrowDown.status = 'keyup';
        manualFallInterval.reset();
      },
      ['ArrowDown']
    );
  }

  function addPointerListener() {
    const listenerMap = useDrag({
      elem,
      pred: () => R.propEq('keyup', 'status', context.operateMap.ArrowUp),
    });

    listenerMap.pointerdown = () => {
      context.onPointerDown(elem);
      context.operateMap.ArrowDown.status = 'keydown'
    };
    
    listenerMap.pointerup = () => {
      context.onPointerUp(elem);
      context.operateMap.ArrowDown.status = 'keyup';
      manualFallInterval.reset();
    };
  }

  addKeyListener();
  addPointerListener();
}
