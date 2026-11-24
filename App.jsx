import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, LogIn, ConciergeBell,
  Sparkles, Wrench, UserCog, Wallet, BarChart3, History, Settings,
  Search, Bell, Plus, X, Printer, RefreshCw, ShieldCheck, Building2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const ROOM_TYPES = {
  Standard: { code: 'STD', price: 800000, capacity: 2, color: '#64748b' },
  Superior: { code: 'SUP', price: 1100000, capacity: 2, color: '#3b82f6' },
  Deluxe: { code: 'DLX', price: 1500000, capacity: 3, color: '#8b5cf6' },
  Executive: { code: 'EXE', price: 2200000, capacity: 3, color: '#f59e0b' },
  Family: { code: 'FAM', price: 2500000, capacity: 4, color: '#10b981' },
  Suite: { code: 'SUI', price: 4000000, capacity: 4, color: '#ec4899' },
};

const ROLES = [
  'Admin',
  'General Manager',
  'Manager',
  'Receptionist',
  'Housekeeping',
  'Maintenance',
  'Accountant'
];

const SOURCES = ['Walk-in', 'Website', 'Điện thoại', 'Traveloka', 'Agoda', 'Booking.com', 'Đối tác'];

const INITIAL_SERVICES = [
  { id: 'DV-01', name: 'Ăn sáng Buffet', category: 'Nhà hàng', price: 250000, unit: 'Suất', active: true },
  { id: 'DV-02', name: 'Giặt là nhanh', category: 'Giặt là', price: 120000, unit: 'Kg', active: true },
  { id: 'DV-03', name: 'Nước khoáng & Minibar', category: 'Minibar', price: 80000, unit: 'Combo', active: true },
  { id: 'DV-04', name: 'Massage thư giãn 60p', category: 'Spa', price: 550000, unit: 'Lần', active: true },
  { id: 'DV-05', name: 'Đưa đón sân bay 4 chỗ', category: 'Đưa đón sân bay', price: 450000, unit: 'Chuyến', active: true },
  { id: 'DV-06', name: 'Thuê xe máy theo ngày', category: 'Thuê xe', price: 200000, unit: 'Ngày', active: true },
];

const INITIAL_EMPLOYEES = [
  { id: 'NV-01', username: 'admin', fullName: 'Nguyễn Minh Quân', role: 'Admin', phone: '0901234567', email: 'admin@hotelpms216.vn', active: true },
  { id: 'NV-02', username: 'gm_lan', fullName: 'Trần Thị Lan', role: 'General Manager', phone: '0902345678', email: 'gm@hotelpms216.vn', active: true },
  { id: 'NV-03', username: 'lt_huy', fullName: 'Lê Quang Huy', role: 'Receptionist', phone: '0903456789', email: 'frontdesk@hotelpms216.vn', active: true },
  { id: 'NV-04', username: 'hk_mai', fullName: 'Phạm Thị Mai', role: 'Housekeeping', phone: '0904567890', email: 'hk@hotelpms216.vn', active: true },
  { id: 'NV-05', username: 'kt_nam', fullName: 'Hoàng Văn Nam', role: 'Maintenance', phone: '0905678901', email: 'tech@hotelpms216.vn', active: true },
  { id: 'NV-06', username: 'acc_thao', fullName: 'Vũ Thu Thảo', role: 'Accountant', phone: '0906789012', email: 'finance@hotelpms216.vn', active: true },
];

function generateInitial216Rooms() {
  const allocation = [
    { floor: 1, counts: { Standard: 24, Superior: 18, Deluxe: 12 } },
    { floor: 2, counts: { Standard: 18, Superior: 18, Deluxe: 12, Family: 6 } },
    { floor: 3, counts: { Superior: 12, Deluxe: 18, Executive: 14, Family: 10 } },
    { floor: 4, counts: { Deluxe: 12, Executive: 18, Family: 12, Suite: 12 } },
  ];
  const rooms = [];
  allocation.forEach(({ floor, counts }) => {
    let seq = 1;
    Object.entries(counts).forEach(([type, qty]) => {
      for (let i = 0; i < qty; i++) {
        const num = `${floor}${String(seq).padStart(2, '0')}`;
        let status = 'Available';
        let hkStatus = 'Inspected';
        if (['101', '102', '205', '310', '401', '450'].includes(num)) {
          status = 'Occupied';
          hkStatus = 'Clean';
        } else if (['105', '210', '315', '405'].includes(num)) {
          status = 'Reserved';
          hkStatus = 'Inspected';
        } else if (['112', '220', '330'].includes(num)) {
          status = 'Available';
          hkStatus = 'Dirty';
        } else if (['154', '354'].includes(num)) {
          status = 'Maintenance';
          hkStatus = 'Dirty';
        }
        rooms.push({
          id: num,
          roomNumber: num,
          floor,
          type,
          price: ROOM_TYPES[type].price,
          capacity: ROOM_TYPES[type].capacity,
          status,
          hkStatus,
          amenities: ['Wifi tốc độ cao', 'TV 55 inch', 'Điều hòa', 'Minibar', type === 'Suite' ? 'Bồn tắm Jacuzzi' : 'Vòi sen đứng'],
          notes: status === 'Maintenance' ? 'Đang kiểm tra điều hòa' : '',
        });
        seq++;
      }
    });
  });
  return rooms;
}

const todayStr = new Date().toISOString().split('T')[0];
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_GUESTS = [
  { id: 'KH-001', fullName: 'Nguyễn Văn An', gender: 'Nam', phone: '0912345678', email: 'an.nguyen@gmail.com', idNumber: '001090123456', nationality: 'Việt Nam', vip: true, totalBookings: 4, totalSpent: 18500000, notes: 'Thích phòng tầng cao' },
  { id: 'KH-002', fullName: 'Trần Thị Bích', gender: 'Nữ', phone: '0987654321', email: 'bich.tran@gmail.com', idNumber: '001092654321', nationality: 'Việt Nam', vip: false, totalBookings: 2, totalSpent: 6200000, notes: '' },
  { id: 'KH-003', fullName: 'John Smith', gender: 'Nam', phone: '+84909998887', email: 'john.smith@example.com', idNumber: 'P98231122', nationality: 'Mỹ', vip: true, totalBookings: 3, totalSpent: 24000000, notes: 'Yêu cầu đưa đón sân bay' },
];

const INITIAL_BOOKINGS = [
  { id: 'BK-2026-0001', guestId: 'KH-001', guestName: 'Nguyễn Văn An', phone: '0912345678', roomNumber: '450', roomType: 'Suite', checkIn: addDays(-1), checkOut: addDays(2), adults: 2, children: 0, pricePerNight: 4000000, deposit: 4000000, source: 'Website', status: 'Checked-in', services: [{ name: 'Ăn sáng Buffet', qty: 2, total: 500000 }] },
  { id: 'BK-2026-0002', guestId: 'KH-002', guestName: 'Trần Thị Bích', phone: '0987654321', roomNumber: '101', roomType: 'Standard', checkIn: todayStr, checkOut: addDays(2), adults: 2, children: 0, pricePerNight: 800000, deposit: 500000, source: 'Booking.com', status: 'Checked-in', services: [] },
  { id: 'BK-2026-0003', guestId: 'KH-003', guestName: 'John Smith', phone: '+84909998887', roomNumber: '405', roomType: 'Deluxe', checkIn: todayStr, checkOut: addDays(3), adults: 2, children: 1, pricePerNight: 1500000, deposit: 1500000, source: 'Agoda', status: 'Confirmed', services: [] },
  { id: 'BK-2026-0004', guestId: 'KH-001', guestName: 'Nguyễn Văn An', phone: '0912345678', roomNumber: '105', roomType: 'Standard', checkIn: addDays(1), checkOut: addDays(3), adults: 1, children: 0, pricePerNight: 800000, deposit: 0, source: 'Walk-in', status: 'Confirmed', services: [] },
];

const INITIAL_PAYMENTS = [
  { id: 'TXN-001', bookingId: 'BK-2026-0001', amount: 4000000, type: 'Đặt cọc', method: 'Chuyển khoản', date: addDays(-1), note: 'Cọc phòng 450' },
  { id: 'TXN-002', bookingId: 'BK-2026-0002', amount: 500000, type: 'Đặt cọc', method: 'Tiền mặt', date: todayStr, note: 'Cọc phòng 101' },
  { id: 'TXN-003', bookingId: 'BK-2026-0003', amount: 1500000, type: 'Đặt cọc', method: 'Thẻ ngân hàng', date: todayStr, note: 'Cọc phòng 405' },
];

const INITIAL_MAINTENANCE = [
  { id: 'MNT-001', roomNumber: '154', title: 'Điều hòa không mát', priority: 'Cao', status: 'Đang xử lý', cost: 450000, reportedAt: todayStr },
  { id: 'MNT-002', roomNumber: '354', title: 'Rò rỉ vòi nước bồn rửa', priority: 'Trung bình', status: 'Mở', cost: 200000, reportedAt: todayStr },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Admin');
  const [globalSearch, setGlobalSearch] = useState('');

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('pms216_rooms');
    return saved ? JSON.parse(saved) : generateInitial216Rooms();
  });
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('pms216_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });
  const [guests] = useState(INITIAL_GUESTS);
  const [services] = useState(INITIAL_SERVICES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);
  const [employees] = useState(INITIAL_EMPLOYEES);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'Admin', time: new Date().toLocaleString('vi-VN'), action: 'INIT_SYSTEM', target: '216 Phòng', detail: 'Khởi tạo hệ thống HOTEL PMS 216' }
  ]);
  const [notifications] = useState([
    { id: 1, title: 'Khách sắp Check-in', message: 'Booking BK-2026-0003 (Phòng 405) dự kiến nhận phòng hôm nay.', read: false },
    { id: 2, title: 'Phòng cần bảo trì', message: 'Phòng 154 và 354 đang có yêu cầu kỹ thuật.', read: false },
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const [floorFilter, setFloorFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guestName: '', phone: '', roomNumber: '103', checkIn: todayStr, checkOut: addDays(2),
    adults: 2, children: 0, deposit: 0, source: 'Walk-in'
  });

  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutSurcharge, setCheckoutSurcharge] = useState(0);
  const [checkoutMethod, setCheckoutMethod] = useState('Chuyển khoản');

  const [serviceOrderRoom, setServiceOrderRoom] = useState('');
  const [serviceOrderId, setServiceOrderId] = useState('DV-01');
  const [serviceOrderQty, setServiceOrderQty] = useState(1);

  useEffect(() => {
    localStorage.setItem('pms216_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('pms216_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addAuditLog = (action, target, detail) => {
    setAuditLogs(prev => [{
      id: Date.now(),
      user: currentRole,
      time: new Date().toLocaleString('vi-VN'),
      action,
      target,
      detail
    }, ...prev]);
  };

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const available = rooms.filter(r => r.status === 'Available' && r.hkStatus !== 'Dirty').length;
    const reserved = rooms.filter(r => r.status === 'Reserved').length;
    const maintenanceCount = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Out of Order').length;
    const dirtyCount = rooms.filter(r => r.hkStatus === 'Dirty' || r.hkStatus === 'Cleaning').length;
    const occupancyRate = ((occupied / total) * 100).toFixed(1);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const todayRevenue = payments.filter(p => p.date === todayStr).reduce((sum, p) => sum + p.amount, 0);
    const activeGuests = bookings.filter(b => b.status === 'Checked-in').reduce((s, b) => s + b.adults + b.children, 0);
    return { total, occupied, available, reserved, maintenanceCount, dirtyCount, occupancyRate, totalRevenue, todayRevenue, activeGuests };
  }, [rooms, payments, bookings]);

  const roomTypeChartData = useMemo(() => {
    return Object.keys(ROOM_TYPES).map(type => ({
      name: type,
      value: rooms.filter(r => r.type === type).length,
      color: ROOM_TYPES[type].color
    }));
  }, [rooms]);

  const revenue7DaysData = [
    { day: 'T2', revenue: 18500000 },
    { day: 'T3', revenue: 22400000 },
    { day: 'T4', revenue: 19800000 },
    { day: 'T5', revenue: 26500000 },
    { day: 'T6', revenue: 34200000 },
    { day: 'T7', revenue: 41000000 },
    { day: 'CN', revenue: Math.max(stats.todayRevenue, 15000000) },
  ];

  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (newBooking.checkOut <= newBooking.checkIn) {
      alert('Lỗi nghiệp vụ: Ngày trả phòng phải sau ngày nhận phòng!');
      return;
    }
    const overlap = bookings.find(b =>
      b.roomNumber === newBooking.roomNumber &&
      !['Cancelled', 'Checked-out'].includes(b.status) &&
      !(newBooking.checkOut <= b.checkIn || newBooking.checkIn >= b.checkOut)
    );
    if (overlap) {
      alert(`Phòng ${newBooking.roomNumber} đã có booking (${overlap.id}) trùng thời gian này!`);
      return;
    }
    const room = rooms.find(r => r.roomNumber === newBooking.roomNumber);
    if (!room || room.status === 'Maintenance' || room.status === 'Out of Order') {
      alert('Phòng đang bảo trì hoặc ngừng kinh doanh!');
      return;
    }

    const bkId = `BK-2026-${String(bookings.length + 1).padStart(4, '0')}`;
    const created = {
      id: bkId,
      guestId: `KH-${Date.now()}`,
      guestName: newBooking.guestName,
      phone: newBooking.phone,
      roomNumber: newBooking.roomNumber,
      roomType: room.type,
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      adults: Number(newBooking.adults),
      children: Number(newBooking.children),
      pricePerNight: room.price,
      deposit: Number(newBooking.deposit),
      source: newBooking.source,
      status: 'Confirmed',
      services: []
    };

    setBookings(prev => [created, ...prev]);
    setRooms(prev => prev.map(r => r.roomNumber === room.roomNumber ? { ...r, status: 'Reserved' } : r));

    if (created.deposit > 0) {
      setPayments(prev => [{
        id: `TXN-${Date.now().toString().slice(-4)}`,
        bookingId: bkId,
        amount: created.deposit,
        type: 'Đặt cọc',
        method: 'Chuyển khoản',
        date: todayStr,
        note: `Tiền cọc booking ${bkId}`
      }, ...prev]);
    }

    addAuditLog('CREATE_BOOKING', bkId, `Đặt phòng ${room.roomNumber} cho ${created.guestName}`);
    setShowBookingModal(false);
    setNewBooking({ guestName: '', phone: '', roomNumber: '103', checkIn: todayStr, checkOut: addDays(2), adults: 2, children: 0, deposit: 0, source: 'Walk-in' });
  };

  const handleCheckIn = (booking) => {
    const room = rooms.find(r => r.roomNumber === booking.roomNumber);
    if (booking.status === 'Cancelled') return alert('Không thể Check-in booking đã hủy!');
    if (room.status === 'Maintenance' || room.hkStatus === 'Dirty' || room.hkStatus === 'Cleaning') {
      return alert(`Phòng ${room.roomNumber} chưa sẵn sàng (${room.status} / ${room.hkStatus})! Vui lòng hoàn tất vệ sinh hoặc bảo trì trước.`);
    }
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Checked-in' } : b));
    setRooms(prev => prev.map(r => r.roomNumber === booking.roomNumber ? { ...r, status: 'Occupied' } : r));
    addAuditLog('CHECK_IN', booking.id, `Nhận phòng ${booking.roomNumber} - Khách ${booking.guestName}`);
  };

  const calculateNights = (inDate, outDate) => {
    const diff = (new Date(outDate) - new Date(inDate)) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff));
  };

  const handleConfirmCheckOut = () => {
    if (!checkoutBooking) return;
    const nights = calculateNights(checkoutBooking.checkIn, checkoutBooking.checkOut);
    const roomTotal = nights * checkoutBooking.pricePerNight;
    const serviceTotal = (checkoutBooking.services || []).reduce((s, sv) => s + sv.total, 0);
    const grandTotal = roomTotal + serviceTotal + Number(checkoutSurcharge);
    const balanceDue = Math.max(0, grandTotal - checkoutBooking.deposit);

    if (balanceDue > 0) {
      setPayments(prev => [{
        id: `TXN-${Date.now().toString().slice(-4)}`,
        bookingId: checkoutBooking.id,
        amount: balanceDue,
        type: 'Thanh toán Check-out',
        method: checkoutMethod,
        date: todayStr,
        note: `Quyết toán phòng ${checkoutBooking.roomNumber} (đã trừ cọc ${formatVND(checkoutBooking.deposit)})`
      }, ...prev]);
    }

    setBookings(prev => prev.map(b => b.id === checkoutBooking.id ? { ...b, status: 'Checked-out' } : b));
    setRooms(prev => prev.map(r => r.roomNumber === checkoutBooking.roomNumber ? { ...r, status: 'Available', hkStatus: 'Dirty' } : r));
    addAuditLog('CHECK_OUT', checkoutBooking.id, `Trả phòng ${checkoutBooking.roomNumber}, thu thêm ${formatVND(balanceDue)}. Phòng chuyển sang Dirty.`);
    setCheckoutBooking(null);
    setCheckoutSurcharge(0);
  };

  const handleAddServiceOrder = (e) => {
    e.preventDefault();
    const activeBk = bookings.find(b => b.roomNumber === serviceOrderRoom && b.status === 'Checked-in');
    if (!activeBk) return alert('Không tìm thấy khách đang lưu trú (Checked-in) tại phòng này!');
    const sv = services.find(s => s.id === serviceOrderId);
    const total = sv.price * Number(serviceOrderQty);
    setBookings(prev => prev.map(b => b.id === activeBk.id ? {
      ...b,
      services: [...(b.services || []), { name: sv.name, qty: Number(serviceOrderQty), total }]
    } : b));
    addAuditLog('ADD_SERVICE', activeBk.id, `Thêm ${serviceOrderQty} ${sv.name} cho phòng ${serviceOrderRoom}`);
    alert(`Đã ghi nhận dịch vụ ${sv.name} vào hóa đơn phòng ${serviceOrderRoom}`);
  };

  const updateRoom = (roomNumber, patch, logMsg) => {
    setRooms(prev => prev.map(r => r.roomNumber === roomNumber ? { ...r, ...patch } : r));
    if (selectedRoom && selectedRoom.roomNumber === roomNumber) {
      setSelectedRoom(prev => ({ ...prev, ...patch }));
    }
    addAuditLog('UPDATE_ROOM', `Phòng ${roomNumber}`, logMsg);
  };

  const getRoomCardColor = (room) => {
    if (room.status === 'Maintenance' || room.status === 'Out of Order') return 'bg-slate-200 border-slate-400 text-slate-700';
    if (room.status === 'Occupied') return 'bg-rose-50 border-rose-400 text-rose-800';
    if (room.status === 'Reserved') return 'bg-amber-50 border-amber-400 text-amber-800';
    if (room.hkStatus === 'Dirty' || room.hkStatus === 'Cleaning') return 'bg-sky-50 border-sky-400 text-sky-800';
    return 'bg-emerald-50 border-emerald-400 text-emerald-800';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'rooms', label: 'Sơ đồ 216 phòng', icon: BedDouble },
    { id: 'bookings', label: 'Đặt phòng', icon: CalendarCheck },
    { id: 'checkin', label: 'Check-in / Out', icon: LogIn },
    { id: 'guests', label: 'Khách hàng', icon: Users },
    { id: 'services', label: 'Dịch vụ', icon: ConciergeBell },
    { id: 'housekeeping', label: 'Buồng phòng', icon: Sparkles },
    { id: 'maintenance', label: 'Bảo trì', icon: Wrench },
    { id: 'finance', label: 'Tài chính', icon: Wallet },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
    { id: 'employees', label: 'Nhân viên & RBAC', icon: UserCog },
    { id: 'audit', label: 'Nhật ký hoạt động', icon: History },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const filteredRooms = rooms.filter(r => {
    if (floorFilter !== 'ALL' && r.floor !== Number(floorFilter)) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Cleaning') return r.hkStatus === 'Dirty' || r.hkStatus === 'Cleaning';
      if (r.status !== statusFilter) return false;
    }
    if (globalSearch && !r.roomNumber.includes(globalSearch)) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col shrink-0 no-print">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base tracking-tight">HOTEL PMS 216</h1>
            <p className="text-xs text-slate-400">4 Tầng • 216 Phòng</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          Múi giờ: GMT+7 (VNĐ)
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3 w-96">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã phòng (VD: 101, 450)..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Vai trò:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="text-xs font-semibold bg-transparent outline-none text-slate-800"
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)} className="p-2 rounded-lg hover:bg-slate-100 relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.some(n => !n.read) && <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-1.5 right-1.5" />}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <h4 className="font-semibold text-sm mb-2">Thông báo hệ thống</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Tổng quan vận hành</h2>
                  <p className="text-sm text-slate-500">Dữ liệu tính toán trực tiếp từ 216 phòng và giao dịch thực tế</p>
                </div>
                <button onClick={() => setShowBookingModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tạo Booking mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase">Tổng phòng / Đang ở</p>
                  <p className="text-2xl font-bold mt-1">{stats.total} <span className="text-sm font-normal text-rose-600">/ {stats.occupied} đang dùng</span></p>
                  <p className="text-xs text-emerald-600 mt-2">Còn trống sẵn sàng: {stats.available} phòng</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase">Tỷ lệ lấp đầy (Occupancy)</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">{stats.occupancyRate}%</p>
                  <p className="text-xs text-slate-500 mt-2">Đã đặt trước: {stats.reserved} • Bảo trì: {stats.maintenanceCount}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase">Doanh thu ghi nhận</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600">{formatVND(stats.totalRevenue)}</p>
                  <p className="text-xs text-slate-500 mt-2">Hôm nay: {formatVND(stats.todayRevenue)}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase">Khách đang lưu trú</p>
                  <p className="text-2xl font-bold mt-1">{stats.activeGuests} khách</p>
                  <p className="text-xs text-sky-600 mt-2">Phòng chờ vệ sinh: {stats.dirtyCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4">Doanh thu 7 ngày gần nhất (VNĐ)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenue7DaysData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={(v) => `${v / 1000000}M`} />
                        <Tooltip formatter={(v) => formatVND(v)} />
                        <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu 216 phòng theo hạng</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roomTypeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                          {roomTypeChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center gap-3">
                  <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm">
                    <option value="ALL">Tất cả 4 tầng (216 phòng)</option>
                    <option value="1">Tầng 1 (101 - 154)</option>
                    <option value="2">Tầng 2 (201 - 254)</option>
                    <option value="3">Tầng 3 (301 - 354)</option>
                    <option value="4">Tầng 4 (401 - 454)</option>
                  </select>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm">
                    <option value="ALL">Tất cả loại phòng</option>
                    {Object.keys(ROOM_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm">
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="Available">Trống (Available)</option>
                    <option value="Occupied">Đang có khách (Occupied)</option>
                    <option value="Reserved">Đã đặt trước (Reserved)</option>
                    <option value="Cleaning">Cần/Đang vệ sinh</option>
                    <option value="Maintenance">Bảo trì (Maintenance)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" /> Trống</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-400" /> Có khách</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400" /> Đã đặt</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-400" /> Vệ sinh</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400" /> Bảo trì</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2.5">
                {filteredRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-2.5 rounded-lg border-2 text-left transition hover:shadow-md ${getRoomCardColor(room)}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{room.roomNumber}</span>
                      <span className="text-[10px] font-semibold opacity-75">{ROOM_TYPES[room.type].code}</span>
                    </div>
                    <p className="text-[10px] truncate mt-1">{room.status === 'Available' && room.hkStatus !== 'Inspected' ? room.hkStatus : room.status}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Quản lý đặt phòng ({bookings.length})</h2>
                <button onClick={() => setShowBookingModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Tạo Booking
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3">Mã BK</th>
                      <th className="p-3">Khách hàng</th>
                      <th className="p-3">Phòng</th>
                      <th className="p-3">Nhận / Trả</th>
                      <th className="p-3">Nguồn</th>
                      <th className="p-3">Tiền cọc</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-blue-600">{b.id}</td>
                        <td className="p-3">
                          <div className="font-medium">{b.guestName}</div>
                          <div className="text-xs text-slate-500">{b.phone}</div>
                        </td>
                        <td className="p-3 font-bold">{b.roomNumber} <span className="text-xs font-normal text-slate-500">({b.roomType})</span></td>
                        <td className="p-3 text-xs">{b.checkIn} → {b.checkOut}</td>
                        <td className="p-3">{b.source}</td>
                        <td className="p-3">{formatVND(b.deposit)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            b.status === 'Checked-in' ? 'bg-rose-100 text-rose-700' :
                            b.status === 'Confirmed' ? 'bg-amber-100 text-amber-700' :
                            b.status === 'Checked-out' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>{b.status}</span>
                        </td>
                        <td className="p-3 space-x-2">
                          {b.status === 'Confirmed' && (
                            <button onClick={() => handleCheckIn(b)} className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded">Check-in</button>
                          )}
                          {b.status === 'Checked-in' && (
                            <button onClick={() => setCheckoutBooking(b)} className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded">Check-out</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'checkin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-amber-700">Chờ nhận phòng (Confirmed)</h3>
                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'Confirmed').map(b => (
                    <div key={b.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.guestName} — Phòng {b.roomNumber}</p>
                        <p className="text-xs text-slate-500">{b.id} • {b.checkIn} → {b.checkOut} • Cọc: {formatVND(b.deposit)}</p>
                      </div>
                      <button onClick={() => handleCheckIn(b)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Xác nhận Check-in</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-rose-700">Đang lưu trú (Sẵn sàng Check-out)</h3>
                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'Checked-in').map(b => (
                    <div key={b.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{b.guestName} — Phòng {b.roomNumber}</p>
                        <p className="text-xs text-slate-500">{b.id} • {b.checkIn} → {b.checkOut} • Dịch vụ: {(b.services || []).length} mục</p>
                      </div>
                      <button onClick={() => setCheckoutBooking(b)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Trả phòng & Hóa đơn</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Hồ sơ khách hàng</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3">Mã KH</th><th className="p-3">Họ tên</th><th className="p-3">SĐT / Email</th><th className="p-3">CCCD/Passport</th><th className="p-3">Phân loại</th><th className="p-3">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guests.map(g => (
                    <tr key={g.id}>
                      <td className="p-3 font-medium">{g.id}</td>
                      <td className="p-3 font-semibold">{g.fullName}</td>
                      <td className="p-3 text-xs">{g.phone}<br />{g.email}</td>
                      <td className="p-3">{g.idNumber}</td>
                      <td className="p-3">{g.vip ? <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">VIP</span> : 'Thường'}</td>
                      <td className="p-3 font-semibold text-emerald-700">{formatVND(g.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-xl font-bold mb-4">Danh mục dịch vụ khách sạn</h2>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr><th className="p-3">Mã</th><th className="p-3">Tên dịch vụ</th><th className="p-3">Nhóm</th><th className="p-3">Đơn giá</th><th className="p-3">ĐVT</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {services.map(s => (
                      <tr key={s.id}><td className="p-3">{s.id}</td><td className="p-3 font-medium">{s.name}</td><td className="p-3">{s.category}</td><td className="p-3 font-semibold">{formatVND(s.price)}</td><td className="p-3">{s.unit}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-bold text-lg mb-4">Ghi nhận dịch vụ vào phòng</h3>
                <form onSubmit={handleAddServiceOrder} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Số phòng đang có khách</label>
                    <input required value={serviceOrderRoom} onChange={e => setServiceOrderRoom(e.target.value)} placeholder="VD: 450, 101" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Chọn dịch vụ</label>
                    <select value={serviceOrderId} onChange={e => setServiceOrderId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatVND(s.price)})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Số lượng</label>
                    <input type="number" min="1" value={serviceOrderQty} onChange={e => setServiceOrderQty(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium">Cộng vào hóa đơn phòng</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'housekeeping' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Quản lý Buồng phòng (Housekeeping)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rooms.filter(r => r.hkStatus !== 'Inspected').map(r => (
                  <div key={r.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50">
                    <div>
                      <p className="font-bold text-lg">Phòng {r.roomNumber} <span className="text-xs font-normal text-slate-500">({r.type})</span></p>
                      <p className="text-xs text-sky-700 font-medium">Vệ sinh: {r.hkStatus} • Phòng: {r.status}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {r.hkStatus === 'Dirty' && (
                        <button onClick={() => updateRoom(r.roomNumber, { hkStatus: 'Cleaning' }, 'Bắt đầu dọn phòng')} className="text-xs bg-sky-600 text-white px-2.5 py-1 rounded">Bắt đầu dọn</button>
                      )}
                      {r.hkStatus !== 'Inspected' && (
                        <button onClick={() => updateRoom(r.roomNumber, { hkStatus: 'Inspected' }, 'Xác nhận sạch & sẵn sàng')} className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded">Xác nhận Sẵn sàng</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Quản lý Bảo trì kỹ thuật</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-3">Mã</th><th className="p-3">Phòng</th><th className="p-3">Sự cố</th><th className="p-3">Ưu tiên</th><th className="p-3">Chi phí dự kiến</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y">
                  {maintenance.map(m => (
                    <tr key={m.id}>
                      <td className="p-3 font-medium">{m.id}</td>
                      <td className="p-3 font-bold">{m.roomNumber}</td>
                      <td className="p-3">{m.title}</td>
                      <td className="p-3">{m.priority}</td>
                      <td className="p-3">{formatVND(m.cost)}</td>
                      <td className="p-3">{m.status}</td>
                      <td className="p-3">
                        {m.status !== 'Hoàn thành' && (
                          <button onClick={() => {
                            setMaintenance(prev => prev.map(x => x.id === m.id ? { ...x, status: 'Hoàn thành' } : x));
                            updateRoom(m.roomNumber, { status: 'Available', hkStatus: 'Dirty' }, 'Hoàn tất bảo trì, chuyển sang chờ vệ sinh');
                          }} className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded">Hoàn tất</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Quản lý Tài chính & Giao dịch thanh toán</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-3">Mã GD</th><th className="p-3">Mã Booking</th><th className="p-3">Loại</th><th className="p-3">Phương thức</th><th className="p-3">Số tiền</th><th className="p-3">Ngày</th><th className="p-3">Ghi chú</th></tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="p-3 font-mono text-xs">{p.id}</td>
                      <td className="p-3 font-semibold">{p.bookingId}</td>
                      <td className="p-3">{p.type}</td>
                      <td className="p-3">{p.method}</td>
                      <td className="p-3 font-bold text-emerald-700">{formatVND(p.amount)}</td>
                      <td className="p-3">{p.date}</td>
                      <td className="p-3 text-xs text-slate-500">{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Báo cáo & Thống kê tổng hợp</h2>
                <button onClick={() => window.print()} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 no-print">
                  <Printer className="w-4 h-4" /> In / Xuất PDF
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-lg border">Tổng công suất: <strong>{stats.occupancyRate}%</strong></div>
                <div className="p-4 bg-slate-50 rounded-lg border">Tổng doanh thu: <strong>{formatVND(stats.totalRevenue)}</strong></div>
                <div className="p-4 bg-slate-50 rounded-lg border">Tổng số booking: <strong>{bookings.length}</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Quản lý Nhân sự & Phân quyền (RBAC)</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr><th className="p-3">Mã NV</th><th className="p-3">Tài khoản</th><th className="p-3">Họ tên</th><th className="p-3">Vai trò</th><th className="p-3">Liên hệ</th><th className="p-3">Trạng thái</th></tr>
                </thead>
                <tbody className="divide-y">
                  {employees.map(e => (
                    <tr key={e.id}>
                      <td className="p-3">{e.id}</td><td className="p-3 font-mono">{e.username}</td><td className="p-3 font-semibold">{e.fullName}</td>
                      <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">{e.role}</span></td>
                      <td className="p-3 text-xs">{e.phone}<br />{e.email}</td>
                      <td className="p-3 text-emerald-600 font-medium">Hoạt động</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-xl font-bold mb-4">Nhật ký hoạt động (Audit Log - Bất biến)</h2>
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                    <div>
                      <span className="font-bold text-blue-700">[{log.user}]</span>{' '}
                      <span className="font-semibold">{log.action}</span> trên <strong>{log.target}</strong>: {log.detail}
                    </div>
                    <span className="text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl space-y-4">
              <h2 className="text-xl font-bold">Cài đặt hệ thống HOTEL PMS 216</h2>
              <div className="text-sm space-y-2">
                <p><strong>Quy mô khóa cứng:</strong> 216 phòng (4 tầng × 54 phòng)</p>
                <p><strong>Đơn vị tiền tệ:</strong> VNĐ (Việt Nam Đồng)</p>
                <p><strong>Múi giờ:</strong> GMT+7 (Asia/Ho_Chi_Minh)</p>
                <p><strong>Giờ Check-in / Check-out chuẩn:</strong> 14:00 / 12:00</p>
              </div>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Khôi phục dữ liệu mẫu ban đầu
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold">Phòng {selectedRoom.roomNumber} — {selectedRoom.type}</h3>
              <button onClick={() => setSelectedRoom(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="text-sm space-y-2">
              <p><strong>Tầng:</strong> Tầng {selectedRoom.floor}</p>
              <p><strong>Giá niêm yết:</strong> {formatVND(selectedRoom.price)} / đêm</p>
              <p><strong>Sức chứa tối đa:</strong> {selectedRoom.capacity} khách</p>
              <p><strong>Trạng thái phòng:</strong> {selectedRoom.status}</p>
              <p><strong>Tình trạng vệ sinh:</strong> {selectedRoom.hkStatus}</p>
              <p><strong>Tiện nghi:</strong> {selectedRoom.amenities.join(', ')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => updateRoom(selectedRoom.roomNumber, { hkStatus: 'Dirty' }, 'Đánh dấu cần vệ sinh')} className="bg-sky-600 text-white py-2 rounded-lg text-xs font-medium">Đánh dấu Cần vệ sinh</button>
              <button onClick={() => updateRoom(selectedRoom.roomNumber, { hkStatus: 'Inspected' }, 'Xác nhận đã vệ sinh')} className="bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium">Xác nhận Sạch (Inspected)</button>
              <button onClick={() => updateRoom(selectedRoom.roomNumber, { status: 'Maintenance' }, 'Báo hỏng / Bảo trì')} className="bg-slate-700 text-white py-2 rounded-lg text-xs font-medium">Báo Bảo trì</button>
              <button onClick={() => updateRoom(selectedRoom.roomNumber, { status: 'Available' }, 'Mở lại phòng trống')} className="bg-blue-600 text-white py-2 rounded-lg text-xs font-medium">Chuyển Trống (Available)</button>
            </div>
          </div>
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateBooking} className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold">Tạo Đặt phòng mới</h3>
              <button type="button" onClick={() => setShowBookingModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><label className="block text-xs mb-1">Tên khách hàng *</label><input required value={newBooking.guestName} onChange={e => setNewBooking({ ...newBooking, guestName: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs mb-1">Số điện thoại *</label><input required value={newBooking.phone} onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs mb-1">Mã phòng (101–454)</label><input required value={newBooking.roomNumber} onChange={e => setNewBooking({ ...newBooking, roomNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div>
                <label className="block text-xs mb-1">Nguồn đặt phòng</label>
                <select value={newBooking.source} onChange={e => setNewBooking({ ...newBooking, source: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="block text-xs mb-1">Ngày nhận phòng</label><input type="date" required value={newBooking.checkIn} onChange={e => setNewBooking({ ...newBooking, checkIn: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs mb-1">Ngày trả phòng</label><input type="date" required value={newBooking.checkOut} onChange={e => setNewBooking({ ...newBooking, checkOut: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs mb-1">Tiền đặt cọc (VNĐ)</label><input type="number" min="0" value={newBooking.deposit} onChange={e => setNewBooking({ ...newBooking, deposit: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div><label className="block text-xs mb-1">Số người lớn</label><input type="number" min="1" value={newBooking.adults} onChange={e => setNewBooking({ ...newBooking, adults: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 rounded-lg border text-sm">Hủy</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">Xác nhận đặt phòng</button>
            </div>
          </form>
        </div>
      )}

      {checkoutBooking && (() => {
        const nights = calculateNights(checkoutBooking.checkIn, checkoutBooking.checkOut);
        const roomTotal = nights * checkoutBooking.pricePerNight;
        const serviceTotal = (checkoutBooking.services || []).reduce((s, sv) => s + sv.total, 0);
        const grandTotal = roomTotal + serviceTotal + Number(checkoutSurcharge);
        const balanceDue = Math.max(0, grandTotal - checkoutBooking.deposit);
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-lg font-bold">Hóa đơn Check-out — Phòng {checkoutBooking.roomNumber}</h3>
                <button onClick={() => setCheckoutBooking(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="text-sm space-y-2 border-b pb-3">
                <p><strong>Khách hàng:</strong> {checkoutBooking.guestName} ({checkoutBooking.id})</p>
                <p><strong>Lưu trú:</strong> {checkoutBooking.checkIn} → {checkoutBooking.checkOut} ({nights} đêm)</p>
                <div className="flex justify-between"><span>Tiền phòng ({nights} đêm × {formatVND(checkoutBooking.pricePerNight)}):</span><strong>{formatVND(roomTotal)}</strong></div>
                <div className="flex justify-between"><span>Phí dịch vụ ({(checkoutBooking.services || []).length} mục):</span><strong>{formatVND(serviceTotal)}</strong></div>
                <div className="flex justify-between items-center">
                  <span>Phụ thu (nếu có):</span>
                  <input type="number" min="0" value={checkoutSurcharge} onChange={e => setCheckoutSurcharge(e.target.value)} className="w-32 border rounded px-2 py-1 text-right" />
                </div>
                <div className="flex justify-between text-emerald-700"><span>Đã đặt cọc:</span><strong>- {formatVND(checkoutBooking.deposit)}</strong></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Còn phải thanh toán:</span><span className="text-rose-600">{formatVND(balanceDue)}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Phương thức thanh toán:</span>
                <select value={checkoutMethod} onChange={e => setCheckoutMethod(e.target.value)} className="border rounded-lg px-3 py-1.5">
                  <option>Chuyển khoản</option><option>Tiền mặt</option><option>Thẻ ngân hàng</option><option>Thanh toán trực tuyến</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 no-print">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-lg border text-sm flex items-center gap-1"><Printer className="w-4 h-4" /> In hóa đơn</button>
                <button onClick={handleConfirmCheckOut} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Xác nhận Trả phòng</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
