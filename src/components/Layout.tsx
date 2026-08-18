import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface Props {
  mockTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoadDemo: () => void;
  children: ReactNode;
}

export default function Layout({ mockTheme, onToggleTheme, onLoadDemo, children }: Props) {
  return (
    <div id="top" className="flex min-h-[100dvh] flex-col bg-cream">
      <Navbar mockTheme={mockTheme} onToggleTheme={onToggleTheme} onLoadDemo={onLoadDemo} />
      <main className="flex-1">{children}</main>
      <Footer onLoadDemo={onLoadDemo} />
    </div>
  );
}
