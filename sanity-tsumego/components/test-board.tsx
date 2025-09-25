import React from 'react';
import { createRoot } from 'react-dom/client';
import GoBoard from '../GoBoard';

const TestBoard = () => {
  return (
    <GoBoard
      boardSize={9} // or 13, 19
      stones={[]}
      onBoardClick={() => {}}
    />
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TestBoard />);
}
