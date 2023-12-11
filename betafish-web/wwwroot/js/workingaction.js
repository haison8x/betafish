



function getCurrentFEN(pgn) {
    myChess.reset();
    myChess.loadPgn(pgn);
  
    return myChess.fen();
  }
  
  function getCurrentPGN() {
    let pgn = ""
    let counter = 1;
    jQuery('#live-game-tab-scroll-container .move').each(function (i, e) {
      let step = counter.toString() + ". "
      jQuery(e)
        .find('div.node')
        .each(function (i1, e1) {
          let icon = jQuery(e1).find(".icon-font-chess").data("figurine");
          let move = jQuery(e1).text()
          move = (icon || "") + move.trim()
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
  
  function chessHint() {
  
    if (isThinking || !autoHint) {
      return false;
    }
    let pgn;
    try {
      pgn = getCurrentPGN()
      if (pgn === myLastPgn) {
        return false;
      }
      myLastPgn = pgn;
    }
    catch { }
  
    let hintColor = myGame.GameBoard.side == 0 ? 'WHITE' : 'BLACK';
    jQuery('.user-username-component').text(hintColor + " is thinking ..................");
  
    isThinking = true;
    try {
  
      let fen = getCurrentFEN(myLastPgn);
      myGame.reset();
      myGame.setFEN(fen)
  
      const status = myGame.gameStatus();
  
      if (!status.over && myGame.GameBoard.side == myColor) {
  
        let bestMove = myGame.getBestMove();
        let from = myGame.fromSQ(bestMove);
        let to = myGame.toSQ(bestMove);
        jQuery('.user-username-component').text(mySquares[from] + '->' + mySquares[to])
        highlightFrom(mySquares[from])
        highlightFrom(mySquares[to])
        highlightTo(mySquares[to])
      }
    }
    catch {
  
    }
  
    isThinking = false;
  }
  
  
  let myGame = new engine();
  myGame.setThinkingTime(5);
  let myChess = new chessModule.chessClass();
  let isThinking = false;
  let $moveToDiv = null;
  const MYCOLOR_WHITE = 0;
  const MYCOLOR_BLACK = 1;
  let myColor = MYCOLOR_WHITE;
  let autoHint = false;
  let myBoardNodeObserver = null;
  let myLastPgn = ""
  jQuery("#board-layout-controls").off('click')
  jQuery('#board-layout-player-bottom').off('click');
  jQuery('#board-layout-player-top').off('click');
  
    
  jQuery("#board-layout-controls").on('click', function () {
    autoHint = !autoHint;
  
    if (autoHint) {
      let hintColor = myGame.GameBoard.side == 0 ? 'WHITE' : 'BLACK';
      jQuery('.user-username-component').text("Auto mode. " + hintColor);
    }
    else {
      jQuery('.user-username-component').text("Manual Mode");
    }
  
    return false
  })
  
  
  jQuery('#board-layout-player-bottom').on('click', function () {
    myColor = MYCOLOR_WHITE;
  })
  
  jQuery('#board-layout-player-top').on('click', function () {
  
    myColor = MYCOLOR_BLACK;
  })
  
  
  
  

jQuery('#board-single').on('DOMSubtreeModified', function(){
    console.log('changed');
  });


