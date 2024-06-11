const game = {
  row: 20,
  col: 10,
  /** @type {HTMLButtonElement} */
  get ctrlBtn() {
    return document.getElementById('ctrl');
  },
};

const state = {
  /** @type {'playing' | 'paused'} */
  playStatus: 'paused',
  togglePlayStatus() {
    this.playStatus = 'playing' == this.playStatus ? 'paused' : 'playing';
  },
};

// const cubeDic = {
//   L: [
//     [1,width+1,width*2+1,2],
//     [width,width+1,width+2,width*2+2],
//     [1,width+1,width*2+1,width*2],
//     [width,width*2,width*2+1,width*2+2],
//   ],
//   Z: [
//     [0,width,width+1,width*2+1],
//     [width+1,width+2,width*2,width*2+1],
//     [0,width,width+1,width*2+1],
//     [width+1,width+2,width*2,width*2+1],
//   ],
//   T: [
//     [1,width,width+1,width+2],
//     [1,width+1,width+2,width*2+1],
//     [width,width+1,width+2,width*2+1],
//     [1,width,width+1,width*2+1],
//   ],
//   O: [
//     [0,1,width,width+1],
//     [0,1,width,width+1],
//     [0,1,width,width+1],
//     [0,1,width,width+1],
//   ],
//   I: [
//     [1,width+1,width*2+1,width*3+1],
//     [width,width+1,width+2,width+3],
//     [1,width+1,width*2+1,width*3+1],
//     [width,width+1,width+2,width+3],
//   ],
// };

// const keyDownMap = {
//   ArrowUp: () => {},
// };

// function drop() {
//   active.forEach((item) => {++item.y});
// }

// function droppable() {
//   return active.some();
// }

// function run() {
//   droppable() && drop();
// }

function init() {
  document.querySelector('main').innerHTML = Array
    .from({ length: game.row * game.col })
    .reduce((acc, x) => acc.concat('<div></div>'), '');
}

function main() {
  init();

  game.ctrlBtn.addEventListener('click', () => {
    state.togglePlayStatus();
    game.ctrlBtn.innerHTML = 'playing' == state.playStatus
      ? '<svg t="1717924085723" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5499" width="12" height="12"><path d="M426.666667 138.666667v746.666666a53.393333 53.393333 0 0 1-53.333334 53.333334H266.666667a53.393333 53.393333 0 0 1-53.333334-53.333334V138.666667a53.393333 53.393333 0 0 1 53.333334-53.333334h106.666666a53.393333 53.393333 0 0 1 53.333334 53.333334z m330.666666-53.333334H650.666667a53.393333 53.393333 0 0 0-53.333334 53.333334v746.666666a53.393333 53.393333 0 0 0 53.333334 53.333334h106.666666a53.393333 53.393333 0 0 0 53.333334-53.333334V138.666667a53.393333 53.393333 0 0 0-53.333334-53.333334z" fill="#5C5C66" p-id="5500"></path></svg> 暂停'
      : '<svg t="1717926943187" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5648" width="12" height="12"><path d="M870.2 466.333333l-618.666667-373.28a53.333333 53.333333 0 0 0-80.866666 45.666667v746.56a53.206667 53.206667 0 0 0 80.886666 45.666667l618.666667-373.28a53.333333 53.333333 0 0 0 0-91.333334z" fill="#5C5C66" p-id="5649"></path></svg> 继续';
  });

  // const ListenerMap = {
  //   ArrowUp: transform,
  //   ArrowRight: move('right'),
  //   ArrowLeft: move('left'),
  //   ArrowDown: move('down'),
  // };

  addEventListener('keyup', event => {
  });

  // setTimeout(() => {
  //   run();
  // }, 200);
}

main();
