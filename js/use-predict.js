import { game, perdictDic } from './const.js';
import * as _ from './tool.js';

/** @type {function(Main.PickedState): number[]} */
const IndexList = R.converge(R.map, [R.compose(R.add, _.Offset(game.predictSize)), _.Shape(perdictDic)]);

/** @returns {Main.Predict} */
export function usePredict() {
  return {
    info: {
      angle: 0,
      letter: _.RndLetter(perdictDic),
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
    classNameList: _.ClassNameList( Math.pow(game.predictSize.col,2) ),
    get squares() {
      return Array.from(game.predictElem.children);
    },
    nextShape() {
      this.info.letter = _.RndLetter(perdictDic);
    },
  };
}
