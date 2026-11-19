import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coca-Cola Shake Shake | Interactive Arcade Activation',
  description: 'Offline 2D interactive arcade activation powered by Phaser 3 and BLE bottle controller',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden select-none bg-black">
        {children}
      </body>
    </html>
  );
}

