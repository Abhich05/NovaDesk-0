import React, { useState } from 'react';
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  ExternalLink,
  MessageCircle,
  Sparkles,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { CompanyProfile } from '../types';

interface StoreMockupProps {
  company: CompanyProfile;
  onOpenWidget: (initialPrompt?: string) => void;
  isWidgetOpen: boolean;
}

export const StoreMockup: React.FC<StoreMockupProps> = ({
  company,
  onOpenWidget,
  isWidgetOpen,
}) => {
  return (
    <div className="bg-slate-100 rounded-3xl border border-slate-200/80 overflow-hidden shadow-inner relative">
      {/* Browser Chrome Simulation */}
      <div className="bg-slate-200/80 px-4 py-2.5 border-b border-slate-300/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="bg-white/80 text-2xs text-slate-500 font-mono px-6 py-1 rounded-full border border-slate-300/60 max-w-sm truncate text-center shadow-2xs">
          https://{company.name.toLowerCase().replace(/\s+/g, '')}.com/store
        </div>
        <div className="text-2xs text-slate-500 font-medium">Customer View Simulation</div>
      </div>

      {/* Simulated Store Page Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900">{company.name}</h1>
            <p className="text-2xs text-slate-500">{company.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="hidden md:inline cursor-pointer hover:text-indigo-600">Catalog</span>
          <span className="hidden md:inline cursor-pointer hover:text-indigo-600">Sustainability</span>
          <span className="hidden md:inline cursor-pointer hover:text-indigo-600">Track Order</span>
          <button
            onClick={() => onOpenWidget()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support Chat</span>
          </button>
        </div>
      </div>

      {/* Simulated Hero Banner */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="max-w-md space-y-3 relative z-10">
            <span className="text-2xs font-semibold tracking-wider uppercase text-indigo-300">
              Spring 2026 Collection
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Curated Essentials for Conscious Living
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Handcrafted with sustainable organic materials, lifetime craftsmanship guarantee, and carbon-neutral express delivery.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onOpenWidget('What are your delivery times and shipping rates?')}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Ask About Shipping
              </button>
              <button
                onClick={() => onOpenWidget('What is your return policy and guarantee window?')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Check Return Guarantee
              </button>
            </div>
          </div>
        </div>

        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => onOpenWidget('What are the delivery times and shipping rates?')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">Free Shipping $50+</h3>
              <p className="text-2xs text-slate-500">Fast 2-4 business day delivery</p>
            </div>
          </div>

          <div
            onClick={() => onOpenWidget('What is your return policy and guarantee window?')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">30-Day Easy Returns</h3>
              <p className="text-2xs text-slate-500">Prepaid shipping labels provided</p>
            </div>
          </div>

          <div
            onClick={() => onOpenWidget('Do your products come with a warranty?')}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-800">2-Year Full Warranty</h3>
              <p className="text-2xs text-slate-500">100% manufacturer protection</p>
            </div>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Featured Customer Favorites
            </h3>
            <span className="text-2xs text-slate-400">Click any product to simulate customer questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Aura Organic Linen Duvet Set',
                price: '$129.00',
                tag: '100% GOTS Cotton',
                question: 'Are your materials sustainably sourced and eco-friendly?',
              },
              {
                title: 'Nordic Oak Floating Desk Lamp',
                price: '$89.00',
                tag: 'FSC Certified Oak',
                question: 'Do your products come with a warranty?',
              },
              {
                title: 'Minimalist Ceramic Pour-over Kit',
                price: '$45.00',
                tag: 'Hand-glazed Stone',
                question: 'What should I do if an item arrives damaged or defective?',
              },
            ].map((prod, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2 hover:shadow-xs transition-shadow"
              >
                <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <div className="flex items-center justify-between text-2xs text-indigo-600 font-medium">
                  <span>{prod.tag}</span>
                  <span className="text-slate-900 font-bold">{prod.price}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 leading-snug">{prod.title}</h4>
                <button
                  onClick={() => onOpenWidget(prod.question)}
                  className="w-full mt-2 py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-2xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>Ask Bot About This Item</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
