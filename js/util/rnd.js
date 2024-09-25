export const RndInt = R.curry(
  (min, max) => Math.floor( Math.random() * (max - min) ) + min
);

/** @type {function(any[]): number} */
export const RndIndex = R.compose( RndInt(0), R.length );

/** @type {function<T>(T[]): T} */
export const RndItem = R.converge(R.prop, [RndIndex, R.identity]);

/** @type {function(Main.ShapeDic): Main.Letter} */
export const RndLetter = R.compose( RndItem, R.keys );
