export function useLoops(i, xs) {
  const indexLimit = { min: 0, max: xs.length - 1 };
  
  const readValue = R.compose( R.prop(R.__, xs), R.tap(newIndex => (i = newIndex)) );
  
  return {
    reset() {
      i = 0;
    },
    value() {
      return xs[i];
    },
    prev() {
      return R.compose(
        readValue,
        R.when(R.lt(R.__, indexLimit.min), R.always(indexLimit.max)),
        R.dec
      )(i);
    },
    next() {
      return R.compose(
        readValue,
        R.when(R.gt(R.__, indexLimit.max), R.always(indexLimit.min)),
        R.inc
      )(i);
    },
  };
}

export const isInRange = R.curry(
  (xs, x) => R.allPass([
    R.compose( R.gte(x), R.head ),
    R.compose( R.lte(x), R.last ),
  ])(xs)
);

export const RndInt = R.curry(
  (min, max) => Math.floor( Math.random() * (max - min) ) + min
);

/** @type {function(any[]): number} */
export const RndIndex = R.compose( RndInt(0), R.length );

/** @type {function<T>(T[]): T} */
export const RndItem = R.converge(R.prop, [RndIndex, R.identity]);

/** @type {function(Main.ShapeDic): Main.Letter} */
export const RndLetter = R.compose( RndItem, R.keys );

/** @typedef {Extract<keyof Set, 'add' | 'delete' | 'has'>} ClassNameOperate */

/** @type {function(Main.MoveTo): { left: -1; right: 1; }[Main.MoveTo]} */
export const Sign = R.prop(R.__, { left: -1, right: 1 });

/** @type {function(Main.ClassNameSet): string} */
export const toClassName = R.compose( R.join(' '), Array.from );
