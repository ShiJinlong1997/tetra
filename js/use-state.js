import { game, shapeDic } from './const.js';
import * as _ from './tool.js';

/**
 * 形状内各方块下标
 * @param {Pick<Main.State, 'letter' | 'angle'>} param0
 * @returns {number[]}
 */
function Shape({ letter, angle }) {
  return shapeDic[letter][angle];
}

/**
 * 偏移对应下标数
 * @param {Pick<Main.State, 'row' | 'col'>} param0
 * @returns {number}
 */
export function Offset({ row, col }) {
  return row * game.mapSize.col + col;
}

export const pickState = R.pick(['letter','angle','row','col']);

/** @type {function(Pick<Main.State, 'letter' | 'angle' | 'row' | 'col'>): number[]} */
export const IndexList = R.converge(R.map, [R.compose(R.add, Offset), Shape]);

/** @type {function(number): Main.ClassNameSet[]} */
export const ClassNameList = R.times(() => new Set());

/** @returns {Main.State} */
export function useState() {
  const shapeStatusLoop = _.useLoops(0, ['active', 'hold']);
  const playStatusLoop = _.useLoops(0, ['paused','playing']);
  const angleLoop = _.useLoops(0, R.range(0,4));

  return {
    score: 0,
    timerId: -1,

    shapeStatus: shapeStatusLoop.value(),
    toggleShapeStatus() {
      this.shapeStatus = shapeStatusLoop.next();
    },

    playStatus: playStatusLoop.value(),
    togglePlayStatus() {
      this.playStatus = playStatusLoop.next();
    },

    angle: angleLoop.value(),
    inferNextAngle: angleLoop.next,
    letter: _.RndLetter(shapeDic),

    position: {
      row: 0,
      col: game.mapSize.col / 2 - 1,
    },
    get row() {
      return this.position.row;
    },
    get col() {
      return this.position.col;
    },

    get indexList() {
      return IndexList(this);
    },
    classNameList: ClassNameList(game.squaresNum),
    init() {
      this.letter = _.RndLetter(shapeDic);
      this.position.row = 0;
      this.position.col = game.mapSize.col / 2 - 1;
    }
  };
}
