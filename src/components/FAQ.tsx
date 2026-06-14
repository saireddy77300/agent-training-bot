import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const faqs: FAQItemProps[] = [
  {
    question: "What is the plot booking process?",
    answer: "To book a plot, the customer must pay a token advance of Rs. 1,00,000. The remaining 20% of the plot value must be paid within 15 days as the allotment amount. Registration will be done only after 100% payment is cleared."
  },
  {
    question: "What is the cancellation and refund policy?",
    answer: "If a booking is cancelled within 7 days, 100% of the token advance is refunded. If cancelled after 7 days but before 15 days, a 10% cancellation charge applies to the advance. Refunds will be processed within 14 working days via bank transfer."
  },
  {
    question: "How should leads be managed?",
    answer: "Hot Leads must be contacted within 2 hours with an immediate site visit scheduled. Warm Leads must be followed up within 24 hours with project brochures via WhatsApp. Cold Leads should be followed up once a week with project updates."
  },
  {
    question: "What are the site visit guidelines?",
    answer: "Always confirm the site visit 1 hour before the scheduled time. Share your live location with the customer when you start. Carry hard copies of the project layout and price sheet."
  }
];

export function FAQ({ isDark = false }: { isDark?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto w-full overflow-y-auto styled-scrollbar">
      <div className="mb-10 text-center max-w-lg mx-auto">
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border transition-colors duration-200", 
          isDark ? "bg-indigo-950/40 border-indigo-900/50" : "bg-indigo-50 border-indigo-100"
        )}>
          <HelpCircle className="w-8 h-8 text-indigo-500" />
        </div>
        <h1 className={cn("text-3xl font-bold tracking-tight transition-colors duration-200", isDark ? "text-slate-100" : "text-slate-800")}>Frequently Asked Questions</h1>
        <p className={cn("mt-2 text-sm leading-relaxed transition-colors duration-200", isDark ? "text-slate-400" : "text-slate-500")}>
          Quick reference for company policies, guidelines, and booking processes.
        </p>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto pb-12">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={cn("border rounded-2xl overflow-hidden shadow-sm transition-all duration-200", 
              isDark ? "bg-[#151923] border-[#1e2433]" : "bg-white border-slate-200"
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className={cn("w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none transition-colors duration-200", 
                isDark ? "hover:bg-[#1c2331]/30" : "hover:bg-slate-50"
              )}
            >
              <span className={cn("font-semibold text-base transition-colors duration-200", isDark ? "text-slate-200" : "text-slate-800")}>{faq.question}</span>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 shadow-sm border",
                openIndex === index 
                  ? "bg-indigo-600 text-white border-indigo-600 rotate-180" 
                  : (isDark ? "bg-[#1e2433] text-slate-400 border-[#2a303f]" : "bg-white text-slate-400 border-slate-200")
              )}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className={cn("px-6 py-5 border-t transition-colors duration-200", 
                    isDark ? "border-[#1e2433] bg-[#1a1e2b]/30" : "border-slate-100 bg-slate-50/50"
                  )}>
                    <p className={cn("leading-relaxed text-sm transition-colors duration-200", isDark ? "text-slate-350" : "text-slate-650")}>
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
