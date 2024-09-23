import { game, perdictDic, shapeDic } from './const.js';
import * as _ from './tool.js';

/**
 * 形状内各方块下标
 * @type {function(Main.ShapeDic): function(Main.UseLetter>): number[]}
 */
const Shape = dic => ({ letter, angle }) => {
  return dic[letter][angle];
}

/**
 * 偏移对应下标数
 * @type {function({ col: number; }): function(Main.UsePosition): number}
 */
export const Offset = mapSize => ({ row, col }) => {
  return row * mapSize.col + col;
}

export const pickState = R.pick(['letter','angle','row','col']);

/** @type {function(Main.PickedState): number[]} */
export const IndexList = R.converge(R.map, [R.compose(R.add, Offset(game.mapSize)), Shape(shapeDic)]);

/** @type {function(Main.PickedState): number[]} */
export const PredictList = R.converge(R.map, [R.compose(R.add, Offset(game.predictSize)), Shape(perdictDic)]);

/** @type {function(number): Main.ClassNameSet[]} */
export const ClassNameList = R.times(() => new Set());

/** @returns {Main.State} */
export function useState() {
  const shapeStatusLoop = _.useLoops(0, ['active', 'hold']);
  const playStatusLoop = _.useLoops(0, ['paused', 'playing']);
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

    predict: {
      angle: 0,
      letter: _.RndLetter(perdictDic),
    },

    angle: angleLoop.value(),
    letter: _.RndLetter(shapeDic),
    
    get predictList() {
      return PredictList(Object.assign(
        {
          row: 0,
          col: game.predictSize.col / 2 - 1
        },
        this.predict
      ));
    },
    inferNextAngle: angleLoop.next,
    
    row: 0,
    col: game.mapSize.col / 2 - 1,

    get indexList() {
      return IndexList(this);
    },
    classNameList: ClassNameList(game.squaresNum),
    nextShape() {
      angleLoop.reset();
      Object.assign(this, this.predict);
      this.predict.letter = _.RndLetter(shapeDic);
      this.row = 0;
      this.col = game.mapSize.col / 2 - 1;
    },
    reset() {
      this.letter = _.RndLetter(shapeDic);
      angleLoop.reset();
      this.angle = angleLoop.value();
      this.row = 0;
      this.col = game.mapSize.col / 2 - 1;
    }
  };
}
