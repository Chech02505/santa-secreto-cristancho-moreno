import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Santa Secreto | Familia Cristancho Moreno',
  description: 'Un intercambio navideño privado para la familia Cristancho Moreno.',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="snow snow-one" aria-hidden="true" />
        <div className="snow snow-two" aria-hidden="true" />
        <main className="main-wrap">{children}</main>
        <footer>Hecho con cariño para la Familia Cristancho Moreno · Santa Secreto</footer>
      </body>
    </html>
  );
}
