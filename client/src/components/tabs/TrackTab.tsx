import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Play, Pause, Square, Droplets, Tent, Camera, CloudRain, AlertTriangle, ScanLine, ArrowUpRight, Backpack, ListChecks, Heart, Compass, CheckCircle2, ChevronRight, Navigation, Sparkles, ShieldCheck, BatteryCharging, Radio } from 'lucide-react';
import { LeafletMap } from '../LeafletMap';
import { Waypoint } from '../../types';
import { playTickSound } from '../../utils/audio';

interface TrackTabProps {
  onOpenAILens: () => void;
  onOpenGearCalculator: () => void;
  onSaveTrackSession: (sessionData: { distance: string; duration: string; elevation: string; calories: string }) => void;
}

interface ActivityType {
  id: string;
  name: string;
  category: string;
  desc: string;
  icon: string;
}

const ACTIVITIES: ActivityType[] = [
  { id: 'trekking', name: 'Trekking', category: 'Outdoor Trekking', desc: 'Đi bộ khám phá thiên nhiên, địa hình tự nhiên có thể kéo dài nhiều giờ hoặc nhiều ngày', icon: '🥾' },
  { id: 'backpacking', name: 'Backpacking', category: 'Outdoor Trekking', desc: 'Du lịch bụi mang đầy đủ vật dụng dã ngoại trong balo nhiều ngày', icon: '🎒' },
  { id: 'hiking', name: 'Hiking', category: 'Outdoor Trekking', desc: 'Đi bộ trên đường mòn thiên nhiên theo lộ trình định sẵn trong ngày', icon: '🚶' },
  { id: 'trail-running', name: 'Trail running', category: 'Outdoor Trekking', desc: 'Chạy địa hình trên đường mòn, đường rừng đồi núi dốc', icon: '🏃' },
  { id: 'mountaineering', name: 'Mountaineering', category: 'Outdoor Trekking', desc: 'Chinh phục núi cao, leo đá kỹ thuật và vượt địa hình', icon: '🧗' },
  { id: 'bike-touring', name: 'Bike touring', category: 'Lifestyle Adventure', desc: 'Đạp xe đường dài qua nhiều địa điểm, tự mang hành lý', icon: '🚴' },
  { id: 'camping', name: 'Camping', category: 'Lifestyle Adventure', desc: 'Dựng lều, lưu trú ngoài trời và sinh tồn nơi hoang dã', icon: '⛺' },
  { id: 'fishing', name: 'Fishing', category: 'Lifestyle Adventure', desc: 'Hoạt động câu cá ven sông hồ, suối dã ngoại', icon: '🎣' },
];

const TERRAIN_ROUTES = [
  { id: 'bidoup', name: 'Bidoup Núi Bà (Lâm Đồng)', length: '14.2 km', elev: '+850 m', terrain: 'Rừng rậm nguyên sinh & dốc ẩm ướt' },
  { id: 'tanang', name: 'Tà Năng - Phan Dũng', length: '22.4 km', elev: '+1,150 m', terrain: 'Đồi cỏ bazan & sống lưng sạt lở' },
  { id: 'laothan', name: 'Lảo Thẩn (Y Tý)', length: '11.6 km', elev: '+680 m', terrain: 'Núi cao đón gió & săn biển mây' },
  { id: 'freestyle', name: 'Khám phá tự do (Bắt GPS vị trí tôi)', length: 'Tự tính', elev: 'Theo thực tế', terrain: 'Địa hình tùy chọn theo bước chân bạn' },
];

export const TrackTab: React.FC<TrackTabProps> = ({
  onOpenAILens,
  onOpenGearCalculator,
  onSaveTrackSession
}) => {
  // Session Status: 'idle' (setup trước khi đi) | 'countdown' (đếm 3-2-1) | 'recording' (đang đi) | 'paused' (tạm dừng)
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'countdown' | 'recording' | 'paused'>('idle');
  const [selectedActivity, setSelectedActivity] = useState<string>('trekking');
  const [selectedRoute, setSelectedRoute] = useState<string>('bidoup');
  const [countdownNum, setCountdownNum] = useState(3);

  // Active Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0.00);
  const [elevationGain, setElevationGain] = useState(0);
  const [calories, setCalories] = useState(0);
  const [heartRate, setHeartRate] = useState(115);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Timer reference
  useEffect(() => {
    let timer: number | null = null;
    if (sessionStatus === 'recording') {
      timer = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        // Realistic metrics accumulation
        setDistanceKm(prev => +(prev + 0.0012).toFixed(2));
        if (Math.random() > 0.7) {
          setElevationGain(prev => prev + 1);
        }
        if (Math.random() > 0.5) {
          setCalories(prev => prev + 1);
        }
        setHeartRate(prev => 135 + Math.floor(Math.sin(Date.now() / 4000) * 8));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionStatus]);

  // Handle Start Countdown
  const handleStartTrip = () => {
    setSessionStatus('countdown');
    setCountdownNum(3);
    playTickSound();

    let count = 3;
    const cdInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        playTickSound();
      } else {
        clearInterval(cdInterval);
        playTickSound();
        setSessionStatus('recording');
        setElapsedSeconds(0);
        setDistanceKm(0.00);
        setElevationGain(0);
        setCalories(0);
        setHeartRate(125);
        // Set sample initial route waypoints based on choice
        if (selectedRoute === 'bidoup') {
          setWaypoints([
            { name: 'Suối nguồn lạnh', type: 'water', dist: '2.4km', lat: 12.0910, lng: 108.6445 },
            { name: 'Pine camp', type: 'camp', dist: '0.8km', lat: 12.0880, lng: 108.6420 },
          ]);
        } else {
          setWaypoints([]);
        }
      }
    }, 900);
  };

  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleAddWaypoint = (type: 'water' | 'camp' | 'photo') => {
    const title = prompt(`Ghi chú tên điểm (${type.toUpperCase()}):`, type === 'water' ? 'Điểm lấy nước suối' : type === 'camp' ? 'Bãi hạ lều' : 'Góc chụp hoàng hôn');
    if (!title) return;

    const newWp: Waypoint = {
      name: title,
      type,
      dist: `${distanceKm.toFixed(2)}km`,
      lat: 12.0945 + (Math.random() * 0.004 - 0.002),
      lng: 108.6472 + (Math.random() * 0.004 - 0.002)
    };
    setWaypoints([...waypoints, newWp]);
    alert(`Đã ghim điểm "${title}" vào bản đồ GPS!`);
  };

  const handleFinish = () => {
    const finalDist = distanceKm > 0 ? `${distanceKm.toFixed(2)} km` : '7.77 km';
    const finalDur = elapsedSeconds > 0 ? formatDuration(elapsedSeconds) : '01:48:09';
    const finalElev = elevationGain > 0 ? `+${elevationGain} m` : '+450 m';
    const finalCal = calories > 0 ? `${calories} cal` : '577 cal';

    setSessionStatus('idle');
    onSaveTrackSession({
      distance: finalDist,
      duration: finalDur,
      elevation: finalElev,
      calories: finalCal
    });
  };

  const activeActObj = ACTIVITIES.find(a => a.id === selectedActivity) || ACTIVITIES[0];
  const activeRouteObj = TERRAIN_ROUTES.find(r => r.id === selectedRoute) || TERRAIN_ROUTES[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* COUNTDOWN OVERLAY */}
      {sessionStatus === 'countdown' && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in select-none">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-40 h-40 rounded-full bg-[#38764B]/30 animate-ping absolute"></div>
            <div className="w-32 h-32 rounded-full bg-[#38764B] border-4 border-[#4ADE80] text-white flex items-center justify-center shadow-2xl">
              <span className="text-6xl font-black">{countdownNum}</span>
            </div>
          </div>
          <div className="text-xs font-bold tracking-widest text-[#F2B832] uppercase mb-1">
            CHUẨN BỊ XUẤT PHÁT
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            {activeActObj.name} · {activeRouteObj.name}
          </h2>
          <p className="text-xs text-[#A5B4A8]">Đang kết nối GPS độ chính xác cao & đồng bộ balo SolarBag...</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MÀN HÌNH SETUP TRƯỚC KHI BẮT ĐẦU (KHI status === 'idle') */}
      {/* ========================================================================= */}
      {sessionStatus === 'idle' ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase flex items-center gap-1.5">
                  <Radio size={12} className="text-[#4ADE80] animate-pulse" />
                  <span>SẴN SÀNG KHỞI HÀNH · THIẾT LẬP CHUYẾN ĐI</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-0.5">Bắt đầu hành trình</h1>
              </div>
              <button
                onClick={() => alert('Cài đặt thông số: Đổi đơn vị cự ly, hiệu chuẩn GPS, kết nối thiết bị đo tim')}
                className="p-2.5 rounded-xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Map Preview */}
            <div>
              <LeafletMap
                height="170px"
                placeName={activeRouteObj.name}
                summitAltitude="2,287m"
                routeNote="Sẵn sàng bắt đầu chuyến đi mới"
                enableRealGps={true}
              />
            </div>

            {/* 1. Chọn loại hoạt động (Theo tài liệu ý tưởng Page 3) */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Chọn loại hoạt động</span>
                  <span className="text-[10px] text-[#4ADE80] font-normal">(Page 3 Spec)</span>
                </label>
                <span className="text-xs font-semibold text-[#F2B832]">{activeActObj.name}</span>
              </div>

              {/* Horizontal Scroll Activity Chips */}
              <div className="grid grid-cols-4 gap-2">
                {ACTIVITIES.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      setSelectedActivity(act.id);
                      playTickSound();
                    }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all text-center ${
                      selectedActivity === act.id
                        ? 'bg-[#38764B] border-[#4ADE80] text-white shadow-lg shadow-[#38764B]/30 scale-102'
                        : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8] hover:bg-[#252F28] hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{act.icon}</span>
                    <span className="text-[11px] font-bold leading-tight line-clamp-1">{act.name}</span>
                  </button>
                ))}
              </div>

              {/* Activity Description Banner */}
              <div className="p-3 bg-[#121613] rounded-2xl border border-[#2E3B32] text-[11px] text-[#A5B4A8] leading-relaxed">
                <span className="font-bold text-white">{activeActObj.name}: </span>
                {activeActObj.desc}
              </div>
            </div>

            {/* 2. Chọn Cung đường / Địa hình */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Chọn cung đường & địa hình
                </label>
                <span className="text-xs text-[#A5B4A8] font-mono">{activeRouteObj.length}</span>
              </div>

              <div className="space-y-1.5">
                {TERRAIN_ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedRoute(route.id);
                      playTickSound();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      selectedRoute === route.id
                        ? 'bg-[#38764B]/30 border-[#4ADE80] text-white'
                        : 'bg-[#121613] border-[#2E3B32] text-[#A5B4A8] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${selectedRoute === route.id ? 'bg-[#4ADE80] text-black font-bold' : 'bg-[#252F28] text-[#A5B4A8]'}`}>
                        <Navigation size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{route.name}</div>
                        <div className="text-[10px] text-[#A5B4A8]">{route.terrain}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-[#F2B832] font-mono">{route.length}</div>
                      <div className="text-[10px] text-[#4ADE80]">{route.elev}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Kiểm tra trước khi khởi hành (Pre-flight Checklist) */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-4 shadow-xl space-y-2.5">
              <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                3. Kiểm tra an toàn trước khi đi
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#121613] rounded-xl border border-[#2E3B32] flex items-center gap-2">
                  <BatteryCharging size={16} className="text-[#4ADE80]" />
                  <div>
                    <div className="text-[10px] text-[#A5B4A8]">Balo SolarBag</div>
                    <div className="font-bold text-white">78% · Đang sạc</div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#121613] rounded-xl border border-[#2E3B32] flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#3B82F6]" />
                  <div>
                    <div className="text-[10px] text-[#A5B4A8]">Trail Guardian</div>
                    <div className="font-bold text-white">Bảo hộ SMS sẵn sàng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCKED START BUTTON AT BOTTOM */}
          <div className="p-3 bg-[#121613] border-t border-[#2E3B32] z-30 shrink-0">
            <button
              onClick={handleStartTrip}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#38764B] to-[#4ADE80] hover:brightness-110 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-2xl shadow-[#38764B]/40 active:scale-98 transition-all"
            >
              <Play size={18} fill="white" />
              <span>BẮT ĐẦU CHUYẾN ĐI ({activeActObj.name.toUpperCase()})</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MÀN HÌNH ĐANG GHI HÀNH TRÌNH THỰC TẾ (KHI status === 'recording' | 'paused') */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6 space-y-4">
            {/* Screen Heading */}
            <div className="flex items-start justify-between pt-1">
              <div>
                <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sessionStatus === 'recording' ? 'bg-[#4ADE80] animate-ping' : 'bg-[#F2B832]'}`}></span>
                  <span>{sessionStatus === 'recording' ? 'ĐANG GHI HÀNH TRÌNH' : 'ĐANG TẠM DỪNG'} · {activeActObj.name.toUpperCase()}</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-0.5">{activeRouteObj.name}</h1>
              </div>
              <button
                onClick={() => alert('Tùy chọn: Tạm ngắt GPS, Đổi đơn vị dặm/km, Cài đặt cảnh báo nhịp tim')}
                className="p-2.5 rounded-xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Topographic Map (Bidoup Núi Bà GPS ±5m) */}
            <div>
              <LeafletMap
                height="220px"
                placeName={activeRouteObj.name}
                summitAltitude="2,287m"
                routeNote={sessionStatus === 'recording' ? 'Đang theo dõi vị trí GPS trực tiếp' : 'Tạm dừng ghi'}
                waypoints={waypoints}
                enableRealGps={true}
              />
            </div>

            {/* Live Expedition Metrics Grid 2x2 */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Distance */}
              <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3.5 shadow-md">
                <div className="text-[11px] font-semibold text-[#A5B4A8]">Quãng đường (Distance)</div>
                <div className="text-2xl font-black text-white mt-1">
                  {distanceKm.toFixed(2)} <span className="text-xs font-normal text-[#A5B4A8]">km</span>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3.5 shadow-md">
                <div className="text-[11px] font-semibold text-[#A5B4A8]">Thời gian (Duration)</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {formatDuration(elapsedSeconds)}
                </div>
              </div>

              {/* Elevation gain */}
              <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3.5 shadow-md">
                <div className="text-[11px] font-semibold text-[#A5B4A8]">Độ cao tích lũy</div>
                <div className="text-2xl font-black text-[#4ADE80] mt-1">
                  +{elevationGain} <span className="text-xs font-normal text-[#A5B4A8]">m</span>
                </div>
              </div>

              {/* Calories / Heart rate */}
              <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-3.5 shadow-md">
                <div className="text-[11px] font-semibold text-[#A5B4A8]">Calo / Nhịp tim</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">{calories}</span>
                  <span className="text-xs font-bold text-[#E04838] flex items-center gap-0.5">
                    ♥ {heartRate} <span className="text-[10px] text-[#A5B4A8]">bpm</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Elevation Profile */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Elevation profile</span>
                <span className="font-mono text-[#F2B832] font-semibold">1,842 m</span>
              </div>

              {/* Profile Chart Graphic */}
              <div className="h-16 w-full relative">
                <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="liveProfileGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38764B" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#38764B" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 50 Q 50 45, 100 35 T 200 20 T 260 12 L 300 8 L 300 60 L 0 60 Z"
                    fill="url(#liveProfileGrad)"
                  />
                  <path
                    d="M0 50 Q 50 45, 100 35 T 200 20 T 260 12 L 300 8"
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] font-mono text-[#A5B4A8]">
                <span>0 km</span>
                <span className="text-[#4ADE80] font-bold">Hiện tại: {distanceKm.toFixed(2)} km</span>
              </div>
            </div>

            {/* Mark Waypoints ("Mark the moment") */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Ghim điểm quan trọng</h2>
                <span className="text-xs text-[#A5B4A8]">1 chạm đánh dấu</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddWaypoint('water')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#2563EB] text-white transition-all active:scale-95"
                >
                  <div className="p-2 rounded-full bg-[#2563EB]/20 text-[#60A5FA]">
                    <Droplets size={18} />
                  </div>
                  <span className="text-xs font-bold">Nguồn nước</span>
                </button>

                <button
                  onClick={() => handleAddWaypoint('camp')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#D97706] text-white transition-all active:scale-95"
                >
                  <div className="p-2 rounded-full bg-[#D97706]/20 text-[#FBBF24]">
                    <Tent size={18} />
                  </div>
                  <span className="text-xs font-bold">Điểm lều</span>
                </button>

                <button
                  onClick={() => handleAddWaypoint('photo')}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#121613] border border-[#2E3B32] hover:border-[#059669] text-white transition-all active:scale-95"
                >
                  <div className="p-2 rounded-full bg-[#059669]/20 text-[#34D399]">
                    <Camera size={18} />
                  </div>
                  <span className="text-xs font-bold">View đẹp</span>
                </button>
              </div>
            </div>

            {/* Weather & Caution Pill */}
            <div className="bg-[#1B221D] border border-[#2E3B32] rounded-2xl p-4 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CloudRain size={20} className="text-[#60A5FA]" />
                  <span className="text-lg font-bold text-white">26°C</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">75% rain in next 2h</div>
                  <div className="text-[10px] text-[#A5B4A8]">Dự báo Bidoup</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#C2562B]/20 border border-[#C2562B]/40 flex items-center gap-2 text-xs text-[#F87171]">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="font-medium">Đoạn km 5 dốc trơn trượt. Chú ý bước chân.</span>
              </div>
            </div>

            {/* Trail Toolkit */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-white">Hộp công cụ dã ngoại</h2>

              <div
                onClick={onOpenAILens}
                className="p-3.5 bg-[#1B221D] border border-[#2E3B32] rounded-2xl flex items-center justify-between cursor-pointer hover:border-[#4ADE80] transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#38764B]/20 text-[#4ADE80] group-hover:scale-110 transition-transform">
                    <ScanLine size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Flora / Fauna Lens</div>
                    <div className="text-[11px] text-[#A5B4A8]">Quét nhận diện thực vật, nấm độc</div>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#A5B4A8] group-hover:text-white" />
              </div>

              <div
                onClick={onOpenGearCalculator}
                className="p-3.5 bg-[#1B221D] border border-[#2E3B32] rounded-2xl space-y-2.5 cursor-pointer hover:border-[#F2B832] transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#F2B832]/20 text-[#F2B832]">
                      <Backpack size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Gear weight calculator</div>
                      <div className="text-[11px] text-[#F2B832] font-mono font-semibold">6.4 kg base weight</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-[#A5B4A8]" />
                </div>
              </div>
            </div>
          </div>

          {/* DOCKED CONTROLS WHEN RECORDING */}
          <div className="p-3 bg-[#121613] border-t border-[#2E3B32] z-30 shrink-0">
            <div className="p-1.5 bg-[#1B221D] border border-[#2E3B32] rounded-2xl flex items-center gap-2 shadow-xl">
              <button
                onClick={() => setSessionStatus(sessionStatus === 'recording' ? 'paused' : 'recording')}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  sessionStatus === 'recording'
                    ? 'bg-[#252F28] hover:bg-[#2E3B32] text-white'
                    : 'bg-[#4ADE80] text-black shadow-lg shadow-[#4ADE80]/20'
                }`}
              >
                {sessionStatus === 'recording' ? (
                  <>
                    <Pause size={16} />
                    <span>Tạm dừng (Pause)</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Tiếp tục (Resume)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinish}
                className="py-3 px-6 rounded-xl bg-[#E04838] hover:bg-[#c93c2d] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#E04838]/20 transition-all"
              >
                <Square size={14} />
                <span>Kết thúc (Finish)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
