import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Heart, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord, PatientProfile } from '../../types';
import { Modal } from '../../components/common/Modal';

export const MedicalRecordsPage: React.FC = () => {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('LAB_REPORT');
  const [file, setFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Health summary edit modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const fetchRecords = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/medical-records', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        if (data.profile) {
          setPatientProfile(data.profile);
          setBloodGroup(data.profile.bloodGroup || 'O+');
          setAllergies(data.profile.allergies || 'None');
          setChronicConditions(data.profile.chronicConditions || 'None');
          setEmergencyContact(data.profile.emergencyContact || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [token]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setUploadError('Please select a file and enter a descriptive title');
      return;
    }

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      setUploadError('Only PDF, JPG, and PNG documents are supported for clinical records.');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Preview = reader.result as string;
        const res = await fetch('/api/medical-records/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            category,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            base64Preview,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload document');

        setIsUploadOpen(false);
        setTitle('');
        setFile(null);
        fetchRecords();
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document from your records?')) return;
    try {
      const res = await fetch(`/api/medical-records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch('/api/medical-records/profile-history', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodGroup,
          allergies,
          chronicConditions,
          emergencyContact,
        }),
      });
      if (res.ok) {
        setIsProfileModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      console.error('Failed to save profile history:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (selectedCategory === 'ALL') return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-sm text-slate-600">Secure electronic health records vault, diagnostic reports, and allergies profile.</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Patient Health Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-900 text-sm">Health Profile & Clinical Background</h3>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
          >
            Edit Health Profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Blood Group</span>
            <span className="font-bold text-slate-900 text-sm">{patientProfile?.bloodGroup || 'Not specified'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Known Allergies</span>
            <span className="font-semibold text-rose-700">{patientProfile?.allergies || 'None recorded'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Chronic Conditions</span>
            <span className="font-semibold text-slate-800">{patientProfile?.chronicConditions || 'None recorded'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Emergency Contact</span>
            <span className="font-semibold text-slate-800">{patientProfile?.emergencyContact || 'None set'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'LAB_REPORT', 'IMAGING', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'OTHER'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Records Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading documents...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No medical documents in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload diagnostic lab test results, imaging reports, or doctor discharge summaries.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                    {rec.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {rec.title}
                </h4>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>📁 {rec.fileName} ({rec.fileSize})</p>
                  <p>Uploaded by: <strong className="text-slate-700">{rec.uploadedBy}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={rec.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={rec.fileName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Upload Medical Document"
        >
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete Blood Count (CBC) Lab Report"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="LAB_REPORT">Lab Report</option>
                <option value="IMAGING">Imaging / X-Ray</option>
                <option value="PRESCRIPTION">External Prescription</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="OTHER">Other Clinical Record</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Select File (PDF, PNG, JPG)</label>
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {uploadError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadLoading || !file}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs disabled:opacity-50"
              >
                {uploadLoading ? 'Uploading...' : 'Save to Medical Vault'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Health Profile Modal */}
      {isProfileModalOpen && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title="Update Clinical Health Profile"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Allergies (Drugs, Foods, Environmental)</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Sulfa"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Chronic Conditions</label>
              <input
                type="text"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="e.g. Hypertension, Mild Asthma"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Emergency Contact Name & Phone</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Rachel Morgan (+1 555-0192)"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
