declare namespace Main {
  type ShapeDic = ReturnType<typeof import('./const.js').genShapeDic>;
  type Letter = keyof ShapeDic;
  type MoveTo = 'left' | 'right';
  type Sign = -1 | 1;
  type ShapeStatus = 'active' | 'hold';
  type PlayStatus = 'paused' | 'playing';
  type ClassNameSet = Set<'show' | 'taken'>;
  type PickedState = Pick<Main.State, 'letter' | 'angle' | 'row' | 'col'>;

  interface UseShapeStatus {
    shapeStatus: ShapeStatus;
    toggleShapeStatus(): void;
  }

  interface UseShape {
    letter: Letter;
    angle: number;
  }

  interface UsePlayStatus {
    playStatus: PlayStatus;
    togglePlayStatus(): void;
  }

  interface UseLetter {
    angle: number;
    letter: Letter;
  }
  
  interface UsePosition {
    row: number;
    col: number;
  }

  type State =
  & UseShapeStatus
  & UsePlayStatus
  & UseLetter
  & UsePosition
  & UseShape
  & { score: number; }
  & { timerId: number; }
  & { init(): void; }
  & { predict: UseShape; }
  & {
      classNameList: ClassNameSet[];
      get indexList(): number[];
      inferNextAngle(): number;
      inferPrevAngle(): number;
      predictList: number[];
    }
}