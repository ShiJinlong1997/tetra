import { game, shapeDic } from './const.js';
import * as _ from './tool.js';

/** @type {function(Main.PickedState): number[]} */
export const IndexList = R.converge(R.map, [R.compose(R.add, _.Offset(game.mapSize)), _.Shape(shapeDic)]);

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

    angle: angleLoop.value(),
    letter: _.RndLetter(shapeDic),
    
    inferNextAngle: angleLoop.next,
    inferPrevAngle: angleLoop.prev,
    
    row: 0,
    col: game.mapSize.col / 2 - 1,

    get indexList() {
      return IndexList(this);
    },
    classNameList: _.ClassNameList(game.squaresNum),
    nextShape(predict) {
      angleLoop.reset();
      Object.assign(this, predict.info);
      this.resetPosition();
    },
    resetPosition() {
      this.row = 0;
      this.col = game.mapSize.col / 2 - 1;
    },
    reset() {
      this.letter = _.RndLetter(shapeDic);
      angleLoop.reset();
      this.angle = angleLoop.value();
      this.resetPosition();
    }
  };
}
