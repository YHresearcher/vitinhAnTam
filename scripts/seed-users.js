const { scryptSync, randomBytes } = require('crypto');
const fs = require('fs');
const path = require('path');

function hash(plain) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

const users = [
  {
    id: 'u-admin-1',
    username: 'thanhphan',
    name: 'Thanh Phan',
    email: 'thanhphan@vitinhantam.com',
    phone: '0909.053.058',
    role: 'admin',
    roleTitle: 'Quản trị viên (Admin)',
    avatarBg: 'bg-blue-600',
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    last_login: '2026-10-04T08:00:00Z',
    permissions: {
      can_edit_stock: true,
      can_update_repair_status: true,
      can_access_payroll: true,
      can_manage_users: true,
    },
    password_hash: hash('AnTam@Admin#2026!Sec'),
    password_changed: true,
  },
  {
    id: 'u-sales-1',
    username: 'sales01',
    name: 'Sales 01',
    email: 'sales01@vitinhantam.com',
    phone: '0933.345.678',
    role: 'sales',
    roleTitle: 'Chuyên viên Bán hàng & CSKH',
    avatarBg: 'bg-purple-600',
    status: 'active',
    created_at: '2024-05-20T08:00:00Z',
    last_login: '2026-10-04T08:00:00Z',
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: false,
      can_access_payroll: false,
      can_manage_users: false,
    },
    password_hash: hash('AnTam@Sales$2026*Pro'),
    password_changed: true,
  },
  {
    id: 'u-tech-1',
    username: 'tech01',
    name: 'Kỹ thuật viên 01',
    email: 'tech01@vitinhantam.com',
    phone: '0977.123.456',
    role: 'technician',
    roleTitle: 'Kỹ thuật viên phần cứng & QC',
    avatarBg: 'bg-emerald-600',
    status: 'active',
    created_at: '2024-02-01T08:30:00Z',
    last_login: '2026-10-04T08:00:00Z',
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: true,
      can_access_payroll: false,
      can_manage_users: false,
    },
    password_hash: hash('AnTam@Tech#2026%Ktv'),
    password_changed: true,
  },
  {
    id: 'u-outsourced-1',
    username: 'ktv_ngoai01',
    name: 'Trần Văn Cường (KTV Thuê Ngoài)',
    email: 'cuong.ktvngoai@vitinhantam.com',
    phone: '0988.765.432',
    role: 'outsourced',
    roleTitle: 'Kỹ thuật viên đối tác / Thuê ngoài',
    avatarBg: 'bg-amber-600',
    status: 'active',
    created_at: '2024-06-10T08:00:00Z',
    last_login: '2026-10-04T08:00:00Z',
    permissions: {
      can_edit_stock: false,
      can_update_repair_status: true,
      can_access_payroll: false,
      can_manage_users: false,
    },
    password_hash: hash('AnTam@Partner&2026^Out'),
    password_changed: true,
  },
];

const dataDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2), 'utf8');
console.log('SUCCESS: Seeded 4 users to .data/users.json');
