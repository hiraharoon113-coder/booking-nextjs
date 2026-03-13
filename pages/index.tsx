import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <>
      <Head>
        <title>{isLoggedIn ? 'Dashboard' : 'Sign In'} — RMS</title>
        <meta name="description" content="RMS Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoggedIn ? <DashboardLayout /> : <LoginForm />}
    </>
  );
}
