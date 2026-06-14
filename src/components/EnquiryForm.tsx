import React, { useState } from 'react';
import { Lead } from '../types';
import { Building2, IndianRupee, Phone, Mail, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EnquiryFormProps {
  onAddLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
  isDark?: boolean;
}

export function EnquiryForm({ onAddLead, isDark = false }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyInterest: 'Residential Plot',
    budget: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onAddLead(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          propertyInterest: 'Residential Plot',
          budget: '',
          priority: 'Medium',
        });
      }, 3000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto styled-scrollbar">
      <div className="mb-10 text-center max-w-lg mx-auto">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border transition-colors duration-200", 
          isDark ? "bg-indigo-950/40 border-indigo-900/50" : "bg-indigo-50 border-indigo-100"
        )}>
          <Building2 className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className={cn("text-3xl font-bold tracking-tight transition-colors duration-200", isDark ? "text-slate-100" : "text-slate-800")}>New Buyer Enquiry</h1>
        <p className={cn("mt-2 text-sm leading-relaxed transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>
          Capture new lead details below. Information will be securely sent to the agent dashboard for immediate follow-up.
        </p>
      </div>

      <div className={cn("border rounded-2xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto relative overflow-hidden transition-colors duration-200", 
        isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200"
      )}>
        <AnimatePresence>
          {isSubmitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn("absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center transition-colors duration-200", 
                isDark ? "bg-[#151923]" : "bg-white"
              )}
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className={cn("text-xl font-bold mb-2 transition-colors duration-200", isDark ? "text-slate-100" : "text-slate-800")}>Lead Captured Successfully</h3>
              <p className={cn("text-sm transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>The dashboard has been updated. Agents have been notified to follow up.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text" 
                  placeholder="John Doe"
                  className={cn("w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200",
                    isDark 
                      ? "bg-[#1c2331] border-[#2a303f] text-slate-100 placeholder:text-slate-500 focus:bg-[#1e2433]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Phone Mobile</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel" 
                  placeholder="+91 99999 99999"
                  className={cn("w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200",
                    isDark 
                      ? "bg-[#1c2331] border-[#2a303f] text-slate-100 placeholder:text-slate-500 focus:bg-[#1e2433]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Email Address (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                placeholder="john@example.com"
                className={cn("w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200",
                  isDark 
                    ? "bg-[#1c2331] border-[#2a303f] text-slate-100 placeholder:text-slate-500 focus:bg-[#1e2433]" 
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Property Interest</label>
              <select 
                name="propertyInterest"
                value={formData.propertyInterest}
                onChange={handleChange}
                className={cn("w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none",
                  isDark 
                    ? "bg-[#1c2331] border-[#2a303f] text-slate-100 focus:bg-[#1e2433]" 
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                )}
              >
                <option value="Residential Plot">Residential Plot</option>
                <option value="Commercial Plot">Commercial Plot</option>
                <option value="Farm Land">Farm Land</option>
                <option value="Villa">Villa Plot</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Estimated Budget</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  required
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  type="text" 
                  placeholder="20 Lakhs"
                  className={cn("w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200",
                    isDark 
                      ? "bg-[#1c2331] border-[#2a303f] text-slate-100 placeholder:text-slate-500 focus:bg-[#1e2433]" 
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-semibold transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-700")}>Lead Priority</label>
              <select 
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={cn("w-full pl-4 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 appearance-none",
                  isDark 
                    ? "bg-[#1c2331] border-[#2a303f] text-slate-100 focus:bg-[#1e2433]" 
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                )}
              >
                <option value="High">Hot (High)</option>
                <option value="Medium">Warm (Medium)</option>
                <option value="Low">Cold (Low)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-650 text-white font-bold text-sm uppercase tracking-wide py-4 px-6 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none flex justify-center items-center gap-2"
          >
           {isSubmitting ? 'Registering...' : 'Register Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}
