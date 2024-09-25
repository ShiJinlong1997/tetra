export const isInRange = R.curry(
  (xs, x) => R.allPass([
    R.compose( R.gte(x), R.head ),
    R.compose( R.lte(x), R.last ),
  ])(xs)
);

/** @type {function(Main.MoveTo): { left: -1; right: 1; }[Main.MoveTo]} */
export const Sign = R.prop(R.__, { left: -1, right: 1 });

/**
 * 形状内各方块下标
 * @type {function(Main.ShapeDic): function(Main.UseShape>): number[]}
 */
export const Shape = dic => ({ letter, angle }) => {
  return dic[letter][angle];
}

/**
 * 偏移对应下标数
 * @type {function({ col: number; }): function(Main.UsePosition): number}
 */
export const Offset = mapSize => ({ row, col }) => {
  return row * mapSize.col + col;
}
