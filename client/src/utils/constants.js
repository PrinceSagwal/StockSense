export const STATUS = {
  DRAFT: 'draft',
  WAITING: 'waiting',
  READY: 'ready',
  DONE: 'done',
  CANCELED: 'canceled'
};

export const OPERATION_TYPE = {
  RECEIPT: 'receipt',
  DELIVERY: 'delivery',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment'
};

export const UOM_LIST = [
  'pcs',
  'kg',
  'litres',
  'metres',
  'boxes',
  'units',
  'cartons',
  'rolls',
  'bags'
];

export const LOCATION_TYPES = [
  { value: 'rack', label: 'Rack' },
  { value: 'shelf', label: 'Shelf' },
  { value: 'zone', label: 'Zone' },
  { value: 'floor', label: 'Floor' },
  { value: 'bin', label: 'Bin' },
  { value: 'other', label: 'Other' }
];

export const ROLES = {
  MANAGER: 'inventory_manager',
  STAFF: 'warehouse_staff'
};
