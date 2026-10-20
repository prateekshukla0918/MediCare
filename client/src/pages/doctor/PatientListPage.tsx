import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, FileText, Calendar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Appointment } from '../../types';

export const PatientListPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch (err) {
        console.error('Failed to fetch patient list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  // Aggregate distinct patients
  const patientMap: { [id: string]: { patient: any; appts: Appointment[] } } = {};
  appointments.forEach((appt) => {
    const pId = appt.patientId;
    if (!patientMap[pId]) {
      patientMap[pId] = { patient: appt.patient, appts: [] };
    }
    patientMap[pId].appts.push(appt);
  });

  let patientList = Object.values(patientMap);
  if (search) {
    const term = search.toLowerCase();
    patientList = patientList.filter((item) =>
      item.patient.user.name.toLowerCase().includes(term) ||
      item.patient.user.email.toLowerCase().includes(term)
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Patients</h1>
          <p className="text-sm text-slate-600">Review clinical health records and consultation histories for your patient cohort.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading patient directory...</p>
        </div>
      ) : patientList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No patients found</h3>
          <p className="text-xs text-slate-500">Patients who schedule consultations with you will appear in this clinical roster.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Allergies</th>
                <th className="p-4">Consultations</th>
                <th className="p-4">Latest Visit</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientList.map(({ patient, appts }) => {
                const latestAppt = appts.sort(
                  (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
                )[0];

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={patient.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.user.name)}&background=0D9488&color=fff`}
                          alt={patient.user.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/20"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{patient.user.name}</span>
                          <span className="text-[11px] text-slate-400">
                            Blood: {patient.bloodGroup || 'O+'} • DOB: {patient.dob || '1992'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      <p>{patient.user.email}</p>
                      <p className="text-[11px] text-slate-400">{patient.user.phone || 'No phone set'}</p>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px]">
                        {patient.allergies || 'None recorded'}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800">{appts.length} visit(s)</span>
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(latestAppt.dateTime).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        to={`/doctor/patients/${patient.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors"
                      >
                        <span>Clinical Chart</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
