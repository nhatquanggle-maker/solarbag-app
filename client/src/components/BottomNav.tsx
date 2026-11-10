import React from 'react';
import { Compass, Users, Route, Backpack, ShieldCheck } from 'lucide-react';

export type TabType = 'explore' | 'community' | 'track' | 'mybag' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'explore', label: 'Khám Phá', icon: Compass },
    { id: 'community', label: 'Cộng Đồng', icon: Users },
    { id: 'track', label: 'Hành Trình', icon: Route },
    { id: 'mybag', label: 'Balo Tôi', icon: Backpack },
    { id: 'profile', label: 'Hồ Sơ', icon: ShieldCheck },
  ];

  return (
    <div className="w-full bg-[#121613]/95 backdrop-blur-md border-t border-[#2E3B32] px-2 py-1.5 grid grid-cols-5 items-center z-40 select-none">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className="flex flex-col items-center justify-center py-1 transition-all group focus:outline-none"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#38764B]/35 text-[#4ADE80] ring-1 ring-[#4ADE80]/40'
                  : 'text-[#A5B4A8] group-hover:text-white group-hover:bg-[#1B221D]'
              }`}
            >
              <Icon
                size={20}
                className={isActive ? 'text-[#4ADE80]' : 'text-[#A5B4A8] group-hover:text-white'}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive
                  ? 'font-bold text-[#4ADE80]'
                  : 'font-medium text-[#A5B4A8] group-hover:text-white'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
