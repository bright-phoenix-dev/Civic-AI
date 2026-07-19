import React from 'react';
import { ComplaintProvider, useComplaints } from './context/ComplaintContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import CitizenPortal from './views/CitizenPortal';
import TrackComplaints from './views/TrackComplaints';
import AdminDashboard from './views/AdminDashboard';

function AppContent() {
  const { activeView } = useComplaints();
  
  return (
    <Layout>
      <div className="animate-fade-in h-full">
        <ErrorBoundary>
          {activeView === 'file' && <CitizenPortal />}
          {activeView === 'track' && <TrackComplaints />}
          {activeView === 'admin' && <AdminDashboard />}
        </ErrorBoundary>
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <ComplaintProvider>
      <AppContent />
    </ComplaintProvider>
  );
}
