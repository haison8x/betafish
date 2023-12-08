let myGame = new engine();
mygame.setThinkingTime(5000);
let myChess = new chessModule.chessClass();

jQuery('#player-bottom').off('click')
jQuery('#player-bottom').on('click', function () {
    let fen = getCurrentFEN()

    myGame.setFEN(fen)

    const status = myGame.gameStatus();

    if (status.over) {
        return false
    }

    myGame.makeAIMove();

    let newFen = myGame.getFEN();

    myChess.reset();
    myChess.load(newFen)

    let moves = myChess.moves({ verbose: true });
    if (moves.length > 0) {
        let move = moves[moves.length - 1]
        jQuery('.player-row-top .user-username-component').text(move.flags + ':' + move.from + '->' + move.to)
        resetHighlight()
        highlightMove(move.from)
        highlightMove(move.to)
    }

    return false
})

function getCurrentFEN() {
    let pgn = getCurrentPgn();
    myChess.reset();
    myChess.loadPgn(pgn);

    return myChess.fen();
}

function getCurrentPgn() {
    let pgn = []
    jQuery('#scroll-container .move').each(function (i, e) {
        jQuery(e)
            .find('div')
            .each(function (i1, e1) {
                let icon = jQuery(e1).find(".icon-font-chess").data("figurine");

                let move = jQuery(e1).text()
                move = icon + move.trim()

                pgn.push(move)
            })
    })

    return pgn
}

function toCoordinates(move) {
    let code = move[0].charCodeAt(0)
    let number = code - 97 + 1
    return [number, parseInt(move[1])]
}

function highlightMove(move) {
    let coordinates = toCoordinates(move)
    jQuery('#board-layout-chessboard .square-' + coordinates[0] + coordinates[1]).css('background-color', 'red')
}

function resetHighlight() {
    for (let i = 1; i <= 8; i++) {
        for (let j = 1; j <= 8; j++) {
            jQuery('#board-layout-chessboard .square-' + i + j).css('background-color', '')
        }
    }
}
