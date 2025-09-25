import React from 'react';

interface Stone {
  _key?: string;
  color: 'B' | 'W';
  x: number;
  y: number;
  type?: 'initial' | 'solution'; // Add type property
}

interface GoBoardProps {
  boardSize: number;
  stones: Stone[];
  onBoardClick: (x: number, y: number, event: React.MouseEvent<HTMLDivElement>) => void;
}

const GoBoard: React.FC<GoBoardProps> = ({ boardSize, stones, onBoardClick }) => {
  const cellSize = 35; // Corresponds to the original script's 35px
  const boardPadding = cellSize / 2; // Half cell for padding around the board

  const gridWidth = (boardSize - 1) * cellSize;
  const gridHeight = (boardSize - 1) * cellSize;
  const totalWidth = gridWidth + 2 * boardPadding;
  const totalHeight = gridHeight + 2 * boardPadding;

  const starPoints = [];
  // Star points for 9x9 board
  if (boardSize === 9) {
    starPoints.push([2, 2], [2, 6], [6, 2], [6, 6], [4, 4]);
  }
  // Star points for 13x13 board (from original script)
  else if (boardSize === 13) {
    starPoints.push(
      [3, 3], [3, 9], [9, 3], [9, 9], // Corners
      [3, 6], [6, 3], [6, 9], [9, 6], // Sides
      [6, 6] // Center
    );
  }

  return (
    <div
      style={{
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        backgroundColor: '#dcb35c',
        border: '2px solid #333',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <svg
        className="go-board-svg"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width={`${totalWidth}px`}
        height={`${totalHeight}px`}
      >
        {/* Grid lines */}
        {Array.from({ length: boardSize }).map((_, i) => (
          <React.Fragment key={`line-${i}`}>
            <line
              x1={boardPadding + i * cellSize}
              y1={boardPadding}
              x2={boardPadding + i * cellSize}
              y2={boardPadding + (boardSize - 1) * cellSize}
              stroke="black"
              strokeWidth="1"
            />
            <line
              x1={boardPadding}
              y1={boardPadding + i * cellSize}
              x2={boardPadding + (boardSize - 1) * cellSize}
              y2={boardPadding + i * cellSize}
              stroke="black"
              strokeWidth="1"
            />
          </React.Fragment>
        ))}

        {/* Star points */}
        {starPoints.map(([r, c]) => (
          <circle
            key={`star-${r}-${c}`}
            cx={boardPadding + c * cellSize}
            cy={boardPadding + r * cellSize}
            r="3"
            fill="black"
          />
        ))}

        {/* Stones */}
        {stones.map((stone, index) => {
          const solutionStones = stones.filter(s => s.type === 'solution');
          const solutionIndex = solutionStones.indexOf(stone);

          return (
            <React.Fragment key={stone._key || `${stone.x}-${stone.y}`}>
              <circle
                cx={boardPadding + stone.x * cellSize}
                cy={boardPadding + stone.y * cellSize}
                r="16"
                fill={stone.color === 'B' ? 'black' : 'white'}
                className={`stone ${stone.color === 'B' ? 'black' : 'white'}`}
              />
              {stone.type === 'solution' && solutionIndex !== -1 && (
                <text
                  x={boardPadding + stone.x * cellSize}
                  y={boardPadding + stone.y * cellSize + 5} // Adjust for vertical alignment
                  textAnchor="middle"
                  fill={stone.color === 'B' ? 'white' : 'black'}
                  fontSize="14"
                >
                  {solutionIndex + 1}
                </text>
              )}
            </React.Fragment>
          );
        })}
      </svg>

      {/* Clickable areas for placing stones */}
      {Array.from({ length: boardSize }).map((_, r) =>
        Array.from({ length: boardSize }).map((__, c) => (
          <div
            key={`square-${r}-${c}`}
            onMouseDown={(e) => onBoardClick(c, r, e)}
            onContextMenu={(e) => e.preventDefault()} // Prevent context menu
            style={{
              position: 'absolute',
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              top: `${boardPadding + r * cellSize - cellSize / 2}px`,
              left: `${boardPadding + c * cellSize - cellSize / 2}px`,
              // For debugging click areas:
              // border: '1px solid red',
            }}
          />
        ))
      )}
    </div>
  );
};

export default GoBoard;
