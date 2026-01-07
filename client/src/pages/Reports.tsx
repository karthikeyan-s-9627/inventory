import { useState } from 'react';
import { db } from '../lib/db';
import { FileText, ClipboardList } from 'lucide-react';
import clsx from 'clsx';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'summary' | 'movement'>('summary');
  const items = db.getItems();
  const stock = db.getAllStock();
  const transactions = db.getTransactions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('summary')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              activeTab === 'summary' ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <ClipboardList className="w-4 h-4" /> Stock Summary
          </button>
          <button
            onClick={() => setActiveTab('movement')}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
              activeTab === 'movement' ? "bg-white text-blue-600 border-t-2 border-blue-600" : "text-gray-500 hover:text-gray-900"
            )}
          >
           <FileText className="w-4 h-4" /> Stock Movement
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'summary' && (
            <div className="overflow-x-auto">
              <div className="p-4 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>Generated on: {new Date().toLocaleString()}</span>
                <button onClick={() => window.print()} className="hover:underline">Print Report</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">SKU</th>
                    <th className="px-6 py-3 font-medium">Item Name</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium text-right">Qty Level</th>
                    <th className="px-6 py-3 font-medium text-right">Value (Approx)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(item => {
                    const qty = stock.find(s => s.itemId === item.id)?.quantity || 0;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-gray-500">{item.sku}</td>
                        <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-3 text-gray-500">{item.category}</td>
                        <td className={clsx("px-6 py-3 text-right font-bold", qty < 5 ? 'text-red-600' : 'text-gray-900')}>
                          {qty} {item.uom}
                        </td>
                        <td className="px-6 py-3 text-right text-gray-400">--</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="overflow-x-auto">
               <div className="p-4 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>Transaction Log (Immutable)</span>
                <button onClick={() => window.print()} className="hover:underline">Print Report</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date/Time</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Item</th>
                    <th className="px-6 py-3 font-medium text-right">Change</th>
                    <th className="px-6 py-3 font-medium">Reference</th>
                    <th className="px-6 py-3 font-medium">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(t => {
                     const item = items.find(i => i.id === t.itemId);
                     return (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-500 text-xs">{new Date(t.date).toLocaleString()}</td>
                        <td className="px-6 py-3">
                           <span className={clsx("px-2 py-0.5 rounded text-xs font-medium",
                             t.type === 'IN' ? 'bg-green-100 text-green-700' :
                             t.type === 'OUT' ? 'bg-blue-100 text-blue-700' :
                             'bg-orange-100 text-orange-700'
                           )}>
                             {t.type}
                           </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-gray-900">{item?.name || 'Unknown'}</td>
                        <td className={clsx("px-6 py-3 text-right font-bold", t.quantityChange > 0 ? 'text-green-600' : 'text-red-600')}>
                          {t.quantityChange > 0 ? '+' : ''}{t.quantityChange}
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs max-w-xs truncate" title={t.reference}>{t.reference}</td>
                        <td className="px-6 py-3 text-gray-500 text-xs">{t.userName}</td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
