import React from 'react';
import { Compass, Users, Route, Backpack, ShieldCheck } from 'lucide-react';

export type TabType = 'explore' | 'community' | 'track' | 'mybag' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="w-full bg-[#121613]/95 backdrop-blur-md border-t border-[#2E3B32] px-4 pt-2 pb-5 flex items-center justify-around z-40 select-none">
      {/* 1. Explore */}
      <button
        onClick={() => onChangeTab('explore')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'explore' ? 'text-white' : 'text-[#A5B4A8] hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'explore' ? 'text-[#4ADE80]' : ''}`}>
          <Compass size={22} />
        </div>
        <span className="text-[11px] font-medium tracking-tight">Khám Phá</span>
      </button>

      {/* 2. Community */}
      <button
        onClick={() => onChangeTab('community')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'community' ? 'text-white' : 'text-[#A5B4A8] hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'community' ? 'text-[#4ADE80]' : ''}`}>
          <Users size={22} />
        </div>
        <span className="text-[11px] font-medium tracking-tight">Cộng Đồng</span>
      </button>

      {/* 3. Center Raised Track Action FAB */}
      <div className="relative -top-4 flex flex-col items-center">
        <button
          onClick={() => onChangeTab('track')}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 transition-all transform active:scale-95 ${
            activeTab === 'track'
              ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-[#38764B]/50'
              : 'bg-[#1B221D] border-[#38764B] text-white hover:border-[#4ADE80]'
          }`}
        >
          <Route size={26} className={activeTab === 'track' ? 'text-[#F2B832]' : 'text-white'} />
        </button>
        <span className={`text-[11px] font-bold mt-1 tracking-tight ${
          activeTab === 'track' ? 'text-[#4ADE80]' : 'text-[#A5B4A8]'
        }`}>
          Hành Trình
        </span>
      </div>

      {/* 4. My SolarBag */}
      <button
        onClick={() => onChangeTab('mybag')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'mybag' ? 'text-white' : 'text-[#A5B4A8] hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'mybag' ? 'text-[#4ADE80]' : ''}`}>
          <Backpack size={22} />
        </div>
        <span className="text-[11px] font-medium tracking-tight">Balo Tôi</span>
      </button>

      {/* 5. Profile & Trail Guardian */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center justify-center gap-1 transition-all ${
          activeTab === 'profile' ? 'text-white' : 'text-[#A5B4A8] hover:text-white'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'text-[#4ADE80]' : ''}`}>
          <ShieldCheck size={22} />
        </div>
        <span className="text-[11px] font-medium tracking-tight">Hồ Sơ</span>
      </button>
    </div>
  );
};

