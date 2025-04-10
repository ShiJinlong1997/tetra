export function useInterval() {
  const map = {};

  /**
   * 帧函数调用于指定间隔之间
   * @param {function} f 
   * @param {number} interval 
   * @param {string} key 
   */
  function add(f, interval, key) {
    let lastTime = 0;
    
    /**
     * 使时间流逝
     * @param {number} elapsed 时长
     */
    function go(elapsed) {
      lastTime += elapsed;
      return R.when(
        () => R.lte(interval, lastTime),
        () => {
          reset();
          f(elapsed);
        },
        void 0
      );
    };
    
    function reset() {
      lastTime = 0;
    }
    
    const item = {
      go,
      reset,
    };

    Reflect.set(map, key, item);
    return item;
  }

  /**
   * 使时间流逝
   * @param {number} elapsed 
   */
  function go(elapsed) {
    R.forEach(
      R.apply(R.__, [elapsed]),
      R.compose( R.pluck('go'), R.values )(map)
    );
  }

  /** 重置已流逝时长 */
  function reset() {
    R.forEach(
      R.call,
      R.compose( R.pluck('reset'), R.values )(map)
    );
  }

  return {
    add,
    go,
    reset,
  }
}
