import { db } from '../lib/db';
import { Package, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  // Simple reactivity?
  // Since db is just a class, it won't trigger re-renders automatically except on mount.
  // For a "Demo" this is fine, or we can force update.
  // For better UX, let's just fetch on mount.
  
  const items = db.getItems();
  const stock = db.getAllStock();
  const transactions = db.getTransactions().slice(0, 5); // Latest 5
  
  const totalItems = items.length;
  const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);
  // Derived low stock items (e.g. < 5)
  const lowStockCount = stock.filter(s => s.quantity < 5).length;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalItems}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Stock Quantity</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalStock}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{lowStockCount}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                 <th className="px-6 py-3 font-medium">Date</th>
                 <th className="px-6 py-3 font-medium">Type</th>
                 <th className="px-6 py-3 font-medium">Item</th>
                 <th className="px-6 py-3 font-medium text-right">Qty</th>
                 <th className="px-6 py-3 font-medium">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions yet.</td>
                </tr>
              ) : (
                transactions.map(t => {
                  const item = items.find(i => i.id === t.itemId);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{new Date(t.date).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'IN' ? 'bg-green-100 text-green-800' :
                          t.type === 'OUT' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{item?.name || 'Unknown Item'} <span className="text-gray-400 font-normal">({item?.sku})</span></td>
                      <td className={`px-6 py-4 text-right font-bold ${t.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.quantityChange > 0 ? '+' : ''}{t.quantityChange}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{t.userName}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
