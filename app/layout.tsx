import type { Metadata, Viewport } from 'next';
import './globals.css';

const BASE_URL = 'https://sistema-solar.arm-solutions.com.mx';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000010',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Sistema Solar 3D — Simulador Interactivo del Sistema Solar',
    template: '%s | Sistema Solar 3D',
  },
  description:
    'Explora el Sistema Solar en tiempo real con nuestro simulador 3D interactivo. Descubre los 8 planetas, sus lunas, distancias, temperaturas y más. Ideal para estudiantes y amantes de la astronomía.',
  keywords: [
    'sistema solar 3D',
    'simulador sistema solar',
    'planetas 3D interactivo',
    'astronomía interactiva',
    'planetas del sistema solar',
    'simulación espacial',
    'educación espacial',
    'Three.js sistema solar',
    'explorar planetas',
    'sistema solar online',
  ],
  authors: [{ name: 'ARM Solutions', url: BASE_URL }],
  creator: 'ARM Solutions',
  publisher: 'ARM Solutions',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: BASE_URL,
    siteName: 'Sistema Solar 3D',
    title: 'Sistema Solar 3D — Simulador Interactivo del Sistema Solar',
    description:
      'Explora el Sistema Solar en tiempo real con nuestro simulador 3D interactivo. Descubre los 8 planetas, sus lunas, distancias y temperaturas.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sistema Solar 3D - Simulador Interactivo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema Solar 3D — Simulador Interactivo',
    description:
      'Explora el Sistema Solar en tiempo real con nuestro simulador 3D interactivo.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}