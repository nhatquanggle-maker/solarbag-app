import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, MapPin, Footprints, Clock, Mountain, Flame, CheckCircle, Upload, Sparkles, Lock } from 'lucide-react';

interface SaveTripPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    distance: string;
    duration: string;
    elevation: string;
    calories: string;
    trailName?: string;
  };
  onPublish: (data: {
    caption: string;
    photo: string;
    location: string;
    shareToCommunity: boolean;
  }) => void;
}

const PRESET_PHOTOS = [
  { id: 'p1', label: 'Rừng Bidoup', url: '/assets/9680546a9f58bc783a3080e0c17b964f703f4857.png' },
  { id: 'p2', label: 'Đồi cỏ Tà Năng', url: '/assets/86d3e49ab71461892a12953e82f3ccf9025e1a13.png' },
  { id: 'p3', label: 'Biển mây hoàng hôn', url: '/assets/76e3c9174d19487fa8f507d6d81434dd898ab6b8.png' },
];

export const SaveTripPostModal: React.FC<SaveTripPostModalProps> = ({
  isOpen,
  onClose,
  sessionData,
  onPublish
}) => {
  const [caption, setCaption] = useState(
    `Vừa hoàn thành chặng trekking ${sessionData.distance}! Đường rừng tuyệt đẹp và tràn đầy năng lượng cùng SolarBag ☀️🌲🎒`
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string>(PRESET_PHOTOS[0].url);
  const [locationName, setLocationName] = useState(sessionData.trailName || 'Bidoup Núi Bà (2,287m)');
  const [shareToCommunity, setShareToCommunity] = useState(true);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSuggestion = (text: string) => {
    setCaption(text);
  };

  const handleConfirm = (publishToFeed: boolean) => {
    onPublish({
      caption: caption.trim() || `Hoàn thành chuyến đi ${sessionData.distance}`,
      photo: selectedPhoto,
      location: locationName,
      shareToCommunity: publishToFeed
    });
  };

  return (
    <div
      onClick={onClose}
      className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in select-none text-white font-['Inter',sans-serif]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[94%] bg-[#1B221D] border border-[#2E3B32] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2E3B32] flex items-center justify-between bg-[#121613]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#38764B]/20 text-[#4ADE80] rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lưu & Chia sẻ bài viết</h3>
              <p className="text-[11px] text-[#A5B4A8]">Khớp số liệu thực tế · Tùy chỉnh ảnh và nội dung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#252F28] text-[#A5B4A8] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 1. Verified Metrics Banner (1 Dòng tối ưu giao diện theo yêu cầu) */}
          <div className="bg-[#121613] p-3 rounded-2xl border border-[#2E3B32] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#A5B4A8]">
              <span className="flex items-center gap-1.5 text-[#4ADE80] font-semibold">
                <CheckCircle size={13} /> SỐ LIỆU ĐÃ GHI THỜI GIAN THỰC
              </span>
              <span className="font-mono text-[#F2B832] text-[10px]">GPS Verified</span>
            </div>

            {/* 1 Dòng ngang cân bằng tuyệt đối, không lệch khối */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#1B221D] rounded-xl border border-[#2E3B32] text-xs">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-[#A5B4A8]">Cự ly</span>
                <span className="font-black text-[#4ADE80] text-sm tabular-nums mt-0.5">
                  {sessionData.distance}
                </span>
              </div>

              <div className="w-[1px] h-6 bg-[#2E3B32]" />

              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-[#A5B4A8]">Thời gian</span>
                <span className="font-black text-white text-sm tabular-nums font-mono mt-0.5">
                  {sessionData.duration}
                </span>
              </div>

              <div className="w-[1px] h-6 bg-[#2E3B32]" />

              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-[#A5B4A8]">Độ cao</span>
                <span className="font-black text-[#60A5FA] text-sm tabular-nums mt-0.5">
                  {sessionData.elevation}
                </span>
              </div>

              <div className="w-[1px] h-6 bg-[#2E3B32]" />

              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-[#A5B4A8]">Calo</span>
                <span className="font-black text-[#F2B832] text-sm tabular-nums mt-0.5">
                  {sessionData.calories}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Caption Input Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Nội dung bài viết (Caption)</span>
              <span className="text-[10px] font-normal text-[#A5B4A8]">Tự do chỉnh sửa</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full bg-[#121613] border border-[#2E3B32] focus:border-[#4ADE80] rounded-2xl p-3 text-xs text-white placeholder-[#7A857E] outline-none transition-colors resize-none leading-relaxed"
              placeholder="Chia sẻ cảm xúc, trải nghiệm trên đường mòn hoặc lưu ý địa hình..."
            />

            {/* Quick Caption Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Đoạn dốc cuối thở không ra hơi nhưng cảnh biển mây đỉnh núi quá mãn nhãn! 🏔️✨')}
                className="px-2.5 py-1 bg-[#121613] hover:bg-[#252F28] border border-[#2E3B32] rounded-full text-[10px] text-[#A5B4A8] transition-colors"
              >
                + Cảnh săn mây đẹp ☁️
              </button>
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Đoạn dốc km 5 nhiều rêu trơn, trekker nhớ chuẩn bị gậy và giày bám tốt nhé! 🥾⚠️')}
                className="px-2.5 py-1 bg-[#121613] hover:bg-[#252F28] border border-[#2E3B32] rounded-full text-[10px] text-[#A5B4A8] transition-colors"
              >
                + Cảnh báo đoạn trơn ⚠️
              </button>
              <button
                type="button"
                onClick={() => handleQuickSuggestion(`Chinh phục trọn vẹn ${sessionData.distance}! Pin balo SolarBag nạp nắng liên tục cực tiện 🎒☀️`)}
                className="px-2.5 py-1 bg-[#121613] hover:bg-[#252F28] border border-[#2E3B32] rounded-full text-[10px] text-[#A5B4A8] transition-colors"
              >
                + Năng lượng mặt trời ☀️
              </button>
            </div>
          </div>

          {/* 3. Photo Picker & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#4ADE80]" />
                <span>Ảnh hành trình check-in</span>
              </label>

              {/* Upload from device button */}
              <label className="cursor-pointer px-2.5 py-1 bg-[#252F28] hover:bg-[#38764B] border border-[#2E3B32] rounded-xl text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors">
                <Upload size={12} />
                <span>Tải ảnh từ máy</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Preview & Presets */}
            <div className="relative rounded-2xl overflow-hidden border border-[#2E3B32] bg-[#121613] aspect-video flex items-center justify-center">
              <img
                src={selectedPhoto}
                alt="Trip Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                <MapPin size={10} className="text-[#E04838]" />
                <span>{locationName}</span>
              </div>
            </div>

            {/* Quick preset selector */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PHOTOS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPhoto(p.url)}
                  className={`relative rounded-xl overflow-hidden border text-left p-1 flex items-center gap-2 transition-all ${
                    selectedPhoto === p.url
                      ? 'border-[#4ADE80] bg-[#38764B]/30'
                      : 'border-[#2E3B32] bg-[#121613] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-8 h-8 rounded-lg object-cover" />
                  <span className="text-[10px] font-medium text-white truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Location Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white">Địa điểm check-in</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#121613] border border-[#2E3B32] rounded-xl text-xs text-white">
              <MapPin size={14} className="text-[#E04838]" />
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="bg-transparent flex-1 outline-none text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions: 2 nút kích thước bằng nhau, nhỏ gọn và vừa vặn */}
        <div className="p-3 border-t border-[#2E3B32] bg-[#121613] space-y-2">
          {/* Primary: Share to Community */}
          <button
            onClick={() => handleConfirm(true)}
            className="w-full h-[40px] px-3 bg-gradient-to-r from-[#38764B] to-[#4ADE80] hover:brightness-110 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#38764B]/30 transition-all"
          >
            <Send size={14} />
            <span>Đăng lên cộng đồng ({sessionData.distance})</span>
          </button>

          {/* Secondary: Save privately */}
          <button
            onClick={() => handleConfirm(false)}
            className="w-full h-[40px] px-3 bg-[#1B221D] hover:bg-[#252F28] border border-[#2E3B32] text-[#A5B4A8] hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Lock size={13} />
            <span>Chỉ lưu vào nhật ký cá nhân</span>
          </button>
        </div>
      </div>
    </div>
  );
};

