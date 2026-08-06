import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DeveloperOnlyProps {
  children: React.ReactNode;
}

const DeveloperOnly: React.FC<DeveloperOnlyProps> = ({ children }) => {
  const { user } = useAuth();

  // If user is not admin or doesn't have developer mode enabled, hide the content.
  if (!user || user.role !== 'admin' || !user.developer_mode_enabled) {
    return null;
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-purple-500 to-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-white shadow-sm z-10 pointer-events-none">
          Dev Mode
        </div>
        {children}
      </div>
    </div>
  );
};

export default DeveloperOnly;
