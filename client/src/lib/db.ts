import { v4 as uuidv4 } from 'uuid';
import type { Item, Stock, Supplier, Transaction, TransactionType, User } from './types';

const DB_KEY = 'inventory_system_db_v1';

interface DBState {
  users: User[];
  items: Item[];
  suppliers: Supplier[];
  stock: Stock[];
  transactions: Transaction[];
}

const INITIAL_STATE: DBState = {
  users: [
    { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'System Admin' },
    { id: '2', username: 'staff', password: 'staff123', role: 'staff', name: 'Demo Staff' },
  ],
  items: [],
  suppliers: [],
  stock: [],
  transactions: [],
};

class MockDB {
  private state: DBState;

  constructor() {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      this.state = JSON.parse(saved);
    } else {
      this.state = INITIAL_STATE;
      this.save();
    }
  }

  private save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.state));
  }

  // --- Users ---
  getUsers() { return this.state.users; }
  
  // --- Items ---
  getItems() { return this.state.items; }
  
  createItem(item: Omit<Item, 'id'>) {
    if (this.state.items.some(i => i.sku === item.sku)) {
      throw new Error(`SKU ${item.sku} already exists.`);
    }
    const newItem: Item = { ...item, id: uuidv4() };
    this.state.items.push(newItem);
    // Initialize 0 stock
    this.state.stock.push({ itemId: newItem.id, quantity: 0 });
    this.save();
    return newItem;
  }

  updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'sku'>>) {
    const idx = this.state.items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    this.state.items[idx] = { ...this.state.items[idx], ...updates };
    this.save();
    return this.state.items[idx];
  }

  // --- Suppliers ---
  getSuppliers() { return this.state.suppliers; }
  
  createSupplier(supplier: Omit<Supplier, 'id'>) {
    const newSupplier: Supplier = { ...supplier, id: uuidv4() };
    this.state.suppliers.push(newSupplier);
    this.save();
    return newSupplier;
  }

  // --- Stock & Transactions ---
  getStock(itemId: string) {
    return this.state.stock.find(s => s.itemId === itemId)?.quantity || 0;
  }

  getAllStock() {
    return this.state.stock;
  }

  getTransactions(itemId?: string) {
    if (itemId) {
      return this.state.transactions.filter(t => t.itemId === itemId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return [...this.state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // CORE LOGIC: The ONLY way to modify stock
  commitTransaction(
    type: TransactionType,
    itemId: string,
    quantity: number, // Magnitude for IN/OUT. Signed for ADJUSTMENT?
    reference: string,
    user: User
  ): Transaction {
    // Basic validation
    if (type !== 'ADJUSTMENT' && quantity <= 0) throw new Error('Quantity must be positive for IN/OUT operations');
    if (type === 'ADJUSTMENT' && quantity === 0) throw new Error('Adjustment quantity cannot be zero');

    const stockIdx = this.state.stock.findIndex(s => s.itemId === itemId);
    if (stockIdx === -1) throw new Error('Item stock record not found');

    const currentQty = this.state.stock[stockIdx].quantity;
    let newQty = currentQty;
    let change = 0;

    if (type === 'IN') {
      change = quantity;
      newQty += quantity;
    } else if (type === 'OUT') {
      if (currentQty < quantity) throw new Error(`Insufficient stock. Current: ${currentQty}, Requested: ${quantity}`);
      change = -quantity;
      newQty -= quantity;
    } else if (type === 'ADJUSTMENT') {
        // For Adjustment, 'quantity' is signed.
        // Positive = Adding stock (Found it)
        // Negative = Removing stock (Lost/Damaged)
        change = quantity;
        newQty += change;
        if (newQty < 0) throw new Error('Adjustment resulting in negative stock is not allowed');
    }

    // Update Stock
    this.state.stock[stockIdx].quantity = newQty;

    // Create Log
    const transaction: Transaction = {
      id: uuidv4(),
      itemId,
      type,
      quantityChange: change,
      reference,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };

    this.state.transactions.push(transaction);
    this.save();
    return transaction;
  }
}

export const db = new MockDB();
