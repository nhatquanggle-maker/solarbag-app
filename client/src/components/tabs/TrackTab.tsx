import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Play, Pause, Square, Droplets, Tent, Camera, CloudRain, AlertTriangle, ScanLine, ArrowUpRight, Backpack, ListChecks, Heart, Compass, CheckCircle2, ChevronRight, Navigation, Sparkles, ShieldCheck, BatteryCharging, Radio } from 'lucide-react';
import { LeafletMap } from '../LeafletMap';
import { HardwareState, Waypoint } from '../../types';
import { playTickSound } from '../../utils/audio';
import { ActiveTripRecording } from './ActiveTripRecording';

interface TrackTabProps {
  onOpenAILens: () => void;
  onOpenGearCalculator: () => void;
  onSaveTrackSession: (sessionData: { distance: string; duration: string; elevation: string; calories: string }) => void;
  hardware?: HardwareState;
  onUpdateHardware?: (updates: Partial<HardwareState>) => void;
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
  onSaveTrackSession,
  hardware,
  onUpdateHardware
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
    // Khớp 100% số km thực tế đã ghi
    const finalDist = `${distanceKm.toFixed(2)} km`;
    const finalDur = formatDuration(elapsedSeconds);
    const finalElev = `+${elevationGain} m`;
    const finalCal = `${calories} cal`;

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
        /* 2. MÀN HÌNH ĐANG GHI HÀNH TRÌNH (TUÂN THỦ 100% DESIGN.MD MỤC 4.3 & TOKENS) */
        /* ========================================================================= */
        <ActiveTripRecording
          elapsedSeconds={elapsedSeconds}
          distanceKm={distanceKm}
          elevationGain={elevationGain}
          calories={calories}
          heartRate={heartRate}
          isPaused={sessionStatus === 'paused'}
          waypoints={waypoints}
          trailName={activeRouteObj.name}
          hardware={hardware || {
            connected: true,
            deviceName: 'SolarBag Pro',
            edition: 'EXPEDITION / 30L',
            serial: 'SN SBP-26-DEMO',
            batteryLevel: 78,
            chargingState: 'CHARGING',
            solarInputWatts: 5.2,
            topPillWatts: 4.2,
            dailyWhHarvested: 32.5,
            targetWh: 50.0,
            lampState: 'OFF',
            brightness: 60,
            sosFlashActive: false,
            bleDistanceMeters: 12,
            bleDirection: 'NE · 45°',
            lastSeen: 'Just now',
            nfcRegistered: true,
            healthPercent: 98,
          }}
          onTogglePause={() => setSessionStatus(sessionStatus === 'recording' ? 'paused' : 'recording')}
          onFinish={handleFinish}
          onAddWaypoint={handleAddWaypoint}
          onOpenAILens={onOpenAILens}
          onOpenGearCalculator={onOpenGearCalculator}
          onUpdateHardware={onUpdateHardware}
        />
      )}
    </div>
  );
};
