import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select'; // Assuming we create a basic native select wrapper
import { BellRing, Check, Clock, Filter } from 'lucide-react';
import { cn } from '../components/ui/Card';

export default function AdminPortal() {
  const { complaints, updateComplaintStatus } = useComplaints();
  const [filterDept, setFilterDept] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const departments = ['All', ...new Set(complaints.map(c => c.department))];

  const filteredComplaints = complaints.filter(c => 
    filterDept === 'All' ? true : c.department === filterDept
  );

  const pendingComplaints = filteredComplaints.filter(c => c.status === 'Submitted' || c.status === 'Assigned');

  const handleEscalate = (id) => {
    setToastMessage(`Urgent escalation reminder sent to department head for ${id}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <BellRing size={18} className="text-amber-400 animate-bounce" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Department Admin Portal</h2>
          <p className="text-slate-500 mt-1">Staff view for managing and routing civic issues.</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {pendingComplaints.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">Action Required</h4>
                <p className="text-xs text-amber-700 mt-0.5">There are {pendingComplaints.length} pending issues waiting for resolution.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => handleEscalate(pendingComplaints[0].id)}>
              Trigger Escalation
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComplaints.map(c => (
          <Card key={c.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400">{c.id}</span>
                <Badge variant={
                  c.status === 'Resolved' ? 'success' : 
                  c.status === 'In Progress' ? 'primary' : 
                  'warning'
                }>{c.status}</Badge>
              </div>
              <h3 className="font-semibold text-slate-900 leading-tight">{c.type}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">{c.department}</p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-0">
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{c.description}</p>
              
              <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Reporter:</span>
                  <span className="font-medium text-slate-700">{c.name}</span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Logged:</span>
                  <span className="font-medium text-slate-700">{new Date(c.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={c.status === 'In Progress' || c.status === 'Resolved'}
                  onClick={() => updateComplaintStatus(c.id, 'In Progress')}
                >
                  Start Work
                </Button>
                <Button 
                  variant={c.status === 'Resolved' ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={c.status === 'Resolved'}
                  onClick={() => updateComplaintStatus(c.id, 'Resolved')}
                >
                  {c.status === 'Resolved' ? <><Check size={14} className="mr-1" /> Done</> : 'Resolve'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredComplaints.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No complaints found for this department.
          </div>
        )}
      </div>
    </div>
  );
}
