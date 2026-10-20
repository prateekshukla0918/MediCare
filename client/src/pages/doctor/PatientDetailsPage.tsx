import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Download, 
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord, PatientProfile, Prescription, Appointment } from '../../types';
import { Modal } from '../../components/common/Modal';

export const PatientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // patientId
  const { token } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Follow-up modal
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [recDate, setRecDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');
  const [fuLoading, setFuLoading] = useState(false);
  const [fuSuccess, setFuSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const [recRes, rxRes, apptRes] = await Promise.all([
          fetch(`/api/medical-records?patientId=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/prescriptions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (recRes.ok) {
          const data = await recRes.json();
          setRecords(data.records || []);
          setProfile(data.profile);
        }
        if (rxRes.ok) {
          const data = await rxRes.json();
          setPrescriptions((data.prescriptions || []).filter((rx: Prescription) => rx.patientId === id));
        }
        if (apptRes.ok) {
          const data = await apptRes.json();
          setAppointments((data.appointments || []).filter((a: Appointment) => a.patientId === id));
        }
      } catch (err) {
        console.error('Failed to load patient chart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFuLoading(true);
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: id,
          recommendedDate: recDate,
          instructions,
        }),
      });

      if (res.ok) {
        setFuSuccess(true);
        setTimeout(() => {
          setIsFollowUpModalOpen(false);
          setFuSuccess(false);
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create follow-up:', err);
    } finally {
      setFuLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading clinical chart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link to="/doctor/patients" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Patient Roster</span>
      </Link>

      {/* Patient Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={profile?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.user?.name || 'Patient')}&background=0D9488&color=fff`}
            alt={profile?.user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-2 ring-teal-500/20"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{profile?.user?.name}</h1>
            <p className="text-xs text-slate-500">
              DOB: {profile?.dob || '1992'} • Gender: {profile?.gender || 'Not specified'} • Blood Group: <strong className="text-slate-800">{profile?.bloodGroup || 'O+'}</strong>
            </p>
            <p className="text-xs text-slate-400">
              {profile?.user?.email} • {profile?.user?.phone || 'No phone'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/doctor/prescriptions?patientId=${id}`}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            Issue Prescription
          </Link>
          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs transition-colors"
          >
            Recommend Follow-up
          </button>
        </div>
      </div>

      {/* Clinical Health Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Known Allergies</span>
          <p className="text-xs font-semibold text-rose-950">{profile?.allergies || 'No allergies recorded'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Chronic Conditions</span>
          <p className="text-xs font-semibold text-blue-950">{profile?.chronicConditions || 'None reported'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Emergency Contact</span>
          <p className="text-xs font-semibold text-slate-800">{profile?.emergencyContact || 'No emergency contact set'}</p>
        </div>
      </div>

      {/* Grid: Medical Records & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Uploaded Records */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Diagnostic & Medical Documents ({records.length})</span>
            </h3>
          </div>

          {records.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded by patient.</p>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                      {r.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{r.title}</h4>
                    <span className="text-[10px] text-slate-400">{r.fileName} • {r.fileSize}</span>
                  </div>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-teal-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions History */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Issued Prescriptions ({prescriptions.length})</span>
            </h3>
          </div>

          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No prescriptions on record.</p>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded">
                      {rx.referenceNo}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rx.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {rx.items.map((item, idx) => (
                      <p key={idx} className="text-xs text-slate-700">
                        • <strong>{item.medicationName}</strong> ({item.dosage}) — {item.frequency} for {item.duration}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Follow-up Recommendation Modal */}
      {isFollowUpModalOpen && (
        <Modal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title={`Recommend Follow-Up for ${profile?.user?.name}`}
        >
          {fuSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">Follow-up recorded & sent to patient!</p>
            </div>
          ) : (
            <form onSubmit={handleCreateFollowUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Recommended Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={recDate}
                  onChange={(e) => setRecDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Clinical Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Check blood pressure twice daily for 2 weeks, repeat lipid profile before consult."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fuLoading}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
                >
                  {fuLoading ? 'Saving...' : 'Issue Recommendation'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};
