'use client';

import { useState, useCallback, useEffect } from 'react';

const QuoridorGame = () => {
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerWalls, setPlayerWalls] = useState([10, 10]);
  const [gameMode, setGameMode] = useState('move');
  const [status, setStatus] = useState("Player 1's turn - Click to move!");
  const [gameWon, setGameWon] = useState(false);
  
  // Player positions
  const [players, setPlayers] = useState([
    { row: 8, col: 4, targetRow: 0, name: 'Player 1', color: 'bg-red-500' },
    { row: 0, col: 4, targetRow: 8, name: 'Player 2 (AI)', color: 'bg-blue-500' }
  ]);
  
  // Board state - 9x9 grid with walls
  const [board, setBoard] = useState(() => {
    const initialBoard = [];
    for (let row = 0; row < 9; row++) {
      initialBoard[row] = [];
      for (let col = 0; col < 9; col++) {
        initialBoard[row][col] = {
          occupied: (row === 8 && col === 4) || (row === 0 && col === 4),
          walls: { top: false, right: false, bottom: false, left: false }
        };
      }
    }
    return initialBoard;
  });

  const [validMoves, setValidMoves] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Check if a move is valid
  const isValidMove = useCallback((player, targetRow, targetCol) => {
    if (targetRow < 0 || targetRow > 8 || targetCol < 0 || targetCol > 8) return false;
    if (board[targetRow][targetCol].occupied) return false;
    
    const currentRow = players[player].row;
    const currentCol = players[player].col;
    
    const rowDiff = Math.abs(targetRow - currentRow);
    const colDiff = Math.abs(targetCol - currentCol);
    
    // Can only move one step in any direction
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      return !isWallBlocking(currentRow, currentCol, targetRow, targetCol);
    }
    
    return false;
  }, [players, board]);

  // Check if a wall blocks movement between two adjacent cells
  const isWallBlocking = useCallback((fromRow, fromCol, toRow, toCol) => {
    if (fromRow === toRow) {
      // Horizontal movement
      if (fromCol < toCol) {
        return board[fromRow][fromCol].walls.right;
      } else {
        return board[fromRow][fromCol].walls.left;
      }
    } else {
      // Vertical movement
      if (fromRow < toRow) {
        return board[fromRow][fromCol].walls.bottom;
      } else {
        return board[fromRow][fromCol].walls.top;
      }
    }
  }, [board]);

  // Get all valid moves for a player
  const getValidMovesForPlayer = useCallback((player) => {
    const moves = [];
    const currentRow = players[player].row;
    const currentCol = players[player].col;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    directions.forEach(([dRow, dCol]) => {
      const newRow = currentRow + dRow;
      const newCol = currentCol + dCol;
      
      if (isValidMove(player, newRow, newCol)) {
        moves.push({ row: newRow, col: newCol });
      }
    });
    
    return moves;
  }, [players, isValidMove]);

  // Update valid moves when current player changes
  useEffect(() => {
    if (!gameWon) {
      const moves = getValidMovesForPlayer(currentPlayer);
      setValidMoves(moves);
    }
  }, [currentPlayer, players, board, getValidMovesForPlayer, gameWon]);

  // Move player
  const movePlayer = useCallback((player, newRow, newCol) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[player] = { ...newPlayers[player], row: newRow, col: newCol };
      return newPlayers;
    });
    
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ ...cell })));
      // Clear old position
      newBoard[players[player].row][players[player].col].occupied = false;
      // Set new position
      newBoard[newRow][newCol].occupied = true;
      return newBoard;
    });
  }, [players]);

  // Check win condition
  const checkWinCondition = useCallback((player) => {
    return players[player].row === players[player].targetRow;
  }, [players]);

  // Handle cell click for movement
  const handleCellClick = useCallback((row, col) => {
    if (gameWon || gameMode !== 'move') return;
    
    const isValid = validMoves.some(move => move.row === row && move.col === col);
    if (isValid) {
      movePlayer(currentPlayer, row, col);
      
      // Check win condition
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayer] = { ...updatedPlayers[currentPlayer], row, col };
      
      if (updatedPlayers[currentPlayer].row === updatedPlayers[currentPlayer].targetRow) {
        setGameWon(true);
        setStatus(`🎉 ${updatedPlayers[currentPlayer].name} wins!`);
        return;
      }
      
      // Switch player
      const nextPlayer = 1 - currentPlayer;
      setCurrentPlayer(nextPlayer);
      setStatus(`${updatedPlayers[nextPlayer].name}'s turn`);
      
      // AI move after a delay
      if (nextPlayer === 1) {
        setTimeout(() => makeAIMove(updatedPlayers), 1000);
      }
    }
  }, [gameWon, gameMode, validMoves, currentPlayer, movePlayer, players]);

  // Simple AI logic
  const makeAIMove = useCallback((currentPlayers) => {
    if (gameWon) return;
    
    const aiMoves = [];
    const currentRow = currentPlayers[1].row;
    const currentCol = currentPlayers[1].col;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    directions.forEach(([dRow, dCol]) => {
      const newRow = currentRow + dRow;
      const newCol = currentCol + dCol;
      
      if (newRow >= 0 && newRow <= 8 && newCol >= 0 && newCol <= 8) {
        if (!board[newRow][newCol].occupied && !isWallBlocking(currentRow, currentCol, newRow, newCol)) {
          // Prioritize moves toward target
          const priority = newRow > currentRow ? 10 : 1;
          aiMoves.push({ row: newRow, col: newCol, priority });
        }
      }
    });
    
    if (aiMoves.length > 0) {
      // Sort by priority (moves toward target first)
      aiMoves.sort((a, b) => b.priority - a.priority);
      const move = aiMoves[0];
      
      movePlayer(1, move.row, move.col);
      
      // Check AI win condition
      if (move.row === 8) {
        setGameWon(true);
        setStatus('🤖 AI wins!');
        return;
      }
      
      // Switch back to human player
      setCurrentPlayer(0);
      setStatus("Player 1's turn");
    }
  }, [gameWon, board, isWallBlocking, movePlayer]);

  // Wall placement logic (simplified for 2D)
  const canPlaceWall = useCallback((row, col, orientation) => {
    if (playerWalls[currentPlayer] <= 0) return false;
    
    if (orientation === 'horizontal') {
      // Check horizontal wall placement
      if (row < 0 || row > 7 || col < 0 || col > 7) return false;
      return !board[row][col].walls.bottom && !board[row][col + 1].walls.bottom;
    } else {
      // Check vertical wall placement
      if (row < 0 || row > 7 || col < 0 || col > 7) return false;
      return !board[row][col].walls.right && !board[row + 1][col].walls.right;
    }
  }, [playerWalls, currentPlayer, board]);

  const placeWall = useCallback((row, col, orientation) => {
    if (!canPlaceWall(row, col, orientation)) return false;
    
    setBoard(prev => {
      const newBoard = prev.map(row => row.map(cell => ({ 
        ...cell, 
        walls: { ...cell.walls }
      })));
      
      if (orientation === 'horizontal') {
        newBoard[row][col].walls.bottom = true;
        newBoard[row][col + 1].walls.bottom = true;
        if (row + 1 <= 8) {
          newBoard[row + 1][col].walls.top = true;
          newBoard[row + 1][col + 1].walls.top = true;
        }
      } else {
        newBoard[row][col].walls.right = true;
        newBoard[row + 1][col].walls.right = true;
        if (col + 1 <= 8) {
          newBoard[row][col + 1].walls.left = true;
          newBoard[row + 1][col + 1].walls.left = true;
        }
      }
      
      return newBoard;
    });
    
    setPlayerWalls(prev => {
      const newWalls = [...prev];
      newWalls[currentPlayer]--;
      return newWalls;
    });
    
    return true;
  }, [canPlaceWall, currentPlayer]);

  // Handle wall placement click
  const handleWallClick = useCallback((row, col, orientation) => {
    if (gameWon || gameMode !== 'wall') return;
    
    if (placeWall(row, col, orientation)) {
      // Switch player
      const nextPlayer = 1 - currentPlayer;
      setCurrentPlayer(nextPlayer);
      setStatus(`${players[nextPlayer].name}'s turn`);
      
      // AI move for walls (simplified - AI doesn't place walls in this version)
      if (nextPlayer === 1) {
        setTimeout(() => makeAIMove(players), 1000);
      }
    } else {
      setStatus('Cannot place wall there!');
      setTimeout(() => setStatus(`${players[currentPlayer].name}'s turn`), 1500);
    }
  }, [gameWon, gameMode, placeWall, currentPlayer, players, makeAIMove]);

  // Reset game
  const resetGame = () => {
    setCurrentPlayer(0);
    setPlayerWalls([10, 10]);
    setGameMode('move');
    setStatus("Player 1's turn - Click to move!");
    setGameWon(false);
    
    setPlayers([
      { row: 8, col: 4, targetRow: 0, name: 'Player 1', color: 'bg-red-500' },
      { row: 0, col: 4, targetRow: 8, name: 'Player 2 (AI)', color: 'bg-blue-500' }
    ]);
    
    const initialBoard = [];
    for (let row = 0; row < 9; row++) {
      initialBoard[row] = [];
      for (let col = 0; col < 9; col++) {
        initialBoard[row][col] = {
          occupied: (row === 8 && col === 4) || (row === 0 && col === 4),
          walls: { top: false, right: false, bottom: false, left: false }
        };
      }
    }
    setBoard(initialBoard);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-2 animate-pulse">
          🎮 QUORIDOR GAME
        </h1>
        <p className="text-gray-300 text-lg">Strategic Board Game - Reach the opposite end!</p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Game Controls */}
        <div className="lg:w-80 space-y-4">
          <div className="bg-black bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Game Controls</h2>
            
            {/* Current Player Info */}
            <div className={`p-4 rounded-xl mb-4 ${players[currentPlayer].color} bg-opacity-20 border-2 ${players[currentPlayer].color.replace('bg-', 'border-')}`}>
              <div className="text-white text-center">
                <div className="text-lg font-bold">{players[currentPlayer].name}</div>
                <div className="text-sm opacity-75">Walls: {playerWalls[currentPlayer]}</div>
              </div>
            </div>

            {/* Mode Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setGameMode('move');
                  setStatus(gameWon ? status : `${players[currentPlayer].name}'s turn - Move mode`);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                  gameMode === 'move'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={gameWon}
              >
                🚶‍♂️ Move Player
              </button>
              <button
                onClick={() => {
                  setGameMode('wall');
                  setStatus(gameWon ? status : `${players[currentPlayer].name}'s turn - Wall mode`);
                }}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                  gameMode === 'wall'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                disabled={gameWon}
              >
                🧱 Place Wall
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetGame}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              🔄 Reset Game
            </button>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-xl">
              <h3 className="text-white font-bold mb-2">📋 How to Play:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Reach the opposite end to win</li>
                <li>• Move mode: Click highlighted cells</li>
                <li>• Wall mode: Click between cells</li>
                <li>• Use walls to block opponent</li>
                <li>• Each player has 10 walls</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1">
          <div className="bg-black bg-opacity-30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <div className="inline-block bg-gray-900 rounded-xl p-4">
              <div className="grid grid-cols-9 gap-1" style={{ width: 'fit-content' }}>
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isCurrentPlayer = players.some((player, pIndex) => 
                      player.row === rowIndex && player.col === colIndex && pIndex === currentPlayer
                    );
                    const playerOnCell = players.find(player => 
                      player.row === rowIndex && player.col === colIndex
                    );
                    const isValidMoveCell = validMoves.some(move => 
                      move.row === rowIndex && move.col === colIndex
                    );
                    const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="relative"
                      >
                        {/* Main Cell */}
                        <div
                          className={`
                            w-12 h-12 border-2 border-gray-600 cursor-pointer transition-all duration-200 transform hover:scale-110
                            ${playerOnCell 
                              ? `${playerOnCell.color} border-white shadow-lg` 
                              : isValidMoveCell && gameMode === 'move'
                              ? 'bg-green-500 bg-opacity-60 border-green-300 animate-pulse'
                              : 'bg-gray-800 hover:bg-gray-700'
                            }
                            ${isCurrentPlayer ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''}
                            ${isHovered ? 'shadow-xl shadow-blue-500/50' : ''}
                          `}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {/* Player indicator */}
                          {playerOnCell && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white bg-opacity-90 flex items-center justify-center font-bold text-gray-900">
                                {players.findIndex(p => p.row === rowIndex && p.col === colIndex) + 1}
                              </div>
                            </div>
                          )}
                          
                          {/* Valid move indicator */}
                          {isValidMoveCell && gameMode === 'move' && !playerOnCell && (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-white bg-opacity-80 animate-bounce"></div>
                            </div>
                          )}
                        </div>

                        {/* Wall elements */}
                        {/* Right wall */}
                        {colIndex < 8 && (
                          <div
                            className={`absolute -right-1 top-0 w-2 h-12 cursor-pointer transition-all duration-200 ${
                              cell.walls.right 
                                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                                : gameMode === 'wall' 
                                ? 'bg-gray-600 hover:bg-orange-500 opacity-50 hover:opacity-100' 
                                : 'bg-transparent'
                            }`}
                            onClick={() => handleWallClick(rowIndex, colIndex, 'vertical')}
                          />
                        )}

                        {/* Bottom wall */}
                        {rowIndex < 8 && (
                          <div
                            className={`absolute top-12 left-0 w-12 h-2 cursor-pointer transition-all duration-200 ${
                              cell.walls.bottom 
                                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' 
                                : gameMode === 'wall' 
                                ? 'bg-gray-600 hover:bg-orange-500 opacity-50 hover:opacity-100' 
                                : 'bg-transparent'
                            }`}
                            onClick={() => handleWallClick(rowIndex, colIndex, 'horizontal')}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black bg-opacity-80 backdrop-blur-lg rounded-full px-8 py-4 border border-gray-600">
          <div className={`text-center font-bold text-lg ${gameWon ? 'text-yellow-400 animate-bounce' : 'text-white'}`}>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoridorGame;