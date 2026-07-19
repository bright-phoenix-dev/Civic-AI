import React, { useState, useRef, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea, Label } from '../components/ui/Input';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Bot, 
  CloudLightning, 
  FileText, 
  Copy, 
  Check, 
  Send, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../components/ui/Card';
import { analyzeIssue } from '../services/groqService';

const WORKFLOW_STEPS = [
  { id: 1, title: 'Security Guardrail', icon: ShieldCheck },
  { id: 2, title: 'Automated Classification', icon: Bot },
  { id: 3, title: 'Environmental Priority Enricher', icon: CloudLightning },
  { id: 4, title: 'Document Generation', icon: FileText }
];

export default function CitizenPortal() {
  const { addComplaint, setActiveView } = useComplaints();
  
  const [description, setDescription] = useState('');
  const [weather, setWeather] = useState('Clear');
  
  const [status, setStatus] = useState('idle'); // idle, processing, complete, intercepted
  const [currentStep, setCurrentStep] = useState(0); // 0 to 4
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const timersRef = useRef([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!description.trim() || status === 'processing') return;

    // Reset state
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setStatus('processing');
    setCurrentStep(0);
    setResult(null);
    setCopied(false);

    // Call API
    const liveResponse = await analyzeIssue(description, weather);
    
    if (liveResponse) {
      const path = liveResponse.execution_path || [];
      let delay = 500;
      
      // Animate steps
      for (let i = 0; i < path.length; i++) {
        timersRef.current.push(setTimeout(() => {
          setCurrentStep(i + 1);
        }, delay));
        delay += 800;
      }
      
      timersRef.current.push(setTimeout(() => {
        if (liveResponse.is_safe === false) {
          setStatus('intercepted');
        } else {
          setStatus('complete');
        }
        setResult(liveResponse);
      }, delay + 200));
      
    } else {
      // Fallback if API fails
      setStatus('idle');
      alert('Failed to connect to the LangGraph Engine.');
    }
  };

  const handleCopy = () => {
    if (result?.formal_complaint) {
      navigator.clipboard.writeText(result.formal_complaint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitFinal = () => {
    if (result && result.is_safe !== false) {
       addComplaint({
         type: result.category,
         department: result.department,
         description: result.formal_complaint,
         name: "Anonymous Citizen",
         contact: "Not Provided",
         address: "Determined via Context"
       });
       setActiveView('track');
    }
  };

  // UI helpers
  const getStepStatus = (stepId) => {
    if (status === 'idle') return 'pending';
    if (status === 'processing') {
      if (currentStep > stepId) return 'complete';
      if (currentStep === stepId) return 'current';
      return 'pending';
    }
    // intercepted or complete
    if (status === 'intercepted' && stepId === 1) return 'error';
    if (status === 'intercepted') return 'pending';
    return 'complete';
  };

  return (
    <section aria-labelledby="portal-title" className="space-y-6 animate-fade-in">
      <header>
        <h2 id="portal-title" className="text-3xl font-extrabold text-slate-900 tracking-tight">Civic Issue Triage</h2>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">Describe your civic issue in plain English. Our AI will automatically classify, prioritize, and draft an official municipal letter.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 shadow-md bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Send className="text-municipal-indigo" size={20} /> 
                Complaint Submission
              </h3>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="description" className="font-semibold text-slate-700">Issue Context</Label>
                  <span className="text-xs text-slate-400 font-medium">{description.length}/1000</span>
                </div>
                <Textarea 
                  id="description" 
                  placeholder="E.g., There is a massive pothole flooding the street on 5th Avenue..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  maxLength={1000}
                  rows={6} 
                  disabled={status === 'processing'}
                  className="resize-none focus:ring-municipal-indigo bg-slate-50 border-slate-200 text-slate-800 w-full"
                />
              </div>

              <div className="space-y-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <Label htmlFor="weather" className="font-semibold text-indigo-900 text-sm">Simulate Local Weather Context</Label>
                <select
                  id="weather"
                  value={weather}
                  onChange={e => setWeather(e.target.value)}
                  disabled={status === 'processing'}
                  className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow cursor-pointer"
                >
                  <option value="Clear">☀️ Clear Skies</option>
                  <option value="Heavy Rain">⛈️ Heavy Rain & Storm</option>
                  <option value="Fog">🌫️ Dense Fog</option>
                </select>
                <p className="text-xs text-indigo-700 mt-1">Tests the Environmental Priority Enricher.</p>
              </div>

              <Button 
                onClick={handleProcess} 
                size="lg" 
                disabled={status === 'processing' || !description.trim()} 
                className={cn(
                  "w-full font-bold text-white shadow-lg transition-all",
                  status === 'processing' ? "bg-indigo-400" : "bg-gradient-to-r from-municipal-indigo to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
                )}
              >
                {status === 'processing' ? (
                  <span className="flex items-center gap-2">
                    <Activity className="animate-spin" size={18} /> Processing Graph...
                  </span>
                ) : 'Analyze & Route via Civic AI'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow & Output */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* LangGraph Workflow Stepper */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-100" />
            <CardHeader className="pb-2">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Activity className="text-emerald-500" size={16} /> 
                LangGraph State Pipeline
              </h3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative pt-4 pb-2 gap-4 md:gap-0">
                {/* Horizontal connecting line (desktop) */}
                <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                
                {WORKFLOW_STEPS.map((step) => {
                  const stepStatus = getStepStatus(step.id);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-2 w-full md:w-auto">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                        stepStatus === 'complete' ? "bg-emerald-50 border-emerald-400 text-emerald-600" :
                        stepStatus === 'current' ? "bg-indigo-50 border-indigo-500 text-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] animate-pulse" :
                        stepStatus === 'error' ? "bg-red-50 border-red-500 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]" :
                        "bg-white border-slate-200 text-slate-300"
                      )}>
                        {stepStatus === 'complete' ? <Check size={18} strokeWidth={3} /> : 
                         stepStatus === 'error' ? <AlertTriangle size={18} strokeWidth={3} /> :
                         <Icon size={18} />}
                      </div>
                      <div className="text-left md:text-center">
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                          stepStatus === 'complete' ? "text-emerald-600" :
                          stepStatus === 'current' ? "text-indigo-600" :
                          stepStatus === 'error' ? "text-red-600" :
                          "text-slate-400"
                        )}>
                          Step {step.id}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-600 w-32 hidden md:block leading-tight mt-0.5">
                          {step.title}
                        </div>
                        <div className="text-sm font-semibold text-slate-700 md:hidden">
                          {step.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Results Area */}
          <div className="flex-1 flex flex-col">
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 min-h-[300px]">
                <Bot size={48} className="mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">Waiting for civic issue submission...</p>
                <p className="text-sm mt-1 text-center max-w-sm">The AI graph will automatically populate this area with classified details and a drafted letter.</p>
              </div>
            )}

            {status === 'processing' && (
              <div className="flex-1 flex flex-col items-center justify-center text-indigo-400 p-12 border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/30 min-h-[300px]">
                <Activity size={48} className="mb-4 text-indigo-300 animate-bounce" />
                <p className="font-bold text-indigo-700 animate-pulse">Running LangGraph Mutations...</p>
                <p className="text-sm mt-1 text-indigo-500">Routing through state nodes.</p>
              </div>
            )}

            {status === 'intercepted' && result && (
              <div className="flex-1 animate-fade-in-up">
                <Card className="border-red-200 shadow-xl bg-gradient-to-b from-red-50 to-white overflow-hidden h-full">
                  <div className="bg-red-600 p-4 flex items-center gap-3 text-white">
                    <ShieldAlert size={24} className="shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg">Security Guardrail Intercepted Input</h3>
                      <p className="text-red-100 text-sm opacity-90">Submission halted before downstream processing.</p>
                    </div>
                  </div>
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-2 shadow-inner">
                      <AlertTriangle size={40} />
                    </div>
                    <h4 className="text-2xl font-extrabold text-slate-800">Prompt Injection Blocked</h4>
                    <p className="text-slate-600 max-w-md mx-auto text-lg leading-relaxed">{result.error_message}</p>
                    <div className="pt-8">
                      <Button onClick={() => setStatus('idle')} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 font-bold px-8">
                        Acknowledge & Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {status === 'complete' && result && (
              <div className="flex-1 space-y-4 animate-fade-in-up">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Category</span>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{result.category}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Department</span>
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{result.department}</span>
                  </div>
                  <div className={cn(
                    "border rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-sm transition-all duration-300",
                    result.priority === 'Critical' ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
                  )}>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Priority</span>
                    <span className={cn(
                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold shadow-sm",
                      result.priority === 'Critical' ? "bg-red-600 text-white animate-pulse" : 
                      result.priority === 'High' ? "bg-orange-500 text-white" :
                      "bg-amber-100 text-amber-800"
                    )}>
                      {result.priority}
                    </span>
                  </div>
                </div>

                {/* Paper Letter Viewer */}
                <Card className="border-slate-200 shadow-xl overflow-hidden bg-[#fdfbf7] relative group">
                  <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 opacity-30" />
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 pb-3 pt-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <FileText size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Formal Municipal Report</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopy}
                      className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors h-8 border border-transparent hover:border-indigo-100"
                    >
                      {copied ? <Check size={14} className="mr-1 text-emerald-500" /> : <Copy size={14} className="mr-1" />}
                      <span className="text-xs font-semibold">{copied ? 'Copied' : 'Copy Text'}</span>
                    </Button>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="font-serif text-slate-800 leading-relaxed text-sm whitespace-pre-wrap max-w-prose mx-auto">
                      {result.formal_complaint}
                    </div>
                    
                    <div className="mt-10 flex justify-center border-t border-slate-200/60 pt-6">
                      <Button onClick={handleSubmitFinal} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg px-8 py-6 text-base font-bold">
                        <Send size={18} className="mr-2" /> File Official Complaint
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
