import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Label } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { UploadCloud, CheckCircle2, AlertCircle, Camera } from 'lucide-react';

const PRESETS = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    image: '/pothole_main_st.png',
    aiResult: {
      type: 'Roads & Infrastructure',
      department: 'Public Works',
      description: 'Detected a large, severe pothole on the asphalt surface posing a hazard to vehicles. Located near the center lane.',
    }
  },
  {
    id: 2,
    title: 'Broken Streetlight in Central Park',
    image: '/broken_streetlight.png',
    aiResult: {
      type: 'Parks & Recreation',
      department: 'Parks Dept',
      description: 'Identified a damaged street luminaire with exposed wiring on the pedestrian path. Requires immediate electrical maintenance.',
    }
  },
  {
    id: 3,
    title: 'Uncollected Garbage Pile near Downtown',
    image: '/garbage_pile.png',
    aiResult: {
      type: 'Sanitation',
      department: 'Sanitation Dept',
      description: 'Visual analysis shows an excessive accumulation of uncollected waste bags obstructing the sidewalk area.',
    }
  }
];

export default function FileComplaint() {
  const { addComplaint, setActiveView } = useComplaints();
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, analyzing, complete
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const [formData, setFormData] = useState({
    type: '',
    department: '',
    description: '',
    name: '',
    contact: '',
    address: ''
  });

  const handlePresetClick = (preset) => {
    setSelectedImage(preset.image);
    startAiAnalysis(preset.aiResult);
  };

  const startAiAnalysis = (result) => {
    setAiStatus('analyzing');
    setProgress(0);
    setLogs([]);
    
    // Simulate AI sequence
    setTimeout(() => { setProgress(25); setLogs(l => [...l, 'Step 1: Analyzing image metadata and pixels...']); }, 500);
    setTimeout(() => { setProgress(60); setLogs(l => [...l, 'Step 2: Detecting objects (confidence score 96%)...']); }, 1500);
    setTimeout(() => { setProgress(90); setLogs(l => [...l, 'Step 3: Identifying category & routing department...']); }, 2500);
    setTimeout(() => {
      setProgress(100);
      setAiStatus('complete');
      setFormData(prev => ({ ...prev, ...result }));
    }, 3200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = addComplaint(formData);
    // Reset and redirect
    setActiveView('track');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">File a Complaint</h2>
        <p className="text-slate-500 mt-1">Upload an image and let our AI instantly categorize and route your issue.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & AI */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Camera className="text-municipal-indigo" size={20} /> 
                Image Analysis
              </h3>
            </CardHeader>
            <CardContent>
              {aiStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                    <UploadCloud className="mx-auto text-slate-400 group-hover:text-municipal-indigo transition-colors" size={32} />
                    <p className="mt-2 text-sm font-medium text-slate-700">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, HEIC</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Or try a sample preset</p>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESETS.map(preset => (
                        <div 
                          key={preset.id}
                          onClick={() => handlePresetClick(preset)}
                          className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 hover:border-municipal-indigo hover:shadow-md transition-all relative"
                        >
                          <img src={preset.image} alt={preset.title} className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                            <span className="text-[10px] font-medium text-white leading-tight">{preset.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {aiStatus !== 'idle' && (
                <div className="space-y-5">
                  <div className="relative rounded-lg overflow-hidden h-48 border border-slate-200">
                    <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                    {aiStatus === 'analyzing' && (
                      <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-700">AI Processing...</span>
                      <span className="text-municipal-indigo">{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} />
                  </div>

                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 space-y-1.5 h-32 overflow-hidden shadow-inner">
                    {logs.map((log, i) => (
                      <div key={i} className="animate-fade-in-up">
                        <span className="text-slate-500 mr-2">{'>'}</span>{log}
                      </div>
                    ))}
                    {aiStatus === 'complete' && (
                      <div className="text-white mt-2 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> Analysis Complete
                      </div>
                    )}
                  </div>
                  
                  {aiStatus === 'complete' && (
                    <Button variant="outline" className="w-full" onClick={() => setAiStatus('idle')}>
                      Analyze Another Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Smart Form */}
        <div className="lg:col-span-7">
          <Card className={cn("transition-all duration-500", aiStatus === 'idle' ? "opacity-50 pointer-events-none grayscale-[50%]" : "opacity-100")}>
            <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="text-municipal-indigo" size={20} /> 
                Smart Complaint Form
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="text-municipal-indigo shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-medium text-indigo-900">AI Auto-filled Fields</h4>
                    <p className="text-xs text-indigo-700 mt-1">Our AI has automatically categorized and drafted a description based on your image. Please provide your contact details to proceed.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Issue Category (AI Detected)</Label>
                    <Input id="type" value={formData.type} readOnly className="bg-slate-50 border-dashed" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Assigned Dept (AI Routed)</Label>
                    <Input id="department" value={formData.department} readOnly className="bg-slate-50 border-dashed" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Complaint Description (AI Drafted)</Label>
                  <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>

                <div className="border-t border-slate-100 pt-5 mt-5">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Reporter Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact">Email or Phone</Label>
                      <Input id="contact" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="address">Incident Location / Address</Label>
                      <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Main St, Near Central Square" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={aiStatus !== 'complete'} className="w-full md:w-auto">
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
