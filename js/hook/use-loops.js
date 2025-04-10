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
