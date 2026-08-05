import React from 'react';
import { History, FileText } from 'lucide-react';

interface BrandVersionsProps {
  versions: any[];
}

export const BrandVersions: React.FC<BrandVersionsProps> = ({ versions }) => {
  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-gray-400" /> Version History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Version</th>
              <th className="px-4 py-3">Generated At</th>
              <th className="px-4 py-3">Documents Analyzed</th>
              <th className="px-4 py-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v, i) => (
              <tr key={i} className={`border-b border-gray-700/50 ${i === 0 ? 'bg-gray-800/50' : ''}`}>
                <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                  v{v.version}
                  {i === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase">Active</span>}
                </td>
                <td className="px-4 py-4 text-gray-300">
                  {new Date(v.generated_at).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> {v.document_count}
                </td>
                <td className="px-4 py-4">
                  <span className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Success
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
