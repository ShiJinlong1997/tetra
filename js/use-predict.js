import { Offset, Shape } from './util/index.js';
import { ClassMapList } from './util/dom.js';
import { RndLetter } from './util/rnd.js';
import { game, perdictDic } from './const.js';

/** @type {function(Main.PickedState): number[]} */
const IndexList = R.converge(R.map, [R.compose(R.add, Offset(game.predictSize)), Shape(perdictDic)]);

/** @returns {Main.Predict} */
export function usePredict() {
  return {
    info: {
      angle: 0,
      letter: RndLetter(perdictDic),
    },
    get position() {
      return {
        row: 0,
        col: game.predictSize.col / 2 - 1,
      };
    },
    get indexList() {
      return IndexList( R.mergeRight(this.position,this.info) );
    },
    classMapList: ClassMapList( Math.pow(game.predictSize.col,2) ),
    get squares() {
      return Array.from(game.predictElem.children);
    },
    nextShape() {
      this.info.letter = RndLetter(perdictDic);
    },
  };
}
