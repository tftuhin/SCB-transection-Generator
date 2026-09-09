"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, type Vendor } from "@/lib/supabase";
import Select from "react-select";
import { Plus, Trash2, FileSpreadsheet, AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { format } from "date-fns";

type TransferRow = {
  id: string;
  vendorId: string | null;
  amount: string;
  description: string;
  transferDate: string;
};

export default function GeneratorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rows, setRows] = useState<TransferRow[]>([
    { id: crypto.randomUUID(), vendorId: null, amount: "", description: "", transferDate: "" }
  ]);

  useEffect(() => {
    const fetchVendors = async () => {
      if (!isSupabaseConfigured) return;
      const { data } = await supabase.from("vendors").select("*");
      if (data) setVendors(data);
    };
    fetchVendors();
  }, []);

  const vendorOptions = vendors.map(v => ({
    value: v.id,
    label: `${v.receiver_name} - ${v.account_number} (${v.bank_name})`,
    vendor: v
  }));

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), vendorId: null, amount: "", description: "", transferDate: "" }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const handleRowChange = (id: string, field: keyof TransferRow, value: string | null) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleReset = () => {
    const hasData = rows.some(r => r.vendorId || r.amount || r.description || r.transferDate) || rows.length > 1;
    if (hasData) {
      const confirmReset = window.confirm("Are you sure you want to reset and clear all transfer entries?");
      if (!confirmReset) return;
    }
    setRows([
      { id: crypto.randomUUID(), vendorId: null, amount: "", description: "", transferDate: "" }
    ]);
  };

  const handleGenerateExcel = () => {
    // Validate rows
    const validRows = rows.filter(r => r.vendorId && r.amount && r.transferDate);
    
    if (validRows.length === 0) {
      alert("Please fill in all required fields (Vendor, Amount, Date) for at least one row.");
      return;
    }

    const excelData = validRows.map(row => {
      const vendor = vendors.find(v => v.id === row.vendorId);
      if (!vendor) return null;

      // Format date to DD/MM/YYYY
      let formattedDate = "";
      try {
        formattedDate = format(new Date(row.transferDate), "dd/MM/yyyy");
      } catch (e) {
        console.error("Invalid date", e);
      }

      return {
        "Customer Reference": "",
        "Beneficiary Name(120)": vendor.receiver_name,
        "Beneficiary Account Number": vendor.account_number,
        "Routing Number": vendor.routing_number,
        "Payment Amount": row.amount,
        "Reason(140)": row.description,
        "Date(DD/MM/YYYY)": formattedDate,
        "Debit Account Number(Prefix- 00 BDT)": "0000000000000",
        "Beneficiary Email ID(Optional)": ""
      };
    }).filter(Boolean);

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");
    
    // Generate and download
    const fileName = `SCB_Transfers_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
          SCB Banking Tool
        </div>
        <h1 className="text-3xl font-bold text-gray-900">SCB Transection Generator</h1>
        <p className="text-gray-500 mt-2">Create multiple transfer records and generate the bank Excel file.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Supabase connection required</p>
              <p className="mt-1">
                Configure your Supabase URL & anon key in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> to pull saved beneficiary accounts into this dropdown.
              </p>
            </div>
          </div>
          <Link
            href="/vendors"
            className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg whitespace-nowrap"
          >
            Manage Vendors
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-wrap md:flex-nowrap items-start gap-4 p-4 border rounded-lg bg-gray-50">
              
              {/* Vendor Selection */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Receiver *</label>
                <Select 
                  options={vendorOptions}
                  value={vendorOptions.find(o => o.value === row.vendorId) || null}
                  onChange={(val) => handleRowChange(row.id, "vendorId", val?.value || null)}
                  placeholder="Search receiver..."
                  className="text-sm"
                  styles={{ control: (base) => ({ ...base, minHeight: '42px' }) }}
                />
              </div>

              {/* Amount */}
              <div className="w-full md:w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input 
                  type="number" 
                  value={row.amount}
                  onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px]" 
                  placeholder="0.00" 
                />
              </div>

              {/* Description (Max 100 chars) */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Max 100)</label>
                <input 
                  type="text" 
                  maxLength={100}
                  value={row.description}
                  onChange={(e) => handleRowChange(row.id, "description", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px]" 
                  placeholder="Transfer reason..." 
                />
              </div>

              {/* Transfer Date */}
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input 
                  type="date" 
                  value={row.transferDate}
                  onChange={(e) => handleRowChange(row.id, "transferDate", e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px]" 
                />
              </div>

              {/* Remove Action */}
              <div className="flex items-end self-end h-[42px] mb-1">
                <button 
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Remove Row"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={addRow}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Transfer
            </button>

            <button 
              onClick={handleReset}
              className="flex items-center text-gray-600 hover:text-red-600 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
              title="Reset form and clear all entries"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>

          <button 
            onClick={handleGenerateExcel}
            className="flex items-center bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Generate Excel
          </button>
        </div>
      </div>
    </div>
  );
}
