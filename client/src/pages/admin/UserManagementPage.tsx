import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

export const UserManagementPage: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== 'ALL') params.append('role', role);
      if (status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, role, status]);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmMsg = `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'suspend'} ${user.name}?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setActionSuccess(`User ${user.name} is now ${newStatus.toLowerCase()}.`);
        fetchUsers();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform User Directory</h1>
        <p className="text-sm text-slate-600">Review registered patient, doctor, and administrator accounts across the telemedicine network.</p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
            <option value="ADMIN">Admins</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending Review</option>
          </select>
        </div>

      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No users match filters</h3>
          <p className="text-xs text-slate-500">Try adjusting your query or role filter.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Name & Role</th>
                <th className="p-4">Email</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          {u.role.toLowerCase()}
                          {u.doctorProfile?.specialization && ` • ${u.doctorProfile.specialization}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 font-mono text-[11px]">{u.email}</td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' :
                      u.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700' :
                      'bg-amber-50 text-amber-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
