import DashboardClient from '../../components/Dashboard.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
