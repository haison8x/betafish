function convertToFen(pgn) {
  myChess.reset();
  myChess.loadPgn(pgn);

  return myChess.fen();
}

function getCurrentPGN() {
  let pgn = ""
  let counter = 1;
  jQuery('#live-game-tab-scroll-container .move-list-row').each(function (i, e) {
    let step = counter.toString() + ". "
    jQuery(e)
      .find('div.node .node-highlight-content')
      .each(function (i1, e1) {
        let nodes = e1.childNodes;
        let move = '';
        for (let node of nodes) {
          if (node.nodeType === 3) {
            move += node.nodeValue.trim();
          } else if (node.nodeType === 1) {
            let figurine = jQuery(node).data("figurine");
            move += figurine || "";
          }
        }
        step += move + " "
      })
    pgn += step;
    counter++;
  })

  return pgn.trim()
}



function toCoordinates(move) {
  let code = move[0].charCodeAt(0)
  let number = code - 97 + 1
  return [number, parseInt(move[1])]
}

function highlightFrom(move) {
  let coordinates = toCoordinates(move.toLowerCase())
  jQuery('#board-layout-chessboard .square-' + coordinates[0] + coordinates[1]).css('background-color', 'red')
}

function highlightTo(move) {

  let coordinates = toCoordinates(move.toLowerCase());
  let x = (coordinates[0] - 1);
  let y = 7 - (coordinates[1] - 1);

  if (myGame.GameBoard.side == 1) {
    x = 7 - x;
    y = 7 - y;
  }

  let width = jQuery('#board-layout-chessboard').width();
  let height = jQuery('#board-layout-chessboard').height();
  let startOfLeft = (width - height) / 2;
  let left = startOfLeft + x * height / 8;
  let top = y * height / 8;
  $moveToDiv = $(`<div class="move-to-div" style="position:absolute;left:${left}px;top:${top}px;width: 30px;height: 30px;z-index: 1000;background-color: red;">&nbsp;</div>`);
  jQuery('#board-layout-chessboard').append($moveToDiv);
}


function resetHighlight() {

  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 8; j++) {
      jQuery('#board-layout-chessboard .square-' + i + j).css('background-color', '')
    }
  }
  if ($moveToDiv) {
    $moveToDiv.remove();
  }
}

const mySquares = {
  '21': 'A1', '22': 'B1', '23': 'C1', '24': 'D1', '25': 'E1', '26': 'F1', '27': 'G1', '28': 'H1',
  '31': 'A2', '32': 'B2', '33': 'C2', '34': 'D2', '35': 'E2', '36': 'F2', '37': 'G2', '38': 'H2',
  '41': 'A3', '42': 'B3', '43': 'C3', '44': 'D3', '45': 'E3', '46': 'F3', '47': 'G3', '48': 'H3',
  '51': 'A4', '52': 'B4', '53': 'C4', '54': 'D4', '55': 'E4', '56': 'F4', '57': 'G4', '58': 'H4',
  '61': 'A5', '62': 'B5', '63': 'C5', '64': 'D5', '65': 'E5', '66': 'F5', '67': 'G5', '68': 'H5',
  '71': 'A6', '72': 'B6', '73': 'C6', '74': 'D6', '75': 'E6', '76': 'F6', '77': 'G6', '78': 'H6',
  '81': 'A7', '82': 'B7', '83': 'C7', '84': 'D7', '85': 'E7', '86': 'F7', '87': 'G7', '88': 'H7',
  '91': 'A8', '92': 'B8', '93': 'C8', '94': 'D8', '95': 'E8', '96': 'F8', '97': 'G8', '98': 'H8'
};

function safeChessHint() {
  if (isThinking || !autoHint) {
    return false
  }

  isThinking = true

  try {
    chessHint()
  } catch (err) {
    console.log(err.message)
  }

  isThinking = false
}

function autoDetectColor() {
  let board = jQuery('#board-single')
  if (board.length > 0) {
    myColor = board.hasClass('flipped') ? MYCOLOR_BLACK : MYCOLOR_WHITE
  }
}

function chessHint() {
  let pgn = getCurrentPGN()

  if (checkDuplicatePgn(pgn)) {
    return false
  }

  resetHighlight()

  autoDetectColor();

  let fen = convertToFen(pgn)
  myGame.reset()
  myGame.setFEN(fen)

  const status = myGame.gameStatus()

  if (!status.over && myGame.GameBoard.side == myColor) {

    let bestMove = myGame.getBestMove()
    let from = myGame.fromSQ(bestMove)
    let to = myGame.toSQ(bestMove)
    myLastHint = mySquares[from] + '->' + mySquares[to]
    jQuery('.user-username-component').text(myLastHint)
    highlightFrom(mySquares[from])
    highlightFrom(mySquares[to])
    highlightTo(mySquares[to])
  }
}

function checkDuplicatePgn(pgn) {
  if (pgn == myLastPgn) {
    jQuery('.user-username-component').text(myLastHint)
    return true
  }

  myLastPgn = pgn

  return false
}

let myGame = new engine()
myGame.setThinkingTime(4)
let myChess = new chessModule.chessClass()
let isThinking = false
let $moveToDiv = null
let myLastPgn = ''
let myLastHint = ''
const MYCOLOR_WHITE = 0
const MYCOLOR_BLACK = 1
let myColor = MYCOLOR_WHITE
let autoHint = false

jQuery('#board-layout-controls').off('click')
jQuery('#board-layout-player-bottom').off('click')
jQuery('#board-layout-player-top').off('click')
jQuery('#board-layout-ad').off('click')

jQuery('#board-layout-ad').on('click', function () {
  autoHint = !autoHint

  if (autoHint) {
    let hintColor = myColor == 0 ? 'WHITE' : 'BLACK'
    jQuery('.user-username-component').text('Auto mode. for ' + hintColor)
  } else {
    jQuery('.user-username-component').text('Manual Mode')
  }

  return false
})

jQuery('#board-layout-controls').on('click', function () {
  isThinking = true

  try {
    chessHint()
  } catch (err) {
    console.log(err.message)
  }

  isThinking = false

  return false
})

let myHintHandle = setInterval(safeChessHint, 500)
