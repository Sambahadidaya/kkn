import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ThemeProvider from '../components/themeProvider';

export const metadata = {
  title: 'KKN Tematik Pengolahan Sampah Lingkungan',
  description: 'Aplikasi partisipasi masyarakat dalam pemilahan dan pengelolaan sampah rumah tangga',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
