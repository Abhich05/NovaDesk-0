import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  FileText,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { SupportTicket } from '../types';

interface TicketManagerProps {
  tickets: SupportTicket[];
  onUpdateTicketStatus: (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => void;
}

export const TicketManager: React.FC<TicketManagerProps> = ({
  tickets,
  onUpdateTicketStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(tickets[0] || null);

  const filtered = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const priorityColors = {
    urgent: 'text-rose-600 bg-rose-50 border-rose-200',
    high: 'text-amber-600 bg-amber-50 border-amber-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200',
    low: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  const statusColors = {
    open: 'text-amber-700 bg-amber-100/70',
    in_progress: 'text-indigo-700 bg-indigo-100/70',
    resolved: 'text-emerald-700 bg-emerald-100/70',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Escalation Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Support tickets created when customer inquiries cannot be resolved via automated FAQs or require agent intervention.
          </p>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="block text-2xs uppercase text-slate-600 font-semibold">Open</span>
            <span className="text-sm font-bold text-amber-600">{openCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="block text-2xs uppercase text-slate-600 font-semibold">In Progress</span>
            <span className="text-sm font-bold text-indigo-600">{inProgressCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
            <span className="block text-2xs uppercase text-slate-600 font-semibold">Resolved</span>
            <span className="text-sm font-bold text-emerald-600">{resolvedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setFilterStatus('open')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterStatus === 'open'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Open ({openCount})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterStatus === 'in_progress'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          onClick={() => setFilterStatus('resolved')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            filterStatus === 'resolved'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Split view: List on left, details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No tickets match this filter.</p>
            </div>
          ) : (
            filtered.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {ticket.id}
                    </span>
                    <span
                      className={`text-2xs font-medium uppercase px-2 py-0.5 rounded-full ${
                        statusColors[ticket.status]
                      }`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {ticket.subject}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {ticket.summary}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-2xs text-slate-400">
                    <span className="font-medium text-slate-600">{ticket.customerName}</span>
                    <span className="capitalize text-amber-600 font-semibold">{ticket.priority} Priority</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Detail Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {selectedTicket.id}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{selectedTicket.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedTicket.subject}
                  </h3>
                </div>

                {/* Status action toggle */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'open' | 'in_progress' | 'resolved';
                      onUpdateTicketStatus(selectedTicket.id, newStatus);
                      setSelectedTicket({ ...selectedTicket, status: newStatus });
                    }}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Customer Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs">
                <div className="space-y-1">
                  <span className="text-slate-600 font-medium block">Customer</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedTicket.customerName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-600 font-medium block">Contact Email</span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{selectedTicket.customerEmail}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-600 font-medium block">Priority Level</span>
                  <span className={`inline-block font-semibold capitalize px-2 py-0.5 rounded border text-2xs ${priorityColors[selectedTicket.priority]}`}>
                    {selectedTicket.priority} Priority
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-600 font-medium block">Created Date</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Summary Statement */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Issue Summary</h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed">
                  {selectedTicket.summary}
                </div>
              </div>

              {/* Chat Excerpt */}
              {selectedTicket.chatExcerpt && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-1.5">
                    Live Chat Excerpt at Escalation
                  </h4>
                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedTicket.chatExcerpt}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Customer will receive email notification on resolution
                </span>

                {selectedTicket.status !== 'resolved' ? (
                  <button
                    onClick={() => {
                      onUpdateTicketStatus(selectedTicket.id, 'resolved');
                      setSelectedTicket({ ...selectedTicket, status: 'resolved' });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ticket Resolved</span>
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Select a ticket from the left column to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
