import { useState } from 'react';
import { db } from '../lib/db';
import type { Item, ItemStatus } from '../lib/types'; // Using type-only import
import { Plus, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>(db.getItems());
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    uom: 'pcs',
    description: '',
    status: 'active' as ItemStatus,
  });

  const refresh = () => setItems([...db.getItems()]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.createItem(formData);
      setIsModalOpen(false);
      setFormData({ sku: '', name: '', category: '', uom: 'pcs', description: '', status: 'active' });
      refresh();
      alert('Item created successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating item');
    }
  };

  const currentStock = db.getAllStock();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Item Master</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="Search items..." className="pl-9 w-full px-3 py-2 border rounded-md text-sm" />
           </div>
           <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50">
             <Filter className="w-4 h-4" /> Filter
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
               <tr>
                 <th className="px-6 py-3 font-medium">SKU</th>
                 <th className="px-6 py-3 font-medium">Name</th>
                 <th className="px-6 py-3 font-medium">Category</th>
                 <th className="px-6 py-3 font-medium">UOM</th>
                 <th className="px-6 py-3 font-medium text-right">Current Stock</th>
                 <th className="px-6 py-3 font-medium">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {items.length === 0 ? (
                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No items found. Create one to get started.</td></tr>
               ) : (
                 items.map(item => {
                   const stock = currentStock.find(s => s.itemId === item.id)?.quantity || 0;
                   return (
                     <tr key={item.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.sku}</td>
                       <td className="px-6 py-4 font-medium text-gray-900">
                         <div>{item.name}</div>
                         <div className="text-xs text-gray-400 font-normal">{item.description}</div>
                       </td>
                       <td className="px-6 py-4">{item.category}</td>
                       <td className="px-6 py-4">{item.uom}</td>
                       <td className={clsx("px-6 py-4 text-right font-bold", stock < 5 ? "text-orange-600" : "text-gray-900")}>
                         {stock}
                       </td>
                       <td className="px-6 py-4">
                         <span className={clsx("px-2 py-1 rounded-full text-xs capitalize", 
                           item.status === 'active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                         )}>
                           {item.status}
                         </span>
                       </td>
                     </tr>
                   );
                 })
               )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                   <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ItemStatus})} className="w-full px-3 py-2 border rounded-md">
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                   </select>
                </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                   <input required type="text" value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. pcs, kg" />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" rows={3} />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
