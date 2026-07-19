import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { routeDepartment } from '../utils/engine';

const ComplaintContext = createContext();

export const useComplaints = () => useContext(ComplaintContext);

const DEFAULT_COMPLAINTS = [
  {
    id: '#CIVIC-1024',
    type: 'Roads & Infrastructure',
    department: 'Public Works',
    description: 'Large pothole on the right lane of Main St.',
    name: 'Jane Doe',
    contact: 'jane@example.com',
    address: '123 Main St',
    status: 'In Progress',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '#CIVIC-1025',
    type: 'Water & Sewage Board',
    department: 'Water & Sewage Board',
    description: 'A major pipe is leaking water into the street.',
    name: 'John Smith',
    contact: 'john@example.com',
    address: '456 Elm St',
    status: 'Submitted',
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
  }
];

export const ComplaintProvider = ({ children }) => {
  const [timeOffset, setTimeOffset] = useState(0);
  const [role, setRole] = useState('citizen'); 
  const [activeView, setActiveView] = useState('file'); 
  const [weather, setWeather] = useState('Clear'); // 'Clear' or 'Heavy Rain'

  const [complaints, setComplaints] = useState(() => {
    // SRE Hardening: Rigorous try/catch for localStorage hydration
    try {
      const saved = localStorage.getItem('civic_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        throw new Error("Local storage data is not an array.");
      }
    } catch (e) {
      console.warn("CivicAI Warning: Corrupted local storage detected. Falling back to default state.", e);
      localStorage.removeItem('civic_complaints');
    }
    return DEFAULT_COMPLAINTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('civic_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [complaints]);

  const addComplaint = useCallback((complaint) => {
    const dept = complaint.department || routeDepartment(complaint.description);
    
    const newComplaint = {
      ...complaint,
      department: dept,
      id: `#CIVIC-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date(Date.now() - timeOffset).toISOString(),
      status: 'Submitted',
    };
    
    setComplaints(prev => [newComplaint, ...prev]);
    return newComplaint.id;
  }, [timeOffset]);

  const updateComplaintStatus = useCallback((id, newStatus) => {
    if (role !== 'staff' && newStatus === 'Resolved') {
      console.warn("Security Alert: Only staff can mark tickets as resolved.");
      return; 
    }
    
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));
  }, [role]);

  const fastForwardTime = useCallback(() => {
    setTimeOffset(prev => prev + (5 * 24 * 60 * 60 * 1000));
  }, []);

  const resetTime = useCallback(() => {
    setTimeOffset(0);
  }, []);

  const simulatedTime = useMemo(() => Date.now() + timeOffset, [timeOffset]);

  const value = useMemo(() => ({
    complaints,
    addComplaint,
    updateComplaintStatus,
    activeView,
    setActiveView,
    role,
    setRole,
    weather,
    setWeather,
    fastForwardTime,
    resetTime,
    simulatedTime
  }), [complaints, addComplaint, updateComplaintStatus, activeView, role, weather, fastForwardTime, resetTime, simulatedTime]);

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};
