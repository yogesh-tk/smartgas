import React, { useState, useEffect } from 'react';
import { Printer, Download, X, Flame, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function ReceiptModal({ isOpen, onClose, bookingRef }) {
  const { lang } = useAuth();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && bookingRef) {
      setLoading(true);
      api.getReceipt(bookingRef)
        .then((res) => {
          if (res.success) setReceipt(res.receipt);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, bookingRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Actions Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Digital LPG Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-xs text-slate-800 space-y-6 max-h-[80vh] overflow-y-auto">
          {loading || !receipt ? (
            <div className="py-12 text-center text-slate-400">Loading digital receipt...</div>
          ) : (
            <>
              {/* Invoice Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {receipt.portalName}
                  </h2>
                  <p className="text-[11px] text-slate-600 font-semibold">{receipt.portalNameTa}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{receipt.companyName}</p>
                  <p className="text-[10px] text-slate-400">GSTIN: 33AAACI1681G1Z1 | State: Tamil Nadu (33)</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-blue-900 font-mono">{receipt.invoiceNumber}</div>
                  <p className="text-[11px] text-slate-500">Booking Ref: {receipt.bookingReference}</p>
                  <p className="text-[11px] text-slate-500">Date: {receipt.date}</p>
                </div>
              </div>

              {/* Distributor & Citizen Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Authorized Agency</span>
                  <p className="font-bold text-slate-900">{receipt.distributorName}</p>
                  <p className="text-[11px] text-slate-600">Code: {receipt.distributorCode}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Citizen Details</span>
                  <p className="font-bold text-slate-900">{receipt.consumerName}</p>
                  <p className="text-[11px] text-slate-600">Consumer No: {receipt.maskedConsumerNumber}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{receipt.deliveryAddress}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Taxable Value</th>
                    <th className="py-2 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold">{receipt.itemDescription}</td>
                    <td className="py-3 text-center font-bold">1</td>
                    <td className="py-3 text-right font-mono">₹{receipt.baseAmount.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold font-mono">₹{receipt.baseAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tax & Total Calculation */}
              <div className="border-t-2 border-slate-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Base:</span>
                    <span className="font-mono">₹{receipt.baseAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (2.5%):</span>
                    <span className="font-mono">₹{receipt.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (2.5%):</span>
                    <span className="font-mono">₹{receipt.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-300 pt-2">
                    <span>Total Amount:</span>
                    <span className="font-mono text-blue-900">₹{receipt.totalAmountPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* DBTL Subsidy Footnote */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Direct Benefit Transfer (DBTL - PAHAL):</span>
                    <p className="text-[11px] text-emerald-700">
                      Subsidy of ₹{receipt.subsidyDetails.amount.toFixed(2)} credited directly to Aadhaar-linked bank account.
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono font-bold text-emerald-800">
                  {receipt.subsidyDetails.utrNumber}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                This is a computer-generated digital invoice authenticated under the Bharat Scheme Digital Governance Framework.
                <br />
                For gas leak emergencies, dial 1906 (24x7 Universal Toll-Free).
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
