import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory application state
let hardwareState = {
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
};

let emergencyContacts = [
  { id: '1', name: 'Lan', relationship: 'Sister', phone: '+84 912 345 678', notifySms: true, notifyZalo: true }
];

let fallDetectionConfig = {
  enabled: false,
  countdownSeconds: 60,
  sensitivity: 'Normal',
  autoDispatchAfterSeconds: 60
};

let groupCrew = [
  { id: 'ml', name: 'Minh Linh', initials: 'ML', status: 'On trail', lat: 12.0965, lng: 108.6490, altitude: 2180, speed: '3.4 km/h', battery: '82%', distanceToMe: '150m ahead' },
  { id: 'tt', name: 'Thanh Thảo (Me)', initials: 'TT', status: 'On trail', lat: 12.0945, lng: 108.6472, altitude: 2150, speed: '3.2 km/h', battery: '78%', distanceToMe: '0m' },
  { id: 'an', name: 'An Nguyễn', initials: 'AN', status: 'On trail', lat: 12.0920, lng: 108.6450, altitude: 2090, speed: '2.8 km/h', battery: '65%', distanceToMe: '280m behind' },
  { id: 'qh', name: 'Quang Huy', initials: 'QH', status: 'At camp', lat: 12.0880, lng: 108.6410, altitude: 1980, speed: '0 km/h', battery: '95%', distanceToMe: '850m behind' },
];

let communityFeed = [
  {
    id: 'post-1',
    author: {
      name: 'Minh Linh',
      avatar: '/assets/f1b0d97ebc58a1cecac42c0204fe91b2f86a8b8a.png',
      location: 'Bidoup Núi Bà',
      timeAgo: '12 min ago'
    },
    caption: 'Above the clouds. Powered by a little sun ☀️🌲',
    metrics: {
      distance: '14.2 km',
      elevation: '+850 m',
      type: 'Trek'
    },
    photo: '/assets/76e3c9174d19487fa8f507d6d81434dd898ab6b8.png',
    mapPreview: 'Bidoup · GPS trail log',
    likes: 24,
    hasLiked: false,
    comments: [
      { id: 'c1', author: 'Thanh Thảo', text: 'Cung này dốc đoạn cuối thở không ra hơi luôn!', time: '10 min ago' },
      { id: 'c2', author: 'An Nguyễn', text: 'Đẹp quá chị ơi, em đang leo lên sau nè', time: '5 min ago' }
    ]
  }
];

let trails = [
  {
    id: 'bidoup-summit',
    name: 'Bidoup summit loop',
    rating: 4.8,
    reviewsCount: 142,
    length: '14.2 km',
    duration: '6–7 hr',
    region: 'Lâm Đồng · Vườn Quốc Gia Bidoup',
    difficulty: 'Hard',
    statusBadge: 'Slippery',
    elevationGain: '+850 m',
    summitAltitude: '2,287m',
    image: '/assets/9680546a9f58bc783a3080e0c17b964f703f4857.png',
    coordinates: [12.0945, 108.6472],
    center: [12.0945, 108.6472],
    path: [
      [12.0820, 108.6380],
      [12.0860, 108.6410],
      [12.0900, 108.6440],
      [12.0945, 108.6472],
      [12.0980, 108.6505],
      [12.1030, 108.6540],
      [12.1060, 108.6560]
    ],
    waypoints: [
      { name: 'Pine camp', type: 'camp', dist: '0.8km', lat: 12.0880, lng: 108.6420 },
      { name: 'Suối nguồn lạnh', type: 'water', dist: '2.4km', lat: 12.0910, lng: 108.6445 },
      { name: 'Viewpoint Cây Đỗ Quyên', type: 'photo', dist: '5.1km', lat: 12.0970, lng: 108.6495 },
      { name: 'Đỉnh Bidoup 2,287m', type: 'summit', dist: '7.8km', lat: 12.1060, lng: 108.6560 }
    ],
    offlineAvailable: true,
    packageSize: '240 MB'
  },
  {
    id: 'ta-nang-phan-dung',
    name: 'Tà Năng ridge walk',
    rating: 4.8,
    reviewsCount: 310,
    length: '22.4 km',
    duration: '8–9 hr',
    region: 'Lâm Đồng - Bình Thuận',
    difficulty: 'Moderate',
    statusBadge: 'Landslide',
    elevationGain: '+1,150 m',
    summitAltitude: '1,420m',
    image: '/assets/86d3e49ab71461892a12953e82f3ccf9025e1a13.png',
    coordinates: [11.6420, 108.4120],
    center: [11.6420, 108.4120],
    path: [
      [11.6200, 108.3900],
      [11.6310, 108.4010],
      [11.6420, 108.4120],
      [11.6550, 108.4280],
      [11.6700, 108.4450]
    ],
    waypoints: [
      { name: 'Đồi Lính Camp', type: 'camp', dist: '4.2km', lat: 11.6350, lng: 108.4050 },
      { name: 'Vực sạt lở km số 5', type: 'alert', dist: '5.5km', lat: 11.6440, lng: 108.4150 },
      { name: 'Mốc 3 tỉnh Viewpoint', type: 'photo', dist: '9.8km', lat: 11.6580, lng: 108.4310 }
    ],
    offlineAvailable: true,
    packageSize: '310 MB'
  }
];

let floraFaunaDb = [
  {
    id: 'amanita-verna',
    commonName: 'White amanita',
    scientificName: 'Amanita verna',
    localName: 'Nấm Tán Trắng / Nấm Độc Cực Nguy Hiểm',
    toxicity: 'Potentially highly toxic ⚠️',
    isToxic: true,
    safetyInstruction: 'Do not touch or consume. Contains lethal amatoxins. AI identification can be wrong—never use it to decide what is safe to eat.',
    status: 'POSSIBLE MATCH · NOT VERIFIED',
    confidence: '94%',
    habitat: 'Rừng thông, rừng hỗn giao vùng á nhiệt đới',
    recommendation: 'Tránh tiếp xúc bằng tay trần. Rửa tay ngay nếu vô tình chạm phải.'
  },
  {
    id: 'dendrobium-nobile',
    commonName: 'Noble Dendrobium Orchid',
    scientificName: 'Dendrobium nobile',
    localName: 'Lan Phi Điệp / Thạch Hộc',
    toxicity: 'Non-toxic · Thảo dược quý',
    isToxic: false,
    safetyInstruction: 'Hoa phong lan dại quý hiếm. Vui lòng không ngắt hoa bẻ cành để bảo tồn thiên nhiên.',
    status: 'HIGH CONFIDENCE MATCH',
    confidence: '98%',
    habitat: 'Thân cây cổ thụ rừng nguyên sinh',
    recommendation: 'Chỉ chụp ảnh lưu lại tọa độ cho nhật ký sinh thái.'
  },
  {
    id: 'phyllium-bioculatum',
    commonName: 'Leaf Insect',
    scientificName: 'Phyllium bioculatum',
    localName: 'Bọ Lá Xanh Rừng Núi',
    toxicity: 'Harmless · Sinh vật ngụy trang',
    isToxic: false,
    safetyInstruction: 'Côn trùng ngụy trang đặc hữu quý hiếm. Rất nhạy cảm với nhiệt độ và rung động.',
    status: 'VERIFIED MATCH',
    confidence: '96%',
    habitat: 'Tán lá rậm rạp nhiệt đới ẩm',
    recommendation: 'Quan sát nhẹ nhàng từ khoảng cách tối thiểu 30cm.'
  }
];

// --- ROUTES ---

// 1. Hardware IoT Status
app.get('/api/status', (req, res) => {
  // Simulate minor solar fluctuations when charging
  if (hardwareState.chargingState === 'CHARGING') {
    const jitter = (Math.random() * 0.4 - 0.2);
    hardwareState.solarInputWatts = +(5.2 + jitter).toFixed(1);
    hardwareState.topPillWatts = +(4.2 + jitter * 0.8).toFixed(1);
  }
  res.json({ success: true, data: hardwareState });
});

app.post('/api/status/control', (req, res) => {
  const { lampState, brightness, sosFlashActive } = req.body;
  if (lampState !== undefined) hardwareState.lampState = lampState;
  if (brightness !== undefined) hardwareState.brightness = brightness;
  if (sosFlashActive !== undefined) hardwareState.sosFlashActive = sosFlashActive;

  res.json({ success: true, message: 'Hardware state updated', data: hardwareState });
});

// Sound chime on bag locator
app.post('/api/locator/chime', (req, res) => {
  res.json({
    success: true,
    message: 'Sound chime command beamed via BLE to SolarBag speaker (BEEP-BEEP-BEEP)'
  });
});

// 2. Trails & Offline Maps
app.get('/api/trails', (req, res) => {
  const { q, difficulty, nearWater } = req.query;
  let result = [...trails];
  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(t => t.name.toLowerCase().includes(lower) || t.region.toLowerCase().includes(lower));
  }
  if (difficulty && difficulty !== 'All') {
    result = result.filter(t => t.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (nearWater === 'true') {
    result = result.filter(t => t.waypoints.some(w => w.type === 'water'));
  }
  res.json({ success: true, count: result.length, data: result });
});

app.get('/api/trails/:id', (req, res) => {
  const trail = trails.find(t => t.id === req.params.id);
  if (!trail) return res.status(404).json({ success: false, message: 'Trail not found' });
  res.json({ success: true, data: trail });
});

// Offline packages
app.get('/api/offline/packages', (req, res) => {
  res.json({
    success: true,
    storageUsed: '640 MB',
    storageTotal: '2.0 GB',
    packages: [
      { id: 'tay-bac', name: 'Tây Bắc (Lào Cai, Yên Bái, Sơn La)', size: '320 MB', ready: true, updateAvailable: false },
      { id: 'bidoup', name: 'Bidoup Núi Bà (Lâm Đồng)', size: '240 MB', ready: true, updateAvailable: true },
      { id: 'ta-xua', name: 'Tà Xùa - Bắc Yên', size: '180 MB', ready: false, updateAvailable: false }
    ]
  });
});

// 3. Community Feed & Group Tracker
app.get('/api/community/feed', (req, res) => {
  res.json({ success: true, data: communityFeed });
});

app.post('/api/community/feed/:id/like', (req, res) => {
  const post = communityFeed.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  post.hasLiked = !post.hasLiked;
  post.likes += post.hasLiked ? 1 : -1;
  res.json({ success: true, likes: post.likes, hasLiked: post.hasLiked });
});

app.post('/api/community/feed/:id/comment', (req, res) => {
  const post = communityFeed.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  const { text, author = 'Thanh Thảo' } = req.body;
  const newComment = { id: `c-${Date.now()}`, author, text, time: 'Just now' };
  post.comments.push(newComment);
  res.json({ success: true, data: newComment, comments: post.comments });
});

app.get('/api/community/group', (req, res) => {
  res.json({
    success: true,
    groupName: 'Weekend crew',
    totalMembers: 4,
    sharingCount: 3,
    statusText: 'Weekend crew · 3 on trail, 1 at camp',
    permission: 'group only · Sample locations',
    members: groupCrew
  });
});

app.get('/api/community/challenges', (req, res) => {
  res.json({
    success: true,
    period: 'November challenges',
    daysLeft: 12,
    challenges: [
      {
        id: 'climb-1000m',
        title: 'Climb 1,000m',
        progress: 650,
        target: 1000,
        unit: 'm climbed',
        percentage: 65,
        badgeName: 'Summit',
        rewardNote: 'Complete the climb to unlock the Summit solar badge.'
      },
      {
        id: 'harvest-solar-50wh',
        title: 'Harvest solar energy',
        progress: 32.5,
        target: 50.0,
        unit: 'Wh harvested',
        percentage: 65,
        badgeName: 'Sun Keeper',
        rewardNote: 'Earn the Sun Keeper badge. Energy is measured in Wh.'
      }
    ],
    trophies: [
      { id: 'first-light', name: 'First light', icon: 'sun', unlocked: true },
      { id: 'trail-friend', name: 'Trail friend', icon: 'trophy', unlocked: true },
      { id: 'summit', name: 'Summit', icon: 'mountain', unlocked: false }
    ]
  });
});

app.get('/api/community/csr', (req, res) => {
  res.json({
    success: true,
    campaignName: 'Gùi nắng lên bản',
    badge: 'SPONSOR MATCHING · SAMPLE',
    explanation: 'Every 10 verified trekking km unlocks a 50,000₫ sponsor contribution toward a SolarBag Lite for a mountain student.',
    verifiedKm: 20,
    matchedAmount: 100000,
    targetAmount: 350000,
    percentage: 28.5,
    calculationText: '20 verified km = 100,000₫ matched',
    disclaimer: 'Sponsor-funded, not an automatic donation from you. Illustrative campaign progress; no payment is taken.'
  });
});

// 4. Trail Guardian & Safety
app.get('/api/guardian/config', (req, res) => {
  res.json({
    success: true,
    contacts: emergencyContacts,
    fallDetection: fallDetectionConfig,
    locationPermission: 'Allowed',
    syncWatches: [
      { name: 'Apple Watch', connected: false, status: 'Not connected · Sync setup' },
      { name: 'Garmin', connected: false, status: 'Not connected · Sync setup' }
    ]
  });
});

app.post('/api/guardian/test-sms', (req, res) => {
  const { contactId, currentCoords } = req.body;
  const lat = currentCoords?.lat || 12.0945;
  const lng = currentCoords?.lng || 108.6472;
  const smsBody = `[SOLARBAG GUARDIAN] Thanh Thao gui tin nhan an toan: Toi dang o toa do ${lat}, ${lng}. Xem ban do thoi gian thuc: https://solarbag.app/live/${encodeURIComponent('thanh-thao-bidoup')}`;

  res.json({
    success: true,
    message: 'Test emergency SMS simulated successfully via Gateway',
    preview: smsBody,
    sentTo: emergencyContacts[0].phone
  });
});

app.post('/api/guardian/sos', (req, res) => {
  const { lat, lng, reason = 'PANIC BUTTON PRESSED' } = req.body;
  const alertEvent = {
    id: `sos-${Date.now()}`,
    timestamp: new Date().toISOString(),
    reason,
    coordinates: { lat, lng },
    sentTo: emergencyContacts.map(c => c.phone),
    status: 'ACTIVE_DISTRESS_BROADCAST'
  };
  res.json({
    success: true,
    message: 'DISTRESS BEACON BROADCASTED TO CONTACTS',
    alert: alertEvent
  });
});

// 5. AI Outdoor Lens
app.post('/api/ai-lens/identify', (req, res) => {
  const { query, speciesId } = req.body;
  const match = floraFaunaDb.find(f => f.id === speciesId) || floraFaunaDb[0];
  res.json({
    success: true,
    result: match
  });
});

app.listen(PORT, () => {
  console.log(`SolarBag Backend Server listening on http://localhost:${PORT}`);
});