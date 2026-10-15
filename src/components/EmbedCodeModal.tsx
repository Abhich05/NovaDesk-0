import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, Terminal } from 'lucide-react';
import { CompanyProfile } from '../types';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  isOpen,
  onClose,
  company,
}) => {
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState<'html' | 'react' | 'shopify'>('html');

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  const snippets = {
    html: `<!-- NovaDesk FAQ Chatbot Widget -->
<script
  src="${appUrl}/widget.js"
  data-company-name="${company.name}"
  data-primary-color="#4f46e5"
  data-position="bottom-right"
  defer>
</script>`,
    react: `// Install in React / Next.js layout:
import { useEffect } from 'react';

export default function Layout({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${appUrl}/widget.js';
    script.dataset.companyName = '${company.name}';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <>{children}</>;
}`,
    shopify: `<!-- In Shopify theme.liquid right before </body> -->
<script
  src="${appUrl}/widget.js"
  data-company-name="{{ shop.name }}"
  data-customer-email="{{ customer.email }}"
  data-position="bottom-right"
  async>
</script>`,
  };

  const currentSnippet = snippets[framework];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-sm">Website Embed Snippet</h3>
              <p className="text-2xs text-slate-400">Embed this live FAQ chatbot on any site or CMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setFramework('html')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                framework === 'html' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              HTML / Web
            </button>
            <button
              onClick={() => setFramework('react')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                framework === 'react' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              React / Next.js
            </button>
            <button
              onClick={() => setFramework('shopify')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                framework === 'shopify' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Shopify / Liquid
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{currentSnippet}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Configuration Options:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-2xs">
              <li><code>data-primary-color</code>: Hex code for launcher and user bubbles.</li>
              <li><code>data-position</code>: <code>bottom-right</code> or <code>bottom-left</code>.</li>
              <li><code>data-greeting</code>: Override bot welcome message.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
