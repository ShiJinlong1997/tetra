export function useInterval() {
  const resetFns = [];

  /**
   * 帧函数调用于指定间隔之间
   * @param {function} f 
   * @param {number} interval 
   */
  function addInterval(f, interval) {
    let lastTime = 0;
    
    /**
     * 使时间流逝
     * @param {number} elapsed 时长
     */
    const go = elapsed => {
      lastTime += elapsed;
      return R.when(
        () => R.lte(interval, lastTime),
        () => {
          lastTime = 0;
          f(elapsed);
        },
        void 0
      );
    };
    
    const reset = () => (lastTime = 0);

    resetFns.push(reset);
    
    return {
      go,
      reset,
    };
  }

  function resetAllInterval() {
    R.forEach(R.call, resetFns);
  }

  return {
    addInterval,
    resetAllInterval,
  }
}
