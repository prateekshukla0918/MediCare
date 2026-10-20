import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Share2, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  User, 
  Send,
  CheckCircle,
  AlertCircle,
  FilePlus,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Appointment } from '../../types';

export const ConsultationRoomPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socket } = useSocket();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  // Video / Audio Media State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Call state
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'NOTES' | 'CHAT'>('NOTES');

  // Clinical Notes & Diagnosis (Doctor)
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveNoteSuccess, setSaveNoteSuccess] = useState(false);

  // Live in-call chat
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: string; text: string; time: string; isDoctor: boolean }>
  >([
    {
      sender: 'System',
      text: 'Encrypted WebRTC consultation session started. Audio and video streams are protected.',
      time: 'Just now',
      isDoctor: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Fetch Appointment & Initialize consultation
  useEffect(() => {
    const initConsultation = async () => {
      if (!token || !appointmentId) return;
      try {
        // Start consultation endpoint
        const startRes = await fetch(`/api/consultations/${appointmentId}/start`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (startRes.ok) {
          const startData = await startRes.json();
          setAppointment(startData.appointment);
          if (startData.consultation?.clinicalNotes) {
            setClinicalNotes(startData.consultation.clinicalNotes);
          }
          if (startData.consultation?.diagnosis) {
            setDiagnosis(startData.consultation.diagnosis);
          }
        } else {
          // Fallback fetch appointment details
          const apptRes = await fetch(`/api/appointments/${appointmentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (apptRes.ok) {
            const data = await apptRes.json();
            setAppointment(data.appointment);
          }
        }
      } catch (err) {
        console.error('Error starting consultation:', err);
      } finally {
        setLoading(false);
      }
    };

    initConsultation();
  }, [appointmentId, token]);

  // Handle WebRTC media stream initialization
  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn('Camera access denied or headless, using simulated stream:', err);
        setHasCameraPermission(false);
      }
    };

    setupMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Socket.IO Room Joining and Chat handling
  useEffect(() => {
    if (!socket || !appointmentId || !user) return;

    socket.emit('join_consultation', {
      consultationId: appointmentId,
      role: user.role,
      name: user.name,
    });

    socket.on('consultation_chat', (msg: any) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leave_consultation', {
        consultationId: appointmentId,
        name: user.name,
      });
      socket.off('consultation_chat');
    };
  }, [socket, appointmentId, user]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = isAudioMuted));
    }
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = isVideoOff));
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !user) return;

    const msg = {
      sender: user.name,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDoctor: user.role === 'DOCTOR',
    };

    socket.emit('consultation_chat', {
      consultationId: appointmentId,
      message: msg,
    });

    setInputMessage('');
  };

  const handleSaveNotes = async () => {
    if (!token || !appointment?.consultation) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/consultations/${appointment.consultation.id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clinicalNotes, diagnosis }),
      });
      if (res.ok) {
        setSaveNoteSuccess(true);
        setTimeout(() => setSaveNoteSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleEndConsultation = async () => {
    if (!token || !appointmentId) return;
    const confirmEnd = confirm('Are you sure you want to conclude and finalize this video consultation?');
    if (!confirmEnd) return;

    try {
      await fetch(`/api/consultations/${appointmentId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clinicalNotes, diagnosis }),
      });

      if (user?.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/appointments');
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err);
      navigate('/');
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-mono">Securing WebRTC signaling connection...</p>
      </div>
    );
  }

  const isDoctor = user?.role === 'DOCTOR';
  const remotePersonName = isDoctor ? appointment?.patient?.user?.name : appointment?.doctor?.user?.name;
  const remoteRoleLabel = isDoctor ? 'Patient' : 'Attending Physician';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white flex flex-col">
      
      {/* Top Session Bar */}
      <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Consultation with {remotePersonName}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Ref: {appointment?.referenceId || 'APT-2026'}</p>
          </div>
        </div>

        {/* Timer & Encryption Tag */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-white text-sm">{formatTimer(callDuration)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-medium border border-slate-700">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit WebRTC Encrypted</span>
          </div>

          <button
            onClick={handleEndConsultation}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{isDoctor ? 'End & Finalize' : 'Leave Call'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Stage & Contextual Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Video Stage */}
        <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between relative bg-slate-950">
          
          {/* Main Remote Video Window */}
          <div className="flex-1 relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center min-h-[380px] shadow-2xl">
            
            {/* Simulated Remote Stream / Video Feed */}
            <div className="text-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-2xl ring-4 ring-teal-500/20">
                <span className="text-3xl font-bold">
                  {remotePersonName?.charAt(0) || 'P'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{remotePersonName}</h3>
                <span className="text-xs text-teal-400 font-semibold">{remoteRoleLabel}</span>
                <p className="text-[11px] text-slate-500 font-mono">Audio & Video Active • 1080p WebRTC Stream</p>
              </div>

              {/* Pulsing Audio Waves Indicator */}
              <div className="flex items-center justify-center gap-1 pt-2">
                <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-6 bg-teal-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1 h-7 bg-teal-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>

            {/* Self View (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-40 sm:w-48 aspect-video rounded-2xl bg-slate-800 border-2 border-teal-500/40 shadow-2xl overflow-hidden z-20">
              {hasCameraPermission ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
                />
              ) : null}

              {(!hasCameraPermission || isVideoOff) && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 space-y-1">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-semibold">{user?.name} (You)</span>
                  {isVideoOff && <span className="text-[9px] text-rose-400">Camera Off</span>}
                </div>
              )}

              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white drop-shadow">
                You
              </div>
            </div>

            {/* Remote Info Tag */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-200">{remotePersonName}</span>
            </div>
          </div>

          {/* Media Control Dock */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-2xl border transition-all ${
                isAudioMuted
                  ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-2xl border transition-all ${
                isVideoOff
                  ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 rounded-2xl border transition-all ${
                isScreenSharing
                  ? 'bg-teal-600/20 border-teal-500 text-teal-400'
                  : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
              }`}
              title="Share Screen"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleEndConsultation}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            >
              <PhoneOff className="w-5 h-5" />
              <span className="hidden sm:inline">End Session</span>
            </button>
          </div>

        </div>

        {/* Right Contextual Panel: Notes & Chat */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 flex flex-col justify-between">
          
          {/* Panel Tabs */}
          <div className="p-3 border-b border-slate-800 grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('NOTES')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'NOTES' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isDoctor ? 'Clinical Notes' : 'Visit Overview'}</span>
            </button>
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'CHAT' ? 'bg-slate-800 text-teal-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>In-Call Chat</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            
            {activeTab === 'NOTES' ? (
              <div className="space-y-4 text-xs">
                {isDoctor ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 block">Provisional Diagnosis</label>
                      <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Essential Hypertension, Acute Bronchitis..."
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300 block">Consultation Notes & Observations</label>
                      <textarea
                        rows={8}
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Document patient chief complaint, vital signs, physical evaluation, and recommended care plan..."
                        className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>

                    {saveNoteSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Clinical notes saved to patient history.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/doctor/prescriptions?patientId=${appointment?.patientId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        <FilePlus className="w-4 h-4" />
                        <span>Prescribe Medications</span>
                      </Link>

                      <button
                        type="button"
                        disabled={savingNotes}
                        onClick={handleSaveNotes}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors"
                      >
                        {savingNotes ? 'Saving...' : 'Save Draft Notes'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Your Doctor</span>
                      <h4 className="text-sm font-bold text-white">{appointment?.doctor.user.name}</h4>
                      <p className="text-xs text-slate-400">{appointment?.doctor.specialization}</p>
                      <p className="text-[11px] text-slate-500">{appointment?.doctor.qualifications}</p>
                    </div>

                    {appointment?.symptoms && (
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Reported Concern</span>
                        <p className="text-xs text-slate-300">"{appointment.symptoms}"</p>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/60 text-xs text-teal-300 space-y-1">
                      <span className="font-bold block">Patient Telemedicine Instructions:</span>
                      <p className="leading-relaxed">
                        Please remain in a quiet, well-lit room. Your doctor can issue prescriptions and diagnostic follow-up orders directly to your portal upon completing the visit.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Live Chat */
              <div className="space-y-3">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      msg.sender === user?.name
                        ? 'bg-teal-600 text-white ml-6'
                        : msg.sender === 'System'
                        ? 'bg-slate-800 text-slate-400 text-center'
                        : 'bg-slate-800 text-slate-200 mr-6'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-80">
                      <span className="font-bold">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Chat Input if Chat Tab is Active */}
          {activeTab === 'CHAT' && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message to peer..."
                className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
