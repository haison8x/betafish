import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";

const Chessboard = dynamic(() => import("chessboardjsx"), {
  ssr: false, // <- this do the magic ;)
});

var reverse_array = function (array) {
  return array.slice().reverse();
};

export default function Test() {
  const [position, setPosition] = useState("start");
  const [game, setGame] = useState();
  const [gameState, setGameState] = useState("");
  const [orientation, setOrientation] = useState();
  const [positionsEvaluated, setPositionsEvaluated] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  var pawn_value = 100;
  var knight_value = 320;
  var bishop_value = 330;
  var rook_value = 500;
  var queen_value = 900;
  var king_value = 20000;

  useEffect(() => {
    setGame(new Chess());
    // setTimeout(() => randomMove(), 1000);
  }, []);

  useEffect(() => {
    if (orientation === "black") {
      makeMove();
    }
    setPositionsEvaluated(0);
  }, [orientation]);

  const onDrop = ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    var move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return "snapback";
    setPosition(game.fen());
    setGameState("Black to move");
    if (game.in_checkmate()) {
      setGameState("White wins");
      console.log(game.pgn());
    }
    // make random legal move for black
    window.setTimeout(() => makeMove(), 300);
    if (game.in_checkmate()) {
      setGameState("Black wins");
      console.log(game.pgn());
    }
  };

  const makeMove = () => {
    setPositionsEvaluated(0);
    game.move(rootnegamax());
    setPosition(game.fen());
  };

  // const boardScore = (fen) => {
  //   // fen = rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
  //   // caps are for white
  //   // white is maximizing player
  //   const pieceWorth = {
  //     p: -1,
  //     P: 1,
  //     k: -3,
  //     K: 3,
  //     b: -3,
  //     B: 3,
  //     r: -5,
  //     R: 5,
  //     q: -3,
  //     Q: 3,
  //     k: -99999,
  //     K: 99999,
  //   };
  //   const pieces = fen.split(" ")[0].split("");
  //   const score = 0;
  //   for (const piece in pieces) {
  //     score += pieceWorth[pieces[piece]] || 0;
  //   }

  //   if (game.turn() === "b" && game.in_checkmate()) score += 99999999;
  //   if (game.turn() === "w" && game.in_checkmate()) score -= 99999999;

  //   return score;
  // };

  var evaluate = function () {
    if (game.in_checkmate()) {
      return game.turn() === "w" ? 999999 : -999999;
    }
    if (
      game.in_threefold_repetition() ||
      game.in_stalemate() ||
      game.in_draw()
    ) {
      return game.turn() === "w" ? 999999 : -999999;
    }

    var total = 0;

    // loop through the board
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        // get every piece
        var piece = game.get(String.fromCharCode(97 + i) + (j + 1));

        // exit as soon as possible if there's not piece
        if (!piece) {
          continue;
        }

        /* add the piece value
         * p > pawn > 100
         * n > knight > 320
         * b > bishop > 330
         * r > rook > 500
         * q > queen > 900
         * k > king > 20000
         */
        var index = j * 8 + i;
        switch (piece.type) {
          case "p":
            total +=
              piece.color == "w"
                ? pawn_value + white_pawn[index]
                : -(pawn_value + black_pawn[index]);
            break;
          case "n":
            total +=
              piece.color == "w"
                ? knight_value + white_knight[index]
                : -(knight_value + black_knight[index]);
            break;
          case "b":
            total +=
              piece.color == "w"
                ? bishop_value + white_bishop[index]
                : -(bishop_value + black_bishop[index]);
            break;
          case "r":
            total +=
              piece.color == "w"
                ? rook_value + white_rook[index]
                : -(rook_value + black_rook[index]);
            break;
          case "q":
            total +=
              piece.color == "w"
                ? queen_value + white_queen[index]
                : -(queen_value + black_queen[index]);
            break;
          case "k":
            total +=
              piece.color == "w"
                ? king_value + white_king[index]
                : -(king_value + black_king[index]);
            break; // CHANGE TO "w/b_king_endgame" table on endgame positions
        }
        /* Also give bonuses and maluses
         * ADD BISHOP PAIR BONUS
         * ADD KNIGHT PAIR MALUS
         * ADD PAWN STRUCTURE BONUS / MALUS
         * ADD KING PROXIMITY ON ENDGAME
         */
      }
    }

    return game.turn() === "w" ? total : -total;
  };

  const quiescence = (alpha, beta) => {
    setPositionsEvaluated((e) => e + 1);
    const evaluation = evaluate();

    if (evaluation >= beta) {
      return beta;
    }
    if (alpha < evaluation) {
      alpha = evaluation;
    }

    const movesWithTakes = game.moves()?.filter((move) => move.includes("x"));
    for (var i = 0; i < movesWithTakes.length; i++) {
      game.move(movesWithTakes[i]);

      var score = -quiescence(-beta, -alpha);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  };

  // Negamax algorithm root
  var rootnegamax = function () {
    var start_time = performance.now();
    var depth = 1;
    var moves = game.moves();
    var max = -Infinity;
    var best_move;

    for (var i in moves) {
      game.move(moves[i]);
      var score = -negamax(depth - 1, -999999, 999999);
      game.undo();

      if (score > max) {
        max = score;
        best_move = moves[i];
      }
    }

    var end_time = performance.now();
    var time_taken = end_time - start_time;

    setTimeTaken((time_taken / 1000).toFixed(3));
    return best_move;
  };

  var negamax = function (depth, alpha, beta) {
    setPositionsEvaluated((e) => e + 1);
    if (depth == 0) {
      // return evaluate();
      return quiescence(alpha, beta);
    }
    var moves = game.moves();
    var l = moves.length;
    for (var i = 0; i < l; i++) {
      game.move(moves[i]);
      var score = -negamax(depth - 1, -beta, -alpha);
      game.undo();

      if (score >= beta) {
        return beta;
      } // beta cutoff
      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  };

  var black_pawn = [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30,
    20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5,
    -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0,
    0,
  ];

  var white_pawn = reverse_array(black_pawn);

  var black_knight = [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30,
    0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20,
    20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20,
    -40, -50, -40, -30, -30, -30, -30, -40, -50,
  ];

  var white_knight = reverse_array(black_knight);

  var black_bishop = [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0,
    5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10,
    0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20,
    -10, -10, -10, -10, -10, -10, -20,
  ];

  var white_bishop = reverse_array(black_bishop);

  var black_rook = [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0,
    -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0,
    0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ];

  var white_rook = reverse_array(black_rook);

  var black_queen = [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5,
    5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5,
    5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ];

  var white_queen = reverse_array(black_queen);

  var black_king = [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40,
    -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20,
    -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ];

  var white_king = reverse_array(black_king);

  var black_king_endgame = [
    -50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30,
    -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30,
    -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30,
    0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50,
  ];

  var white_king_endgame = reverse_array(black_king_endgame);

  const getPgn = () => {
    console.log(game.pgn());
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
        <Chessboard
          position={position}
          transitionDuration={100}
          onDrop={onDrop}
        />

        <h2>Gamestate: {gameState}</h2>
        <h2>Positions evaluated: {positionsEvaluated}</h2>
        <h2>Time taken: {timeTaken}s</h2>
        <button onClick={getPgn}>print pgn</button>
      </main>
    </div>
  );
}