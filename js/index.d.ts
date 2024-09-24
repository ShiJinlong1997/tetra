declare namespace Main {
  type ShapeDic = ReturnType<typeof import('./const.js').genShapeDic>;
  type Letter = keyof ShapeDic;
  type MoveTo = 'left' | 'right';
  type Sign = -1 | 1;
  type ShapeStatus = 'active' | 'hold';
  type PlayStatus = 'paused' | 'playing';
  type ClassNameSet = Set<'show' | 'taken'>;
  type PickedState = Pick<Main.State, 'letter' | 'angle' | 'row' | 'col'>;

  interface UseShape {
    letter: Letter;
    angle: number;
  }
  
  interface UsePosition {
    row: number;
    col: number;
  }

  interface UseRender {
    get indexList(): number[];
    classNameList: ClassNameSet[];
    get squares(): HTMLDivElement[];
  }

  type Predict =
  & { info: UseShape; }
  & { get position(): UsePosition; }
  & UseRender
  & { nextShape(): void; }

  type State =
  & {
      shapeStatus: ShapeStatus;
      toggleShapeStatus(): void;
    }
  & {
      playStatus: PlayStatus;
      togglePlayStatus(): void;
    }
  & UseShape
  & UsePosition
  & { score: number; }
  & { timerId: number; }
  & {
      nextShape(predict: Predict): void;
      resetPosition(): void;
    }
  & UseRender
  & {
      inferNextAngle(): number;
      inferPrevAngle(): number;
    }
}