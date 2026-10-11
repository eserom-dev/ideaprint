import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'IDEAPRINT — Make Ideas Buildable | AI Product Engineering Workspace',
  description:
    'Turn your software ideas into structured requirements, technical architecture, development tasks, and actionable product blueprints — all in one intelligent workspace.',
  keywords: [
    'software blueprint',
    'product engineering',
    'AI architecture generator',
    'Postgres RLS',
    'task graph',
    'traceability',
    'Build Pack',
  ],
  authors: [{ name: 'IDEAPRINT' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-base text-primary antialiased min-h-screen selection:bg-ember selection:text-zinc-950">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
