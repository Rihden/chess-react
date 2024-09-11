import "./App.css";
import { useState } from "react";

function App() {
  const initialBoardState = [
    [
      { type: "R", color: "black" },
      { type: "N", color: "black" },
      { type: "B", color: "black" },
      { type: "Q", color: "black" },
      { type: "K", color: "black" },
      { type: "B", color: "black" },
      { type: "N", color: "black" },
      { type: "R", color: "black" },
    ],
    [
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
      { type: "P", color: "black" },
    ],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
      { type: "P", color: "white" },
    ],
    [
      { type: "R", color: "white" },
      { type: "N", color: "white" },
      { type: "B", color: "white" },
      { type: "Q", color: "white" },
      { type: "K", color: "white" },
      { type: "B", color: "white" },
      { type: "N", color: "white" },
      { type: "R", color: "white" },
    ],
  ];
  const [boardState, setBoardState] = useState(initialBoardState);
  const [possibleMoves, setPossibleMoves] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [currentTurn, setCurrentTurn] = useState("white");

  const [whitePlayer, setWhitePlayer] = useState({
    isChecked: false,
    kingHasMoved: false,
    rightRookMoved: false,
    leftRookMoved: false,
    hasCastled: false,
  });
  const [blackPlayer, setBlackPlayer] = useState({
    isChecked: false,
    kingHasMoved: false,
    rightRookMoved: false,
    leftRookMoved: false,
    hasCastled: false,
  });

  const [matchResult, setMatchResult] = useState(null);

  const isOccupied = function (rankIndex, fileIndex, boardState) {
    return !!boardState[rankIndex][fileIndex];
  };

  const switchTurn = function () {
    const currentTurnCopy = currentTurn;
    if (currentTurnCopy === "white") {
      setCurrentTurn("black");
      if (!checkAvailableMoves("black")) {
        if (isInCheck(boardState, "black")) {
          setMatchResult("white");
        } else {
          setMatchResult("draw");
        }
      }
    } else {
      setCurrentTurn("white");
      if (!checkAvailableMoves("white")) {
        if (isInCheck(boardState, "white")) {
          setMatchResult("black");
        } else {
          setMatchResult("draw");
        }
      }
    }
  };

  const checkAvailableMoves = function (color) {
    let hasPossibleMoves = false;
    let i = 0;
    let j = 0;

    while (!hasPossibleMoves && i < 8) {
      while (!hasPossibleMoves && j < 8) {
        const piece = boardState[i][j];
        if (piece && piece.color === color) {
          let possibleMoves = getLegalMoves({
            rank: i,
            file: j,
            piece: boardState[i][j],
          });
          if (possibleMoves.length > 0) {
            hasPossibleMoves = true;
          }
        }
        j++;
      }
      j = 0;
      i++;
    }

    return hasPossibleMoves;
  };

  const isSameColor = function (piece1, piece2) {
    return piece1 && piece2 && piece1.color == piece2.color;
  };

  const movePiece = function (targetSquare) {
    const move = {
      startingSquare: selectedSquare,
      newSquare: targetSquare,
      piece: selectedSquare.piece,
    };

    const boardStateCopy = [...boardState];
    const blackPlayerCopy = { ...blackPlayer };
    const whitePlayerCopy = { ...whitePlayer };

    // Handle castling
    if (move.piece.type === "K") {
      console.log("It's a king");

      //Short side
      if (move.startingSquare.file == move.newSquare.file - 2) {
        // Change rook spot
        boardStateCopy[move.newSquare.rank][move.newSquare.file - 1] =
          boardStateCopy[move.newSquare.rank][7];
        boardStateCopy[move.newSquare.rank][7] = null;
        if (move.piece.color == "white") {
          whitePlayerCopy.hasCastled = true;
          whitePlayerCopy.kingHasMoved = true;
          whitePlayerCopy.rightRookMoved = true;
        } else {
          blackPlayerCopy.hasCastled = true;
          blackPlayerCopy.kingHasMoved = true;
          blackPlayerCopy.rightRookMoved = true;
        }
      }

      //Long side
      if (move.startingSquare.file == move.newSquare.file + 2) {
        // Change rook spot
        boardStateCopy[move.newSquare.rank][move.newSquare.file + 1] =
          boardStateCopy[move.newSquare.rank][0];
        boardStateCopy[move.newSquare.rank][0] = null;
        if (move.piece.color == "white") {
          whitePlayerCopy.hasCastled = true;
          whitePlayerCopy.kingHasMoved = true;
          whitePlayerCopy.rightRookMoved = true;
        } else {
          blackPlayerCopy.hasCastled = true;
          blackPlayerCopy.kingHasMoved = true;
          blackPlayerCopy.rightRookMoved = true;
        }
      }
    }

    //Handle en passant capture
    if (move.piece.type === "P") {
      // if the move is diagonal (capture)
      if (move.newSquare.file != move.startingSquare.file) {
        //if the square is empty (meaning it's en passant, so the pawn should be in same rank as capturing pawn but same file as target square)
        if (!isOccupied(move.newSquare.rank, move.newSquare.file, boardState)) {
          // remove pawn
          boardStateCopy[move.startingSquare.rank][move.newSquare.file] = null;
        }
      }
    }

    // Move actual piece
    boardStateCopy[targetSquare.rank][targetSquare.file] =
      boardState[selectedSquare.rank][selectedSquare.file];
    boardStateCopy[selectedSquare.rank][selectedSquare.file] = null;

    setLastMove(move);
    resetSelectedPiece();

    blackPlayerCopy.isChecked = isInCheck(boardStateCopy, "black");
    whitePlayerCopy.isChecked = isInCheck(boardStateCopy, "white");

    setBlackPlayer(blackPlayerCopy);
    setWhitePlayer(whitePlayerCopy);
    setBoardState(boardStateCopy);
    switchTurn();
  };

  const canCastle = function (color, type) {
    const RANK = color === "white" ? 7 : 0;
    const FILE = 4;
    const fileDelta = type === "short" ? 1 : -1;
    const rookFile = type == "short" ? 7 : 0;

    if (isInCheck(boardState, color)) {
      return false;
    }
    if (
      isOccupied(RANK, FILE + 1 * fileDelta, boardState) ||
      isOccupied(RANK, FILE + 2 * fileDelta, boardState)
    ) {
      return false;
    }
    if (type == "long" && isOccupied(RANK, FILE + 3 * fileDelta, boardState)) {
      return false;
    }
    if (color == "white") {
      if (whitePlayer.kingHasMoved || whitePlayer.rightRookMoved) {
        return false;
      }
    }
    if (color == "black") {
      if (blackPlayer.kingHasMoved || blackPlayer.rightRookMoved) {
        return false;
      }
    }
    const rookPiece = boardState[RANK][rookFile];
    if (rookPiece.type != "R" || rookPiece.color != color) {
      return false;
    }
    //we can safely assume king is in his initial spot and spots next to him are empty.
    const boardStateCopy = JSON.parse(JSON.stringify(boardState));
    boardStateCopy[RANK][FILE + 1 * fileDelta] = { type: "K", color: color };
    boardStateCopy[RANK][FILE] = null;
    if (isInCheck(boardStateCopy, color)) {
      return false;
    }

    const boardStateCopy2 = JSON.parse(JSON.stringify(boardState));
    boardStateCopy2[RANK][FILE + 2 * fileDelta] = { type: "K", color: color };
    boardStateCopy2[RANK][FILE] = null;
    boardStateCopy2[RANK][FILE + 1 * fileDelta] = { type: "R", color: color };
    boardStateCopy2[RANK][rookFile] = null;
    if (isInCheck(boardStateCopy2, color)) {
      return false;
    }
    return true;
  };

  const resetSelectedPiece = function () {
    setPossibleMoves(null);
    setSelectedSquare(null);
  };

  const getLegalPawnMoves = function (square, boardState) {
    const piece = square.piece;
    const isWhite = piece.color === "white";

    const rankIndex = square.rank;
    const fileIndex = square.file;

    const possibleMovesCopy = [];
    const upwardsModifier = isWhite ? -1 : 1;

    // can only go up by one rank  //squre is not occuppied
    if (!isOccupied(rankIndex + upwardsModifier, fileIndex, boardState)) {
      possibleMovesCopy.push({
        rank: rankIndex + upwardsModifier,
        file: fileIndex,
      });
    }

    // can go 2 squares up on  first move
    if ((rankIndex === 6 && isWhite) || (rankIndex === 1 && !isWhite)) {
      if (!isOccupied(rankIndex + upwardsModifier * 2, fileIndex, boardState)) {
        possibleMovesCopy.push({
          rank: rankIndex + upwardsModifier * 2,
          file: fileIndex,
        });
      }
    }

    // can capture diagonal.
    if (isOccupied(rankIndex + upwardsModifier, fileIndex - 1, boardState)) {
      const piece2 = boardState[rankIndex + upwardsModifier][fileIndex - 1];
      if (!isSameColor(piece, piece2))
        possibleMovesCopy.push({
          rank: rankIndex + upwardsModifier,
          file: fileIndex - 1,
        });
    }
    if (isOccupied(rankIndex + upwardsModifier, fileIndex + 1, boardState)) {
      const piece2 = boardState[rankIndex + upwardsModifier][fileIndex + 1];
      if (!isSameColor(piece, piece2))
        possibleMovesCopy.push({
          rank: rankIndex + upwardsModifier,
          file: fileIndex + 1,
        });
    }

    // capture en passant
    if (lastMove && lastMove.piece.type === "P") {
      if (
        Math.abs(lastMove.startingSquare.rank - lastMove.newSquare.rank) === 2
      ) {
        if (
          lastMove.newSquare.rank === rankIndex &&
          lastMove.newSquare.file == fileIndex + 1
        ) {
          possibleMovesCopy.push({
            rank: rankIndex + upwardsModifier,
            file: fileIndex + 1,
          });
        }
        if (
          lastMove.newSquare.rank === rankIndex &&
          lastMove.newSquare.file == fileIndex - 1
        ) {
          possibleMovesCopy.push({
            rank: rankIndex + upwardsModifier,
            file: fileIndex - 1,
          });
        }
      }
    }

    return possibleMovesCopy;
  };

  const getLegalKnightMoves = function (square, boardState) {
    const piece = square.piece;
    const rank = square.rank;
    const file = square.file;
    const possibleMovesCopy = [];

    const possibleSquares = [
      {
        rank: rank - 2,
        file: file + 1,
      },
      {
        rank: rank - 2,
        file: file - 1,
      },
      {
        rank: rank + 2,
        file: file + 1,
      },
      {
        rank: rank + 2,
        file: file - 1,
      },
      {
        rank: rank - 1,
        file: file + 2,
      },
      {
        rank: rank + 1,
        file: file + 2,
      },
      {
        rank: rank + 1,
        file: file - 2,
      },
      {
        rank: rank - 1,
        file: file - 2,
      },
    ];

    possibleSquares.forEach((possibleSquare) => {
      if (
        possibleSquare.rank > 7 ||
        possibleSquare.rank < 0 ||
        possibleSquare.file > 7 ||
        possibleSquare.file < 0
      )
        return;

      if (!isOccupied(possibleSquare.rank, possibleSquare.file, boardState)) {
        possibleMovesCopy.push(possibleSquare);
      } else {
        const piece2 = boardState[possibleSquare.rank][possibleSquare.file];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push(possibleSquare);
        }
      }
    });

    return possibleMovesCopy;
  };

  const getLegalRookMoves = function (square, boardState) {
    const piece = square.piece;
    const possibleMovesCopy = [];

    let currentRank = square.rank;
    let currentFile = square.file;
    let foundPiece = false;

    // Going south
    while (currentRank < 7 && !foundPiece) {
      currentRank++;
      if (!isOccupied(currentRank, square.file, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: square.file });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][square.file];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: square.file });
        }
      }
    }

    // Going north
    foundPiece = false;
    currentRank = square.rank;
    while (currentRank > 0 && !foundPiece) {
      currentRank--;
      if (!isOccupied(currentRank, square.file, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: square.file });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][square.file];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: square.file });
        }
      }
    }

    // Going east
    foundPiece = false;
    currentFile = square.file;
    while (currentFile < 7 && !foundPiece) {
      currentFile++;
      if (!isOccupied(square.rank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: square.rank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[square.rank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: square.rank, file: currentFile });
        }
      }
    }

    // Going east
    foundPiece = false;
    currentFile = square.file;
    while (currentFile > 0 && !foundPiece) {
      currentFile--;
      if (!isOccupied(square.rank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: square.rank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[square.rank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: square.rank, file: currentFile });
        }
      }
    }

    return possibleMovesCopy;
  };

  const getLegalBishopMoves = function (square, boardState) {
    const piece = square.piece;
    const possibleMovesCopy = [];

    let currentRank = square.rank;
    let currentFile = square.file;
    let foundPiece = false;

    // Going north-west
    while (currentRank > 0 && currentFile > 0 && !foundPiece) {
      currentRank--;
      currentFile--;
      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // Going south-east
    currentRank = square.rank;
    currentFile = square.file;
    foundPiece = false;
    while (currentRank < 7 && currentFile < 7 && !foundPiece) {
      currentRank++;
      currentFile++;
      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // Going north-east
    currentRank = square.rank;
    currentFile = square.file;
    foundPiece = false;
    while (currentRank > 0 && currentFile < 7 && !foundPiece) {
      currentRank--;
      currentFile++;
      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // Going south-west
    currentRank = square.rank;
    currentFile = square.file;
    foundPiece = false;
    while (currentRank < 7 && currentFile > 0 && !foundPiece) {
      currentRank++;
      currentFile--;
      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        foundPiece = true;
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    return possibleMovesCopy;
  };

  const getLegalKingMoves = function (square, boardState) {
    const piece = square.piece;
    const possibleMovesCopy = [];
    let currentRank = square.rank;
    let currentFile = square.file;

    //top
    if (square.rank > 0) {
      currentRank = square.rank - 1;
      currentFile = square.file;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // bottom
    if (square.rank < 7) {
      currentRank = square.rank + 1;
      currentFile = square.file;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // Right
    if (square.file < 7) {
      currentFile = square.file + 1;
      currentRank = square.rank;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // Left
    if (square.file > 0) {
      currentFile = square.file - 1;
      currentRank = square.rank;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // top-right
    if (square.rank > 0 && square.file < 7) {
      currentRank = square.rank - 1;
      currentFile = square.file + 1;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // top-left
    if (square.rank > 0 && square.file > 0) {
      currentRank = square.rank - 1;
      currentFile = square.file - 1;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // bottom-right
    if (square.rank < 7 && square.file < 7) {
      currentRank = square.rank + 1;
      currentFile = square.file + 1;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    // bottom-right
    if (square.rank < 7 && square.file > 0) {
      currentRank = square.rank + 1;
      currentFile = square.file - 1;

      if (!isOccupied(currentRank, currentFile, boardState)) {
        possibleMovesCopy.push({ rank: currentRank, file: currentFile });
      } else {
        const piece2 = boardState[currentRank][currentFile];
        if (!isSameColor(piece, piece2)) {
          possibleMovesCopy.push({ rank: currentRank, file: currentFile });
        }
      }
    }

    if (canCastle(piece.color, "short")) {
      possibleMovesCopy.push({ rank: square.rank, file: square.file + 2 });
    }

    if (canCastle(piece.color, "long")) {
      possibleMovesCopy.push({ rank: square.rank, file: square.file - 2 });
    }
    return possibleMovesCopy;
  };

  const isInCheck = function (boardState, color) {
    const kingSquare = findKingSquare(boardState, color);
    const kingPiece = boardState[kingSquare.rank][kingSquare.file];
    let isCheck = false;

    const rookMoves = getLegalRookMoves(kingSquare, boardState);
    rookMoves.forEach((square) => {
      let piece = boardState[square.rank][square.file];
      if (
        piece &&
        (piece.type == "R" || piece.type == "Q") &&
        !isSameColor(piece, kingPiece)
      ) {
        isCheck = true;
        // console.log("rook/queen check on square", square);
      }
    });

    const bishopMoves = getLegalBishopMoves(kingSquare, boardState);
    bishopMoves.forEach((square) => {
      let piece = boardState[square.rank][square.file];
      if (
        piece &&
        (piece.type == "B" || piece.type == "Q") &&
        !isSameColor(piece, kingPiece)
      ) {
        isCheck = true;
        // console.log("bishop/queen check on square", square);
      }
    });

    const knightMoves = getLegalKnightMoves(kingSquare, boardState);
    knightMoves.forEach((square) => {
      let piece = boardState[square.rank][square.file];
      if (piece && piece.type == "N" && !isSameColor(piece, kingPiece)) {
        isCheck = true;
        // console.log("knight check on square", square);
      }
    });

    // King diagonals for pawns
    // if (
    //   (kingSquare.rank > 0 && color == "white") ||
    //   (kingSquare.rank < 7 && color == "black")
    // ) {
    if (color == "white" && kingSquare.rank > 0) {
      if (kingSquare.file > 0) {
        let diag1 = { rank: kingSquare.rank - 1, file: kingSquare.file - 1 };
        let piece1 = boardState[diag1.rank][diag1.file];
        if (piece1 && piece1.type == "P" && !isSameColor(piece1, kingPiece)) {
          isCheck = true;
        }
      }
      if (kingSquare.file < 7) {
        let diag2 = { rank: kingSquare.rank - 1, file: kingSquare.file + 1 };

        let piece2 = boardState[diag2.rank][diag2.file];
        if (piece2 && piece2.type == "P" && !isSameColor(piece2, kingPiece)) {
          isCheck = true;
        }
      }
    }
    if (color == "black" && kingSquare.rank < 7) {
      let diag1 = { rank: kingSquare.rank + 1, file: kingSquare.file - 1 };
      let diag2 = { rank: kingSquare.rank + 1, file: kingSquare.file + 1 };
      let piece1 = boardState[diag1.rank][diag1.file];
      if (piece1 && piece1.type == "P" && !isSameColor(piece1, kingPiece)) {
        isCheck = true;
      }
      let piece2 = boardState[diag2.rank][diag2.file];
      if (piece2 && piece2.type == "P" && !isSameColor(piece2, kingPiece)) {
        isCheck = true;
      }
    }

    // }

    return isCheck;
  };

  const findKingSquare = function (boardState, color) {
    let i = 0;
    let rank = null;
    let file = -1;
    while (file === -1) {
      file = boardState[i].findIndex(
        (element) => element && element.color == color && element.type == "K"
      );
      if (file != -1) {
        rank = i;
      } else {
        i++;
      }
    }

    return { rank, file };
  };

  const showLegalMoves = function (rankIndex, fileIndex) {
    // console.log("Starting position");
    // console.log(rankIndex, fileIndex);

    // If empty square do nothing
    if (!isOccupied(rankIndex, fileIndex, boardState)) {
      resetSelectedPiece();
      return;
    }

    const square = {
      rank: rankIndex,
      file: fileIndex,
      piece: boardState[rankIndex][fileIndex],
    };

    if (square.piece.color != currentTurn) {
      return;
    }

    // Set selected starting piece coordinates
    setSelectedSquare({
      rank: rankIndex,
      file: fileIndex,
      piece: boardState[rankIndex][fileIndex],
    });

    let legalMoves = getLegalMoves(square);
    setPossibleMoves(legalMoves);
  };

  const getLegalMoves = function (square) {
    let moves = [];

    if (square.piece.type == "P") {
      moves = getLegalPawnMoves(square, boardState);
    }

    if (square.piece.type == "N") {
      moves = getLegalKnightMoves(square, boardState);
    }

    if (square.piece.type == "R") {
      moves = getLegalRookMoves(square, boardState);
    }

    if (square.piece.type == "B") {
      moves = getLegalBishopMoves(square, boardState);
    }

    if (square.piece.type == "Q") {
      let rookMoves = getLegalRookMoves(square, boardState);
      let bishopMoves = getLegalBishopMoves(square, boardState);
      moves = rookMoves.concat(bishopMoves);
    }

    if (square.piece.type == "K") {
      moves = getLegalKingMoves(square, boardState);
    }

    return removeSelfCheckMoves(square, moves);
  };

  const removeSelfCheckMoves = function (square, moves) {
    const piece = square.piece;
    const legalMoves = moves.filter((move) => {
      // Simulate a board where the move happened
      // Deep copy boardstate to not affect original
      const boardStateCopy = JSON.parse(JSON.stringify(boardState));
      boardStateCopy[move.rank][move.file] =
        boardState[square.rank][square.file];
      boardStateCopy[square.rank][square.file] = null;

      // console.log(boardStateCopy);
      // console.log("is in check?", isInCheck(boardStateCopy, piece.color));

      if (!isInCheck(boardStateCopy, piece.color)) {
        return move;
      }
    });

    return legalMoves;
  };

  return (
    <>
      <div className="page-container">
        <div
          className={`player-name-container ${
            blackPlayer.isChecked ? "checked" : ""
          } ${currentTurn == "black" ? "current-player" : ""} ${
            matchResult === "black" ? "winning-player" : ""
          }`}
        >
          Black Player
        </div>
        <div className="board-container">
          {possibleMoves &&
            possibleMoves.map((square, index) => {
              return (
                <div
                  className="highlight possible-move"
                  style={{
                    left: 12.5 * square.file + "%",
                    top: 12.5 * square.rank + "%",
                  }}
                  key={index}
                  onClick={() => {
                    movePiece(square);
                  }}
                >
                  {boardState[square.rank][square.file] == null ? (
                    <div className="possible-move-dot"></div>
                  ) : (
                    <div className="capture"></div>
                  )}
                </div>
              );
            })}

          {selectedSquare && (
            <div
              className="highlight selected-piece"
              style={{
                left: 12.5 * selectedSquare.file + "%",
                top: 12.5 * selectedSquare.rank + "%",
              }}
            ></div>
          )}
          {blackPlayer.isChecked && (
            <div
              className="highlight checked"
              style={{
                left: 12.5 * findKingSquare(boardState, "black").file + "%",
                top: 12.5 * findKingSquare(boardState, "black").rank + "%",
              }}
            ></div>
          )}
          {whitePlayer.isChecked && (
            <div
              className="highlight checked"
              style={{
                left: 12.5 * findKingSquare(boardState, "white").file + "%",
                top: 12.5 * findKingSquare(boardState, "white").rank + "%",
              }}
            ></div>
          )}
          {boardState.map((rank, rankIndex) => {
            return (
              <div className="board-line" key={rankIndex}>
                {rank.map((piece, fileIndex) => {
                  return (
                    <div
                      className="square"
                      onClick={() => {
                        showLegalMoves(rankIndex, fileIndex);
                      }}
                      key={fileIndex}
                    >
                      {piece ? (
                        <img
                          src={`/${
                            piece.color[0]
                          }${piece.type.toLowerCase()}.png`}
                          alt=""
                          className="piece"
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div
          className={`player-name-container ${
            whitePlayer.isChecked ? "checked" : ""
          } ${currentTurn == "white" ? "current-player" : ""} ${
            matchResult === "white" ? "winning-player" : ""
          }`}
        >
          White Player
        </div>
        {matchResult && (
          <div className="match-over-container">
            <div>Game Over</div>
            <div>
              {matchResult == "white" ? (
                <div>White wins</div>
              ) : matchResult == "black" ? (
                <div>Black wins</div>
              ) : (
                <div>Stalemate</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
