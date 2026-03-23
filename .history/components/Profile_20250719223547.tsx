import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../services/supabaseClient';

interface Report {
  id: string;
  created_at: string;
  stage: string;
  score: number;
  summary: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setReports(data as Report[]);
      setLoading(false);
    }
    if (user) fetchReports();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-800 rounded-2xl shadow-lg mt-12">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4">My Profile</h2>
      <div className="mb-6 text-slate-200">Logged in as: <span className="font-mono text-cyan-300">{user.email}</span></div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">My Interview Reports</h3>
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-slate-400">No reports found.</div>
      ) : (
        <ul className="space-y-4">
          {reports.map(r => (
            <li key={r.id} className="bg-slate-700 rounded-lg p-4">
              <div className="text-slate-300 text-sm mb-1">{new Date(r.created_at).toLocaleString()}</div>
              <div className="text-cyan-300 font-bold">Stage: {r.stage}</div>
              <div className="text-slate-200">Score: <span className="font-mono text-yellow-300">{r.score}</span></div>
              <div className="text-slate-400 mt-2">{r.summary}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 