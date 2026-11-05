import React, { useState, useEffect } from 'react';
import { StatusBar } from './components/StatusBar';
import { HardwarePill } from './components/HardwarePill';
import { BottomNav, TabType } from './components/BottomNav';
import { ExploreTab } from './components/tabs/ExploreTab';
import { CommunityTab } from './components/tabs/CommunityTab';
import { TrackTab } from './components/tabs/TrackTab';
import { MyBagTab } from './components/tabs/MyBagTab';
import { ProfileTab } from './components/tabs/ProfileTab';

import { OfflineModal } from './components/OfflineModal';
import { TrailDetailModal } from './components/TrailDetailModal';
import { GearChecklistModal } from './components/GearChecklistModal';
import { AILensModal } from './components/AILensModal';
import { FallCountdownModal } from './components/FallCountdownModal';
import { PanicSOSModal } from './components/PanicSOSModal';

import { HardwareState, Trail, FeedPost, CrewMember, Challenge, Trophy, EmergencyContact, FloraFaunaItem } from './types';
import { Smartphone, Monitor } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // App Data States
  const [hardware, setHardware] = useState<HardwareState>({
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
  });

  const [trails, setTrails] = useState<Trail[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Lan', relationship: 'Sister', phone: '+84 912 345 678', notifySms: true, notifyZalo: true }
  ]);

  // Modals
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [gearModalOpen, setGearModalOpen] = useState(false);
  const [aiLensOpen, setAiLensOpen] = useState(false);
  const [fallModalOpen, setFallModalOpen] = useState(false);
  const [panicSOSOpen, setPanicSOSOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 12.0945, lng: 108.6472 });

  // Fetch initial data from backend API
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => { if (data.success) setHardware(data.data); })
      .catch(() => {});

    fetch('/api/trails')
      .then(res => res.json())
      .then(data => { if (data.success) setTrails(data.data); })
      .catch(() => {});

    fetch('/api/community/feed')
      .then(res => res.json())
      .then(data => { if (data.success) setPosts(data.data); })
      .catch(() => {});

    fetch('/api/community/group')
      .then(res => res.json())
      .then(data => { if (data.success) setCrew(data.members); })
      .catch(() => {});

    fetch('/api/community/challenges')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChallenges(data.challenges);
          setTrophies(data.trophies);
        }
      })
      .catch(() => {});

    // Try real geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  }, []);

  // Update hardware state locally and sync with backend
  const handleUpdateHardware = (updates: Partial<HardwareState>) => {
    setHardware(prev => ({ ...prev, ...updates }));
    fetch('/api/status/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.hasLiked;
        return { ...p, hasLiked: nextLiked, likes: p.likes + (nextLiked ? 1 : -1) };
      }
      return p;
    }));
    fetch(`/api/community/feed/${postId}/like`, { method: 'POST' }).catch(() => {});
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment = { id: `c-${Date.now()}`, author: 'Thanh Thảo', text, time: 'Just now' };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    fetch(`/api/community/feed/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author: 'Thanh Thảo' })
    }).catch(() => {});
  };

  const handleSaveTrackSession = (session: { distance: string; duration: string; elevation: string; calories: string }) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: {
        name: 'Thanh Thảo',
        avatar: '/assets/c3de37e21a9b752dc3aeac3312fa8fc13160c641.png',
        location: 'Bidoup Núi Bà',
        timeAgo: 'Just now'
      },
      caption: `Hoàn thành chuyến trek ${session.distance}! Nạp đầy năng lượng cùng SolarBag Pro ☀️🏕️`,
      metrics: {
        distance: session.distance,
        elevation: session.elevation,
        type: 'Trek'
      },
      photo: '/assets/9680546a9f58bc783a3080e0c17b964f703f4857.png',
      mapPreview: 'Bidoup summit loop · GPS log',
      likes: 1,
      hasLiked: true,
      comments: []
    };
    setPosts([newPost, ...posts]);
    setActiveTab('community');
    alert('Đã lưu hành trình và tự động chia sẻ lên Bảng tin Cộng Đồng SolarBag!');
  };

  const handleSendTestSms = () => {
    fetch('/api/guardian/test-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCoords: userCoords })
    })
      .then(res => res.json())
      .then(data => {
        alert(`Đã gửi tin nhắn mẫu tới ${data.sentTo}:\n\n"${data.preview}"`);
      })
      .catch(() => {
        alert(`[SOLARBAG GUARDIAN] Thanh Thao gui tin nhan an toan: Toi dang o toa do ${userCoords.lat}, ${userCoords.lng}. Web link: https://solarbag.app/live/thanh-thao`);
      });
  };

  const handleTriggerSOS = () => {
    setFallModalOpen(false);
    setPanicSOSOpen(true);
    fetch('/api/guardian/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: userCoords.lat, lng: userCoords.lng, reason: 'PANIC BUTTON PRESSED' })
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#0a0d0b] text-white flex flex-col items-center justify-center sm:py-6 sm:px-4 font-sans select-none antialiased">
      {/* Top Bar Switcher (Mobile Shell vs Fullscreen) */}
      <div className="w-full max-w-[420px] mb-2 px-3 flex items-center justify-between text-xs text-[#A5B4A8]">
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#4ADE80]">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
          <span>SOLARBAG OS v2.4</span>
        </div>

        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1B221D] border border-[#2E3B32] hover:text-white transition-all text-[11px]"
        >
          {isPhoneFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          <span>{isPhoneFrame ? 'Toàn màn hình' : 'Khung iPhone 16 Pro'}</span>
        </button>
      </div>

      {/* Main iPhone 16 Pro Device Frame (393 x 852 px) */}
      <div
        className={`w-full max-w-[420px] bg-[#121613] flex flex-col justify-between overflow-hidden transition-all duration-300 relative ${
          isPhoneFrame
            ? 'h-[852px] sm:rounded-[48px] sm:border-[8px] sm:border-[#2E3B32] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10'
            : 'h-screen'
        }`}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 pointer-events-none hidden sm:flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]/80 border border-black/40"></div>
        </div>

        {/* Global iOS Status Bar */}
        <StatusBar />

        {/* Global Hardware Floating Pill Component (Present on all screens) */}
        <HardwarePill
          hardware={hardware}
          onUpdateHardware={handleUpdateHardware}
          onNavigateToBagTab={() => setActiveTab('mybag')}
        />

        {/* Active Tab Screen Content */}
        {activeTab === 'explore' && (
          <ExploreTab
            trails={trails}
            onSelectTrail={(t) => setSelectedTrail(t)}
            onOpenOfflineManager={() => setOfflineModalOpen(true)}
            onStartTrackingTrail={(t) => {
              setActiveTab('track');
            }}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTab
            posts={posts}
            crew={crew}
            challenges={challenges}
            trophies={trophies}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'track' && (
          <TrackTab
            onOpenAILens={() => setAiLensOpen(true)}
            onOpenGearCalculator={() => setGearModalOpen(true)}
            onSaveTrackSession={handleSaveTrackSession}
          />
        )}

        {activeTab === 'mybag' && (
          <MyBagTab
            hardware={hardware}
            onUpdateHardware={handleUpdateHardware}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            emergencyContacts={emergencyContacts}
            onTriggerFallCountdown={() => setFallModalOpen(true)}
            onTriggerPanicSOS={handleTriggerSOS}
            onSendTestSms={handleSendTestSms}
          />
        )}

        {/* Ergonomic 5-Tab Bottom Navigation Bar with Raised FAB */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* OVERLAY MODALS */}

      {/* 1. Offline Maps Storage Modal */}
      <OfflineModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
      />

      {/* 2. Trail Detail Modal */}
      <TrailDetailModal
        trail={selectedTrail}
        onClose={() => setSelectedTrail(null)}
        onStartTracking={(t) => {
          setSelectedTrail(null);
          setActiveTab('track');
        }}
      />

      {/* 3. LighterPack Gear Weight Calculator Modal */}
      <GearChecklistModal
        isOpen={gearModalOpen}
        onClose={() => setGearModalOpen(false)}
      />

      {/* 4. AI Outdoor Lens Camera Modal (Figma 66:8669) */}
      <AILensModal
        isOpen={aiLensOpen}
        onClose={() => setAiLensOpen(false)}
        onSaveToDiary={(item: FloraFaunaItem) => {
          const diaryPost: FeedPost = {
            id: `post-${Date.now()}`,
            author: {
              name: 'Thanh Thảo',
              avatar: '/assets/c3de37e21a9b752dc3aeac3312fa8fc13160c641.png',
              location: 'Bidoup Núi Bà',
              timeAgo: 'Just now'
            },
            caption: `Vừa quét được loài thực vật: ${item.commonName} (${item.localName}). ${item.toxicity}`,
            metrics: {
              distance: '7.77 km',
              elevation: '+450 m',
              type: 'Flora Lens'
            },
            photo: '/assets/b52ba1f177c970ae590d50a017afbc0d4019f65b.png',
            mapPreview: 'Bidoup · Tọa độ sinh thái',
            likes: 1,
            hasLiked: true,
            comments: []
          };
          setPosts([diaryPost, ...posts]);
        }}
      />

      {/* 5. Fall Detection 60-second Countdown Siren Modal */}
      <FallCountdownModal
        isOpen={fallModalOpen}
        onClose={() => setFallModalOpen(false)}
        onTriggerSOS={handleTriggerSOS}
      />

      {/* 6. Panic SOS Emergency Distress Modal */}
      <PanicSOSModal
        isOpen={panicSOSOpen}
        onClose={() => setPanicSOSOpen(false)}
        coordinates={userCoords}
      />
    </div>
  );
}

export default App;
