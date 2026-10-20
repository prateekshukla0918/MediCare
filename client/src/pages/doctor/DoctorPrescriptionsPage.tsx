import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Printer, 
  Pill,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Prescription, Appointment, PrescriptionItem } from '../../types';
import { Modal } from '../../components/common/Modal';

export const DoctorPrescriptionsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const preSelectedPatientId = searchParams.get('patientId') || '';

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [patientId, setPatientId] = useState<string>(preSelectedPatientId);
  const [advice, setAdvice] = useState<string>('');
  const [items, setItems] = useState<
    Array<{ medicationName: string; dosage: string; frequency: string; duration: string; instructions: string }>
  >([
    {
      medicationName: '',
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: 'Take after meals',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rxRes, apptRes] = await Promise.all([
        fetch('/api/prescriptions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (rxRes.ok) {
        const data = await rxRes.json();
        setPrescriptions(data.prescriptions || []);
      }
      if (apptRes.ok) {
        const data = await apptRes.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Distinct patients from appointments
  const patientOptions: { id: string; name: string }[] = [];
  const seenPatients = new Set<string>();
  appointments.forEach((a) => {
    if (!seenPatients.has(a.patientId)) {
      seenPatients.add(a.patientId);
      patientOptions.push({ id: a.patientId, name: a.patient.user.name });
    }
  });

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicationName: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '7 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      setFormError('Please select a patient from your clinical roster');
      return;
    }
    const invalidItem = items.find((i) => !i.medicationName || !i.dosage);
    if (invalidItem) {
      setFormError('Please complete medication name and dosage for all entries');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          advice,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue prescription');

      setFormSuccess(true);
      setItems([
        {
          medicationName: '',
          dosage: '',
          frequency: 'Once daily',
          duration: '7 days',
          instructions: 'Take after meals',
        },
      ]);
      setAdvice('');
      fetchData();

      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prescription Management</h1>
        <p className="text-sm text-slate-600">Draft, issue, and archive official digital prescriptions with full clinical itemization.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Prescription Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Pill className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Issue New Digital Prescription</h2>
            </div>

            {formSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prescription issued successfully and dispatched to patient health records.</span>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Select Patient */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Select Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="">-- Choose Patient from Roster --</option>
                  {patientOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medication Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Medication List ({items.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Drug</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Medication #{index + 1}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Drug / Medication Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Amoxicillin Clavulanate"
                            value={item.medicationName}
                            onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Dosage</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 625 mg"
                            value={item.dosage}
                            onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Frequency</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Twice daily"
                            value={item.frequency}
                            onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 block">Duration</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 7 days"
                            value={item.duration}
                            onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-semibold text-slate-600 block">Instructions & Timing</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Take immediately after breakfast and dinner with full glass of water."
                            value={item.instructions}
                            onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                            className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Advice */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Clinical Advice & Diet Restrictions</label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="e.g. Maintain hydration, avoid heavy physical exertion, report any allergic rashes immediately."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Generating Digital Rx...' : 'Sign & Issue Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Issued Prescriptions List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Past Issued Prescriptions</span>
              <span className="text-xs text-teal-600 font-semibold">{prescriptions.length} Records</span>
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading records...</p>
            ) : prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No prescriptions issued yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                        {rx.referenceNo}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rx.issuedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">{rx.patient.user.name}</span>
                      <p className="text-[11px] text-slate-500">{rx.items.length} prescribed medication(s)</p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setSelectedRx(rx)}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Modal */}
      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Prescription ${selectedRx.referenceNo}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{selectedRx.doctor.user.name}</span>
                <span className="text-slate-500">{selectedRx.doctor.specialization}</span>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-teal-700">{selectedRx.referenceNo}</span>
                <span className="text-slate-400 block">{new Date(selectedRx.issuedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <p className="font-bold text-slate-900">Patient: {selectedRx.patient.user.name}</p>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Medications:</span>
              {selectedRx.items.map((i, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-800">{i.medicationName} ({i.dosage})</p>
                  <p className="text-slate-500 text-[11px]">{i.frequency} • {i.duration}</p>
                  <p className="text-teal-800 text-[11px] italic">"{i.instructions}"</p>
                </div>
              ))}
            </div>

            {selectedRx.advice && (
              <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-xs">
                <strong>Advice:</strong> {selectedRx.advice}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
