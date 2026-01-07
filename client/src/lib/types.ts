export type Role = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string; // Plaintext for demo purposes
  role: Role;
  name: string;
}

export type ItemStatus = 'active' | 'inactive';

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string; // Unit of Measure
  description: string;
  status: ItemStatus;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface Transaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantityChange: number; // Positive for IN/Increase, Negative for OUT/Decrease
  reference: string; // Invoice # or Reason
  date: string; // ISO String
  userId: string;
  userName: string; // Snapshot of who did it
}

export interface Stock {
  itemId: string;
  quantity: number;
}
