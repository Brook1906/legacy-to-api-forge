import { useState } from "react";
import { useFileHistory } from "@/hooks/useFileHistory";

export default function FileHistoryTable() {
  const [filter, setFilter] = useState<'all' | 'upload' | 'download'>('all');
  const { history, loading, error } = useFileHistory(filter === 'all' ? undefined : filter);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">File History</h2>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="upload">Uploads</option>
          <option value="download">Downloads</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">File Name</th>
              <th className="text-left py-2 px-2">Action</th>
              <th className="text-left py-2 px-2">Timestamp</th>
              <th className="text-left py-2 px-2">User ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="text-center py-4 text-red-500">{error}</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4">No history found</td></tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="border-b hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <td className="py-2 px-2">{row.file_name}</td>
                  <td className="py-2 px-2 capitalize">{row.action}</td>
                  <td className="py-2 px-2">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="py-2 px-2">{row.user_id || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
