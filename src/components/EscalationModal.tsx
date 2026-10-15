import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SupportTicket, CompanyProfile } from '../types';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    customerName: string;
    customerEmail: string;
    subject: string;
    summary: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
  }) => Promise<SupportTicket | null>;
  company: CompanyProfile;
  prefillSubject?: string;
  prefillSummary?: string;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  company,
  prefillSubject = '',
  prefillSummary = '',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(prefillSubject || 'Need assistance with order/account');
  const [summary, setSummary] = useState(prefillSummary || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('Orders & Shipping');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !subject.trim()) {
      setError('Please provide your email address and ticket topic.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const ticket = await onSubmit({
        customerName: name.trim() || 'Guest Customer',
        customerEmail: email.trim(),
        subject: subject.trim(),
        summary: summary.trim() || subject.trim(),
        priority,
        category,
      });

      if (ticket) {
        setCreatedTicket(ticket);
      } else {
        setError('Failed to submit ticket. Please check your network and try again.');
      }
    } catch {
      setError('An unexpected error occurred while reaching the ticket server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCreatedTicket(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Escalate to Customer Care Specialist</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {company.name} Support Team · Average human response within 15 min
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdTicket ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Support Ticket Created!</h4>
              <p className="text-sm text-slate-600 mt-1">
                Your ticket has been assigned to a customer support specialist.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 text-xs text-slate-700">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Ticket ID</span>
                <span className="font-mono font-semibold text-indigo-600">{createdTicket.id}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Notification Sent To</span>
                <span className="font-medium">{createdTicket.customerEmail}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Priority</span>
                <span className="capitalize font-semibold text-amber-600">{createdTicket.priority}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block mb-1">Subject</span>
                <p className="font-medium text-slate-900">{createdTicket.subject}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Return to Chat
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="Orders & Shipping">Orders & Shipping</option>
                  <option value="Returns & Refunds">Returns & Refunds</option>
                  <option value="Billing & Account">Billing & Account</option>
                  <option value="Products & Services">Products & Services</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="low">Low (General guidance)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Time sensitive)</option>
                  <option value="urgent">Urgent (Immediate delivery issue)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Issue Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of what you need help with"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Notes / Details
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Include order numbers, tracking IDs, or details if available..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>We encrypt all customer ticket requests and will reply to your email.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="py-2 px-4 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors shadow-xs"
              >
                {submitting ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Care Team</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
