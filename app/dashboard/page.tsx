import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PegawaiDashboard from '@/components/PegawaiDashboard';
import OSDMDashboard from '@/components/OSDMDashboard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      {session.user.role === 'PEGAWAI' ? (
        <PegawaiDashboard session={session} />
      ) : (
        <OSDMDashboard session={session} />
      )}
    </div>
  );
}
