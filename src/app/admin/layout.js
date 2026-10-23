import { getCurrentUserProfile } from '../../scurity/roleakses';
import AdminGuard from '../../components/admin/AdminGuard';

export const metadata = {
  title: 'Panel Administrator - KKN Sampah'
};

export default async function AdminLayout({ children }) {
  const profile = await getCurrentUserProfile();

  return (
    <AdminGuard profile={profile}>
      {children}
    </AdminGuard>
  );
}
