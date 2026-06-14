import React from 'react';
import { Lead } from '../types';
import { cn } from '../lib/utils';
import { Building2, IndianRupee, Phone, Mail, Clock, ShieldCheck, AlertCircle, Download } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  onUpdateStatus: (id: string, status: Lead['status']) => void;
  isDark?: boolean;
}

export function Dashboard({ leads, onUpdateStatus, isDark = false }: DashboardProps) {
  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'New': return isDark ? 'bg-blue-950/40 text-blue-400 border-blue-900/50' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Contacted': return isDark ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Site Visit': return isDark ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50' : 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Booked': return isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Lost': return isDark ? 'bg-rose-950/40 text-rose-400 border-rose-900/50' : 'bg-rose-100 text-rose-700 border-rose-200';
      default: return isDark ? 'bg-slate-900/40 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Name', 'Phone', 'Email', 'Property Interest', 'Budget', 'Priority', 'Status', 'Date Registered'];
    const rows = leads.map(l => [
      l.name,
      l.phone,
      l.email || '',
      l.propertyInterest,
      l.budget,
      l.priority || '',
      l.status,
      new Date(l.timestamp).toISOString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto w-full overflow-y-auto styled-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={cn("text-2xl font-bold transition-colors duration-200", isDark ? "text-slate-150" : "text-slate-800")}>Sales Dashboard</h1>
          <p className={cn("mt-1 text-sm transition-colors duration-200", isDark ? "text-slate-450" : "text-slate-500")}>Manage leads, track statuses, and monitor updates.</p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={handleExportCSV}
            className={cn("px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 shadow-sm transition-all duration-200",
              isDark 
                ? "bg-[#1e2433] border-[#2a303f] text-slate-200 hover:bg-[#2a303f] hover:border-[#3b445a]" 
                : "bg-white border-slate-200 text-slate-705 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: leads.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'New', value: leads.filter(l => l.status === 'New').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Site Visits', value: leads.filter(l => l.status === 'Site Visit').length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Booked', value: leads.filter(l => l.status === 'Booked').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors duration-200", 
            isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200"
          )}>
            <div>
              <p className={cn("text-sm font-medium transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>{stat.label}</p>
              <p className={cn("text-3xl font-bold mt-2 transition-colors duration-200", isDark ? "text-slate-100" : "text-slate-800")}>{stat.value}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200", 
              isDark ? "bg-indigo-950/40 text-indigo-400" : stat.bg
            )}>
              <Building2 className={cn("w-6 h-6", isDark ? "text-indigo-400" : stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className={cn("border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors duration-200", 
        isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn("border-b text-xs uppercase tracking-wider transition-colors duration-200", 
                isDark ? "bg-[#1c2331]/50 border-[#1e2433] text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
              )}>
                <th className="px-6 py-4 font-semibold">Lead Contact</th>
                <th className="px-6 py-4 font-semibold">Requirement</th>
                <th className="px-6 py-4 font-semibold">Date Registered</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y transition-colors duration-200", isDark ? "divide-[#1e2433]" : "divide-slate-100")}>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertCircle className={cn("w-8 h-8 mx-auto mb-3", isDark ? "text-slate-500" : "text-slate-300")} />
                    <p className={cn("text-base font-medium", isDark ? "text-slate-300" : "text-slate-650")}>No leads found</p>
                    <p className={cn("text-sm mt-1", isDark ? "text-slate-500" : "text-slate-400")}>Start by capturing some leads in the Enquiry Form.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className={cn("transition-colors duration-200", isDark ? "hover:bg-[#1c2331]/20" : "hover:bg-slate-50/50")}>
                    <td className="px-6 py-4">
                      <div className={cn("font-medium text-sm mb-1 transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-800")}>{lead.name}</div>
                      <div className={cn("flex items-center gap-3 text-xs transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {lead.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn("text-sm font-medium mb-1 flex items-center gap-1.5 transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-700")}>
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {lead.propertyInterest}
                      </div>
                      <div className={cn("text-xs font-medium flex items-center gap-1 transition-colors duration-200", isDark ? "text-emerald-400" : "text-emerald-600")}>
                        <IndianRupee className="w-3 h-3" /> {lead.budget}
                      </div>
                    </td>
                    <td className={cn("px-6 py-4 truncate text-sm whitespace-nowrap transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(lead.timestamp).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border w-fit transition-colors duration-200", getStatusColor(lead.status))}>
                          {lead.status}
                        </span>
                        {lead.priority && (
                          <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors duration-200", 
                            lead.priority === 'High' ? (isDark ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-red-50 text-red-600 border-red-200") :
                            lead.priority === 'Medium' ? (isDark ? "bg-amber-950/40 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-600 border-amber-200") :
                            (isDark ? "bg-blue-950/40 text-blue-400 border-blue-900/50" : "bg-blue-50 text-blue-600 border-blue-200")
                          )}>
                            {lead.priority} Priority
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={lead.status}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value as Lead['status'])}
                        className={cn("text-sm border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors duration-200",
                          isDark ? "bg-[#1e2433] border-[#2a303f] text-slate-200" : "bg-white border-slate-200 text-slate-700"
                        )}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Site Visit">Site Visit</option>
                        <option value="Booked">Booked</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
