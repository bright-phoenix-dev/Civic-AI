import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MapPin, Calendar, Activity, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../components/ui/Card';

const STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

export default function TrackComplaints() {
  const { complaints, updateComplaintStatus } = useComplaints();
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);

  const selectedComplaint = complaints.find(c => c.id === selectedId);

  const simulateProgress = (complaint) => {
    const currentIndex = STEPS.indexOf(complaint.status);
    if (currentIndex < STEPS.length - 1) {
      updateComplaintStatus(complaint.id, STEPS[currentIndex + 1]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted': return <Badge variant="default">Submitted</Badge>;
      case 'Assigned': return <Badge variant="warning">Assigned</Badge>;
      case 'In Progress': return <Badge variant="primary">In Progress</Badge>;
      case 'Resolved': return <Badge variant="success">Resolved</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Track Issues</h2>
        <p className="text-slate-500 mt-1">Monitor the live status of your reported civic issues.</p>
      </div>

      {complaints.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-slate-500">You haven't submitted any complaints yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of Complaints */}
          <div className="lg:col-span-5 space-y-4">
            {complaints.map(c => (
              <Card 
                key={c.id} 
                className={cn(
                  "cursor-pointer transition-all hover:border-municipal-indigo",
                  selectedId === c.id ? "border-municipal-indigo ring-1 ring-municipal-indigo shadow-md" : ""
                )}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">{c.id}</span>
                      <h4 className="font-semibold text-slate-900 leading-tight">{c.type}</h4>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-1.5">
                    <MapPin size={14} />
                    <span className="truncate">{c.address}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Details & Timeline */}
          <div className="lg:col-span-7">
            {selectedComplaint && (
              <Card className="h-full">
                <CardHeader className="bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">Issue Details</h3>
                    <span className="font-mono text-sm font-medium text-slate-500">{selectedComplaint.id}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedComplaint.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedComplaint.department}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</h4>
                      <p className="text-sm font-medium text-slate-900">{selectedComplaint.address}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Activity size={18} className="text-municipal-indigo" /> 
                      Progress Timeline
                    </h4>
                    
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-slate-200"></div>

                      <div className="space-y-6 relative">
                        {STEPS.map((step, index) => {
                          const currentIndex = STEPS.indexOf(selectedComplaint.status);
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          
                          return (
                            <div key={step} className="flex gap-4">
                              <div className={cn(
                                "relative z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 shrink-0",
                                isCompleted ? "border-municipal-emerald" : "border-slate-300"
                              )}>
                                {isCompleted ? (
                                  <CheckCircle2 size={16} className="text-municipal-emerald" />
                                ) : (
                                  <Circle size={10} className="text-slate-300 fill-slate-300" />
                                )}
                              </div>
                              <div className="pt-0.5">
                                <h5 className={cn("text-sm font-semibold", isCurrent ? "text-slate-900" : isCompleted ? "text-slate-700" : "text-slate-400")}>
                                  {step}
                                </h5>
                                {isCurrent && (
                                  <p className="text-xs text-slate-500 mt-1">Currently at this stage.</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => simulateProgress(selectedComplaint)}
                      disabled={selectedComplaint.status === 'Resolved'}
                    >
                      Simulate Step Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
