import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const metadata = {
  title: 'KKN Tematik Pengolahan Sampah Lingkungan',
  description: 'Aplikasi partisipasi masyarakat dalam pemilahan dan pengelolaan sampah rumah tangga',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#f7faf8] text-[#1c2826] antialiased">
        {children}
      </body>
    </html>
  );
}
