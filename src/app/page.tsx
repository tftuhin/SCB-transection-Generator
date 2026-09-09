"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, type Vendor, type DebitAccount } from "@/lib/supabase";
import Select from "react-select";
import { Plus, Trash2, FileSpreadsheet, AlertCircle, RotateCcw, Database, CreditCard, Check, ExternalLink, Loader2, Copy, X } from "lucide-react";
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
  const [debitAccount, setDebitAccount] = useState<string>("");
  const [savedDebitAccounts, setSavedDebitAccounts] = useState<DebitAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [savingToDb, setSavingToDb] = useState(false);
  const [saveDbSuccess, setSaveDbSuccess] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch Debit Accounts from Supabase
  const loadDebitAccounts = async () => {
    if (!isSupabaseConfigured) {
      setLoadingAccounts(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("debit_accounts")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setSavedDebitAccounts(data);
        const defaultAcc = data.find((a) => a.is_default) || data[0];
        setDebitAccount(defaultAcc.account_number);
        localStorage.setItem("scb_debit_account", defaultAcc.account_number);
        setLoadingAccounts(false);
        return;
      }
    } catch (e) {
      console.error("Error loading debit accounts:", e);
    }

    // Fallback if no database accounts found
    const saved = localStorage.getItem("scb_debit_account");
    if (saved) {
      setDebitAccount(saved);
    } else if (process.env.NEXT_PUBLIC_SCB_DEBIT_ACCOUNT) {
      setDebitAccount(process.env.NEXT_PUBLIC_SCB_DEBIT_ACCOUNT);
    }
    setLoadingAccounts(false);
  };

  useEffect(() => {
    loadDebitAccounts();
  }, []);

  const handleDebitAccountChange = (val: string) => {
    setDebitAccount(val);
    localStorage.setItem("scb_debit_account", val);
  };

  // Quick save entered account to Supabase
  const handleSaveToDatabase = async () => {
    if (!debitAccount.trim()) {
      alert("Please enter a Debit Account Number to save.");
      return;
    }
    if (!isSupabaseConfigured) {
      alert("Supabase is not configured yet in .env.local.");
      return;
    }

    setSavingToDb(true);
    try {
      // If table already has accounts, unset is_default on others
      if (savedDebitAccounts.length > 0) {
        await supabase.from("debit_accounts").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { data, error } = await supabase
        .from("debit_accounts")
        .insert([{
          account_number: debitAccount.trim(),
          account_label: "Main SCB Account",
          bank_name: "Standard Chartered Bank",
          is_default: true,
        }])
        .select();

      if (error) {
        if (error.message?.includes("Could not find the table") || error.code === "42P01") {
          setShowSqlModal(true);
        } else {
          alert(`Failed to save: ${error.message}`);
        }
      } else if (data && data.length > 0) {
        setSavedDebitAccounts((prev) => [data[0], ...prev.map(a => ({ ...a, is_default: false }))]);
        setSaveDbSuccess("Saved as default in Supabase!");
        setTimeout(() => setSaveDbSuccess(null), 4000);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to save account to database";
      alert(msg);
    }
    setSavingToDb(false);
  };

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

    if (!debitAccount.trim()) {
      alert("Please enter a Debit Account Number before generating the Excel file.");
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
        "Debit Account Number(Prefix- 00 BDT)": debitAccount.trim(),
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

  const sqlSetupScript = `-- Create debit_accounts table in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS debit_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_number TEXT NOT NULL,
  account_label TEXT DEFAULT 'Main SCB Account',
  bank_name TEXT DEFAULT 'Standard Chartered Bank',
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE debit_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on debit_accounts" ON debit_accounts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on debit_accounts" ON debit_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on debit_accounts" ON debit_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on debit_accounts" ON debit_accounts FOR DELETE USING (true);

-- Seed default SCB debit account
INSERT INTO debit_accounts (account_number, account_label, bank_name, is_default)
VALUES ('${debitAccount.trim() || "YOUR_SCB_DEBIT_ACCOUNT"}', 'Main SCB Account', 'Standard Chartered Bank', true)
ON CONFLICT DO NOTHING;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSetupScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const isCurrentAccountInDb = savedDebitAccounts.some(a => a.account_number === debitAccount.trim());

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
          SCB Banking Tool
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SCB Transection Generator</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Create multiple transfer records and generate the bank Excel file.</p>
      </div>

      {/* Debit Account Card */}
      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-gray-900">
                SCB Debit Account (Sender) *
              </label>
              {loadingAccounts ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  Checking DB...
                </span>
              ) : isCurrentAccountInDb ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Synced from Database
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  Local / Unsaved
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Funding account debited for transfers. Loaded automatically from your Supabase database.
            </p>
          </div>

          <Link
            href="/debit-accounts"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <span>Manage Accounts</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Account Selector / Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {savedDebitAccounts.length > 0 ? (
            <div className="flex-1 max-w-xl">
              <select
                value={debitAccount}
                onChange={(e) => handleDebitAccountChange(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                {savedDebitAccounts.map((acc) => (
                  <option key={acc.id} value={acc.account_number}>
                    {acc.account_number} — {acc.account_label} {acc.is_default ? "★ (Default)" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1 max-w-xl flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={debitAccount}
                onChange={(e) => handleDebitAccountChange(e.target.value)}
                placeholder="e.g. 0001234567890"
                className="flex-1 px-3.5 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveToDatabase}
                disabled={savingToDb || !debitAccount.trim()}
                className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors"
                title="Save this debit account into Supabase so it auto-loads next time"
              >
                {savingToDb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>Save to Database</span>
              </button>
            </div>
          )}

          {/* If accounts exist, also allow quick-adding a new one */}
          {savedDebitAccounts.length > 0 && (
            <Link
              href="/debit-accounts"
              className="inline-flex items-center justify-center gap-1 text-xs font-medium text-gray-700 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 border px-3 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Account</span>
            </Link>
          )}
        </div>

        {/* Success message toast */}
        {saveDbSuccess && (
          <div className="mt-2.5 text-xs text-emerald-700 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveDbSuccess}</span>
          </div>
        )}
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold">Supabase connection required</p>
              <p className="mt-1">
                Configure your Supabase URL & anon key in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> to pull saved beneficiary accounts into this dropdown.
              </p>
            </div>
          </div>
          <Link
            href="/vendors"
            className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-auto"
          >
            Manage Vendors
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.id} className="p-3.5 sm:p-4 border rounded-xl bg-gray-50/70 hover:bg-gray-50 transition-colors space-y-3">
              {/* Mobile Header for this row */}
              <div className="flex items-center justify-between md:hidden pb-2 border-b border-gray-200/70">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Transfer #{index + 1}
                </span>
                <button 
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                  title="Remove Transfer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-start">
                {/* Vendor Selection */}
                <div className="sm:col-span-2 md:col-span-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Receiver *</label>
                  <Select 
                    options={vendorOptions}
                    value={vendorOptions.find(o => o.value === row.vendorId) || null}
                    onChange={(val) => handleRowChange(row.id, "vendorId", val?.value || null)}
                    placeholder="Search receiver..."
                    className="text-sm"
                    styles={{ control: (base) => ({ ...base, minHeight: '42px', borderRadius: '0.375rem' }) }}
                  />
                </div>

                {/* Amount */}
                <div className="sm:col-span-1 md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input 
                    type="number" 
                    value={row.amount}
                    onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px] text-sm" 
                    placeholder="0.00" 
                  />
                </div>

                {/* Description (Max 100 chars) */}
                <div className="sm:col-span-1 md:col-span-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description (Max 100)</label>
                  <input 
                    type="text" 
                    maxLength={100}
                    value={row.description}
                    onChange={(e) => handleRowChange(row.id, "description", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px] text-sm" 
                    placeholder="Transfer reason..." 
                  />
                </div>

                {/* Transfer Date */}
                <div className="sm:col-span-1 md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date" 
                    value={row.transferDate}
                    onChange={(e) => handleRowChange(row.id, "transferDate", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[42px] text-sm" 
                  />
                </div>

                {/* Desktop Remove Action */}
                <div className="hidden md:flex md:col-span-1 items-end self-end h-[42px] mb-0.5 justify-center">
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
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-t pt-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={addRow}
              className="flex-1 sm:flex-none flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium px-4 py-2.5 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Transfer
            </button>

            <button 
              onClick={handleReset}
              className="flex items-center justify-center text-gray-600 hover:text-red-600 font-medium px-3.5 py-2.5 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200 text-sm"
              title="Reset form and clear all entries"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset
            </button>
          </div>

          <button 
            onClick={handleGenerateExcel}
            className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm text-sm"
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Generate Excel
          </button>
        </div>
      </div>

      {/* SQL Helper Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Enable Database Debit Accounts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              To store your debit accounts centrally in Supabase, run this SQL script in your <strong>Supabase Dashboard → SQL Editor</strong>:
            </p>

            <div className="relative flex-1 overflow-hidden rounded-xl border bg-gray-950 p-4 font-mono text-xs text-gray-200">
              <pre className="overflow-x-auto max-h-64 whitespace-pre">{sqlSetupScript}</pre>
              <button
                type="button"
                onClick={copySql}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowSqlModal(false);
                  loadDebitAccounts();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
              >
                Done / Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
