import React, { useState, useRef, useEffect } from 'react';
import { X, HelpCircle, Sparkles, AlertTriangle, BookmarkPlus, Zap, ZapOff, ScanLine, Image as ImageIcon, Check, RotateCcw, Camera, RefreshCw } from 'lucide-react';
import { FloraFaunaItem } from '../types';
import { playTickSound } from '../utils/audio';

interface AILensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToDiary: (item: FloraFaunaItem, photoUrl?: string) => void;
}

export const AILensModal: React.FC<AILensModalProps> = ({ isOpen, onClose, onSaveToDiary }) => {
  const [torchOn, setTorchOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const outdoorSpecies: FloraFaunaItem[] = [
    {
      id: 'amanita-verna',
      commonName: 'White amanita',
      scientificName: 'Amanita verna',
      localName: 'Nấm Tán Trắng (CỰC ĐỘC)',
      toxicity: 'Potentially highly toxic ⚠️',
      isToxic: true,
      safetyInstruction: 'Tuyệt đối không chạm tay hoặc tiêu thụ. Chứa độc tố Amatoxin cực mạnh gây tổn thương gan cấp tính. AI chỉ mang tính tham khảo.',
      status: 'POSSIBLE MATCH · NOT VERIFIED',
      confidence: '95%',
      habitat: 'Rừng thông, rừng hỗn giao á nhiệt đới Bidoup',
      recommendation: 'Tránh tiếp xúc. Nếu vô tình chạm phải, rửa tay ngay bằng nước sạch.'
    },
    {
      id: 'dendrobium-nobile',
      commonName: 'Noble Dendrobium Orchid',
      scientificName: 'Dendrobium nobile',
      localName: 'Lan Phi Điệp Rừng / Thạch Hộc',
      toxicity: 'Lành tính · Phong lan đặc hữu quý',
      isToxic: false,
      safetyInstruction: 'Hoa phong lan dại biểu tượng của rừng nguyên sinh. Vui lòng không bẻ cành ngắt hoa để bảo vệ thiên nhiên.',
      status: 'HIGH CONFIDENCE MATCH',
      confidence: '98%',
      habitat: 'Thân cây cổ thụ ẩm ướt vùng núi cao',
      recommendation: 'Chụp ảnh lưu trữ tọa độ vào sổ tay sinh thái.'
    },
    {
      id: 'ganoderma-lucidum',
      commonName: 'Red Reishi Mushroom',
      scientificName: 'Ganoderma lucidum',
      localName: 'Nấm Linh Chi Rừng Tự Nhiên',
      toxicity: 'Dược liệu tự nhiên quý giá 🍄',
      isToxic: false,
      safetyInstruction: 'Nấm linh chi gỗ lim tự nhiên. Vỏ bóng màu cánh gián hoặc nâu đỏ đặc trưng.',
      status: 'VERIFIED MATCH',
      confidence: '94%',
      habitat: 'Gốc cây gỗ mục trong rừng sâu ẩm',
      recommendation: 'Đánh dấu vị trí tọa độ GPS cho đội kiểm lâm nghiên cứu.'
    },
    {
      id: 'phyllium-bioculatum',
      commonName: 'Leaf Insect',
      scientificName: 'Phyllium bioculatum',
      localName: 'Bọ Lá Xanh Rừng Núi',
      toxicity: 'Vô hại · Ngụy trang kỳ thú 🐛',
      isToxic: false,
      safetyInstruction: 'Côn trùng ngụy trang hình chiếc lá rất nhạy cảm với chấn động. Vui lòng giữ khoảng cách tối thiểu 30cm.',
      status: 'VERIFIED MATCH',
      confidence: '96%',
      habitat: 'Tán lá rậm rạp Vườn Quốc Gia Bidoup',
      recommendation: 'Quan sát hành vi tự nhiên không chạm tay.'
    },
    {
      id: 'urtica-dioica',
      commonName: 'Stinging Nettle',
      scientificName: 'Urtica dioica',
      localName: 'Cây Tầm Ma Rừng / Cây Gai Ngứa',
      toxicity: 'Cảnh báo gai ngứa bỏng rát ⚠️',
      isToxic: true,
      safetyInstruction: 'Lông tơ trên lá chứa axit formic và histamine gây ngứa rát, phồng rộp da dữ dội nếu cọ quẹt trúng.',
      status: 'HIGH CONFIDENCE MATCH',
      confidence: '97%',
      habitat: 'Dọc ven đường mòn trekking ẩm ướt',
      recommendation: 'Tránh xa, đi theo lối mòn chính giữa để không quẹt trúng quần áo.'
    }
  ];

  // Khởi động Camera thật của điện thoại
  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraActive(false);
      setCameraError('Chưa cấp quyền Camera hoặc thiết bị không có webcam. Bạn có thể bấm nút Tải Ảnh để chọn ảnh từ thư viện.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Switch between Rear and Front camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle flashlight torch on supported mobile devices
  const toggleTorch = async () => {
    const nextTorch = !torchOn;
    setTorchOn(nextTorch);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        try {
          await track.applyConstraints({
            // @ts-ignore
            advanced: [{ torch: nextTorch }]
          });
        } catch {
          // ignore if torch not supported on hardware
        }
      }
    }
  };

  // Listen to open / close
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setSaved(false);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentItem = outdoorSpecies[currentIndex];

  // Nút Chụp ảnh thật & Kích hoạt AI phân tích
  const handleCaptureAndAnalyze = () => {
    if (scanning) return;
    setScanning(true);
    setSaved(false);
    playTickSound();

    // Chụp lại khung hình từ Video qua Canvas
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const snapshot = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(snapshot);
      }
    }

    // Mô phỏng AI Deep-learning quét và chẩn đoán mẫu vật
    setTimeout(() => {
      setScanning(false);
      playTickSound();
      setCurrentIndex((prev) => (prev + 1) % outdoorSpecies.length);
    }, 1500);
  };

  // Tải ảnh từ thư viện điện thoại
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        setScanning(true);
        setTimeout(() => {
          setScanning(false);
          setCurrentIndex((prev) => (prev + 1) % outdoorSpecies.length);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSaved(false);
    if (!cameraActive) {
      startCamera(facingMode);
    }
  };

  const handleSave = () => {
    onSaveToDiary(currentItem, capturedImage || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black animate-in fade-in select-none">
      <div className="relative w-full max-w-[420px] h-full max-h-[852px] bg-[#121613] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Offscreen Canvas for capturing snapshot */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 1. Camera Live Viewfinder / Captured Photo / Concept Background */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            /* Ảnh vừa chụp bằng điện thoại */
            <img
              src={capturedImage}
              alt="Captured Outdoor Photo"
              className="w-full h-full object-cover"
            />
          ) : cameraActive ? (
            /* Luồng Camera thật của điện thoại */
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            /* Ảnh concept rừng Bidoup mẫu */
            <img
              src="/assets/b52ba1f177c970ae590d50a017afbc0d4019f65b.png"
              alt="Camera Concept"
              className="w-full h-full object-cover brightness-75"
            />
          )}

          {/* Torch overlay simulation */}
          {torchOn && (
            <div className="absolute inset-0 bg-yellow-100/15 mix-blend-screen pointer-events-none"></div>
          )}

          {/* Camera Error Notice if any */}
          {cameraError && !capturedImage && (
            <div className="absolute top-20 inset-x-4 p-3 rounded-2xl bg-black/80 border border-[#F2B832]/60 text-xs text-white text-center backdrop-blur-sm z-20">
              <span className="text-[#F2B832] font-bold">Lưu ý Camera: </span>
              {cameraError}
            </div>
          )}
        </div>

        {/* 2. Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm shadow-md"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-black text-white tracking-wide flex items-center justify-center gap-1.5">
              <span>AI Outdoor Lens</span>
              {cameraActive && (
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
              )}
            </h2>
            <p className="text-[10px] tracking-wider font-bold text-[#A5B4A8] uppercase">
              {capturedImage ? 'ĐÃ CHỤP ẢNH THẬT' : cameraActive ? 'CAMERA ĐIỆN THOẠI ĐANG MỞ' : 'MẪU RỪNG BIDOUP'}
            </p>
          </div>

          <button
            onClick={toggleFacingMode}
            title="Đổi camera trước/sau"
            className="p-2 rounded-full bg-black/60 text-[#A5B4A8] hover:text-white backdrop-blur-sm shadow-md"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* 3. Viewfinder Target Framing Reticle */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pointer-events-none">
          <div className="relative w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden flex items-center justify-center">
            {/* Corner Bracket Accents */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-3 border-l-3 border-[#4ADE80] rounded-tl-xl shadow-sm"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border-t-3 border-r-3 border-[#4ADE80] rounded-tr-xl shadow-sm"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-3 border-l-3 border-[#4ADE80] rounded-bl-xl shadow-sm"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-3 border-r-3 border-[#4ADE80] rounded-br-xl shadow-sm"></div>

            {/* Scanning Laser Beam */}
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-[#4ADE80] shadow-[0_0_16px_#4ADE80] animate-bounce"></div>
            )}

            <div className="text-center px-4 py-2 bg-black/75 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <ScanLine size={13} className="text-[#4ADE80]" />
                {scanning
                  ? 'AI ĐANG PHÂN TÍCH ĐỘC TÍNH...'
                  : capturedImage
                  ? 'Đã chụp · Xem phân tích bên dưới'
                  : 'Đặt thực vật / nấm vào khung'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. AI Identification Result Container Card */}
        <div className="relative z-10 p-4 space-y-3 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="bg-[#1B221D]/95 border border-[#2E3B32] rounded-3xl p-4 backdrop-blur-md shadow-2xl space-y-2.5">
            {/* Certainty Eyebrow */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#F2B832] uppercase tracking-wider">
                <Sparkles size={13} />
                <span>{currentItem.status}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#4ADE80]">{currentItem.confidence} Match</span>
            </div>

            {/* Species Titles */}
            <div>
              <h3 className="text-lg font-black text-white">{currentItem.commonName}</h3>
              <p className="text-xs text-[#A5B4A8] italic">{currentItem.scientificName} · {currentItem.localName}</p>
            </div>

            {/* Toxicity Warning Pill */}
            {currentItem.isToxic ? (
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#E04838]/25 border border-[#E04838]/60 shadow-md">
                <AlertTriangle size={18} className="text-[#E04838] shrink-0" />
                <span className="text-xs font-black text-[#F87171]">{currentItem.toxicity}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#38764B]/25 border border-[#38764B]/60 shadow-md">
                <span className="text-xs font-black text-[#4ADE80]">🌿 {currentItem.toxicity}</span>
              </div>
            )}

            {/* Safety Warning */}
            <p className="text-[11px] text-[#A5B4A8] leading-relaxed">
              {currentItem.safetyInstruction}
            </p>

            {/* Action Buttons: Save to Diary & Retake */}
            <div className="flex items-center gap-2 pt-1">
              {capturedImage && (
                <button
                  onClick={handleRetake}
                  className="py-2.5 px-3 bg-[#252F28] hover:bg-[#2E3B32] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 border border-[#2E3B32]"
                >
                  <RefreshCw size={13} />
                  <span>Chụp lại</span>
                </button>
              )}

              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  saved
                    ? 'bg-[#4ADE80] text-black shadow-lg shadow-[#4ADE80]/30'
                    : 'bg-[#38764B] hover:bg-[#438a58] text-white shadow-xl shadow-[#38764B]/30'
                }`}
              >
                {saved ? (
                  <>
                    <Check size={15} />
                    <span>ĐÃ LƯU ẢNH VÀO NHẬT KÝ HÀNH TRÌNH!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={15} />
                    <span>Lưu vào Nhật ký hành trình</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 5. Bottom Real Camera Controls Bar */}
          <div className="flex items-center justify-around pb-3 pt-1">
            {/* Torch toggle */}
            <button
              onClick={toggleTorch}
              className="flex flex-col items-center gap-1 text-white hover:opacity-80 active:scale-95 transition-all"
            >
              <div className={`p-3 rounded-full shadow-lg ${torchOn ? 'bg-[#F2B832] text-black' : 'bg-white/20'}`}>
                {torchOn ? <Zap size={18} /> : <ZapOff size={18} />}
              </div>
              <span className="text-[10px] text-[#A5B4A8]">{torchOn ? 'Đèn Bật' : 'Đèn Flash'}</span>
            </button>

            {/* Real Camera Shutter Button */}
            <button
              onClick={handleCaptureAndAnalyze}
              disabled={scanning}
              title="Bấm để chụp bằng Camera điện thoại"
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-all shadow-2xl bg-white/20 hover:border-[#4ADE80]"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-black">
                {scanning ? (
                  <ScanLine size={24} className="animate-spin text-[#38764B]" />
                ) : (
                  <Camera size={26} className="text-[#121613]" />
                )}
              </div>
            </button>

            {/* Open Phone Gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-white hover:opacity-80 active:scale-95 transition-all"
            >
              <div className="p-3 rounded-full bg-white/20 shadow-lg">
                <ImageIcon size={18} />
              </div>
              <span className="text-[10px] text-[#A5B4A8]">Tải ảnh lên</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
