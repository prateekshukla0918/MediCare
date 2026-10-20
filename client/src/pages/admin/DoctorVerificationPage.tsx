import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  FileText, 
  AlertCircle, 
  Clock, 
  Award, 
  User,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DoctorProfile } from '../../types';
import { Modal } from '../../components/common/Modal';

export const DoctorVerificationPage: React.FC = () => {
  const { token } = useAuth();
  const [pendingDoctors, setPendingDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [rejectingDoctor, setRejectingDoctor] = useState<DoctorProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchPending = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/doctors/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingDoctors(data.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending doctor applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleApprove = async (doctor: DoctorProfile) => {
    const confirmApprove = confirm(`Approve medical credentials for ${doctor.user.name}? This will activate their public booking profile.`);
    if (!confirmApprove) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'VERIFIED',
          reason: 'State medical board registration and degree verified by clinical admin.',
        }),
      });

      if (res.ok) {
        setSuccessBanner(`Successfully approved ${doctor.user.name}. They can now accept consultations.`);
        fetchPending();
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDoctor || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/doctors/${rejectingDoctor.id}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'REJECTED',
          reason: rejectReason,
        }),
      });

      if (res.ok) {
        setSuccessBanner(`Application for ${rejectingDoctor.user.name} has been rejected.`);
        setRejectingDoctor(null);
        setRejectReason('');
        fetchPending();
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err) {
      console.error('Rejection error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Verification Queue</h1>
        <p className="text-sm text-slate-600">
          Verify medical council licenses, board certifications, and uploaded proofs before granting public booking access.
        </p>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Checking verification queue...</p>
        </div>
      ) : pendingDoctors.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Verification Backlog Cleared!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted doctor applications have been processed. New practitioner registrations will appear here for clinical review.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Doctor Head Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={doc.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.user.name)}&background=0D9488&color=fff`}
                    alt={doc.user.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/30 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{doc.user.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        PENDING AUDIT
                      </span>
                    </div>

                    <p className="text-xs font-bold text-teal-600">{doc.specialization}</p>
                    <p className="text-xs text-slate-500">{doc.qualifications}</p>
                    <p className="text-[11px] text-slate-400">
                      Email: {doc.user.email} • Phone: {doc.user.phone || 'N/A'} • Submitted: {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-3 self-end md:self-start">
                  <button
                    onClick={() => setRejectingDoctor(doc)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Reject with Reason
                  </button>
                  <button
                    onClick={() => handleApprove(doc)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    Approve Credentials
                  </button>
                </div>
              </div>

              {/* Submitted Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Medical Council Reg No
                  </span>
                  <span className="font-mono font-bold text-slate-900">{doc.regNumber}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Experience & Clinic
                  </span>
                  <span className="font-bold text-slate-800">
                    {doc.experienceYears} Years • {doc.clinicHospital || 'Private Practice'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Submitted Proof File
                  </span>
                  <span className="font-semibold text-teal-700 truncate block">
                    📄 {doc.verificationDoc || 'medical_board_license.pdf'}
                  </span>
                </div>
              </div>

              {/* Bio Statement */}
              <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">Doctor Biography Statement:</span>
                "{doc.bio}"
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingDoctor && (
        <Modal
          isOpen={!!rejectingDoctor}
          onClose={() => setRejectingDoctor(null)}
          title={`Decline Application — ${rejectingDoctor.user.name}`}
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please provide a clinical audit reason for rejecting this doctor’s application. This will be recorded in the audit trail and sent to the applicant.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Rejection Reason</label>
              <textarea
                rows={4}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. License registration could not be verified with state registry; missing proof of malpractice insurance."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
              >
                {actionLoading ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
