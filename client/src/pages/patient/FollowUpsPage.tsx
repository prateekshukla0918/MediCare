import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FollowUp } from '../../types';

export const FollowUpsPage: React.FC = () => {
  const { token } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowUps = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/follow-ups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data.followUps || []);
      }
    } catch (err) {
      console.error('Failed to fetch follow-ups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Follow-Up Care</h1>
        <p className="text-sm text-slate-600">Track recommended clinical reviews and re-evaluations from your attending doctors.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading follow-up schedule...</p>
        </div>
      ) : followUps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No follow-ups currently required</h3>
          <p className="text-xs text-slate-500">
            If your physician recommends a subsequent checkup during your consultation, it will appear here with instructions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((fu) => {
            const isDueSoon = new Date(fu.recommendedDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={fu.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={fu.doctor.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.doctor.user.name)}&background=0D9488&color=fff`}
                    alt={fu.doctor.user.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-500/20 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fu.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        fu.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {fu.status}
                      </span>
                      {isDueSoon && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          Due Soon
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{fu.doctor.user.name}</h3>
                    <p className="text-xs font-semibold text-teal-600">{fu.doctor.specialization}</p>
                    
                    <p className="text-xs text-slate-700 pt-1">
                      📌 <strong>Doctor's Instructions:</strong> {fu.instructions}
                    </p>

                    <p className="text-xs text-slate-400 pt-0.5">
                      Target Date: <strong>{new Date(fu.recommendedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <Link
                    to={`/doctors/${fu.doctorId}`}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Book Follow-Up Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
