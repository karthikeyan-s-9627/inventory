import { useState } from 'react';
import { db } from '../lib/db';
import type { Supplier } from '../lib/types';
import { Plus, Users, Phone, Search } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(db.getSuppliers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '' });

  const refresh = () => setSuppliers([...db.getSuppliers()]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.createSupplier(formData);
      setIsModalOpen(false);
      setFormData({ name: '', contact: '' });
      refresh();
      alert('Supplier added successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 relative">
             <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="Search suppliers..." className="pl-9 w-full max-w-sm px-3 py-2 border rounded-md text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
               <tr>
                 <th className="px-6 py-3 font-medium">Name</th>
                 <th className="px-6 py-3 font-medium">Contact Details</th>
                 <th className="px-6 py-3 font-medium text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {suppliers.length === 0 ? (
                 <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No suppliers found.</td></tr>
               ) : (
                 suppliers.map(sup => (
                   <tr key={sup.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                       <div className="bg-purple-50 p-1.5 rounded-full"><Users className="w-4 h-4 text-purple-600"/></div>
                       {sup.name}
                     </td>
                     <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {sup.contact}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button onClick={() => alert('Edit not implemented in demo')} className="text-blue-600 hover:underline text-xs">Edit</button>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add New Supplier</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
                 <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="Phone, Email, Address" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
