const modifiers = R.map(R.concat(R.__, 'Key'), ['ctrl', 'shift', 'alt', 'meta']);
const modifiersMatch = xs => R.all(R.includes(R.__, xs), modifiers);

const MatchMainKeyOf = main => event => R.compose(
  R.equals(R.toLower( main )),
  R.prop('key')
)(event);

const MatchModifiersOf = xs => event => R.converge(equals, [
  R.converge(R.props, [R.always(modifiers), R.identity]),
  R.always( modifiersMatch(xs) ),
])(event);

export function useKeyboard() {
  function Operate() {
    return {
      accept: true,
      /** @type {'keyup' | 'keydown'} */
      status: 'keyup',
    };
  }

  /** @typedef {'ArrowUp' | 'ArrowRight' | 'ArrowLeft' | 'ArrowDown'} OperateKey */
  
  /**
   * @type {function(OperateKey[]): Record<OperateKey, ReturnType<Operate>}>}
   */
  const OperateMap = R.converge(R.zipObj, [
    R.identity,
    R.compose( R.times(Operate), R.length )
  ]);

  function reestOperateMap(map) {
    R.forEach(
      o => Object.assign(o, Operate()),
      R.values(map)
    )
  };

  /** 判断是否需要阻止默认事件，像 F5 不用阻止，该刷新刷新 */
  const preventCondPairs = [[R.T, R.T]];

  function addAllowDefault(pred) {
    preventCondPairs.unshift([pred, R.F]);
  }

  const needPrevent = R.cond(preventCondPairs);

  // --- pre conds ---

  /** 条件符合才检测键是否按下 */
  const preConds = [];

  const allowCondPairs = R.allPass(preConds);

  function addPreCond(pred) {
    preConds.push(pred);
  }

  /** @type {[键是否按下, 监听器][} */
  const keyDownFirstFrameCondPairs = [];

  /** @type {[键是否按下, 监听器][]} */
  const keyDownCondPairs = [];

  /** @type {[键是否按下, 监听器][]} */
  const keyUpCondPairs = [];

  function listenShortcutKey() {
    addEventListener('keydown', handleKeyDownFirstFrame, { once: true });
    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);
  };

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyDownFirstFrame(event) {
    needPrevent(event) && event.preventDefault();
    allowCondPairs() && R.cond(keyDownFirstFrameCondPairs)(event);
  }

  function handleKeyDown(event) {
    // 判断是否需要阻止默认事件，像 F5 不用阻止，该刷新刷新
    // 所有快捷键都满足大前提才调用监听器，比如正在打字或某 Modal 已显示则不调用
    needPrevent(event) && event.preventDefault();
    allowCondPairs() && R.cond(keyDownCondPairs)(event);
  }

  function handleKeyUp(event) {
    addEventListener('keydown', handleKeyDownFirstFrame, { once: true });
    allowCondPairs() && R.cond(keyUpCondPairs)(event);
  }
  
  function addKeyDownFirstFrame(preCond, listener, keys) {
    keyDownFirstFrameCondPairs.push([
      R.allPass([
        event => R.equals(R.toLower(keys[0]), R.toLower(event.key)),
        event => R.compose(
          R.all( ([k, v]) => R.propEq(v, k, event) ),
          R.map( k => [`${ k }Key`, keys.includes(k)] )
        )(['ctrl', 'shift', 'alt', 'meta']),
        preCond
      ]),
      listener
    ]);
  }

  function addKeyDown(preCond, listener, keys) {
    keyDownCondPairs.push([
      R.allPass([
        event => R.equals(R.toLower(keys[0]), R.toLower(event.key)),
        event => R.compose(
          R.all( ([k, v]) => R.propEq(v, k, event) ),
          R.map( k => [`${ k }Key`, keys.includes(k)] )
        )(['ctrl', 'shift', 'alt', 'meta']),
        preCond
      ]),
      listener
    ]);
  }

  function addKeyUp(preCond, listener, keys) {
    keyUpCondPairs.push([
      R.allPass([
        event => R.equals(R.toLower(keys[0]), R.toLower(event.key)),
        event => R.compose(
          R.all( ([k, v]) => R.propEq(v, k, event) ),
          R.map( k => [`${ k }Key`, keys.includes(k)] )
        )(['ctrl', 'shift', 'alt', 'meta']),
        preCond
      ]),
      listener
    ]);
  }

  return {
    addAllowDefault,
    addPreCond,
    addKeyDownFirstFrame,
    addKeyDown,
    addKeyUp,
    OperateMap,
    reestOperateMap,
    listenShortcutKey,
  };
}
