// components/KanbanBoard.tsx
interface BoardProps {
  children: React.ReactNode;
}

const Board: React.FC<BoardProps> = ({ children }) => {
  return <main className="bg-slate-50 py-10">{children}</main>;
};

export default Board;
