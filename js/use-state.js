import { game, shapeDic } from './const.js';
import { ClassMapList } from './util/dom.js';
import { Offset, Shape } from './util/index.js';
import { RndLetter } from './util/rnd.js';
import { useLoops } from './util/use-loops.js';

/** @type {function(Main.PickedState): number[]} */
export const IndexList = R.converge(R.map, [R.compose(R.add, Offset(game.mapSize)), Shape(shapeDic)]);

/** @returns {Main.State} */
export function useState() {
  const shapeStatusLoop = useLoops(0, ['active', 'hold']);
  const playStatusLoop = useLoops(0, ['paused', 'playing']);
  const angleLoop = useLoops(0, R.range(0,4));

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
    letter: RndLetter(shapeDic),
    
    inferNextAngle: angleLoop.next,
    inferPrevAngle: angleLoop.prev,
    
    row: 0,
    col: game.mapSize.col / 2 - 1,

    get indexList() {
      return IndexList(this);
    },
    classMapList: ClassMapList(game.squaresNum),
    get squares() {
      return Array.from(game.mainElem.children);
    },

    nextShape(predict) {
      angleLoop.reset();
      Object.assign(this, predict.info);
      this.resetPosition();
    },
    resetPosition() {
      this.row = 0;
      this.col = game.mapSize.col / 2 - 1;
    },
  };
}
