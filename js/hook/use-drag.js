export function useDrag({
  calcStartPoint = R.pick(['x', 'y']),
  elem,
  pred = R.T,
}) {
  const listenerMap = {
    pointerdown: R.identity,
    /** 定制 pointermove 触发调用的函数 */
    moveListener: R.identity,
    pointerup: R.identity,
    pointermove: R.identity,
    data: null,
  };

  elem.addEventListener(
    'pointerdown',
    R.both(
      pred,
      event => {
        const startPoint = calcStartPoint(event);
        listenerMap.pointerdown({ event, startPoint });

        const handlePointerMove = event => {
          listenerMap.pointermove({ event, startPoint });
        };

        document.body.addEventListener('pointermove', handlePointerMove);

        // pointerleave 就取消监听 pointerup
        const handlePointerLeave = () => {
          handleEnd();
          document.body.removeEventListener('pointerup', handlePointerUp);
        };

        // pointerup 就取消监听 pointerleave
        const handlePointerUp = () => {
          handleEnd();
          document.body.removeEventListener('pointerleave', handlePointerLeave);
        };

        // pointerup 和 pointerleave 最终都取消监听 pointermove

        document.body.addEventListener('pointerleave', handlePointerLeave);
        document.body.addEventListener('pointerup', handlePointerUp);

        function handleEnd() {
          listenerMap.pointerup();
          listenerMap.data = null;
          document.body.removeEventListener('pointermove', handlePointerMove);
        }
      }
    )
  );

  return listenerMap;
}
