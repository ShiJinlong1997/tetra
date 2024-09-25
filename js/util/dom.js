/** @type {function(number): string[]} */
export const DivElems = R.compose( R.join(''), R.repeat('<div></div>') );

/** @type {function(Main.ClassMap): string} */
export const toClassName = R.compose( R.join(' '), R.keys, R.filter(Boolean) );

/** @type {function(number): Main.ClassMap[]} */
export const ClassMapList = R.times( () => ({ show: false, taken: false }) );

/** @type {function('add' | 'delete' | 'has', string[]): Main.ClassMap} */
export const inferMap = R.curry(
  (operate, keys) => {
    const ValuesOf = R.compose( R.map, R.always, R.equals('add') );
    return R.converge(R.zipObj, [R.identity, ValuesOf(operate)])(keys);
  }
);

/**
 * 用方块下标列表影响类名列表
 * @function
 * @param {Function} f 用于遍历方块下标列表
 * @param {function(Main.ClassMap, Main.ClassMap): Main.ClassMap} iterator classMap 结合 处理类名数组的结果
 * @param {function(string[]): Main.ClassMap} transducer 处理类名数组
 * @param {string[]} keys 类名数组
 * @param {Pick<Main.UseRender, 'indexList' | 'classMapList'>} param4 
 * @returns {ReturnType<typeof f>}
 */
export const ClassHandler = R.curry(
  (f, iterator, transducer, keys, { indexList, classMapList }) => (
    f(
      index => iterator(classMapList[index], transducer(keys)),
      indexList
    )
  )
)