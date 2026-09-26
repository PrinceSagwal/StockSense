import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Warehouse from '../models/Warehouse.js';
import Location from '../models/Location.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Receipt from '../models/Receipt.js';
import DeliveryOrder from '../models/DeliveryOrder.js';
import InternalTransfer from '../models/InternalTransfer.js';
import StockAdjustment from '../models/StockAdjustment.js';
import StockMove from '../models/StockMove.js';
import connectDB from '../config/db.js';

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const randInt   = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFrom  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad       = (n, len = 4) => String(n).padStart(len, '0');
const daysAgo   = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysLater = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// Insert in chunks to avoid hitting MongoDB document limit
const insertChunks = async (Model, docs, size = 50) => {
  for (let i = 0; i < docs.length; i += size) {
    await Model.insertMany(docs.slice(i, i + size), { ordered: false });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATIC MASTER DATA
// ─────────────────────────────────────────────────────────────────────────────

const SUPPLIERS = [
  'Apex Metallurgy Corp',       'TechnoCore Electronics',     'GlobalPack Supplies',
  'FastenWorld Industries',     'SkyMetal Alloys Ltd',        'CircuitBase Technologies',
  'PackRight Solutions',        'BoltMaster Co.',             'RawEdge Materials',
  'NanoChip Distributors',      'AeroFrame Components',       'PureSteel Foundry',
  'BoxMart Wholesale',          'Quantum Semiconductors',     'IronForge Metals',
  'SafeGuard PPE Supplies',     'PrecisionParts Ltd',         'MegaWatt Batteries Inc',
  'IndusTech Hardware',         'ProPack Logistics',          'AlphaWire & Cable Co',
  'SteelFab Direct',            'ElectroBridge Systems',      'OmniTools Corp',
  'SafetyFirst Wholesale',
];

const CUSTOMERS = [
  'Skyline Aerospace Ltd',      'Orion Manufacturing',        'Delta Robotics Inc',
  'Horizon Electronics',        'Peak Fabrications',          'Crestwood Industries',
  'BlueStar Components',        'NexGen Assembly',            'Vertex Automotive',
  'Summit Engineering',         'Atlas Precision Works',      'Falcon Systems Ltd',
  'Eclipse Tech Corp',          'Pinnacle Machinery',         'CoreLogic Hardware',
  'TerraFab Solutions',         'MountainView Robotics',      'NovaStar Engineering',
  'ClearPath Aviation',         'OmniDrive Automation',       'RedLine Manufacturing',
  'BlueOcean Logistics',        'CrystalTech Assemblies',     'GoldBridge Industries',
  'SilverPeak Components',
];

const ADJUSTMENT_REASONS = [
  'Physical count correction',  'Damaged goods write-off',    'Expired stock removal',
  'Supplier over-shipment',     'System sync discrepancy',    'Quality control rejection',
  'Theft/loss adjustment',      'Return to vendor',           'Cycle count update',
  'Receiving error correction', 'Production scrap',           'Sample withdrawal',
];

const NOTES_RECEIPT = [
  'Priority shipment — inspect on arrival.',
  'Fragile items — handle with care.',
  'Temperature sensitive — store immediately.',
  'Match PO exactly — no substitutions.',
  'Partial delivery expected — remainder ETA next week.',
  'Inspect for corrosion before racking.',
  'Count and weigh before signing off.',
  'Cross-dock directly to WH02 after receipt.',
  'Hold in dock until QC approval.',
  'Express freight — surcharge applies.',
];

const NOTES_DELIVERY = [
  'Ship via Priority Express freight.',
  'Customer requires packing slip inside carton.',
  'Requires cold-chain packaging.',
  'Confirm delivery window with customer before dispatch.',
  'Partial shipment approved by customer.',
  'Include Certificate of Conformance.',
  'Do not ship if stock below safety level.',
  'Customer pickup — no carrier needed.',
  'Add pallet label before loading.',
  'Urgent — customer production line waiting.',
];

const NOTES_TRANSFER = [
  'Replenishing North Depot safety stock.',
  'Balancing inventory across hubs.',
  'Overflow from WH01 — capacity exceeded.',
  'Seasonal rebalance.',
  'Emergency transfer — urgent request.',
  'Planned monthly stock distribution.',
  'Move to cold storage per product spec.',
  'QC passed — now moving to main rack.',
  'Pre-positioning for upcoming season.',
  'Customer proximity stocking.',
];

const NOTES_ADJ = [
  'Verified by warehouse supervisor.',
  'Approved by inventory manager.',
  'Corrected after annual audit.',
  'Pending QC sign-off.',
  'Immediate write-off approved.',
  'Discrepancy found during cycle count.',
  'Vendor confirmed over-shipment.',
  'Insurance claim filed.',
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MASTER — 60 products across 5 categories
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_TEMPLATES = [
  // ── Raw Materials (15) ────────────────────────────────────────────────────
  { name: 'Titanium Rod 20mm',               sku: 'TR-20MM',     cat: 'Raw Materials',         uom: 'pcs',   stock: 120, threshold: 30,  desc: 'High tensile aerospace-grade titanium rod, 20mm diameter, 1m length'           },
  { name: 'Alloy Aluminum Plate 500mm',       sku: 'AL-500',      cat: 'Raw Materials',         uom: 'pcs',   stock: 12,  threshold: 25,  desc: 'Pre-cut 500×500mm 5mm precision aluminum 6061-T6 sheet plate'                   },
  { name: 'Carbon Steel Sheet 3mm',           sku: 'CS-3MM',      cat: 'Raw Materials',         uom: 'pcs',   stock: 340, threshold: 60,  desc: 'Cold-rolled ASTM A1008 carbon steel, 1200×600mm, 3mm gauge'                     },
  { name: 'Copper Coil 1kg',                  sku: 'CC-1KG',      cat: 'Raw Materials',         uom: 'rolls', stock: 88,  threshold: 20,  desc: 'C110 electrolytic copper wire coil, 1.0mm diameter, 1kg spool'                  },
  { name: 'Brass Rod 12mm',                   sku: 'BR-12MM',     cat: 'Raw Materials',         uom: 'pcs',   stock: 210, threshold: 40,  desc: 'Free-machining C360 brass hex rod, 12mm AF, 1m length'                          },
  { name: 'Stainless Steel Pipe 25mm',        sku: 'SSP-25',      cat: 'Raw Materials',         uom: 'pcs',   stock: 0,   threshold: 15,  desc: 'Schedule 40 SS316 stainless steel pipe, 25mm OD, 2m length'                     },
  { name: 'Plastic Granules ABS Natural',     sku: 'PG-ABS',      cat: 'Raw Materials',         uom: 'kg',    stock: 500, threshold: 100, desc: 'Injection-grade ABS natural granules, UV stabilized, 25kg bag'                  },
  { name: 'Rubber Sheet 5mm NR',              sku: 'RS-5MM',      cat: 'Raw Materials',         uom: 'pcs',   stock: 75,  threshold: 20,  desc: 'Natural rubber sheet, Shore A 40, 500×500mm, 5mm thick'                         },
  { name: 'Mild Steel Flat Bar 50×6mm',       sku: 'MS-FB5006',   cat: 'Raw Materials',         uom: 'pcs',   stock: 260, threshold: 50,  desc: 'Hot-rolled mild steel flat bar, 50×6mm cross-section, 3m length'                },
  { name: 'Nylon PA6 Rod 30mm',               sku: 'NY-PA6-30',   cat: 'Raw Materials',         uom: 'pcs',   stock: 44,  threshold: 10,  desc: 'Extruded PA6 nylon rod, natural, 30mm diameter, 1m length'                      },
  { name: 'Spring Steel Wire 2mm',            sku: 'SSW-2MM',     cat: 'Raw Materials',         uom: 'rolls', stock: 32,  threshold: 10,  desc: 'EN10270-1 SH grade spring steel wire, 2mm, 10kg coil'                           },
  { name: 'Fiberglass Sheet 4mm',             sku: 'FG-4MM',      cat: 'Raw Materials',         uom: 'pcs',   stock: 90,  threshold: 20,  desc: 'G10/FR4 woven fiberglass laminate, 300×300mm, 4mm thickness'                    },
  { name: 'PTFE Rod 20mm',                    sku: 'PT-20MM',     cat: 'Raw Materials',         uom: 'pcs',   stock: 18,  threshold: 8,   desc: 'Virgin PTFE extruded rod, 20mm diameter, 300mm length, white'                   },
  { name: 'Lead-Free Solder Wire 1mm',        sku: 'SOL-LF1MM',   cat: 'Raw Materials',         uom: 'rolls', stock: 55,  threshold: 15,  desc: 'Sn99.3/Cu0.7 lead-free solder wire, 1mm, 500g spool, no-clean flux core'       },
  { name: 'Carbon Fibre Tube 12mm OD',        sku: 'CF-12OD',     cat: 'Raw Materials',         uom: 'pcs',   stock: 27,  threshold: 8,   desc: '3K twill carbon fibre tube, 12mm OD × 10mm ID, 1m length'                       },

  // ── Electronics & Sensors (15) ────────────────────────────────────────────
  { name: 'STM32 Microcontroller Core',       sku: 'MCU-STM32',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 0,   threshold: 50,  desc: 'STM32F407VGT6 ARM Cortex-M4 MCU, 168MHz, 1MB Flash, LQFP100'                   },
  { name: 'Raspberry Pi 4 Model B 4GB',       sku: 'RPI-4B4G',    cat: 'Electronics & Sensors', uom: 'pcs',   stock: 45,  threshold: 20,  desc: 'Raspberry Pi 4B SBC, 4GB LPDDR4, dual-display, Gigabit Ethernet'                },
  { name: 'MEMS Barometric Pressure Sensor',  sku: 'SEN-BMP280',  cat: 'Electronics & Sensors', uom: 'pcs',   stock: 180, threshold: 30,  desc: 'BMP280 digital pressure & temperature sensor, I2C/SPI, ±1hPa accuracy'          },
  { name: 'IR Non-Contact Temp Sensor',       sku: 'SEN-MLX90',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 320, threshold: 50,  desc: 'MLX90614 IR thermometer, −40 to +125°C, I2C, TO-39 package'                    },
  { name: 'ESP32-S3 WiFi+BLE Module',         sku: 'ESP32-S3',    cat: 'Electronics & Sensors', uom: 'pcs',   stock: 8,   threshold: 25,  desc: 'ESP32-S3 dual-core LX7, 2.4GHz WiFi+BT5, 512KB SRAM, QFN56'                   },
  { name: 'Li-Ion Cell 18650 3000mAh',        sku: 'BAT-18650',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 600, threshold: 100, desc: 'Samsung INR18650-30Q, 3000mAh, 3.6V nominal, 15A continuous'                   },
  { name: 'DC Motor Driver L298N Board',      sku: 'DRV-L298N',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 95,  threshold: 20,  desc: 'Dual H-bridge L298N motor driver, 5–46V, 2A per channel, heatsink'              },
  { name: 'Current Sensor Module ACS712',     sku: 'SEN-ACS712',  cat: 'Electronics & Sensors', uom: 'pcs',   stock: 142, threshold: 30,  desc: 'ACS712ELCTR-20A-T Hall-effect current sensor module, ±20A range'               },
  { name: 'OLED Display 0.96" I2C',           sku: 'DSP-OLED096', cat: 'Electronics & Sensors', uom: 'pcs',   stock: 230, threshold: 40,  desc: '128×64 SSD1306 OLED display, I2C, 3.3/5V, white pixels, 0.96 inch'             },
  { name: 'Relay Module 4-Channel 5V',        sku: 'RLY-4CH5V',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 175, threshold: 30,  desc: '4-channel optocoupled relay, 5V coil, 10A/250VAC contacts, active low'          },
  { name: 'RS485 Industrial Transceiver',     sku: 'COM-RS485',   cat: 'Electronics & Sensors', uom: 'pcs',   stock: 60,  threshold: 15,  desc: 'MAX485 RS-485/RS-422 transceiver DIP-8, ±15kV ESD protected'                   },
  { name: 'Ultrasonic Distance Sensor HC-SR04', sku: 'SEN-HCSR04', cat: 'Electronics & Sensors', uom: 'pcs', stock: 410, threshold: 60,  desc: 'HC-SR04 ultrasonic ranging module, 2–400cm, 40kHz, 3-wire'                      },
  { name: 'Step-Down Buck Converter 3A',      sku: 'PSU-BUCK3A',  cat: 'Electronics & Sensors', uom: 'pcs',   stock: 88,  threshold: 20,  desc: 'LM2596 adjustable step-down converter, 4–40V in, 1.25–37V out, 3A'             },
  { name: 'Rotary Encoder 600PPR',            sku: 'ENC-600PPR',  cat: 'Electronics & Sensors', uom: 'pcs',   stock: 37,  threshold: 10,  desc: 'Incremental optical rotary encoder, 600 PPR, 5–24VDC, 6mm shaft'                },
  { name: 'CAN Bus Transceiver MCP2551',      sku: 'COM-CAN2551', cat: 'Electronics & Sensors', uom: 'pcs',   stock: 0,   threshold: 20,  desc: 'MCP2551 high-speed CAN bus transceiver, 1Mbps, DIP-8, −40 to +125°C'           },

  // ── Packaging & Supplies (10) ─────────────────────────────────────────────
  { name: 'Heavy Duty Shipping Carton Large', sku: 'CTN-HD-LG',   cat: 'Packaging & Supplies',  uom: 'boxes', stock: 450, threshold: 100, desc: 'Double-walled 3-ply corrugated carton, 60×40×40cm, burst strength 200kg'        },
  { name: 'Bubble Wrap Roll 50m',             sku: 'BW-50M',      cat: 'Packaging & Supplies',  uom: 'rolls', stock: 130, threshold: 30,  desc: 'Standard 10mm bubble wrap, 600mm wide, 50m roll, perforated every 300mm'        },
  { name: 'Stretch Film 500mm 23mic',         sku: 'SF-500',      cat: 'Packaging & Supplies',  uom: 'rolls', stock: 0,   threshold: 40,  desc: 'Cast LLDPE hand stretch wrap, 500mm × 300m, 23 micron, 6 rolls/carton'          },
  { name: 'Anti-Static Foam Sheet 10mm',      sku: 'ASF-10MM',    cat: 'Packaging & Supplies',  uom: 'pcs',   stock: 850, threshold: 150, desc: 'Pink polyethylene anti-static foam, 300×300mm, 10mm, surface resistivity 10^9Ω' },
  { name: 'Thermal Label Roll 100×150mm',     sku: 'LBL-100150',  cat: 'Packaging & Supplies',  uom: 'rolls', stock: 60,  threshold: 20,  desc: 'Direct thermal labels, 100×150mm, 500 labels/roll, gap sensor, permanent adhesive'},
  { name: 'Polybag Zip-Lock 300×400mm',       sku: 'PB-ZL3040',   cat: 'Packaging & Supplies',  uom: 'pcs',   stock: 2000,threshold: 400, desc: '100-micron LDPE zip-lock polybag, 300×400mm, recloseable seal, clear'           },
  { name: 'Desiccant Silica Gel 1g Sachet',   sku: 'DSC-1G',      cat: 'Packaging & Supplies',  uom: 'pcs',   stock: 5000,threshold: 1000,desc: 'Food-grade silica gel desiccant sachet, 1g, 100 pcs per pack'                    },
  { name: 'Foam Corner Protectors Large',     sku: 'FCP-LG',      cat: 'Packaging & Supplies',  uom: 'pcs',   stock: 720, threshold: 150, desc: 'Black EVA foam corner guards, 50×50×50mm, fits panels up to 10mm thick'          },
  { name: 'Kraft Paper Roll 900mm',           sku: 'KP-900',      cat: 'Packaging & Supplies',  uom: 'rolls', stock: 48,  threshold: 15,  desc: 'Brown kraft paper, 900mm wide, 200m roll, 80gsm, recycled content'               },
  { name: 'Cable Tie 300mm Black UV',         sku: 'CT-300BK',    cat: 'Packaging & Supplies',  uom: 'pcs',   stock: 3000,threshold: 500, desc: 'Nylon 66 cable tie, 300×4.8mm, black UV-stabilized, 50N tensile, 100 pcs/pack'   },

  // ── Tools & Hardware (10) ─────────────────────────────────────────────────
  { name: 'Precision Fasteners M6 SS316',     sku: 'FST-M6-SS',   cat: 'Tools & Hardware',      uom: 'pcs',   stock: 850, threshold: 200, desc: 'SS316 hex bolt M6×20mm + nylock nut + washer set, DIN 933 / ISO 4032'           },
  { name: 'Hex Socket Set 12pc Metric',        sku: 'HSS-12M',     cat: 'Tools & Hardware',      uom: 'sets',  stock: 34,  threshold: 10,  desc: '1/4" drive chrome vanadium hex socket set, 4–14mm, with rail'                   },
  { name: 'Torque Wrench 1/2" Drive 20–200Nm', sku: 'TW-200NM',   cat: 'Tools & Hardware',      uom: 'pcs',   stock: 12,  threshold: 5,   desc: 'Click-type torque wrench, 1/2" square drive, 20–200Nm, ±4% accuracy'            },
  { name: 'Allen Key Set 9pc Metric',          sku: 'AK-9M',       cat: 'Tools & Hardware',      uom: 'sets',  stock: 220, threshold: 40,  desc: 'Ball-end hex key set, 1.5–10mm, chrome vanadium steel, T-bar fold-out'          },
  { name: 'HSS Twist Drill Bit 6mm',           sku: 'DB-HSS6',     cat: 'Tools & Hardware',      uom: 'pcs',   stock: 400, threshold: 80,  desc: 'HSS-Co cobalt twist drill, 6mm, 118° split point, DIN 338, Bright finish'       },
  { name: 'Digital Vernier Caliper 150mm',     sku: 'DVC-150',     cat: 'Tools & Hardware',      uom: 'pcs',   stock: 28,  threshold: 8,   desc: 'Digital caliper, 0–150mm, 0.01mm resolution, ABS/depth/step measurement'        },
  { name: 'Bench Vise 100mm Jaw',              sku: 'BV-100',      cat: 'Tools & Hardware',      uom: 'pcs',   stock: 9,   threshold: 3,   desc: 'Cast iron bench vise, 100mm jaw width, swivel base, fixed anvil'                },
  { name: 'Angle Grinder Disc 115mm',          sku: 'AG-DISC115',  cat: 'Tools & Hardware',      uom: 'pcs',   stock: 560, threshold: 100, desc: 'Depressed-centre metal grinding disc, 115×6×22.23mm, A24R, 13300 RPM max'       },
  { name: 'Insulation Tape PVC 19mm Black',    sku: 'IT-PVC19',    cat: 'Tools & Hardware',      uom: 'rolls', stock: 340, threshold: 60,  desc: 'PVC self-fusing insulation tape, 19mm × 20m, black, 80°C rated, UV resistant'  },
  { name: 'Thread Tap Set M3-M12 21pc',        sku: 'TAP-2112',    cat: 'Tools & Hardware',      uom: 'sets',  stock: 15,  threshold: 5,   desc: 'Metric HSS hand tap & die set, M3–M12, T-wrench + hex die holder included'      },

  // ── Safety & PPE (10) ─────────────────────────────────────────────────────
  { name: 'Safety Helmet EN397 White',         sku: 'PPE-SH-W',    cat: 'Safety & PPE',          uom: 'pcs',   stock: 55,  threshold: 15,  desc: 'Hard hat, HDPE shell, EN 397, 6-point nylon webbing cradle, ratchet adjustment'  },
  { name: 'Nitrile Gloves Medium 100-Box',     sku: 'PPE-GL-M',    cat: 'Safety & PPE',          uom: 'boxes', stock: 0,   threshold: 20,  desc: 'Powder-free nitrile exam gloves, medium, 4.5g, EN455, 100 pcs/box, blue'         },
  { name: 'Safety Goggles Anti-Fog Clear',     sku: 'PPE-SG-AF',   cat: 'Safety & PPE',          uom: 'pcs',   stock: 88,  threshold: 20,  desc: 'Indirect-vent safety goggles, anti-fog PC lens, EN 166, UV400 protection'       },
  { name: 'Hi-Vis Vest Class 2 Yellow XL',     sku: 'PPE-HV-XL',   cat: 'Safety & PPE',          uom: 'pcs',   stock: 140, threshold: 30,  desc: 'High-visibility vest, class 2 EN ISO 20471, 2-band + brace, XL, yellow'          },
  { name: 'Steel Toe Boot S3 Size 9',          sku: 'PPE-STB-9',   cat: 'Safety & PPE',          uom: 'pairs', stock: 22,  threshold: 8,   desc: 'S3 SRC steel toe cap boot, EN ISO 20345, slip-resistant, UK size 9, black'       },
  { name: 'Ear Defenders 28dB SNR',            sku: 'PPE-ED28',    cat: 'Safety & PPE',          uom: 'pcs',   stock: 65,  threshold: 15,  desc: 'Over-ear hearing protector, SNR 28dB, EN352-1, adjustable arc, yellow cups'       },
  { name: 'P2 Half-Face Dust Respirator',      sku: 'PPE-P2-HF',   cat: 'Safety & PPE',          uom: 'pcs',   stock: 120, threshold: 25,  desc: 'Reusable half-face respirator with 2× P2 filters, EN 149, low-profile valve'     },
  { name: 'Safety Harness Full-Body',          sku: 'PPE-SFH',     cat: 'Safety & PPE',          uom: 'pcs',   stock: 14,  threshold: 5,   desc: 'EN361 full-body fall-arrest harness, polyester webbing, dorsal D-ring, L/XL'     },
  { name: 'First Aid Kit 50-Person',           sku: 'PPE-FAK50',   cat: 'Safety & PPE',          uom: 'pcs',   stock: 8,   threshold: 3,   desc: 'ANSI/ISEA Z308.1 first aid kit, 50-person, wall-mount poly case, 197 items'     },
  { name: 'Fire Extinguisher 2kg CO2',         sku: 'PPE-FE2CO2',  cat: 'Safety & PPE',          uom: 'pcs',   stock: 0,   threshold: 4,   desc: 'CO2 fire extinguisher, 2kg, suitable for class B/E fires, wall bracket included' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEEDER
// ─────────────────────────────────────────────────────────────────────────────

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // ── Clear collections sequentially ────────────────────────────────────
    console.log('Clearing old data...');
    const modelsToClear = [
      StockMove, StockAdjustment, InternalTransfer,
      DeliveryOrder, Receipt, Product, Category,
      Location, Warehouse, User,
    ];
    for (const Model of modelsToClear) {
      await Model.deleteMany({});
    }

    // ─────────────────────────────────────────────────────────────────────
    // 1. USERS
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating users...');

    const manager = await User.create({
      name: 'Michael Prichett', email: 'manager@stocksense.com',
      password: 'password123',  role: 'inventory_manager', phone: '+1234567890',
    });
    const staff1 = await User.create({
      name: 'Alex Staff',       email: 'staff@stocksense.com',
      password: 'password123',  role: 'warehouse_staff',   phone: '+1987654321',
    });
    const staff2 = await User.create({
      name: 'Priya Sharma',     email: 'priya@stocksense.com',
      password: 'password123',  role: 'warehouse_staff',   phone: '+1122334455',
    });
    const staff3 = await User.create({
      name: 'James Nguyen',     email: 'james@stocksense.com',
      password: 'password123',  role: 'warehouse_staff',   phone: '+1556677889',
    });
    const staff4 = await User.create({
      name: 'Sarah Chen',       email: 'sarah@stocksense.com',
      password: 'password123',  role: 'warehouse_staff',   phone: '+1223344556',
    });

    const USERS   = [manager, staff1, staff2, staff3, staff4];
    const STAFF   = [staff1, staff2, staff3, staff4];

    // ─────────────────────────────────────────────────────────────────────
    // 2. WAREHOUSES
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating warehouses...');

    const wh1 = await Warehouse.create({ name: 'Central Apex Hub',          code: 'WH01', address: 'Plot 42, Logistics Park, Sector 18'       });
    const wh2 = await Warehouse.create({ name: 'North Logistics Depot',     code: 'WH02', address: 'Facility 9, Industrial Corridor'           });
    const wh3 = await Warehouse.create({ name: 'South Distribution Center', code: 'WH03', address: 'Unit 7, Commerce Road, Zone D'            });
    const wh4 = await Warehouse.create({ name: 'East Cold Storage Hub',     code: 'WH04', address: 'Sector 22, Freight Terminal, Bay 3'       });

    const WAREHOUSES = [wh1, wh2, wh3, wh4];

    // ─────────────────────────────────────────────────────────────────────
    // 3. LOCATIONS
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating locations...');

    // WH01 — 8 locations
    const l1_ra01 = await Location.create({ name: 'Rack Alpha-01',      code: 'RA-01',   warehouse: wh1._id, type: 'rack'  });
    const l1_ra02 = await Location.create({ name: 'Rack Alpha-02',      code: 'RA-02',   warehouse: wh1._id, type: 'rack'  });
    const l1_rb01 = await Location.create({ name: 'Rack Beta-01',       code: 'RB-01',   warehouse: wh1._id, type: 'rack'  });
    const l1_rb02 = await Location.create({ name: 'Rack Beta-02',       code: 'RB-02',   warehouse: wh1._id, type: 'rack'  });
    const l1_fz01 = await Location.create({ name: 'Floor Zone Alpha',   code: 'FZ-01',   warehouse: wh1._id, type: 'floor' });
    const l1_fz02 = await Location.create({ name: 'Floor Zone Beta',    code: 'FZ-02',   warehouse: wh1._id, type: 'floor' });
    const l1_dock = await Location.create({ name: 'Receiving Dock 1',   code: 'RCV-01',  warehouse: wh1._id, type: 'zone'  });
    const l1_ship = await Location.create({ name: 'Shipping Dock 1',    code: 'SHP-01',  warehouse: wh1._id, type: 'zone'  });

    // WH02 — 6 locations
    const l2_sn01 = await Location.create({ name: 'Shelf North-01',     code: 'SN-01',   warehouse: wh2._id, type: 'shelf' });
    const l2_sn02 = await Location.create({ name: 'Shelf North-02',     code: 'SN-02',   warehouse: wh2._id, type: 'shelf' });
    const l2_sn03 = await Location.create({ name: 'Shelf North-03',     code: 'SN-03',   warehouse: wh2._id, type: 'shelf' });
    const l2_fz01 = await Location.create({ name: 'Floor Zone A',       code: 'FZA-01',  warehouse: wh2._id, type: 'floor' });
    const l2_dock = await Location.create({ name: 'Receiving Dock 2',   code: 'RCV-02',  warehouse: wh2._id, type: 'zone'  });
    const l2_ship = await Location.create({ name: 'Shipping Dock 2',    code: 'SHP-02',  warehouse: wh2._id, type: 'zone'  });

    // WH03 — 5 locations
    const l3_rc01 = await Location.create({ name: 'Rack Central-01',    code: 'RC-01',   warehouse: wh3._id, type: 'rack'  });
    const l3_rc02 = await Location.create({ name: 'Rack Central-02',    code: 'RC-02',   warehouse: wh3._id, type: 'rack'  });
    const l3_fz01 = await Location.create({ name: 'Floor Zone C1',      code: 'FZC-01',  warehouse: wh3._id, type: 'floor' });
    const l3_dock = await Location.create({ name: 'Receiving Dock 3',   code: 'RCV-03',  warehouse: wh3._id, type: 'zone'  });
    const l3_ship = await Location.create({ name: 'Shipping Dock 3',    code: 'SHP-03',  warehouse: wh3._id, type: 'zone'  });

    // WH04 — 4 locations
    const l4_cs01 = await Location.create({ name: 'Cold Shelf 01',      code: 'CS-01',   warehouse: wh4._id, type: 'shelf' });
    const l4_cs02 = await Location.create({ name: 'Cold Shelf 02',      code: 'CS-02',   warehouse: wh4._id, type: 'shelf' });
    const l4_dock = await Location.create({ name: 'Receiving Dock 4',   code: 'RCV-04',  warehouse: wh4._id, type: 'zone'  });
    const l4_ship = await Location.create({ name: 'Shipping Dock 4',    code: 'SHP-04',  warehouse: wh4._id, type: 'zone'  });

    // Grouped by warehouse for easy random picking (storage only, no docks)
    const WH_STORAGE_LOCS = {
      [wh1._id.toString()]: [l1_ra01, l1_ra02, l1_rb01, l1_rb02, l1_fz01, l1_fz02],
      [wh2._id.toString()]: [l2_sn01, l2_sn02, l2_sn03, l2_fz01],
      [wh3._id.toString()]: [l3_rc01, l3_rc02, l3_fz01],
      [wh4._id.toString()]: [l4_cs01, l4_cs02],
    };

    const WH_RECV_LOCS = {
      [wh1._id.toString()]: l1_dock,
      [wh2._id.toString()]: l2_dock,
      [wh3._id.toString()]: l3_dock,
      [wh4._id.toString()]: l4_dock,
    };

    const WH_SHIP_LOCS = {
      [wh1._id.toString()]: l1_ship,
      [wh2._id.toString()]: l2_ship,
      [wh3._id.toString()]: l3_ship,
      [wh4._id.toString()]: l4_ship,
    };

    // ─────────────────────────────────────────────────────────────────────
    // 4. CATEGORIES
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating categories...');

    const catRaw   = await Category.create({ name: 'Raw Materials',         description: 'Metals, plastics, raw manufacturing input materials'   });
    const catElec  = await Category.create({ name: 'Electronics & Sensors', description: 'Microchips, boards, sensors, communication modules'    });
    const catPack  = await Category.create({ name: 'Packaging & Supplies',  description: 'Boxes, wrapping, cushioning, labels, consumables'      });
    const catTools = await Category.create({ name: 'Tools & Hardware',      description: 'Fasteners, hand tools, measuring instruments'          });
    const catPPE   = await Category.create({ name: 'Safety & PPE',          description: 'Helmets, gloves, goggles and all protective equipment'  });

    const CAT_MAP = {
      'Raw Materials':         catRaw._id,
      'Electronics & Sensors': catElec._id,
      'Packaging & Supplies':  catPack._id,
      'Tools & Hardware':      catTools._id,
      'Safety & PPE':          catPPE._id,
    };

    // ─────────────────────────────────────────────────────────────────────
    // 5. PRODUCTS (60 products, distributed across all warehouses)
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 60 products with multi-location stock...');

    const PRODUCTS = [];

    for (const tpl of PRODUCT_TEMPLATES) {
      // Split stock across 1-3 warehouse locations
      const numLocs    = tpl.stock === 0 ? 0 : randInt(1, 3);
      const stockPerLocation = [];

      if (tpl.stock > 0 && numLocs > 0) {
        // Pick random warehouses (no duplicates)
        const whPool = [...WAREHOUSES].sort(() => Math.random() - 0.5).slice(0, numLocs);
        let remaining = tpl.stock;

        whPool.forEach((wh, idx) => {
          const locArr = WH_STORAGE_LOCS[wh._id.toString()];
          const loc    = randFrom(locArr);
          const qty    = idx === whPool.length - 1
            ? remaining                        // last one gets the rest
            : Math.floor(remaining * randInt(30, 70) / 100);
          remaining -= qty;
          if (qty > 0) {
            stockPerLocation.push({ location: loc._id, warehouse: wh._id, quantity: qty });
          }
        });
      }

      const product = await Product.create({
        name:              tpl.name,
        sku:               tpl.sku,
        category:          CAT_MAP[tpl.cat],
        unitOfMeasure:     tpl.uom,
        description:       tpl.desc,
        stockQuantity:     tpl.stock,
        reorderThreshold:  tpl.threshold,
        stockPerLocation,
        createdBy:         manager._id,
        createdAt:         daysAgo(randInt(60, 180)),
      });

      PRODUCTS.push(product);
    }

    // ─────────────────────────────────────────────────────────────────────
    // 6. INITIAL STOCK MOVES — Opening Balance
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating opening balance stock moves...');

    const openingMoves = [];
    for (const p of PRODUCTS) {
      for (const spl of p.stockPerLocation) {
        openingMoves.push({
          reference:      'INIT-BALANCE',
          operationType:  'adjustment',
          product:        p._id,
          productName:    p.name,
          productSku:     p.sku,
          toLocation:     spl.location,
          toWarehouse:    spl.warehouse,
          quantity:       spl.quantity,
          quantityBefore: 0,
          quantityAfter:  spl.quantity,
          unitOfMeasure:  p.unitOfMeasure,
          performedBy:    manager._id,
          notes:          'Opening stock balance',
          createdAt:      daysAgo(randInt(60, 180)),
        });
      }
    }
    await insertChunks(StockMove, openingMoves);
    console.log(`  -> ${openingMoves.length} opening balance moves`);

    // ─────────────────────────────────────────────────────────────────────
    // 7. RECEIPTS — 120 entries
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 120 receipts...');

    const REC_STATUSES  = ['waiting', 'waiting', 'ready', 'done', 'done', 'done', 'done', 'canceled'];
    const receiptMoves  = [];

    for (let i = 1; i <= 120; i++) {
      const status      = randFrom(REC_STATUSES);
      const supplier    = randFrom(SUPPLIERS);
      const destWh      = randFrom(WAREHOUSES);
      const destLoc     = WH_RECV_LOCS[destWh._id.toString()];
      const storageLoc  = randFrom(WH_STORAGE_LOCS[destWh._id.toString()]);
      const createdDays = randInt(2, 150);
      const creator     = randFrom(USERS);
      const numLines    = randInt(1, 5);
      const selProds    = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, numLines);

      const lines = selProds.map(p => {
        const expected = randInt(10, 150);
        const received = status === 'done'  ? expected
                       : status === 'ready' ? randInt(1, expected - 1)
                       : 0;
        return { product: p._id, expectedQty: expected, receivedQty: received, unitOfMeasure: p.unitOfMeasure };
      });

      await Receipt.create({
        reference:            `REC-2026-${pad(i)}`,
        supplier,
        status,
        destinationWarehouse: destWh._id,
        destinationLocation:  destLoc._id,
        lines,
        notes:                randFrom(NOTES_RECEIPT) + ` PO: PO-${pad(i, 6)}.`,
        createdBy:            creator._id,
        createdAt:            daysAgo(createdDays),
      });

      if (status === 'done') {
        lines.forEach(l => {
          const prod = PRODUCTS.find(p => p._id.equals(l.product));
          if (!prod) return;
          const before = randInt(0, 300);
          receiptMoves.push({
            reference:      `REC-2026-${pad(i)}`,
            operationType:  'receipt',
            product:        l.product,
            productName:    prod.name,
            productSku:     prod.sku,
            toLocation:     storageLoc._id,
            toWarehouse:    destWh._id,
            quantity:       l.expectedQty,
            quantityBefore: before,
            quantityAfter:  before + l.expectedQty,
            unitOfMeasure:  l.unitOfMeasure,
            performedBy:    creator._id,
            notes:          `Received from ${supplier}`,
            createdAt:      daysAgo(createdDays - 1),
          });
        });
      }
    }
    await insertChunks(StockMove, receiptMoves);
    console.log(`  -> ${receiptMoves.length} receipt stock moves`);

    // ─────────────────────────────────────────────────────────────────────
    // 8. DELIVERY ORDERS — 150 entries
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 150 delivery orders...');

    const DEL_STATUSES = ['draft', 'waiting', 'ready', 'ready', 'done', 'done', 'done', 'done', 'canceled'];
    const deliveryMoves = [];

    for (let i = 1; i <= 150; i++) {
      const status      = randFrom(DEL_STATUSES);
      const customer    = randFrom(CUSTOMERS);
      const srcWh       = randFrom(WAREHOUSES);
      const srcLoc      = WH_SHIP_LOCS[srcWh._id.toString()];
      const storageLoc  = randFrom(WH_STORAGE_LOCS[srcWh._id.toString()]);
      const createdDays = randInt(1, 120);
      const creator     = randFrom(USERS);
      const numLines    = randInt(1, 4);
      const selProds    = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, numLines);

      const lines = selProds.map(p => {
        const requested = randInt(5, 80);
        const delivered = status === 'done'  ? requested
                        : status === 'ready' ? randInt(1, requested - 1)
                        : 0;
        return { product: p._id, requestedQty: requested, deliveredQty: delivered, unitOfMeasure: p.unitOfMeasure };
      });

      await DeliveryOrder.create({
        reference:       `DEL-2026-${pad(i)}`,
        customer,
        status,
        sourceWarehouse: srcWh._id,
        sourceLocation:  srcLoc._id,
        lines,
        notes:           randFrom(NOTES_DELIVERY) + ` SO: SO-${pad(i, 6)}.`,
        createdBy:       creator._id,
        createdAt:       daysAgo(createdDays),
      });

      if (status === 'done') {
        lines.forEach(l => {
          const prod = PRODUCTS.find(p => p._id.equals(l.product));
          if (!prod) return;
          const before = randInt(50, 500);
          deliveryMoves.push({
            reference:      `DEL-2026-${pad(i)}`,
            operationType:  'delivery',
            product:        l.product,
            productName:    prod.name,
            productSku:     prod.sku,
            fromLocation:   storageLoc._id,
            fromWarehouse:  srcWh._id,
            quantity:       l.requestedQty,
            quantityBefore: before,
            quantityAfter:  Math.max(0, before - l.requestedQty),
            unitOfMeasure:  l.unitOfMeasure,
            performedBy:    creator._id,
            notes:          `Dispatched to ${customer}`,
            createdAt:      daysAgo(createdDays - 1),
          });
        });
      }
    }
    await insertChunks(StockMove, deliveryMoves);
    console.log(`  -> ${deliveryMoves.length} delivery stock moves`);

    // ─────────────────────────────────────────────────────────────────────
    // 9. INTERNAL TRANSFERS — 80 entries
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 80 internal transfers...');

    const TFR_STATUSES  = ['draft', 'waiting', 'ready', 'done', 'done', 'done', 'canceled'];
    const transferMoves = [];

    for (let i = 1; i <= 80; i++) {
      const status      = randFrom(TFR_STATUSES);
      const createdDays = randInt(1, 130);
      const creator     = randFrom(STAFF);

      // Ensure src and dst warehouses differ
      const shuffled    = [...WAREHOUSES].sort(() => Math.random() - 0.5);
      const srcWh       = shuffled[0];
      const dstWh       = shuffled[1];
      const srcLoc      = randFrom(WH_STORAGE_LOCS[srcWh._id.toString()]);
      const dstLoc      = randFrom(WH_STORAGE_LOCS[dstWh._id.toString()]);

      const numLines    = randInt(1, 4);
      const selProds    = [...PRODUCTS].sort(() => Math.random() - 0.5).slice(0, numLines);

      const lines = selProds.map(p => ({
        product:       p._id,
        quantity:      randInt(5, 60),
        unitOfMeasure: p.unitOfMeasure,
      }));

      await InternalTransfer.create({
        reference:            `INT-2026-${pad(i)}`,
        status,
        sourceWarehouse:      srcWh._id,
        sourceLocation:       srcLoc._id,
        destinationWarehouse: dstWh._id,
        destinationLocation:  dstLoc._id,
        scheduledDate:        status === 'waiting'
                                ? daysLater(randInt(1, 14))
                                : daysAgo(createdDays - 1),
        lines,
        notes:                randFrom(NOTES_TRANSFER),
        createdBy:            creator._id,
        createdAt:            daysAgo(createdDays),
      });

      if (status === 'done') {
        lines.forEach(l => {
          const prod   = PRODUCTS.find(p => p._id.equals(l.product));
          if (!prod) return;
          const before = randInt(30, 400);
          // Out move
          transferMoves.push({
            reference:      `INT-2026-${pad(i)}`,
            operationType:  'transfer',
            product:        l.product,
            productName:    prod.name,
            productSku:     prod.sku,
            fromLocation:   srcLoc._id,
            fromWarehouse:  srcWh._id,
            quantity:       l.quantity,
            quantityBefore: before,
            quantityAfter:  Math.max(0, before - l.quantity),
            unitOfMeasure:  l.unitOfMeasure,
            performedBy:    creator._id,
            notes:          `Transfer out → ${dstWh.name}`,
            createdAt:      daysAgo(createdDays - 1),
          });
          // In move
          const dstBefore = randInt(0, 200);
          transferMoves.push({
            reference:      `INT-2026-${pad(i)}`,
            operationType:  'transfer',
            product:        l.product,
            productName:    prod.name,
            productSku:     prod.sku,
            toLocation:     dstLoc._id,
            toWarehouse:    dstWh._id,
            quantity:       l.quantity,
            quantityBefore: dstBefore,
            quantityAfter:  dstBefore + l.quantity,
            unitOfMeasure:  l.unitOfMeasure,
            performedBy:    creator._id,
            notes:          `Transfer in ← ${srcWh.name}`,
            createdAt:      daysAgo(createdDays - 1),
          });
        });
      }
    }
    await insertChunks(StockMove, transferMoves);
    console.log(`  -> ${transferMoves.length} transfer stock moves`);

    // ─────────────────────────────────────────────────────────────────────
    // 10. STOCK ADJUSTMENTS — 80 entries
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 80 stock adjustments...');

    const ADJ_TYPES  = ['increase', 'increase', 'decrease', 'decrease', 'decrease'];
    const adjMoves   = [];

    for (let i = 1; i <= 80; i++) {
      const adjType     = randFrom(ADJ_TYPES);
      const prod        = randFrom(PRODUCTS);
      const wh          = randFrom(WAREHOUSES);
      const loc         = randFrom(WH_STORAGE_LOCS[wh._id.toString()]);
      const qty         = randInt(1, 40);
      const reason      = randFrom(ADJUSTMENT_REASONS);
      const creator     = randFrom(USERS);
      const createdDays = randInt(1, 120);
      const qtyBefore   = randInt(10, 400);
      const qtyAfter    = adjType === 'increase'
        ? qtyBefore + qty
        : Math.max(0, qtyBefore - qty);

      await StockAdjustment.create({
        reference:       `ADJ-2026-${pad(i)}`,
        product:         prod._id,
        warehouse:       wh._id,
        location:        loc._id,
        systemQuantity:  qtyBefore,
        countedQuantity: qtyAfter,
        difference:      qtyAfter - qtyBefore,
        reason,
        adjustedBy:      creator._id,
        adjustedAt:      daysAgo(createdDays),
      });

      adjMoves.push({
        reference:      `ADJ-2026-${pad(i)}`,
        operationType:  'adjustment',
        product:        prod._id,
        productName:    prod.name,
        productSku:     prod.sku,
        toLocation:     adjType === 'increase' ? loc._id    : undefined,
        toWarehouse:    adjType === 'increase' ? wh._id     : undefined,
        fromLocation:   adjType === 'decrease' ? loc._id    : undefined,
        fromWarehouse:  adjType === 'decrease' ? wh._id     : undefined,
        quantity:       qty,
        quantityBefore: qtyBefore,
        quantityAfter:  qtyAfter,
        unitOfMeasure:  prod.unitOfMeasure,
        performedBy:    creator._id,
        notes:          reason,
        createdAt:      daysAgo(createdDays),
      });
    }
    await insertChunks(StockMove, adjMoves);
    console.log(`  -> ${adjMoves.length} adjustment stock moves`);

    // ─────────────────────────────────────────────────────────────────────
    // 11. EXTRA HISTORICAL STOCK MOVES — 200 additional ledger entries
    //     (for a rich Move History page)
    // ─────────────────────────────────────────────────────────────────────
    console.log('Creating 200 additional historical stock moves...');

    const OP_TYPES  = ['receipt', 'delivery', 'transfer', 'adjustment'];
    const histMoves = [];

    for (let i = 0; i < 200; i++) {
      const prod    = randFrom(PRODUCTS);
      const opType  = randFrom(OP_TYPES);
      const wh      = randFrom(WAREHOUSES);
      const loc     = randFrom(WH_STORAGE_LOCS[wh._id.toString()]);
      const qty     = randInt(1, 100);
      const before  = randInt(10, 600);
      const after   = opType === 'delivery' ? Math.max(0, before - qty) : before + qty;
      const isOut   = opType === 'delivery' || opType === 'transfer';

      histMoves.push({
        reference:      `HIST-${pad(i + 1, 5)}`,
        operationType:  opType,
        product:        prod._id,
        productName:    prod.name,
        productSku:     prod.sku,
        fromLocation:   isOut ? loc._id  : undefined,
        fromWarehouse:  isOut ? wh._id   : undefined,
        toLocation:     !isOut ? loc._id : undefined,
        toWarehouse:    !isOut ? wh._id  : undefined,
        quantity:       qty,
        quantityBefore: before,
        quantityAfter:  after,
        unitOfMeasure:  prod.unitOfMeasure,
        performedBy:    randFrom(USERS)._id,
        notes:          `Historical ${opType} — archived entry ${pad(i + 1, 5)}`,
        createdAt:      daysAgo(randInt(1, 365)),
      });
    }
    await insertChunks(StockMove, histMoves);
    console.log(`  -> ${histMoves.length} historical ledger moves`);

    // ─────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────
    const counts = {
      users:      await User.countDocuments(),
      warehouses: await Warehouse.countDocuments(),
      locations:  await Location.countDocuments(),
      categories: await Category.countDocuments(),
      products:   await Product.countDocuments(),
      receipts:   await Receipt.countDocuments(),
      deliveries: await DeliveryOrder.countDocuments(),
      transfers:  await InternalTransfer.countDocuments(),
      adjustments:await StockAdjustment.countDocuments(),
      stockMoves: await StockMove.countDocuments(),
    };

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║       SEEDING COMPLETED SUCCESSFULLY         ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  Users              : ${String(counts.users).padEnd(22)}║`);
    console.log(`║  Warehouses         : ${String(counts.warehouses).padEnd(22)}║`);
    console.log(`║  Locations          : ${String(counts.locations).padEnd(22)}║`);
    console.log(`║  Categories         : ${String(counts.categories).padEnd(22)}║`);
    console.log(`║  Products           : ${String(counts.products).padEnd(22)}║`);
    console.log(`║  Receipts           : ${String(counts.receipts).padEnd(22)}║`);
    console.log(`║  Delivery Orders    : ${String(counts.deliveries).padEnd(22)}║`);
    console.log(`║  Internal Transfers : ${String(counts.transfers).padEnd(22)}║`);
    console.log(`║  Stock Adjustments  : ${String(counts.adjustments).padEnd(22)}║`);
    console.log(`║  Stock Move Ledger  : ${String(counts.stockMoves).padEnd(22)}║`);
    console.log('╠══════════════════════════════════════════════╣');
    console.log('║  Demo Credentials:                           ║');
    console.log('║  manager@stocksense.com  |  password123      ║');
    console.log('║  staff@stocksense.com    |  password123      ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();