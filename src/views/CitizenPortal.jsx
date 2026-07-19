import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Label } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { UploadCloud, CheckCircle2, AlertCircle, Camera, ShieldAlert } from 'lucide-react';
import { cn } from '../components/ui/Card';
import { sanitizeHTML, detectPromptInjection } from '../utils/security';
import { analyzeIssue } from '../services/groqService';

const PRESETS = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    image: '/pothole_main_st.png',
    aiResult: {
      type: 'Roads & Infrastructure',
      description: 'Detected a large, severe pothole on the asphalt surface posing a hazard to vehicles. Located near the center lane.',
    }
  },
  {
    id: 2,
    title: 'Broken Streetlight in Central Park',
    image: '/broken_streetlight.png',
    aiResult: {
      type: 'Parks & Recreation',
      description: 'Identified a damaged street luminaire with exposed wiring on the pedestrian path. Requires immediate electrical maintenance.',
    }
  },
  {
    id: 3,
    title: 'Clogged Drain on 5th Ave',
    image: '/garbage_pile.png',
    aiResult: {
      type: 'Water Leak',
      description: 'Visual analysis shows a clogged drain flooding the sidewalk area.',
    }
  }
];

export default function CitizenPortal() {
  const { addComplaint, setActiveView } = useComplaints();
  const [selectedImage, setSelectedImage] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle'); // idle, analyzing, complete
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [llmAlert, setLlmAlert] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timersRef = useRef([]);

  // Memory Leak Prevention: Clear all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const [formData, setFormData] = useState({
    type: '',
    description: '',
    name: '',
    contact: '',
    address: ''
  });

  const handlePresetClick = useCallback((preset) => {
    if (aiStatus === 'analyzing') return; // Anti-spam lock
    setSelectedImage(preset.image);
    startAiAnalysis(preset);
    setValidationError('');
  }, [aiStatus]);

  const handlePresetKeyDown = useCallback((e, preset) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePresetClick(preset);
    }
  }, [handlePresetClick]);

  const startAiAnalysis = async (preset) => {
    // Clear any existing timers before starting new ones
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setAiStatus('analyzing');
    setProgress(0);
    setLogs([]);
    
    // UI Loading sequence
    setLogs(l => [...l, 'Step 1: Connecting to LangGraph AI Engine...']);
    setProgress(20);
    
    // Call Live Groq Service - passing a mock "Heavy Rain" to demonstrate the environmental enricher logic
    const liveResponse = await analyzeIssue(preset.description || preset.title, "Heavy Rain");
    
    setProgress(50);
    
    if (liveResponse && liveResponse.execution_path) {
      // LangGraph path animation
      let currentDelay = 300;
      liveResponse.execution_path.forEach((logItem, idx) => {
         timersRef.current.push(setTimeout(() => {
           setLogs(l => [...l, logItem]);
           setProgress(50 + Math.floor(50 * ((idx + 1) / liveResponse.execution_path.length)));
         }, currentDelay));
         currentDelay += 600;
      });

      timersRef.current.push(setTimeout(() => {
        setProgress(100);
        setAiStatus('complete');
        
        if (liveResponse.is_safe === false) {
           setLlmAlert(true);
           setValidationError(liveResponse.error_message);
        } else if (liveResponse.category) {
           setFormData(prev => ({ 
             ...prev, 
             type: liveResponse.category,
             department: liveResponse.department || "",
             description: liveResponse.formal_complaint 
           }));
        }
      }, currentDelay + 400));
    } else {
      setLogs(l => [...l, 'Step 2: Analyzing image context and categories...']);
      timersRef.current.push(setTimeout(() => {
        setProgress(100);
        setAiStatus('complete');
        
        if (liveResponse && liveResponse.category) {
          // Use live Groq JSON response fallback
          setLogs(l => [...l, 'Step 3: Live LLM Processing Successful (JSON Mode)']);
          setFormData(prev => ({ 
            ...prev, 
            type: liveResponse.category,
            description: liveResponse.formal_complaint 
          }));
        } else {
          // Graceful mock fallback
          setLogs(l => [...l, 'Step 3: Running in Demo Mode (Mock AI)']);
          setFormData(prev => ({ ...prev, ...preset.aiResult }));
        }
      }, 1200));
    }
  };

  const handleDescriptionChange = useCallback((e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, description: val }));
    setValidationError('');
    
    if (detectPromptInjection(val)) {
      setLlmAlert(true);
    } else {
      setLlmAlert(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (llmAlert || isSubmitting) return; 

    // Rigorous Client-Side Validation
    if (!formData.description.trim()) {
      setValidationError('Complaint description cannot be empty or just whitespace.');
      return;
    }
    if (!formData.name.trim() || !formData.contact.trim() || !formData.address.trim()) {
      setValidationError('All reporter information fields are required.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    // Simulated async submission for anti-spam testing
    timersRef.current.push(setTimeout(() => {
      // Aggressive XSS Sanitization
      const sanitizedData = {
        type: sanitizeHTML(formData.type),
        description: sanitizeHTML(formData.description),
        name: sanitizeHTML(formData.name),
        contact: sanitizeHTML(formData.contact),
        address: sanitizeHTML(formData.address)
      };

      addComplaint(sanitizedData);
      setActiveView('track');
    }, 600));
  };

  return (
    <section aria-labelledby="portal-title" className="space-y-6">
      <header>
        <h2 id="portal-title" className="text-2xl font-bold text-slate-900">File a Civic Complaint</h2>
        <p className="text-slate-500 mt-1">Upload an image and let our AI instantly categorize and route your issue.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Camera className="text-municipal-indigo" size={20} aria-hidden="true" /> 
                Image Analysis
              </h3>
            </CardHeader>
            <CardContent>
              {aiStatus === 'idle' ? (
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-indigo"
                    tabIndex={0}
                    role="button"
                    aria-label="Upload an image"
                  >
                    <UploadCloud className="mx-auto text-slate-400 group-hover:text-municipal-indigo transition-colors" size={32} aria-hidden="true" />
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
                          onKeyDown={(e) => handlePresetKeyDown(e, preset)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Use preset: ${preset.title}`}
                          className="cursor-pointer group rounded-lg overflow-hidden border border-slate-200 hover:border-municipal-indigo hover:shadow-md transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-municipal-indigo"
                        >
                          <img src={preset.image} alt="" className="w-full h-20 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                            <span className="text-[10px] font-medium text-white leading-tight">{preset.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5" aria-live="polite" aria-busy={aiStatus === 'analyzing'}>
                  <div className="relative rounded-lg overflow-hidden h-48 border border-slate-200">
                    <img src={selectedImage} alt="Selected Issue" className="w-full h-full object-cover" />
                    {aiStatus === 'analyzing' && (
                      <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" aria-label="Loading AI Analysis"></div>
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

                  <div 
                    className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 space-y-1.5 h-32 overflow-hidden shadow-inner" 
                    role="log" 
                    aria-live="polite"
                    aria-atomic="false"
                  >
                    {logs.map((log, i) => (
                      <div key={i} className="animate-fade-in-up">
                        <span className="text-slate-500 mr-2" aria-hidden="true">{'>'}</span>{log}
                      </div>
                    ))}
                    {aiStatus === 'complete' && (
                      <div className="text-white mt-2 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" aria-hidden="true" /> Analysis Complete
                      </div>
                    )}
                  </div>
                  
                  {aiStatus === 'complete' && (
                    <Button variant="outline" className="w-full" onClick={() => setAiStatus('idle')} disabled={isSubmitting}>
                      Analyze Another Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className={cn("transition-all duration-500", aiStatus === 'idle' ? "opacity-50 pointer-events-none grayscale-[50%]" : "opacity-100")}>
            <CardHeader>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="text-municipal-indigo" size={20} aria-hidden="true" /> 
                Smart Complaint Form
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {validationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium" role="alert">
                    {validationError}
                  </div>
                )}

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="text-municipal-indigo shrink-0 mt-0.5" size={18} aria-hidden="true" />
                  <div>
                    <h4 className="text-sm font-medium text-indigo-900">AI Auto-filled Fields</h4>
                    <p className="text-xs text-indigo-700 mt-1">Our AI has automatically categorized and drafted a description based on your image. Please provide your contact details to proceed.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="type">Issue Category (AI Detected)</Label>
                    <Input id="type" value={formData.type} readOnly className="bg-slate-50 border-dashed text-slate-600" aria-readonly="true" />
                  </div>
                </div>

                <div className="space-y-1.5 relative">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description">Complaint Description</Label>
                    <span className={cn("text-xs font-medium", formData.description.length >= 1000 ? "text-red-600" : "text-slate-400")}>
                      {formData.description.length} / 1000
                    </span>
                  </div>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={handleDescriptionChange} 
                    maxLength={1000}
                    rows={3} 
                    disabled={isSubmitting}
                    aria-invalid={llmAlert || (validationError && !formData.description.trim())}
                    aria-describedby={llmAlert ? "llm-alert" : undefined}
                  />
                  {llmAlert && (
                    <div id="llm-alert" role="alert" aria-live="assertive" className="flex items-center gap-2 mt-2 text-red-600 bg-red-50 p-2 rounded text-sm font-medium border border-red-200 animate-pulse">
                      <ShieldAlert size={16} aria-hidden="true" /> System Safety: Override Attempt Prevented
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-5 mt-5">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Reporter Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Your Name <span className="text-red-500">*</span></Label>
                      <Input id="name" required value={formData.name} onChange={e => {setFormData({...formData, name: e.target.value}); setValidationError('');}} placeholder="Jane Doe" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact">Email or Phone <span className="text-red-500">*</span></Label>
                      <Input id="contact" required value={formData.contact} onChange={e => {setFormData({...formData, contact: e.target.value}); setValidationError('');}} placeholder="jane@example.com" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="address">Incident Location / Address <span className="text-red-500">*</span></Label>
                      <Input id="address" required value={formData.address} onChange={e => {setFormData({...formData, address: e.target.value}); setValidationError('');}} placeholder="123 Main St, Near Central Square" disabled={isSubmitting} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" disabled={aiStatus !== 'complete' || llmAlert || isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></div>
                        Submitting...
                      </span>
                    ) : 'Submit Complaint'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
