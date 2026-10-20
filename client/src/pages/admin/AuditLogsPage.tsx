import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(term) ||
      l.actorName.toLowerCase().includes(term) ||
      (l.details && l.details.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Security & Compliance Audit Logs</h1>
          <p className="text-sm text-slate-600">
            Immutable clinical event trail for HIPAA accountability, access control tracking, and verification audit.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action or actor name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading security audit records...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No logs found</h3>
          <p className="text-xs text-slate-500">No security audit events match the current search query.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Resource Target</th>
                <th className="p-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900">{log.actorName}</td>
                  <td className="p-4 font-mono text-slate-500 text-[11px]">{log.resource}</td>
                  <td className="p-4 text-slate-600 max-w-md truncate">{log.details || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
