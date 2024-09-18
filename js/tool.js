export const RndInt = R.curry(
  (min, max) => Math.floor( Math.random() * (max - min) ) + min
);

export const RndLetter = R.compose(
  R.converge(R.prop, [
    R.compose( RndInt(0), R.length ),
    R.identity
  ]),
  R.keys
);

/**
 * @type {(operate: 'add' | 'remove' | 'contains', token: string[], elem: HTMLDivElement) => void}
 */
export const operateClassList = R.curry(
  (operate, tokens, elem) => elem.classList[operate](...tokens)
);

export const cyclic = (xs, i) => (
  R.compose(
    R.ifElse( R.lt(R.__, xs.length), R.identity, R.always(0) ),
    R.inc
  )(i)
);
