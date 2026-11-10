import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Droplets,
  Tent,
  Camera,
  Pause,
  Play,
  Square,
  ChevronUp,
  X,
  Battery,
  Sun,
  Lightbulb,
  Heart,
  Flame,
  Gauge,
  Compass,
  ArrowUpRight,
  CheckCircle2,
  ScanLine,
  Backpack,
  MapPin,
  Radio,
  Sparkles
} from 'lucide-react';
import { HardwareState, Waypoint } from '../../types';
import { LeafletMap } from '../LeafletMap';

interface ActiveTripRecordingProps {
  elapsedSeconds: number;
  distanceKm: number;
  elevationGain: number;
  calories: number;
  heartRate: number;
  isPaused: boolean;
  waypoints: Waypoint[];
  hardware: HardwareState;
  trailName?: string;
  onTogglePause: () => void;
  onFinish: () => void;
  onAddWaypoint: (type: 'water' | 'camp' | 'photo') => void;
  onOpenAILens?: () => void;
  onOpenGearCalculator?: () => void;
  onUpdateHardware?: (updates: Partial<HardwareState>) => void;
}

export const ActiveTripRecording: React.FC<ActiveTripRecordingProps> = ({
  elapsedSeconds,
  distanceKm,
  elevationGain,
  calories,
  heartRate,
  isPaused,
  waypoints,
  hardware,
  trailName = 'Bidoup Núi Bà (2,287m)',
  onTogglePause,
  onFinish,
  onAddWaypoint,
  onOpenAILens,
  onOpenGearCalculator,
  onUpdateHardware
}) => {
  // Bottom Sheet States (Ẩn trước, mở sau)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const [hardwareSheetOpen, setHardwareSheetOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hold to finish state (Giữ 1.5 giây để dừng, tránh bấm nhầm)
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  // Format hh:mm:ss hoặc mm:ss
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Giữ để dừng (Hold to Stop: 1.5 giây = 1500ms)
  const startHold = () => {
    setIsHolding(true);
    let progress = 0;
    holdIntervalRef.current = window.setInterval(() => {
      progress += 10;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current!);
        holdIntervalRef.current = null;
        setIsHolding(false);
        setHoldProgress(0);
        onFinish();
      }
    }, 150);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Ghim nhanh 1 chạm
  const handleQuickMark = (type: 'water' | 'camp' | 'photo') => {
    onAddWaypoint(type);
    const labels = {
      water: '💧 Đã ghim nguồn nước vào bản đồ',
      camp: '⛺ Đã ghim bãi lều vào bản đồ',
      photo: '📸 Đã ghim điểm ngắm cảnh'
    };
    showToast(labels[type]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#121613] text-white font-['Inter',sans-serif] relative overflow-hidden select-none">
      {/* Toast thông báo ghim nhanh */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1B221D] border border-[#38764B] text-white text-[12px] font-bold px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-[#4ADE80]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Trạng thái ghi + Tên cung đường + Hardware Pill đồng bộ theme tối */}
      <header className="px-4 pt-2 pb-2 flex items-center justify-between border-b border-[#2E3B32]/60 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] tracking-widest font-bold uppercase">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#F2B832]' : 'bg-[#4ADE80] animate-pulse'}`} />
            <span className={isPaused ? 'text-[#F2B832]' : 'text-[#4ADE80]'}>
              {isPaused ? 'TẠM DỪNG GHI' : 'ĐANG GHI HÀNH TRÌNH'}
            </span>
          </div>
          <h1 className="text-[17px] font-black text-white mt-0.5 leading-tight truncate max-w-[200px]">
            {trailName}
          </h1>
        </div>

        {/* Hardware Pill đồng bộ với dark outdoor theme */}
        <button
          onClick={() => setHardwareSheetOpen(true)}
          className="h-[32px] px-3 bg-[#1B221D] hover:bg-[#252F28] border border-[#2E3B32] active:scale-98 rounded-full flex items-center gap-2 text-white transition-all shadow-sm"
          aria-label="Trạng thái balo SolarBag"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold tabular-nums">
            <Battery size={14} className="text-[#4ADE80]" />
            <span>{hardware.batteryLevel}%</span>
          </div>
          <span className="text-[#2E3B32]">|</span>
          <div className="flex items-center gap-1 text-[#F2B832] text-[10px] font-semibold">
            <Sun size={12} className="animate-spin-slow" />
            <span>+{hardware.solarInputWatts}W</span>
          </div>
        </button>
      </header>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-2.5 space-y-3">
        {/* 1. CHIP CẢNH BÁO THỜI TIẾT / ĐỊA HÌNH */}
        <button
          onClick={() => setAlertSheetOpen(true)}
          className="w-full px-3 py-2 bg-[#C2562B]/15 hover:bg-[#C2562B]/25 border border-[#C2562B]/35 rounded-xl flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#F87171] truncate">
            <AlertTriangle size={15} className="shrink-0 text-[#F87171]" />
            <span className="truncate">Mưa 75% trong 2h tới · Đoạn km 5 dốc trơn trượt</span>
          </div>
          <span className="text-[10px] font-bold text-[#F2B832] uppercase shrink-0 ml-1">
            Chi tiết
          </span>
        </button>

        {/* 2. BA SỐ HERO (CỰ LY · THỜI GIAN · ĐỘ CAO) - FONT ĐẬM TO, TABULAR NUMS */}
        <section className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3 shadow-md">
          <div className="grid grid-cols-3 gap-1 text-center">
            {/* Cột 1: Cự ly */}
            <div className="flex flex-col items-center">
              <div className="text-[28px] sm:text-[32px] font-black text-white leading-none tracking-tight tabular-nums">
                {distanceKm.toFixed(2)}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold text-[#A5B4A8]">
                Quãng đường <span className="text-[10px] text-[#4ADE80]">(km)</span>
              </div>
            </div>

            {/* Cột 2: Thời gian */}
            <div className="flex flex-col items-center border-x border-[#2E3B32]">
              <div className="text-[28px] sm:text-[32px] font-black text-[#F2B832] leading-none tracking-tight tabular-nums font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold text-[#A5B4A8]">
                Thời gian
              </div>
            </div>

            {/* Cột 3: Độ cao tích lũy */}
            <div className="flex flex-col items-center">
              <div className="text-[28px] sm:text-[32px] font-black text-[#4ADE80] leading-none tracking-tight tabular-nums">
                +{elevationGain}
              </div>
              <div className="mt-1.5 text-[11px] font-semibold text-[#A5B4A8]">
                Độ cao <span className="text-[10px] text-[#4ADE80]">(m)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BẢN ĐỒ Ở GIỮA (LEAFLET MAP TOPO GPS THEO YÊU CẦU CỦA USER) */}
        <section className="rounded-2xl overflow-hidden border border-[#2E3B32] shadow-lg relative">
          <LeafletMap
            height="180px"
            placeName={trailName}
            summitAltitude="2,287m"
            routeNote={isPaused ? 'Hành trình đang tạm dừng' : 'Đang theo dõi GPS thời gian thực (±5m)'}
            waypoints={waypoints}
            enableRealGps={true}
          />
        </section>

        {/* 4. BIỂU ĐỒ TRẮC DIỆN CAO ĐỘ (ELEVATION PROFILE) */}
        <section className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3 shadow-md space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white text-[12px] flex items-center gap-1.5">
              <span>Trắc diện cao độ (Elevation)</span>
            </span>
            <span className="font-mono text-[#F2B832] font-bold text-[12px]">
              2,050 m
            </span>
          </div>

          <div className="h-[60px] w-full relative">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 320 60"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="liveDarkElevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38764B" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38764B" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Vùng bóng màu dưới đường cao độ */}
              <path
                d="M 0 50 Q 50 44, 100 36 T 180 24 T 250 16 L 320 10 L 320 60 L 0 60 Z"
                fill="url(#liveDarkElevationGrad)"
              />

              {/* Đường trắc diện màu xanh neon nổi bật */}
              <path
                d="M 0 50 Q 50 44, 100 36 T 180 24 T 250 16 L 320 10"
                fill="none"
                stroke="#4ADE80"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Mốc vị trí hiện tại */}
              <circle cx="250" cy="16" r="4.5" fill="#F2B832" stroke="#121613" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#A5B4A8]">
            <span>Xuất phát 0 km</span>
            <span className="text-[#4ADE80] font-bold">Hiện tại: {distanceKm.toFixed(2)} km</span>
            <span>Đích 14.2 km</span>
          </div>
        </section>

        {/* 5. HÀNG 3 NÚT TRÒN GHIM NHANH (NƯỚC · LỀU · VIEWPOINT) */}
        <section className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Ghim nhanh điểm dừng
            </span>
            <span className="text-[10px] text-[#A5B4A8]">1 chạm lưu vào bản đồ</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Nước */}
            <button
              onClick={() => handleQuickMark('water')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#3B82F6] active:scale-95 transition-all text-center"
              aria-label="Ghim điểm nguồn nước"
            >
              <div className="w-10 h-10 rounded-full bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <span className="text-[11px] font-bold text-white">Nguồn nước</span>
            </button>

            {/* Lều */}
            <button
              onClick={() => handleQuickMark('camp')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#F59E0B] active:scale-95 transition-all text-center"
              aria-label="Ghim bãi hạ lều"
            >
              <div className="w-10 h-10 rounded-full bg-[#D97706]/20 text-[#FBBF24] flex items-center justify-center">
                <Tent size={20} />
              </div>
              <span className="text-[11px] font-bold text-white">Bãi cắm trại</span>
            </button>

            {/* Viewpoint */}
            <button
              onClick={() => handleQuickMark('photo')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#10B981] active:scale-95 transition-all text-center"
              aria-label="Ghim điểm ngắm cảnh"
            >
              <div className="w-10 h-10 rounded-full bg-[#059669]/20 text-[#34D399] flex items-center justify-center">
                <Camera size={20} />
              </div>
              <span className="text-[11px] font-bold text-white">Điểm ngắm cảnh</span>
            </button>
          </div>
        </section>

        {/* 6. HÀNG ĐIỀU KHIỂN: TẠM DỪNG & GIỮ ĐỂ DỪNG */}
        <section className="space-y-2 pt-1 pb-2">
          <div className="flex items-center gap-2.5">
            {/* Nút Tạm dừng / Tiếp tục */}
            <button
              onClick={onTogglePause}
              className={`h-[48px] px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all shrink-0 ${
                isPaused
                  ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-lg shadow-[#38764B]/30'
                  : 'bg-[#1B221D] hover:bg-[#252F28] border-[#2E3B32] text-white'
              }`}
            >
              {isPaused ? (
                <>
                  <Play size={16} fill="white" />
                  <span>Tiếp tục</span>
                </>
              ) : (
                <>
                  <Pause size={16} />
                  <span>Tạm dừng</span>
                </>
              )}
            </button>

            {/* Nút Dừng: Giữ để kết thúc, chống bấm nhầm */}
            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              className="flex-1 h-[48px] bg-[#1B221D] hover:bg-[#252F28] border border-[#2E3B32] rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 relative overflow-hidden transition-all shadow-md"
              aria-label="Nhấn giữ để dừng hành trình"
            >
              {/* Thanh tiến độ giữ màu đỏ an toàn */}
              {isHolding && (
                <div
                  className="absolute inset-0 bg-[#E04838]/80 transition-all duration-150 ease-linear pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}

              <Square
                size={14}
                className={isHolding ? 'text-white relative z-10' : 'text-[#E04838] relative z-10'}
              />
              <span className="relative z-10 font-bold">
                {isHolding ? `Đang giữ (${Math.ceil((100 - holdProgress) / 33)}s)...` : 'Giữ để dừng chuyến đi'}
              </span>
            </button>
          </div>

          {/* Nút Ghost mở Bottom Sheet xem calo, nhịp tim */}
          <div className="flex justify-center">
            <button
              onClick={() => setDetailSheetOpen(true)}
              className="py-1 px-3 text-[12px] font-semibold text-[#4ADE80] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Xem chi tiết calo, nhịp tim & công cụ</span>
              <ChevronUp size={14} />
            </button>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 1: CHI TIẾT CHỈ SỐ DÃ NGOẠI (NẰM 100% TRONG ĐIỆN THOẠI) */}
      {/* ========================================================================= */}
      {detailSheetOpen && (
        <div
          onClick={() => setDetailSheetOpen(false)}
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#1B221D] border-t border-[#2E3B32] rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom duration-250 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#2E3B32] rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Chi tiết chỉ số dã ngoại</h2>
                <p className="text-[11px] text-[#A5B4A8]">Dữ liệu cảm biến thời gian thực</p>
              </div>
              <button
                onClick={() => setDetailSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#252F28] flex items-center justify-center text-[#A5B4A8] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] flex items-center gap-1.5">
                  <Flame size={14} className="text-[#F2B832]" />
                  <span>Năng lượng</span>
                </div>
                <div className="text-xl font-black text-white mt-0.5 tabular-nums">
                  {calories} <span className="text-[11px] font-normal text-[#A5B4A8]">cal</span>
                </div>
              </div>

              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] flex items-center gap-1.5">
                  <Heart size={14} className="text-[#E04838]" />
                  <span>Nhịp tim</span>
                </div>
                <div className="text-xl font-black text-white mt-0.5 tabular-nums">
                  {heartRate} <span className="text-[11px] font-normal text-[#A5B4A8]">bpm</span>
                </div>
              </div>

              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] flex items-center gap-1.5">
                  <Gauge size={14} className="text-[#4ADE80]" />
                  <span>Tốc độ trung bình</span>
                </div>
                <div className="text-xl font-black text-white mt-0.5 tabular-nums">
                  3.4 <span className="text-[11px] font-normal text-[#A5B4A8]">km/h</span>
                </div>
              </div>

              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8] flex items-center gap-1.5">
                  <Compass size={14} className="text-[#60A5FA]" />
                  <span>Tọa độ GPS</span>
                </div>
                <div className="text-[11px] font-mono font-bold text-white pt-1">
                  12.0945° N · 108.6472° E
                </div>
              </div>
            </div>

            {/* Quick shortcuts to Tools */}
            <div className="pt-2 space-y-2 border-t border-[#2E3B32]">
              {onOpenAILens && (
                <button
                  onClick={() => {
                    setDetailSheetOpen(false);
                    onOpenAILens();
                  }}
                  className="w-full p-3 bg-[#121613] hover:bg-[#252F28] border border-[#2E3B32] rounded-xl flex items-center justify-between text-white text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#38764B]/20 text-[#4ADE80]">
                      <ScanLine size={16} />
                    </div>
                    <span>AI Outdoor Lens (Quét nhận diện thực vật/nấm)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-[#A5B4A8]" />
                </button>
              )}

              {onOpenGearCalculator && (
                <button
                  onClick={() => {
                    setDetailSheetOpen(false);
                    onOpenGearCalculator();
                  }}
                  className="w-full p-3 bg-[#121613] hover:bg-[#252F28] border border-[#2E3B32] rounded-xl flex items-center justify-between text-white text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#F2B832]/20 text-[#F2B832]">
                      <Backpack size={16} />
                    </div>
                    <span>Tính tải trọng balo (LighterPack)</span>
                  </div>
                  <ArrowUpRight size={14} className="text-[#A5B4A8]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 2: CẢNH BÁO THỜI TIẾT & ĐỊA HÌNH */}
      {/* ========================================================================= */}
      {alertSheetOpen && (
        <div
          onClick={() => setAlertSheetOpen(false)}
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#1B221D] border-t border-[#2E3B32] rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom duration-250 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#2E3B32] rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#F2B832]">
                <AlertTriangle size={18} />
                <h2 className="text-base font-bold text-white">Cảnh báo rủi ro cung đường</h2>
              </div>
              <button
                onClick={() => setAlertSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#252F28] flex items-center justify-center text-[#A5B4A8] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 bg-[#121613] border border-[#C2562B]/40 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-[#F87171] flex items-center gap-1.5">
                  <span>🌧️ Khả năng mưa 75% trong 2 giờ tới</span>
                </div>
                <p className="text-[11px] text-[#A5B4A8] leading-relaxed">
                  Đám mây đối lưu tích tụ mạnh trên đỉnh Bidoup. Nhiệt độ giảm còn 19°C. Khuyến nghị chuẩn bị áo mưa dã ngoại và bọc chống ướt cho balo.
                </p>
              </div>

              <div className="p-3.5 bg-[#121613] border border-[#2E3B32] rounded-2xl space-y-1">
                <div className="text-xs font-bold text-[#F2B832] flex items-center gap-1.5">
                  <span>⚠️ Đoạn km 5: Dốc đất đỏ trơn trượt</span>
                </div>
                <p className="text-[11px] text-[#A5B4A8] leading-relaxed">
                  Rừng rậm nguyên sinh có độ ẩm 90%, rễ cây nổi và rêu trơn. Hãy siết chặt quai trợ lực balo và dùng gậy leo núi khi xuống dốc.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAlertSheetOpen(false)}
              className="w-full py-3 bg-[#38764B] hover:bg-[#438a58] rounded-xl text-white font-bold text-xs shadow-lg transition-colors"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BOTTOM SHEET 3: ĐIỀU KHIỂN NHANH BALO SOLARBAG PRO */}
      {/* ========================================================================= */}
      {hardwareSheetOpen && (
        <div
          onClick={() => setHardwareSheetOpen(false)}
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#1B221D] border-t border-[#2E3B32] rounded-t-3xl p-5 space-y-4 max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom duration-250 shadow-2xl"
          >
            <div className="w-10 h-1 bg-[#2E3B32] rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-wider">
                  THIẾT BỊ PHẦN CỨNG IOT
                </span>
                <h2 className="text-base font-bold text-white">{hardware.deviceName}</h2>
              </div>
              <button
                onClick={() => setHardwareSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#252F28] flex items-center justify-center text-[#A5B4A8] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8]">Dung lượng pin</div>
                <div className="text-2xl font-black text-white mt-0.5 tabular-nums">
                  {hardware.batteryLevel}%
                </div>
                <div className="text-[10px] text-[#4ADE80] font-semibold mt-0.5">
                  ● Đang sạc năng lượng mặt trời
                </div>
              </div>

              <div className="bg-[#121613] rounded-2xl p-3 border border-[#2E3B32]">
                <div className="text-[11px] text-[#A5B4A8]">Công suất sạc nắng</div>
                <div className="text-2xl font-black text-[#F2B832] mt-0.5 tabular-nums">
                  +{hardware.solarInputWatts} <span className="text-[11px] font-normal text-[#A5B4A8]">W</span>
                </div>
                <div className="text-[10px] text-[#A5B4A8] mt-0.5">
                  Tích lũy {hardware.dailyWhHarvested} Wh
                </div>
              </div>
            </div>

            {/* Công tắc đèn dã ngoại */}
            <div className="p-3 bg-[#121613] rounded-2xl border border-[#2E3B32] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lightbulb size={20} className={hardware.lampState === 'ON' ? 'text-[#F2B832]' : 'text-[#A5B4A8]'} />
                <div>
                  <div className="text-xs font-bold text-white">Đèn chiếu sáng dã ngoại BLE</div>
                  <div className="text-[10px] text-[#A5B4A8]">
                    {hardware.lampState === 'ON' ? `Đang bật độ sáng ${hardware.brightness}%` : 'Đang tắt'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onUpdateHardware) {
                    onUpdateHardware({
                      lampState: hardware.lampState === 'ON' ? 'OFF' : 'ON'
                    });
                  }
                }}
                className={`w-[48px] h-[28px] rounded-full p-1 transition-colors ${
                  hardware.lampState === 'ON' ? 'bg-[#38764B]' : 'bg-[#2E3B32]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    hardware.lampState === 'ON' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setHardwareSheetOpen(false)}
              className="w-full py-3 bg-[#252F28] hover:bg-[#2E3B32] rounded-xl text-white font-bold text-xs transition-colors"
            >
              Đóng bảng điều khiển
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
