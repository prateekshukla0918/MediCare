import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  AlertCircle,
  Eye,
  Pill
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Prescription } from '../../types';
import { Modal } from '../../components/common/Modal';

export const PrescriptionsPage: React.FC = () => {
  const { token } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Digital Prescriptions</h1>
        <p className="text-sm text-slate-600">Access verified electronic prescriptions issued by your attending physicians.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading prescriptions...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No prescriptions found</h3>
          <p className="text-xs text-slate-500">
            When a doctor prescribes medication following a virtual consultation, your e-prescription will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-6"
            >
              {/* Rx Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80">
                      {rx.referenceNo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Version {rx.version}.0</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Prescribed by {rx.doctor.user.name} ({rx.doctor.specialization})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Issued: {new Date(rx.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • Reg #{' '}
                    {rx.doctor.regNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRx(rx)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Download</span>
                  </button>
                </div>
              </div>

              {/* Medication Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Prescribed Medications ({rx.items.length})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rx.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.medicationName}</span>
                        <span className="font-bold text-teal-700 text-xs bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {item.dosage}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p><strong>Frequency:</strong> {item.frequency}</p>
                        <p><strong>Duration:</strong> {item.duration}</p>
                        <p className="text-[11px] text-teal-900 bg-teal-50/60 p-2 rounded-lg mt-1">
                          📌 <strong>Instructions:</strong> {item.instructions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              {rx.advice && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Physician Clinical Advice</span>
                  <p className="leading-relaxed">{rx.advice}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Clinical Prescription Detail / Print Modal */}
      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Clinical Prescription Document — ${selectedRx.referenceNo}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 printable-rx">
            
            {/* Formal Header */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{selectedRx.doctor.user.name}</h2>
                <p className="text-xs text-teal-700 font-bold">{selectedRx.doctor.specialization}</p>
                <p className="text-[11px] text-slate-500">{selectedRx.doctor.qualifications}</p>
                <p className="text-[10px] text-slate-400 mt-1">Medical Council Reg: {selectedRx.doctor.regNumber}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-teal-600 font-serif">℞</span>
                <span className="text-[11px] font-mono font-bold block text-slate-700">{selectedRx.referenceNo}</span>
                <span className="text-[10px] text-slate-400">Date: {new Date(selectedRx.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Patient Header */}
            <div className="p-4 rounded-xl border border-slate-100 bg-white grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name</span>
                <span className="font-bold text-slate-900">{selectedRx.patient.user.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group & Gender</span>
                <span className="font-semibold text-slate-800">
                  {selectedRx.patient.bloodGroup || 'O+'} • {selectedRx.patient.gender || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Medications Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRx.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{item.medicationName}</span>
                        <span className="text-[11px] text-slate-500">{item.instructions}</span>
                      </td>
                      <td className="p-3 font-semibold text-teal-700">{item.dosage}</td>
                      <td className="p-3 text-slate-600">{item.frequency}</td>
                      <td className="p-3 text-slate-600">{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRx.advice && (
              <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">General Advice:</span>
                <p>{selectedRx.advice}</p>
              </div>
            )}

            {/* Digital Seal & Signature */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-teal-700 font-semibold">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Verified Telemedicine Digital Seal</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Electronically signed by</span>
                <span className="font-bold text-slate-900">{selectedRx.doctor.user.name}</span>
              </div>
            </div>

            {/* Print/Download Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
