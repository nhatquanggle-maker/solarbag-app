import React from 'react';
import { X, Star, Clock, Compass, Mountain, Download, Navigation, Bookmark, AlertTriangle } from 'lucide-react';
import { Trail } from '../types';

interface TrailDetailModalProps {
  trail: Trail | null;
  onClose: () => void;
  onStartTracking: (trail: Trail) => void;
}

export const TrailDetailModal: React.FC<TrailDetailModalProps> = ({ trail, onClose, onStartTracking }) => {
  if (!trail) return null;

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[92%] bg-[#1B221D] border border-[#2E3B32] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95"
      >
        {/* Photo Header */}
        <div className="relative h-48 w-full bg-[#121613] overflow-hidden">
          <img 
            src={trail.image} 
            alt={trail.name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/9680546a9f58bc783a3080e0c17b964f703f4857.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B221D] via-transparent to-black/50"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          >
            <X size={16} />
          </button>

          {/* Status Badges */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#252F28]/90 text-white border border-[#2E3B32]">
              {trail.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C2562B]/90 text-white flex items-center gap-1">
              <AlertTriangle size={12} /> {trail.statusBadge}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{trail.name}</h2>
              <div className="flex items-center gap-1 text-[#F2B832] font-semibold text-sm">
                <Star size={15} fill="#F2B832" />
                <span>{trail.rating}</span>
                <span className="text-xs text-[#A5B4A8]">({trail.reviewsCount})</span>
              </div>
            </div>
            <p className="text-xs text-[#A5B4A8] mt-1">{trail.region}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 py-3 px-3 bg-[#121613] rounded-2xl border border-[#2E3B32] text-center">
            <div>
              <div className="text-[10px] text-[#A5B4A8]">Cự ly</div>
              <div className="text-xs font-bold text-white mt-0.5">{trail.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#A5B4A8]">Thời gian</div>
              <div className="text-xs font-bold text-white mt-0.5">{trail.duration}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#A5B4A8]">Độ dốc +</div>
              <div className="text-xs font-bold text-[#4ADE80] mt-0.5">{trail.elevationGain}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#A5B4A8]">Đỉnh cao</div>
              <div className="text-xs font-bold text-[#F2B832] mt-0.5">{trail.summitAltitude}</div>
            </div>
          </div>

          {/* Elevation Profile Visual */}
          <div className="bg-[#121613] p-3 rounded-2xl border border-[#2E3B32]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-white">Biểu đồ độ cao cung đường</span>
              <span className="text-[11px] text-[#A5B4A8]">Đỉnh {trail.summitAltitude}</span>
            </div>
            {/* SVG Profile Chart */}
            <div className="h-20 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 300 70" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38764B" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#38764B" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 60 Q 40 55, 80 42 T 160 30 T 230 18 T 300 8 L 300 70 L 0 70 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M0 60 Q 40 55, 80 42 T 160 30 T 230 18 T 300 8"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-[#A5B4A8] mt-1">
              <span>Xuất phát (1,450m)</span>
              <span>Lán 1 (1,850m)</span>
              <span>Đỉnh ({trail.summitAltitude})</span>
            </div>
          </div>

          {/* Waypoints Highlights */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Điểm dừng quan trọng trên tuyến
            </h4>
            <div className="space-y-1.5">
              {trail.waypoints.map((wp, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] text-xs">
                  <div className="flex items-center gap-2">
                    <span>
                      {wp.type === 'camp' ? '⛺' : wp.type === 'water' ? '💧' : wp.type === 'summit' ? '▲' : '📸'}
                    </span>
                    <span className="font-semibold text-white">{wp.name}</span>
                  </div>
                  <span className="text-[11px] text-[#A5B4A8] font-mono">{wp.dist}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#121613] border-t border-[#2E3B32] flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onStartTracking(trail);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#38764B] hover:bg-[#438a58] text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <Navigation size={15} />
            <span>Bắt đầu ghi hành trình cung này</span>
          </button>

          <button
            title="Xuất file GPX / Bản đồ"
            onClick={() => alert(`Đã xuất file GPX cho ${trail.name}`)}
            className="p-3 bg-[#252F28] hover:bg-[#2E3B32] text-[#A5B4A8] hover:text-white rounded-xl"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

