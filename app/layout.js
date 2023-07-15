import "./globals.css";
import { Inter } from "next/font/google";
import { GameContextProvider } from "./context/GameContext";

import TopBar from "./components/TopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameContextProvider>
          <TopBar />
          {children}
        </GameContextProvider>
      </body>
    </html>
  );
}
