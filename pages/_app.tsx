import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Saira } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';

const saira = Saira({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-saira',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div
        className={saira.variable}
        style={{ fontFamily: "var(--font-saira, 'Saira', sans-serif)" }}
      >
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
