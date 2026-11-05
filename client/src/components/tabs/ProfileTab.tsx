import React, { useState, useRef } from 'react';
import { Settings, Share2, Sun, Mountain, Sprout, Trophy, ShieldCheck, ContactRound, MapPinCheck, MessageSquare, Timer, Watch, Fingerprint, Siren, ChevronRight, Check } from 'lucide-react';
import { EmergencyContact } from '../../types';

interface ProfileTabProps {
  emergencyContacts: EmergencyContact[];
  onTriggerFallCountdown: () => void;
  onTriggerPanicSOS: () => void;
  onSendTestSms: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  emergencyContacts,
  onTriggerFallCountdown,
  onTriggerPanicSOS,
  onSendTestSms
}) => {
  const [fallDetectionOn, setFallDetectionOn] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

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
        onTriggerPanicSOS();
      }
    }, 100); // 1000ms / 10 = 100ms per 10% -> 1000ms is 1 second, or 3000ms for 3 seconds: 300ms per 10%
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleTestSmsClick = () => {
    onSendTestSms();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
      {/* Screen Heading */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <div className="text-[10px] tracking-widest font-bold text-[#38764B] uppercase">
            YOUR EXPEDITION ID
          </div>
          <h1 className="text-2xl font-black text-white mt-0.5">Trail passport</h1>
        </div>
        <button
          onClick={() => alert('Cài đặt hồ sơ: Đổi avatar, đổi đơn vị đo lường, xuất dữ liệu cá nhân')}
          className="p-2.5 rounded-xl bg-[#1B221D] border border-[#2E3B32] text-[#A5B4A8] hover:text-white"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Hiker Profile Card */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-4">
        {/* Identity & Avatar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/c3de37e21a9b752dc3aeac3312fa8fc13160c641.png"
              alt="Thanh Thảo"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#38764B] shadow-md"
            />
            <div>
              <h2 className="text-lg font-black text-white">Thanh Thảo</h2>
              <div className="flex items-center gap-1.5 text-xs text-[#4ADE80] font-semibold mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
                <span>Light Builder · Level 2</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Đã sao chép liên kết Hồ sơ Hộ chiếu Trail Passport để chia sẻ!')}
            className="p-2.5 rounded-xl bg-[#252F28] hover:bg-[#2E3B32] text-white border border-[#2E3B32]"
            title="Chia sẻ thành tích"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Passport Statistics 3 Columns */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#2E3B32]/70 text-center">
          <div className="p-2.5 bg-[#121613] rounded-2xl border border-[#2E3B32]">
            <div className="text-2xl font-black text-white">12</div>
            <div className="text-[10px] text-[#A5B4A8] mt-0.5 uppercase tracking-wide">Trails</div>
          </div>
          <div className="p-2.5 bg-[#121613] rounded-2xl border border-[#2E3B32]">
            <div className="text-2xl font-black text-[#4ADE80]">86</div>
            <div className="text-[10px] text-[#A5B4A8] mt-0.5 uppercase tracking-wide">km trekked</div>
          </div>
          <div className="p-2.5 bg-[#121613] rounded-2xl border border-[#2E3B32]">
            <div className="text-2xl font-black text-[#F2B832]">2,800</div>
            <div className="text-[10px] text-[#A5B4A8] mt-0.5 uppercase tracking-wide">Highest · m</div>
          </div>
        </div>
      </div>

      {/* Trophy Cabinet */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">A little earned sunshine</h3>
          <span className="text-xs font-semibold text-[#4ADE80] cursor-pointer hover:underline">
            All badges ↗
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center gap-1.5 p-2 bg-[#121613] rounded-xl border border-[#38764B]">
            <div className="p-2 rounded-full bg-[#F2B832]/20 text-[#F2B832]">
              <Sun size={18} />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">First light</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-[#121613] rounded-xl border border-[#38764B]">
            <div className="p-2 rounded-full bg-[#38764B]/20 text-[#4ADE80]">
              <Mountain size={18} />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Peak seeker</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-[#121613] rounded-xl border border-[#38764B]">
            <div className="p-2 rounded-full bg-[#059669]/20 text-[#34D399]">
              <Sprout size={18} />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Light builder</span>
          </div>

          <div className="flex flex-col items-center gap-1.5 p-2 bg-[#121613] rounded-xl border border-[#38764B]">
            <div className="p-2 rounded-full bg-[#D97706]/20 text-[#FBBF24]">
              <Trophy size={18} />
            </div>
            <span className="text-[10px] font-bold text-white leading-tight">Trail keeper</span>
          </div>
        </div>
      </div>

      {/* Trail Guardian Safety Center */}
      <div className="bg-[#1B221D] border-2 border-[#38764B]/80 rounded-3xl p-5 shadow-xl space-y-4">
        {/* Guardian Heading */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#2E3B32]">
          <div className="p-2.5 rounded-2xl bg-[#38764B]/30 text-[#4ADE80] border border-[#38764B]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Trail Guardian</h3>
            <p className="text-xs text-[#4ADE80] font-medium">Your safety plan · no active alert</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Emergency contact</span>
            <span className="text-[#4ADE80] font-semibold cursor-pointer hover:underline">Edit</span>
          </div>

          <div className="p-3 bg-[#121613] rounded-2xl border border-[#2E3B32] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#252F28] text-white">
                <ContactRound size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Lan · Sister</div>
                <div className="text-[11px] font-mono text-[#A5B4A8]">+84 ••• ••• •12 · Demo</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A5B4A8]" />
          </div>

          <p className="text-[10px] text-[#A5B4A8] leading-relaxed">
            Contacts receive an SMS with a GPS web link. They don’t need to install SolarBag.
          </p>
        </div>

        {/* Location Permission */}
        <div className="p-3 bg-[#121613] rounded-2xl border border-[#2E3B32] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <MapPinCheck size={18} className="text-[#4ADE80]" />
            <div>
              <div className="font-bold text-white">Location while hiking · Allowed</div>
              <div className="text-[10px] text-[#A5B4A8]">Contact saved · test message not sent</div>
            </div>
          </div>
        </div>

        {/* Send Test SMS Button */}
        <button
          onClick={handleTestSmsClick}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
            testSent
              ? 'bg-[#4ADE80] text-black border-transparent'
              : 'bg-[#252F28] hover:bg-[#2E3B32] text-white border-[#2E3B32]'
          }`}
        >
          {testSent ? (
            <>
              <Check size={15} />
              <span>Đã gửi thử tin nhắn GPS mẫu!</span>
            </>
          ) : (
            <>
              <MessageSquare size={15} />
              <span>Send test contact message</span>
            </>
          )}
        </button>

        {/* Fall Detection Settings */}
        <div className="pt-3 border-t border-[#2E3B32] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Fall detection</h4>
              <p className="text-[11px] text-[#A5B4A8]">
                {fallDetectionOn ? 'Đang bật · Đếm ngược 60s khi va đập' : 'Off · enable for your next trek'}
              </p>
            </div>
            <button
              onClick={() => setFallDetectionOn(!fallDetectionOn)}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors ${
                fallDetectionOn ? 'bg-[#4ADE80]' : 'bg-[#252F28]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  fallDetectionOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="p-3 bg-[#121613] rounded-xl border border-[#2E3B32] text-[11px] text-[#A5B4A8] leading-relaxed">
            <span className="font-bold text-white">Grace period: 60s. </span>
            If a fall is detected, a 60s countdown starts. Tap Cancel during the countdown to stop the alert.
          </div>

          <button
            onClick={onTriggerFallCountdown}
            className="w-full py-2.5 px-3 bg-[#252F28] hover:bg-[#2E3B32] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Timer size={15} />
            <span>Preview countdown & Cancel</span>
          </button>
        </div>

        <p className="text-[10px] text-[#A5B4A8]/80 leading-relaxed italic">
          SOS sounds an alarm and attempts a GPS contact alert. Cellular / SMS delivery is required. No offline rescue guarantee or emergency-service connection.
        </p>
      </div>

      {/* Connected Watches */}
      <div className="bg-[#1B221D] border border-[#2E3B32] rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white">Watch connections</h3>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32] text-xs">
            <div className="flex items-center gap-2.5">
              <Watch size={18} className="text-[#A5B4A8]" />
              <div>
                <div className="font-bold text-white">Apple Watch</div>
                <div className="text-[10px] text-[#A5B4A8]">Not connected · Sync setup</div>
              </div>
            </div>
            <ChevronRight size={15} className="text-[#A5B4A8]" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121613] border border-[#2E3B32] text-xs">
            <div className="flex items-center gap-2.5">
              <Watch size={18} className="text-[#A5B4A8]" />
              <div>
                <div className="font-bold text-white">Garmin</div>
                <div className="text-[10px] text-[#A5B4A8]">Not connected · Sync setup</div>
              </div>
            </div>
            <ChevronRight size={15} className="text-[#A5B4A8]" />
          </div>
        </div>
      </div>

      {/* Persistent SOS Hold Control */}
      <div className="pt-2">
        <div className="bg-[#1B221D] border-2 border-[#E04838] rounded-3xl p-4 shadow-2xl space-y-2 text-center">
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className="w-full py-4 px-5 rounded-2xl bg-[#E04838] hover:bg-[#c93c2d] text-white flex items-center justify-between shadow-xl transition-all active:scale-98 relative overflow-hidden"
          >
            {/* Progress overlay when holding */}
            {isHolding && (
              <div
                className="absolute inset-0 bg-white/20 transition-all"
                style={{ width: `${holdProgress}%` }}
              ></div>
            )}

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Fingerprint size={22} className={isHolding ? 'animate-ping' : ''} />
            </div>

            <div className="text-center">
              <div className="text-base font-black tracking-wider uppercase">PANIC SOS</div>
              <div className="text-[10px] font-semibold text-white/90">
                {isHolding ? `ĐANG GIỮ (${Math.round((3 * (100 - holdProgress)) / 100)}s)...` : 'Hold 3 seconds for SOS'}
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Siren size={20} />
            </div>
          </button>

          <p className="text-[10px] text-[#A5B4A8]">
            Alarm + GPS to contacts · Cellular / SMS required
          </p>
        </div>
      </div>
    </div>
  );
};

