import { redirect } from 'next/navigation';
import { validateRoleRoute } from '../../scurity/roleakses';
import Header from '../../components/public/header';
import Footer from '../../components/public/footer';
import AiAsisten from '../../components/AiAsisten';
import DynamicFavicon from '../../components/DynamicFavicon';
import SiteBackground from '../../components/siteBackground';

export default async function RoleLayout({ children, params }) {
  const resolvedParams = await params;
  const role = resolvedParams.nama?.toLowerCase();

  const authCheck = await validateRoleRoute(role);
  if (!authCheck.authorized) {
    redirect(authCheck.redirectTo || '/login');
  }

  const profile = authCheck.profile;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf8] text-[#1c2826] relative pb-mobile-nav md:pb-0">
      <SiteBackground />
      <DynamicFavicon />

      {/* Header Atas (Navigasi Desktop & Info Profil) */}
      <Header role={role} profile={profile} />

      {/* Konten Halaman */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 sm:py-6">
        {children}
      </main>

      {/* Asisten AI Floating Widget */}
      <AiAsisten />

      {/* Footer & Mobile Bottom Navigation Bar Sesuai task1.md */}
      <Footer role={role} />
    </div>
  );
}
