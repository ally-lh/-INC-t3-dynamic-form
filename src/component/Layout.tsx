import { useState } from "react";
import Navbar from "./Navbar";
import Board from "./Board";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Board>{children}</Board>
    </div>
  );
};

export default Layout;
