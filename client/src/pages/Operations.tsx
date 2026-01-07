import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import type { TransactionType } from '../lib/types';
import { ArrowDown, ArrowUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function OperationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>('IN');
  const items = db.getItems();
  const suppliers = db.getSuppliers();

  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    supplierId: '', // For IN
    reason: '', // For OUT/ADJUSTMENT
    reference: '', // Invoice #
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!user) return;
    if (!formData.itemId) { setMessage({type: 'error', text: 'Please select an item'}); return; }
    
    const qty = parseInt(formData.quantity);
    if (isNaN(qty)) { setMessage({type: 'error', text: 'Invalid quantity'}); return; }

    try {
      let ref = formData.reference;
      // Build reference string based on context if not provided or to augment it
      if (activeTab === 'IN') {
        const sup = suppliers.find(s => s.id === formData.supplierId);
        ref = `Invoice: ${formData.reference} | Supplier: ${sup ? sup.name : 'Unknown'}`;
      } else if (activeTab === 'OUT' || activeTab === 'ADJUSTMENT') {
        if (!formData.reason) { setMessage({type: 'error', text: 'Reason is required'}); return; }
        ref = `${formData.reason} ${formData.reference ? `(${formData.reference})` : ''}`;
      }

      // For Adjustment, handle sign if needed? 
      // db.commitTransaction handles IN/OUT as magnitude. 
      // For ADJUSTMENT, UI should pass signed qty? 
      // Let's implement logic: 
      // If Tab is ADJUSTMENT, user enters e.g. "5" (Increase) or "-5" (Decrease).
      // Or we can provide a toggle "Add/Remove".
      // Requirement: "Increase or decrease stock".
      // Let's trust the input for Adjustment.
      
      db.commitTransaction(activeTab, formData.itemId, qty, ref, user);
      
      setMessage({ type: 'success', text: 'Transaction commited successfully' });
      setFormData({ itemId: '', quantity: '', supplierId: '', reason: '', reference: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Transaction failed' });
    }
  };

  const tabs: {id: TransactionType; label: string; icon: any; color: string}[] = [
    { id: 'IN', label: 'Stock In', icon: ArrowDown, color: 'text-green-600' },
    { id: 'OUT', label: 'Stock Out', icon: ArrowUp, color: 'text-blue-600' },
    { id: 'ADJUSTMENT', label: 'Adjustment', icon: AlertTriangle, color: 'text-orange-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Operations</h1>
        <p className="text-gray-500">Record stock movement and adjustments</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-white text-gray-900 border-t-2 border-blue-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              <tab.icon className={clsx("w-5 h-5", activeTab === tab.id ? tab.color : "text-gray-400")} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {message && (
             <div className={clsx("mb-6 p-4 rounded-md flex items-center gap-3", 
               message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
             )}>
               {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
               {message.text}
             </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common: Item Selection */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
                <select 
                  required 
                  value={formData.itemId} 
                  onChange={e => setFormData({...formData, itemId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose Item --</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>{i.sku} - {i.name}</option>
                  ))}
                </select>
              </div>

              {/* Common: Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity 
                  {activeTab === 'ADJUSTMENT' && <span className="text-xs font-normal text-gray-500 ml-2">(Use negative for decrease)</span>}
                </label>
                <input 
                  required 
                  type="number" 
                  value={formData.quantity} 
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>

              {/* Conditional Fields */}
              {activeTab === 'IN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select 
                    required 
                    value={formData.supplierId} 
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md outline-none"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'IN' && (
                <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Invoice / Reference No.</label>
                   <input 
                     required 
                     type="text" 
                     value={formData.reference} 
                     onChange={e => setFormData({...formData, reference: e.target.value})}
                     className="w-full px-3 py-2 border rounded-md outline-none"
                     placeholder="INV-2024-001" 
                   />
                </div>
              )}

              {(activeTab === 'OUT' || activeTab === 'ADJUSTMENT') && (
                 <div className="col-span-1 md:col-span-2">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference</label>
                   <input 
                     required 
                     type="text" 
                     value={formData.reason} 
                     onChange={e => setFormData({...formData, reason: e.target.value})}
                     className="w-full px-3 py-2 border rounded-md outline-none"
                     placeholder={activeTab === 'OUT' ? "e.g. Sales Order #123" : "e.g. Stock Count Correction"} 
                   />
                 </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
               <button 
                 type="submit" 
                 className={clsx(
                   "px-8 py-2.5 rounded-md text-white font-medium shadow-sm transition-transform active:scale-95",
                   activeTab === 'IN' ? "bg-green-600 hover:bg-green-700" :
                   activeTab === 'OUT' ? "bg-blue-600 hover:bg-blue-700" :
                   "bg-orange-600 hover:bg-orange-700"
                 )}
               >
                 Confirm Transaction
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
