import { ReactNode } from 'react';
import { AnimatedBackground } from "./animation_components";
import { NavBar } from './nav_bar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <AnimatedBackground />
      <NavBar />
      {children}
    </>
  );
}