declare namespace Main {
  type ShapeDic = typeof import('./const.js').shapeDic;
  type Letter = keyof ShapeDic;
  type MoveTo = 'left' | 'right';
  type Sign = -1 | 1;
  type ShapeStatus = 'active' | 'hold';
  type PlayStatus = 'paused' | 'playing';
  type ClassNameSet = Set<'show' | 'taken'>;

  interface UseShapeStatus {
    shapeStatus: ShapeStatus;
    toggleShapeStatus(): void;
  }

  interface UsePlayStatus {
    playStatus: PlayStatus;
    togglePlayStatus(): void;
  }

  interface UseLetter {
    angle: number;
    inferNextAngle(): number;
    letter: Letter;
  }
  
  interface UsePosition {
    position: {
      row: 0;
      col: number;
    },
    get row(): number;
    get col(): number;
  }

  type State =
  & UseShapeStatus
  & UsePlayStatus
  & UseLetter
  & UsePosition
  & { score: number; }
  & { timerId: number; }
  & { init(): void; }
  & {
      classNameList: ClassNameSet[];
      get indexList(): number[];
    }
}