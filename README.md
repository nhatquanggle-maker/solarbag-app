# 🎒 SolarBag Mobile Application (SolarBag OS)

> **"Hệ Điều Hành Dã Ngoại — Quản Lý Phần Cứng Thông Minh & Kết Nối Hành Trình Tác Động"**  
> Dự án ứng dụng di động hoàn chỉnh cho balo thông minh SolarBag, tích hợp bản đồ địa hình thật (Leaflet/Mapbox Topo), định vị GPS thời gian thực, quản lý phần cứng IoT (BLE, công suất sạc mặt trời, đèn dã ngoại, tìm balo theo chuẩn AirTag), hệ thống an toàn khẩn cấp Trail Guardian (còi SOS, cảm biến té ngã, tin nhắn tọa độ cứu hộ) và mạng xã hội Trekker / Thiện nguyện CSR.

---

## 📱 Kiến Trúc & Bố Cục 5 Tab (Chuẩn Figma 100%)

Ứng dụng được dựng đồng bộ 100% theo các khung màn hình iPhone 16 Pro từ Figma (File: `7MZVGFPkeFh2B1Usl35jgd`):

1. **Tab 1: Khám Phá (Trail Explorer & Offline Hub - Node `66:7872`)**
   - Tìm kiếm đỉnh núi, cung đường, rừng quốc gia; bộ lọc độ khó (`Difficulty`), cự ly, độ dốc, gần nguồn nước (`Water`).
   - Bản đồ địa hình thực tế (Bidoup Núi Bà 2,287m, Tà Năng, Lảo Thẩn, Tà Xùa) với cao độ, la bàn hướng Bắc, mốc đỉnh và tỷ lệ đo.
   - Thẻ cung đường chọn lọc: *Bidoup summit loop* (14.2 km, 4.8★, nhãn "Slippery"), *Tà Năng ridge walk* (22.4 km, 4.8★, nhãn "Landslide").
   - Modal xem chi tiết cung đường kèm biểu đồ trắc diện cao độ và danh sách điểm dừng (suối nước, bãi cắm trại, viewpoint).
   - Bộ quản lý bản đồ ngoại tuyến (*Ready without 4G*): Tải và lưu trữ bản đồ Tây Bắc, Bidoup, Tà Xùa để sử dụng khi mất sóng di động.

2. **Tab 2: Cộng Đồng & Thiện Nguyện (Stories & Impact Matching - Node `66:8036`)**
   - **Bảng tin (Feed)**: Chia sẻ nhật ký hành trình, ảnh check-in thực tế, bản đồ GPS log, cự ly km, độ cao elevation, thả tim và bình luận trực tiếp.
   - **Theo dõi nhóm (Group Trip Tracker)**: Bản đồ hiển thị vị trí thực của các thành viên trong đoàn (*Minh Linh*, *Thanh Thảo*, *An Nguyễn*, *Quang Huy*) để tránh lạc đoàn khi trekking.
   - **Thử thách tháng (Challenges & Solar Badges)**: *Climb 1,000m* (tiến độ 65%), *Harvest solar energy* (32.5/50Wh) và tủ huy hiệu danh dự (*First light*, *Trail friend*, *Summit*).
   - **Thiện nguyện CSR (Impact Matching - "Gùi nắng lên bản")**: Cứ mỗi 10km trekker hoàn thành, doanh nghiệp tài trợ 50.000₫ vào quỹ balo SolarBag Lite cho trẻ em khó khăn vùng cao.

3. **Tab 3: Hành Trình (Trail Tracker HUD - Node `66:8220`)**
   - Nút tròn nổi bật (FAB) trung tâm thanh điều hướng.
   - Ghi tracklog GPS thời gian thực: sử dụng HTML5 Geolocation API (`watchPosition`) bắt tọa độ thực tế, tính cự ly di chuyển, bấm giờ thời gian thực, tính độ cao tích lũy và calo/nhịp tim.
   - Biểu đồ cao độ động (Dynamic Elevation Profile) vẽ theo thời gian thực.
   - Ghim nhanh điểm dừng 1 chạm: 💧 Nguồn nước, ⛺ Bãi lều, 📸 Điểm ngắm cảnh (Viewpoint).
   - Thanh cảnh báo thời tiết & rủi ro địa hình: Khả năng mưa 75%, cảnh báo đoạn km số 5 trơn trượt.
   - Bộ công cụ dã ngoại (*Trail Toolkit*):
     - Lối tắt mở nhanh **AI Outdoor Lens**.
     - **Gear Weight Calculator** (phong cách LighterPack): Phân loại và tính toán tổng trọng lượng trang bị (Shelter 2.8kg, Clothing 2.4kg, Tools 1.2kg, tổng cân nặng cơ bản 6.4kg).

4. **Tab 4: Balo Tôi (My SolarBag Hardware & IoT Hub - Node `66:8380`)**
   - Quản lý thiết bị phần cứng thông minh kết nối Bluetooth Low Energy (BLE).
   - Đồng hồ đo pin hình cung (78% Charging) và đo đạc điện năng mặt trời theo thời gian thực (`+5.2W`), tổng điện Wh tích lũy trong ngày.
   - Gợi ý hướng nắng thông minh: *"Hãy đặt cặp hướng nắng trong 30 phút nữa"*.
   - Điều khiển đèn dã ngoại từ xa: Bật/tắt đèn BLE, thanh trượt chỉnh độ sáng (10% - 100%), chế độ chớp đèn cứu nạn `SOS flash`.
   - Tìm balo (Bag Locator - Apple AirTag style): Đo khoảng cách gần bằng sóng BLE (12m), nút `Sound chime` phát chuông định vị bằng âm thanh thực qua Web Audio API, nút `Find bag` chỉ hướng radar.
   - Hộ chiếu sản phẩm (*Product Passport*): Mã Serial `SN SBP-26-DEMO`, bảo hành điện tử NFC, đăng ký dịch vụ sửa chữa và chương trình thu hồi tái chế balo cũ.

5. **Tab 5: Hồ Sơ & An Toàn Sinh Mạng (Profile & Trail Guardian - Node `66:8521`)**
   - Hộ chiếu hành trình (*Trail Passport*): 12 cung đường, 86 km đã khám phá, đỉnh cao nhất 2,800m.
   - Tủ cúp huy hiệu năng lượng: *First light*, *Peak seeker*, *Light builder*, *Trail keeper*.
   - **Hệ thống An toàn khẩn cấp (Trail Guardian)**:
     - Cài đặt người bảo hộ: Lan (Chị gái) `+84 912 345 678`.
     - Nút `Send test contact message`: Gửi tin nhắn SMS / Zalo mẫu chứa tọa độ GPS và link theo dõi thời gian thực mà người nhận không cần cài app.
     - **Cảm biến phát hiện té ngã (Fall Detection)**: Nút thử nghiệm đếm ngược 60 giây (*Preview countdown & Cancel*) phát còi hú cảnh báo khẩn cấp âm lượng lớn, cho phép hủy nếu người dùng vẫn an toàn.
     - **Nút khẩn cấp PANIC SOS**: Nhấn giữ 3 giây với hiệu ứng vòng tròn quét vân tay, kích hoạt còi cấp cứu distress beacon và phát lệnh cứu hộ.
     - Kết nối đồng hồ thông minh Apple Watch và Garmin.

6. **Màn hình phụ: AI Outdoor Lens (Node `66:8669`)**
   - Khung ngắm camera nhận diện động thực vật trên đường đi (sử dụng camera thật hoặc mẫu thực địa rừng Bidoup).
   - Nhận diện loài *Amanita verna* (Nấm Tán Trắng), cảnh báo độc tính cao (*Potentially highly toxic ⚠️ - Tuyệt đối không chạm tay hoặc sử dụng*).
   - Bật/tắt đèn flash, nút chụp ảnh quét hình thái, nút lưu mẫu vào nhật ký hành trình.

7. **Viên thuốc phần cứng toàn cục (Global Hardware Floating Pill)**
   - Nằm ở mép trên của tất cả các màn hình:  
     `[ 🟢 SolarBag Pro: 78% | ☀️ +4.2W Đang sạc nắng | 🔦 Đèn: Tắt ]`
   - Bấm vào ở bất kỳ tab nào đều mở ngay ngăn kéo (Bottom Sheet) điều khiển nhanh pin, sạc và đèn mà không cần chuyển màn hình.

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### Yêu cầu hệ thống
- Node.js >= 18
- Trình duyệt web hiện đại (Chrome, Edge, Safari, Firefox)

### 1. Khởi động cả Frontend & Backend đồng thời:
```bash
npm run dev
```

- **Client Frontend**: `http://localhost:5173/` (hoặc truy cập qua mạng LAN điện thoại: `http://192.168.1.12:5173/`)
- **Server Backend API**: `http://localhost:5000/`

### 2. Hoặc khởi động riêng biệt:
```bash
# Backend server (Port 5000)
npm run dev:server

# Frontend client (Port 5173)
npm run dev:client
```

### 3. Build ứng dụng production:
```bash
npm run build
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Bản đồ & GPS**: Leaflet, CartoDB Dark Matter / Topo tiles, HTML5 Geolocation API (`navigator.geolocation.watchPosition`).
- **Âm thanh & Cảm biến**: Web Audio API (tổng hợp âm thanh chuông tìm balo Chime và còi hú báo động SOS / té ngã đa tần số chân thực không cần file ngoài).
- **Backend**: Node.js, Express, RESTful APIs, CORS.

