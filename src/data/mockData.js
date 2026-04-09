import { subDays, format, eachDayOfInterval } from 'date-fns';

// ─── Lookup reference data ────────────────────────────────────────────────────
export const CATEGORIES    = ['Electronics','Furniture','Accessories','Software','Services'];
export const PRODUCT_STATUSES = ['Active','Low Stock','Out of Stock','Discontinued'];
export const ORDER_STATUSES   = ['Pending','Processing','Shipped','Delivered','Cancelled'];
export const PAYMENT_STATUSES = ['Paid','Pending','Refunded','Failed'];
export const ROLES            = ['super_admin','admin','user'];
export const DEPARTMENTS      = ['Sales','Marketing','Support','Finance','Operations'];
export const PAY_TERMS        = ['COD','Net 15','Net 30','Net 60'];

// ─── CUSTOMERS (custno, custname, address, payterm) ───────────────────────────
export const INITIAL_CUSTOMERS = [
  { id:'CU001', custno:'C001', custname:'Apex Technologies Inc.', address:'123 Tech Ave, Makati City',       payterm:'Net 30',  email:'procurement@apex-tech.com',  phone:'+1 415 555-0100', type:'Enterprise', totalOrders:24, totalSpent:48920,  status:'Active',  joinDate:'2022-03-15' },
  { id:'CU002', custno:'C002', custname:'Maria Santos',           address:'456 Rizal St, Quezon City',       payterm:'COD',     email:'maria.santos@gmail.com',      phone:'+63 912 345 6789',type:'Individual', totalOrders:7,  totalSpent:3240,   status:'Active',  joinDate:'2023-07-22' },
  { id:'CU003', custno:'C003', custname:'BluePeak Solutions',     address:'789 Ortigas Ave, Pasig City',     payterm:'Net 15',  email:'orders@bluepeak.com',         phone:'+1 312 555-0187', type:'Business',   totalOrders:18, totalSpent:29450,  status:'Active',  joinDate:'2022-11-08' },
  { id:'CU004', custno:'C004', custname:'Carlos Reyes',           address:'321 Luna St, Manila',             payterm:'COD',     email:'c.reyes@email.com',           phone:'+63 917 654 3210',type:'Individual', totalOrders:3,  totalSpent:899,    status:'Active',  joinDate:'2024-01-10' },
  { id:'CU005', custno:'C005', custname:'Nexus Corp',             address:'1 Ayala Ave, Makati City',        payterm:'Net 60',  email:'purchasing@nexuscorp.io',     phone:'+1 646 555-0234', type:'Enterprise', totalOrders:41, totalSpent:127800, status:'Active',  joinDate:'2021-06-30' },
  { id:'CU006', custno:'C006', custname:'Ana Lim',                address:'88 F. Torres St, Cebu City',      payterm:'COD',     email:'ana.lim@company.ph',          phone:'+63 999 111 2222',type:'Individual', totalOrders:5,  totalSpent:1678,   status:'Active',  joinDate:'2023-12-05' },
  { id:'CU007', custno:'C007', custname:'Global Workspace PH',    address:'200 Shaw Blvd, Mandaluyong',      payterm:'Net 30',  email:'office@globalwork.ph',        phone:'+63 2 8888 9999', type:'Business',   totalOrders:12, totalSpent:15600,  status:'Active',  joinDate:'2023-04-17' },
  { id:'CU008', custno:'C008', custname:'StartupHub Manila',      address:'5F Bonifacio High St, BGC',       payterm:'Net 15',  email:'ops@startuphub.ph',           phone:'+63 2 5555 7777', type:'Business',   totalOrders:8,  totalSpent:11240,  status:'Active',  joinDate:'2023-09-01' },
];

// ─── EMPLOYEES (empno, lastname, firstname, gender, hiredate) ─────────────────
export const INITIAL_EMPLOYEES = [
  { id:'E001', empno:'EMP001', lastname:'Dela Cruz', firstname:'Ricardo', fullname:'Dela Cruz, Ricardo', gender:'Male',   hiredate:'2019-01-15', department:'Sales',     position:'Sales Manager',        status:'Active' },
  { id:'E002', empno:'EMP002', lastname:'Cruz',      firstname:'Elena',   fullname:'Cruz, Elena',         gender:'Female', hiredate:'2020-03-01', department:'Sales',     position:'Senior Sales Agent',   status:'Active' },
  { id:'E003', empno:'EMP003', lastname:'Rivera',    firstname:'Marco',   fullname:'Rivera, Marco',        gender:'Male',   hiredate:'2021-06-15', department:'Sales',     position:'Sales Agent',          status:'Active' },
  { id:'E004', empno:'EMP004', lastname:'Lim',       firstname:'Sofia',   fullname:'Lim, Sofia',           gender:'Female', hiredate:'2021-01-10', department:'Sales',     position:'Account Executive',    status:'Active' },
  { id:'E005', empno:'EMP005', lastname:'Tan',       firstname:'James',   fullname:'Tan, James',           gender:'Male',   hiredate:'2022-04-20', department:'Marketing', position:'Marketing Specialist', status:'Active' },
  { id:'E006', empno:'EMP006', lastname:'Reyes',     firstname:'Anika',   fullname:'Reyes, Anika',         gender:'Female', hiredate:'2022-09-05', department:'Support',   position:'Customer Success',     status:'Active' },
];

// ─── PRODUCTS (prodCode, description, unit, current price) ───────────────────
export const INITIAL_PRODUCTS = [
  { id:'P001', prodCode:'PROD001', description:'Pro Laptop 15"',       unit:'pc',  category:'Electronics', stock:42,  status:'Active'    },
  { id:'P002', prodCode:'PROD002', description:'Wireless Headset X',   unit:'pc',  category:'Electronics', stock:115, status:'Active'    },
  { id:'P003', prodCode:'PROD003', description:'Ergonomic Chair',      unit:'pc',  category:'Furniture',   stock:18,  status:'Active'    },
  { id:'P004', prodCode:'PROD004', description:'Standing Desk',        unit:'pc',  category:'Furniture',   stock:7,   status:'Low Stock' },
  { id:'P005', prodCode:'PROD005', description:'Mechanical Keyboard',  unit:'pc',  category:'Electronics', stock:88,  status:'Active'    },
  { id:'P006', prodCode:'PROD006', description:'USB-C Hub 7-in-1',     unit:'pc',  category:'Accessories', stock:203, status:'Active'    },
  { id:'P007', prodCode:'PROD007', description:'Monitor 27" 4K',       unit:'pc',  category:'Electronics', stock:0,   status:'Out of Stock' },
  { id:'P008', prodCode:'PROD008', description:'Webcam HD Pro',        unit:'pc',  category:'Electronics', stock:56,  status:'Active'    },
  { id:'P009', prodCode:'PROD009', description:'Desk Lamp LED',        unit:'pc',  category:'Accessories', stock:143, status:'Active'    },
  { id:'P010', prodCode:'PROD010', description:'Laptop Stand Aluminum',unit:'pc',  category:'Accessories', stock:4,   status:'Low Stock' },
];

// ─── PRICE HISTORY (prodCode, effDate, unitPrice) ─────────────────────────────
export const INITIAL_PRICE_HIST = [
  { id:'PH001', prodCode:'PROD001', effDate:'2023-01-01', unitPrice:1199.00 },
  { id:'PH002', prodCode:'PROD001', effDate:'2024-01-01', unitPrice:1299.00 },
  { id:'PH003', prodCode:'PROD002', effDate:'2023-01-01', unitPrice:219.99  },
  { id:'PH004', prodCode:'PROD002', effDate:'2024-01-01', unitPrice:249.99  },
  { id:'PH005', prodCode:'PROD003', effDate:'2023-06-01', unitPrice:549.00  },
  { id:'PH006', prodCode:'PROD003', effDate:'2024-01-01', unitPrice:599.00  },
  { id:'PH007', prodCode:'PROD004', effDate:'2023-06-01', unitPrice:799.00  },
  { id:'PH008', prodCode:'PROD004', effDate:'2024-01-01', unitPrice:849.00  },
  { id:'PH009', prodCode:'PROD005', effDate:'2023-01-01', unitPrice:159.00  },
  { id:'PH010', prodCode:'PROD005', effDate:'2024-01-01', unitPrice:179.00  },
  { id:'PH011', prodCode:'PROD006', effDate:'2023-01-01', unitPrice:59.99   },
  { id:'PH012', prodCode:'PROD006', effDate:'2024-01-01', unitPrice:69.99   },
  { id:'PH013', prodCode:'PROD007', effDate:'2023-01-01', unitPrice:649.00  },
  { id:'PH014', prodCode:'PROD007', effDate:'2024-01-01', unitPrice:699.00  },
  { id:'PH015', prodCode:'PROD008', effDate:'2023-01-01', unitPrice:109.99  },
  { id:'PH016', prodCode:'PROD008', effDate:'2024-01-01', unitPrice:129.99  },
  { id:'PH017', prodCode:'PROD009', effDate:'2023-01-01', unitPrice:39.99   },
  { id:'PH018', prodCode:'PROD009', effDate:'2024-01-01', unitPrice:49.99   },
  { id:'PH019', prodCode:'PROD010', effDate:'2023-01-01', unitPrice:79.00   },
  { id:'PH020', prodCode:'PROD010', effDate:'2024-01-01', unitPrice:89.00   },
];

// Helper: get current price for a product
export function getCurrentPrice(prodCode) {
  const rows = INITIAL_PRICE_HIST
    .filter(p => p.prodCode === prodCode)
    .sort((a, b) => new Date(b.effDate) - new Date(a.effDate));
  return rows[0] || null;
}

// ─── SALES (transactions) ─────────────────────────────────────────────────────
// record_status: 'ACTIVE' | 'INACTIVE'
export const INITIAL_SALES = [
  { transNo:'TR000001', salesDate:'2024-01-15', custno:'C001', custname:'Apex Technologies Inc.', empno:'EMP002', empname:'Cruz, Elena',   record_status:'ACTIVE',   stamp:'2024-01-15 09:30:00' },
  { transNo:'TR000002', salesDate:'2024-01-20', custno:'C003', custname:'BluePeak Solutions',     empno:'EMP003', empname:'Rivera, Marco',  record_status:'ACTIVE',   stamp:'2024-01-20 14:15:00' },
  { transNo:'TR000003', salesDate:'2024-02-01', custno:'C002', custname:'Maria Santos',           empno:'EMP002', empname:'Cruz, Elena',   record_status:'ACTIVE',   stamp:'2024-02-01 10:00:00' },
  { transNo:'TR000004', salesDate:'2024-02-10', custno:'C005', custname:'Nexus Corp',             empno:'EMP001', empname:'Dela Cruz, Ricardo', record_status:'ACTIVE', stamp:'2024-02-10 11:45:00' },
  { transNo:'TR000005', salesDate:'2024-02-18', custno:'C007', custname:'Global Workspace PH',   empno:'EMP004', empname:'Lim, Sofia',    record_status:'ACTIVE',   stamp:'2024-02-18 16:20:00' },
  { transNo:'TR000006', salesDate:'2024-02-22', custno:'C006', custname:'Ana Lim',               empno:'EMP003', empname:'Rivera, Marco', record_status:'INACTIVE', stamp:'2024-02-22 09:10:00' },
  { transNo:'TR000007', salesDate:'2024-03-01', custno:'C001', custname:'Apex Technologies Inc.', empno:'EMP002', empname:'Cruz, Elena',  record_status:'ACTIVE',   stamp:'2024-03-01 13:00:00' },
  { transNo:'TR000008', salesDate:'2024-03-05', custno:'C008', custname:'StartupHub Manila',     empno:'EMP004', empname:'Lim, Sofia',    record_status:'ACTIVE',   stamp:'2024-03-05 10:30:00' },
  { transNo:'TR000009', salesDate:'2024-03-08', custno:'C005', custname:'Nexus Corp',            empno:'EMP001', empname:'Dela Cruz, Ricardo', record_status:'INACTIVE', stamp:'2024-03-08 15:00:00' },
  { transNo:'TR000010', salesDate:'2024-03-10', custno:'C004', custname:'Carlos Reyes',          empno:'EMP003', empname:'Rivera, Marco', record_status:'ACTIVE',   stamp:'2024-03-10 12:00:00' },
];

// ─── SALES DETAIL (line items) ────────────────────────────────────────────────
export const INITIAL_SALES_DETAIL = [
  { id:'SD001', transNo:'TR000001', prodCode:'PROD001', description:'Pro Laptop 15"',       qty:3,  unitPrice:1299.00, record_status:'ACTIVE'   },
  { id:'SD002', transNo:'TR000001', prodCode:'PROD005', description:'Mechanical Keyboard',  qty:3,  unitPrice:179.00,  record_status:'ACTIVE'   },
  { id:'SD003', transNo:'TR000002', prodCode:'PROD003', description:'Ergonomic Chair',      qty:5,  unitPrice:599.00,  record_status:'ACTIVE'   },
  { id:'SD004', transNo:'TR000003', prodCode:'PROD002', description:'Wireless Headset X',   qty:1,  unitPrice:249.99,  record_status:'ACTIVE'   },
  { id:'SD005', transNo:'TR000004', prodCode:'PROD004', description:'Standing Desk',        qty:10, unitPrice:849.00,  record_status:'ACTIVE'   },
  { id:'SD006', transNo:'TR000004', prodCode:'PROD003', description:'Ergonomic Chair',      qty:10, unitPrice:599.00,  record_status:'ACTIVE'   },
  { id:'SD007', transNo:'TR000005', prodCode:'PROD006', description:'USB-C Hub 7-in-1',     qty:20, unitPrice:69.99,   record_status:'ACTIVE'   },
  { id:'SD008', transNo:'TR000006', prodCode:'PROD009', description:'Desk Lamp LED',        qty:1,  unitPrice:49.99,   record_status:'INACTIVE' },
  { id:'SD009', transNo:'TR000006', prodCode:'PROD010', description:'Laptop Stand Aluminum',qty:1,  unitPrice:89.00,   record_status:'INACTIVE' },
  { id:'SD010', transNo:'TR000007', prodCode:'PROD007', description:'Monitor 27" 4K',       qty:5,  unitPrice:699.00,  record_status:'ACTIVE'   },
  { id:'SD011', transNo:'TR000008', prodCode:'PROD001', description:'Pro Laptop 15"',       qty:2,  unitPrice:1299.00, record_status:'ACTIVE'   },
  { id:'SD012', transNo:'TR000008', prodCode:'PROD008', description:'Webcam HD Pro',        qty:2,  unitPrice:129.99,  record_status:'ACTIVE'   },
  { id:'SD013', transNo:'TR000009', prodCode:'PROD001', description:'Pro Laptop 15"',       qty:8,  unitPrice:1299.00, record_status:'INACTIVE' },
  { id:'SD014', transNo:'TR000010', prodCode:'PROD002', description:'Wireless Headset X',   qty:1,  unitPrice:249.99,  record_status:'ACTIVE'   },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const INITIAL_USERS = [
  { id:'U001', name:'Ricardo Dela Cruz', email:'ricardo@salesflow.com', role:'super_admin', user_type:'SUPERADMIN', department:'Executive', status:'Active',  record_status:'ACTIVE',   joinDate:'2020-01-01', avatar:'RC', salesTarget:200000, salesAchieved:187000 },
  { id:'U002', name:'Elena Cruz',        email:'elena@salesflow.com',   role:'admin',       user_type:'ADMIN',      department:'Sales',     status:'Active',  record_status:'ACTIVE',   joinDate:'2021-03-01', avatar:'EC', salesTarget:150000, salesAchieved:138450 },
  { id:'U003', name:'Marco Rivera',      email:'marco@salesflow.com',   role:'admin',       user_type:'ADMIN',      department:'Sales',     status:'Active',  record_status:'ACTIVE',   joinDate:'2022-06-15', avatar:'MR', salesTarget:80000,  salesAchieved:92100  },
  { id:'U004', name:'Sofia Lim',         email:'sofia@salesflow.com',   role:'admin',       user_type:'ADMIN',      department:'Sales',     status:'Blocked', record_status:'INACTIVE', joinDate:'2022-01-10', avatar:'SL', salesTarget:100000, salesAchieved:87650  },
  { id:'U005', name:'James Tan',         email:'james@salesflow.com',   role:'user',        user_type:'USER',       department:'Marketing', status:'Active',  record_status:'ACTIVE',   joinDate:'2023-04-20', avatar:'JT', salesTarget:60000,  salesAchieved:54320  },
];

// ─── Rights (13 rights per sprint doc) ───────────────────────────────────────
export const ALL_RIGHTS = ['SALES_VIEW','SALES_ADD','SALES_EDIT','SALES_DEL','SD_VIEW','SD_ADD','SD_EDIT','SD_DEL','CUST_LOOKUP','EMP_LOOKUP','PROD_LOOKUP','PRICE_LOOKUP','ADM_USER'];

export const USER_RIGHTS_MAP = {
  SUPERADMIN: { SALES_VIEW:1,SALES_ADD:1,SALES_EDIT:1,SALES_DEL:1,SD_VIEW:1,SD_ADD:1,SD_EDIT:1,SD_DEL:1,CUST_LOOKUP:1,EMP_LOOKUP:1,PROD_LOOKUP:1,PRICE_LOOKUP:1,ADM_USER:1 },
  ADMIN:      { SALES_VIEW:1,SALES_ADD:1,SALES_EDIT:1,SALES_DEL:0,SD_VIEW:1,SD_ADD:1,SD_EDIT:1,SD_DEL:0,CUST_LOOKUP:1,EMP_LOOKUP:1,PROD_LOOKUP:1,PRICE_LOOKUP:1,ADM_USER:1 },
  USER:       { SALES_VIEW:1,SALES_ADD:1,SALES_EDIT:1,SALES_DEL:0,SD_VIEW:1,SD_ADD:1,SD_EDIT:1,SD_DEL:0,CUST_LOOKUP:1,EMP_LOOKUP:1,PROD_LOOKUP:1,PRICE_LOOKUP:1,ADM_USER:0 },
};

// ─── Chart helpers ────────────────────────────────────────────────────────────
export function generateSalesData() {
  const today = new Date();
  return eachDayOfInterval({ start: subDays(today, 29), end: today }).map(day => ({
    date: format(day, 'MMM dd'),
    revenue: Math.floor(Math.random() * 9000) + 2000,
    orders:  Math.floor(Math.random() * 18)  + 4,
  }));
}

export const REVENUE_BY_CATEGORY = [
  { name:'Electronics', value:68420, color:'#2563eb' },
  { name:'Furniture',   value:32810, color:'#16a34a' },
  { name:'Accessories', value:14320, color:'#d97706' },
  { name:'Software',    value:8900,  color:'#7c3aed' },
];

export const MONTHLY_TARGETS = [
  { month:'Oct', target:80000,  actual:74200  },
  { month:'Nov', target:90000,  actual:88500  },
  { month:'Dec', target:120000, actual:135400 },
  { month:'Jan', target:85000,  actual:79800  },
  { month:'Feb', target:95000,  actual:102100 },
  { month:'Mar', target:100000, actual:96300  },
];

export const TOP_PRODUCTS = [
  { name:'Pro Laptop 15"',      units:38, revenue:49362 },
  { name:'Ergonomic Chair',     units:31, revenue:18569 },
  { name:'Standing Desk',       units:17, revenue:14433 },
  { name:'Wireless Headset X',  units:52, revenue:12999 },
  { name:'Mechanical Keyboard', units:64, revenue:11456 },
];

export const SUMMARY_STATS = {
  totalRevenue:115520, totalOrders:156, totalCustomers:8, avgOrderValue:740.51,
  revenueGrowth:12.4, orderGrowth:8.2, customerGrowth:15.0, avgOrderGrowth:-3.1,
};
