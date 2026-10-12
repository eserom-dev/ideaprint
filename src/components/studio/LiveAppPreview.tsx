'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Terminal,
  Sparkles,
  ChevronDown,
  Check,
  AlertCircle,
  Code2,
} from 'lucide-react';

export interface LiveAppPreviewProps {
  projectName: string;
  projectDescription: string;
  entities?: any[];
  endpoints?: any[];
  requirements?: any[];
  files?: Array<{ path: string; description: string; language: string; content: string }>;
  selectedStack?: string;
  onCodeRegenerate?: (prompt?: string) => void;
  isGenerating?: boolean;
}

interface ConsoleEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'network' | 'action' | 'warn';
  message: string;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({
  projectName,
  projectDescription,
  entities = [],
  endpoints = [],
  requirements = [],
  files = [],
  selectedStack = 'Next.js 14 App Router + Tailwind CSS',
  onCodeRegenerate,
  isGenerating = false,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEvent[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen to postMessages from inside the sandbox iframe for live console telemetry
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'ideaprint-sandbox') {
        const newLog: ConsoleEvent = {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          type: event.data.type || 'info',
          message: event.data.message,
        };
        setConsoleLogs((prev) => [newLog, ...prev.slice(0, 49)]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check if a direct runnable HTML file exists in generated files
  const explicitHtmlFile = useMemo(() => {
    return files.find(
      (f) =>
        f.path.toLowerCase().endsWith('preview/index.html') ||
        f.path.toLowerCase() === 'index.html' ||
        f.path.toLowerCase() === 'public/index.html'
    );
  }, [files]);

  // Check if React page.tsx exists
  const reactPageFile = useMemo(() => {
    return files.find(
      (f) =>
        f.path.toLowerCase().includes('page.tsx') ||
        f.path.toLowerCase().includes('page.jsx') ||
        f.path.toLowerCase().includes('app.tsx')
    );
  }, [files]);

  // Construct the complete, self-contained, interactive sandbox HTML
  const sandboxHtml = useMemo(() => {
    // If the AI generated an explicit runnable preview HTML file, use it
    if (explicitHtmlFile && explicitHtmlFile.content.includes('<html') || explicitHtmlFile?.content.includes('<!DOCTYPE')) {
      // Inject the postMessage telemetry bridge if not already present
      return explicitHtmlFile.content;
    }

    // Determine application domain / niche
    const normalizedName = projectName.toLowerCase();
    const normalizedDesc = projectDescription.toLowerCase();
    const isEcommerce =
      normalizedName.includes('ecom') ||
      normalizedName.includes('shop') ||
      normalizedName.includes('store') ||
      normalizedName.includes('market') ||
      normalizedName.includes('cart') ||
      normalizedDesc.includes('product') ||
      normalizedDesc.includes('checkout') ||
      normalizedDesc.includes('buy') ||
      normalizedDesc.includes('sell');

    const appTitle = projectName || 'Ideaprint Application';

    // Build the high-fidelity interactive application
    return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#fff7ed',
              100: '#ffedd5',
              400: '#fb923c',
              500: '#f97316',
              600: '#ea580c',
              700: '#c2410c',
            },
            accent: {
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
            }
          }
        }
      }
    }

    function emitLog(type, message) {
      if (window.parent) {
        window.parent.postMessage({ source: 'ideaprint-sandbox', type, message }, '*');
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.2); border-radius: 999px; }
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Announcement Bar -->
  <aside class="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-600 text-slate-950 text-[11px] font-bold py-1.5 px-4 text-center tracking-wide uppercase shadow-sm">
    <span>⚡ SPECIAL LAUNCH OFFER · FREE EXPRESS SHIPPING ON ALL ORDERS · USE CODE <span class="bg-slate-950 text-brand-400 px-1.5 py-0.5 rounded font-mono">IDEAPRINT</span> FOR 15% OFF</span>
  </aside>

  <!-- Sticky Main Navigation -->
  <header class="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 cursor-pointer" onclick="resetFilters()">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-extrabold text-sm tracking-tighter">
          ${appTitle.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <span class="text-base font-extrabold tracking-tight text-white block leading-tight">${appTitle}</span>
          <span class="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Production Storefront
          </span>
        </div>
      </div>

      <!-- Live Search Bar -->
      <div class="hidden md:flex flex-1 max-w-md mx-6">
        <div class="relative w-full">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            id="searchInput"
            type="text"
            placeholder="Search items, audio, wearables, accessories..."
            oninput="handleSearch(this.value)"
            class="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-sans"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3">
        <!-- Add Product Button (Vendor Portal) -->
        <button
          onclick="openAddProductModal()"
          class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
        >
          <i data-lucide="plus-circle" class="w-4 h-4 text-brand-400"></i>
          <span>Add Product</span>
        </button>

        <!-- Shopping Cart Trigger -->
        <button
          id="cartBtn"
          onclick="toggleCartDrawer()"
          class="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <i data-lucide="shopping-bag" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Cart</span>
          <span id="cartBadge" class="w-5 h-5 rounded-full bg-slate-950 text-white font-mono text-[10px] font-extrabold flex items-center justify-center">0</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 px-4 sm:px-8">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
    <div class="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="max-w-2xl space-y-4 text-center md:text-left">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-mono text-xs font-bold uppercase tracking-wider">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Curated Limited Release
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Next-Gen Hardware & Lifestyle Gear.
        </h1>
        <p class="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
          ${projectDescription || 'Designed for developers, creators, and modern teams. Built with precision, guaranteed durability, and instant checkout.'}
        </p>

        <!-- Value Badges -->
        <div class="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono text-slate-400">
          <div class="flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i> Verified Stripe Checkout</div>
          <div class="flex items-center gap-1.5"><i data-lucide="truck" class="w-4 h-4 text-brand-400"></i> Free Global Delivery</div>
          <div class="flex items-center gap-1.5"><i data-lucide="refresh-cw" class="w-4 h-4 text-accent-400"></i> 30-Day Free Returns</div>
        </div>
      </div>

      <!-- Quick Metrics Pill -->
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Live Products</div>
          <div id="productCountHeader" class="text-2xl font-black text-white">8</div>
          <div class="text-[10px] text-emerald-400 font-semibold">● In Stock Ready</div>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Average Rating</div>
          <div class="text-2xl font-black text-amber-400">4.9 ★</div>
          <div class="text-[10px] text-slate-400 font-mono">1,240+ Verified Reviews</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Filter & Catalog Controls -->
  <main class="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <!-- Category Tabs -->
      <div class="flex flex-wrap items-center gap-2" id="categoryTabs">
        <button onclick="setCategory('all')" class="cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20" data-cat="all">All Items</button>
        <button onclick="setCategory('audio')" class="cat-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" data-cat="audio">Audio & Tech</button>
        <button onclick="setCategory('wearables')" class="cat-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" data-cat="wearables">Wearables</button>
        <button onclick="setCategory('lifestyle')" class="cat-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" data-cat="lifestyle">Carry & Lifestyle</button>
        <button onclick="setCategory('accessories')" class="cat-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800" data-cat="accessories">Accessories</button>
      </div>

      <!-- Sorting & View Controls -->
      <div class="flex items-center gap-3">
        <label class="text-xs font-mono text-slate-400">Sort By:</label>
        <select id="sortSelect" onchange="handleSort(this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500 font-sans cursor-pointer">
          <option value="featured">Featured Picks</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>

    <!-- Product Grid -->
    <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Injected via JavaScript -->
    </div>

    <!-- Empty State (if search yields 0 items) -->
    <div id="emptyCatalog" class="hidden text-center py-16 space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
        <i data-lucide="package-search" class="w-6 h-6"></i>
      </div>
      <h3 class="text-base font-bold text-white">No products found</h3>
      <p class="text-xs text-slate-400">Try tweaking your search query or switching categories.</p>
      <button onclick="resetFilters()" class="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs">Reset All Filters</button>
    </div>
  </main>

  <!-- Slide-Over Shopping Cart Drawer -->
  <div id="cartDrawer" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex justify-end transition-opacity">
    <div class="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl relative animate-slideLeft">
      <!-- Drawer Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div class="flex items-center gap-2">
          <i data-lucide="shopping-bag" class="w-5 h-5 text-brand-400"></i>
          <h2 class="text-lg font-bold text-white">Your Shopping Cart</h2>
        </div>
        <button onclick="toggleCartDrawer()" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Cart Items List -->
      <div id="cartItemsList" class="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
        <!-- Dynamic Cart Items -->
      </div>

      <!-- Drawer Footer with Subtotal, Coupon & Checkout -->
      <div class="border-t border-slate-800 pt-4 space-y-4">
        <!-- Coupon Code Bar -->
        <div class="flex gap-2">
          <input
            id="couponInput"
            type="text"
            placeholder="Discount code (try IDEAPRINT)"
            class="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            onclick="applyCoupon()"
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono transition-colors"
          >
            Apply
          </button>
        </div>
        <div id="couponStatus" class="text-[11px] font-mono hidden"></div>

        <!-- Calculated Summary -->
        <div class="space-y-1.5 text-xs font-mono text-slate-300">
          <div class="flex justify-between">
            <span class="text-slate-400">Subtotal:</span>
            <span id="cartSubtotal" class="font-bold text-white">$0.00</span>
          </div>
          <div id="discountRow" class="flex justify-between text-emerald-400 hidden">
            <span>Promo Discount (15%):</span>
            <span id="cartDiscount">-$0.00</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Estimated Shipping:</span>
            <span id="cartShipping" class="font-bold text-emerald-400">FREE</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
            <span>Total Amount:</span>
            <span id="cartTotal" class="text-brand-400 text-base font-extrabold">$0.00</span>
          </div>
        </div>

        <!-- Checkout Action Button -->
        <button
          id="checkoutBtn"
          onclick="openCheckoutModal()"
          class="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <i data-lucide="lock" class="w-4 h-4"></i>
          <span>Secure Checkout</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Interactive Multi-Step Checkout Modal -->
  <div id="checkoutModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scroll">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Instant Checkout</h2>
            <p class="text-[11px] font-mono text-slate-400">256-Bit SSL Encrypted Transaction</p>
          </div>
        </div>
        <button onclick="closeCheckoutModal()" class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Checkout Form Body -->
      <form id="checkoutForm" onsubmit="handleProcessOrder(event)" class="space-y-4 text-xs font-sans">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="font-mono text-slate-300 uppercase text-[10px]">First Name *</label>
            <input required type="text" value="Jane" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
          <div class="space-y-1">
            <label class="font-mono text-slate-300 uppercase text-[10px]">Last Name *</label>
            <input required type="text" value="Developer" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="font-mono text-slate-300 uppercase text-[10px]">Email Address (for Receipt) *</label>
          <input required type="email" value="jane@company.com" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
        </div>

        <div class="space-y-1">
          <label class="font-mono text-slate-300 uppercase text-[10px]">Shipping Address *</label>
          <input required type="text" value="100 Innovation Way, Suite 400" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="space-y-1">
            <label class="font-mono text-slate-300 uppercase text-[10px]">City *</label>
            <input required type="text" value="San Francisco" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
          <div class="space-y-1">
            <label class="font-mono text-slate-300 uppercase text-[10px]">State *</label>
            <input required type="text" value="CA" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
          <div class="space-y-1">
            <label class="font-mono text-slate-300 uppercase text-[10px]">ZIP Code *</label>
            <input required type="text" value="94107" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
        </div>

        <!-- Payment Selection -->
        <div class="pt-2 space-y-2">
          <label class="font-mono text-slate-300 uppercase text-[10px]">Payment Method</label>
          <div class="grid grid-cols-3 gap-2">
            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-brand-500 bg-brand-500/10 cursor-pointer">
              <input type="radio" name="payment" checked class="text-brand-500" />
              <span class="font-bold text-white">Credit Card</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
              <input type="radio" name="payment" class="text-brand-500" />
              <span class="text-slate-300">Apple Pay</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
              <input type="radio" name="payment" class="text-brand-500" />
              <span class="text-slate-300">PayPal</span>
            </label>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
          <div class="flex justify-between text-slate-400">
            <span>Total Payable:</span>
            <span id="modalCheckoutTotal" class="text-white font-bold">$0.00</span>
          </div>
        </div>

        <button
          type="submit"
          id="confirmOrderBtn"
          class="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition-all"
        >
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>Confirm & Pay Now</span>
        </button>
      </form>

      <!-- Order Confirmation View (Shown on Success) -->
      <div id="orderSuccessView" class="hidden text-center py-8 space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl animate-bounce">
          ✓
        </div>
        <h3 class="text-2xl font-black text-white">Order Confirmed!</h3>
        <p class="text-xs text-slate-300 max-w-md mx-auto">
          Thank you for your purchase. We have dispatched a confirmation email with tracking information to your inbox.
        </p>
        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 max-w-sm mx-auto text-left">
          <div class="flex justify-between text-slate-400"><span>Order ID:</span> <span id="confirmedOrderId" class="text-brand-400 font-bold">ORD-98214</span></div>
          <div class="flex justify-between text-slate-400"><span>Status:</span> <span class="text-emerald-400">Payment Processed</span></div>
          <div class="flex justify-between text-slate-400"><span>Est. Delivery:</span> <span class="text-white">2 Business Days</span></div>
        </div>
        <button onclick="finishOrderAndReset()" class="px-6 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs">
          Continue Shopping
        </button>
      </div>
    </div>
  </div>

  <!-- Quick View Product Modal -->
  <div id="quickViewModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scroll">
      <button onclick="closeQuickView()" class="absolute right-5 top-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div id="quickViewContent" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <!-- Injected via JavaScript -->
      </div>
    </div>
  </div>

  <!-- Add Product / Inventory Modal -->
  <div id="addProductModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 class="text-lg font-bold text-white">Add New Product to Store</h2>
        <button onclick="closeAddProductModal()" class="p-1 rounded-lg text-slate-400 hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <form onsubmit="handleSaveNewProduct(event)" class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 uppercase font-mono text-[10px] mb-1">Product Title *</label>
          <input id="newProdTitle" required type="text" placeholder="e.g. Ergonomic Keyboard" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 uppercase font-mono text-[10px] mb-1">Category</label>
            <select id="newProdCat" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="audio">Audio & Tech</option>
              <option value="wearables">Wearables</option>
              <option value="lifestyle">Carry & Lifestyle</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-400 uppercase font-mono text-[10px] mb-1">Price ($) *</label>
            <input id="newProdPrice" required type="number" step="0.01" value="89.99" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500" />
          </div>
        </div>
        <div>
          <label class="block text-slate-400 uppercase font-mono text-[10px] mb-1">Description</label>
          <textarea id="newProdDesc" rows="2" placeholder="Brief feature summary..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500"></textarea>
        </div>
        <div>
          <label class="block text-slate-400 uppercase font-mono text-[10px] mb-1">Image URL</label>
          <input id="newProdImage" type="url" value="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px]" />
        </div>
        <button type="submit" class="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs transition-colors">
          Publish Product to Storefront
        </button>
      </form>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toastContainer" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Application Logic & State Engine -->
  <script>
    // Initial Catalog Data with High-Res Imagery
    let products = [
      {
        id: 'PRD-001',
        title: 'Acoustic Ultra Wireless Headphones',
        category: 'audio',
        price: 249.99,
        rating: 4.9,
        reviewsCount: 384,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        badge: 'Best Seller',
        inStock: true,
        description: 'Active Noise Cancelling over-ear headphones with 40mm beryllium drivers, 36hr battery, and spatial audio.'
      },
      {
        id: 'PRD-002',
        title: 'Chronos Sapphire Smartwatch',
        category: 'wearables',
        price: 189.00,
        rating: 4.8,
        reviewsCount: 219,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        badge: 'New Release',
        inStock: true,
        description: 'Titanium chassis with sapphire glass, 14-day battery life, continuous ECG, and 50m water resistance.'
      },
      {
        id: 'PRD-003',
        title: 'Ceramic Pour-Over Coffee Station',
        category: 'lifestyle',
        price: 64.50,
        rating: 5.0,
        reviewsCount: 92,
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80',
        badge: 'Staff Pick',
        inStock: true,
        description: 'Hand-crafted matte ceramic dripper with dual-wall borosilicate glass carafe and heat-resistant silicone collar.'
      },
      {
        id: 'PRD-004',
        title: 'Urban Waterproof Roll-Top Backpack',
        category: 'lifestyle',
        price: 135.00,
        rating: 4.9,
        reviewsCount: 148,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
        badge: 'Waterproof',
        inStock: true,
        description: 'Cordura 1000D ballistic nylon with magnetic Fidlock buckles, dedicated 16-inch laptop cocoon, and ergonomic straps.'
      },
      {
        id: 'PRD-005',
        title: 'Titanium Mechanical Studio Keyboard',
        category: 'audio',
        price: 210.00,
        rating: 4.9,
        reviewsCount: 180,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
        badge: 'Pro Tier',
        inStock: true,
        description: 'Gasket-mounted hot-swappable mechanical keyboard with lubricated tactile switches and custom PBT keycaps.'
      },
      {
        id: 'PRD-006',
        title: 'Ergonomic Merino Wool Desk Mat',
        category: 'accessories',
        price: 48.00,
        rating: 4.7,
        reviewsCount: 112,
        image: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&q=80',
        badge: 'Natural Fiber',
        inStock: true,
        description: '100% natural Bavarian merino wool felt with non-slip cork base. Provides wrist cushion and acoustic damping.'
      },
      {
        id: 'PRD-007',
        title: 'MagSafe Aluminum Fast Charging Dock',
        category: 'accessories',
        price: 79.99,
        rating: 4.8,
        reviewsCount: 76,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80',
        badge: '15W Fast Charge',
        inStock: true,
        description: 'Anodized aerospace aluminum with weighted anti-tipping base and 15W Qi2 certified simultaneous charging.'
      },
      {
        id: 'PRD-008',
        title: 'Precision CNC Machined Pen & Stand',
        category: 'accessories',
        price: 52.00,
        rating: 4.9,
        reviewsCount: 65,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80',
        badge: 'Solid Brass',
        inStock: true,
        description: 'Solid brass body machined to 0.01mm tolerances with Schmidt EasyFlow 9000 German refill and monolithic magnetic base.'
      }
    ];

    let cart = [];
    let activeCategory = 'all';
    let searchQuery = '';
    let sortMode = 'featured';
    let discountPercent = 0;

    // Render Product Catalog
    function renderCatalog() {
      const grid = document.getElementById('productGrid');
      const empty = document.getElementById('emptyCatalog');
      if (!grid) return;

      let filtered = products.filter(p => {
        const matchesCat = activeCategory === 'all' || p.category === activeCategory;
        const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
      });

      if (sortMode === 'price-asc') filtered.sort((a, b) => a.price - b.price);
      else if (sortMode === 'price-desc') filtered.sort((a, b) => b.price - a.price);
      else if (sortMode === 'rating') filtered.sort((a, b) => b.rating - a.rating);

      const countHeader = document.getElementById('productCountHeader');
      if (countHeader) countHeader.innerText = filtered.length;

      if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
        return;
      }

      if (empty) empty.classList.add('hidden');

      grid.innerHTML = filtered.map(item => \`
        <div class="group rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-brand-500/10 hover:-translate-y-1">
          <!-- Thumbnail & Badges -->
          <div class="relative h-52 bg-slate-950 overflow-hidden cursor-pointer" onclick="openQuickView('\${item.id}')">
            <img src="\${item.image}" alt="\${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span class="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-brand-400 font-mono text-[10px] font-bold uppercase border border-brand-500/30">\${item.badge}</span>
            </div>
            <button onclick="event.stopPropagation(); openQuickView('\${item.id}')" class="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/90 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> Quick View
            </button>
          </div>

          <!-- Product Details -->
          <div class="p-5 flex flex-col flex-1">
            <div class="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
              <span class="uppercase tracking-wider text-[10px] text-brand-400 font-bold">\${item.category}</span>
              <span class="text-amber-400 flex items-center gap-0.5">★ \${item.rating} (\${item.reviewsCount})</span>
            </div>
            <h3 class="text-sm font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 mb-1.5 cursor-pointer" onclick="openQuickView('\${item.id}')">
              \${item.title}
            </h3>
            <p class="text-xs text-slate-400 font-normal line-clamp-2 mb-4 flex-1">
              \${item.description}
            </p>

            <!-- Price & Add Button -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-auto">
              <div>
                <span class="text-lg font-black text-white font-mono">$\${item.price.toFixed(2)}</span>
              </div>
              <button
                onclick="addToCart('\${item.id}')"
                class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-brand-500 text-white hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
              </button>
            </div>
          </div>
        </div>
      \`).join('');

      if (window.lucide) window.lucide.createIcons();
    }

    // Add To Cart Functionality
    function addToCart(productId) {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      const existing = cart.find(c => c.id === productId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...prod, quantity: 1 });
      }

      updateCartUI();
      showToast(\`Added "\${prod.title}" to cart\`);
      emitLog('action', \`User added item "\${prod.title}" ($` + `\${prod.price}) to cart. Total items: \${cart.reduce((s,i)=>s+i.quantity,0)}\`);
    }

    function updateCartQuantity(productId, delta) {
      const item = cart.find(c => c.id === productId);
      if (!item) return;

      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(c => c.id !== productId);
        showToast(\`Removed item from cart\`);
      }

      updateCartUI();
    }

    function removeCartItem(productId) {
      cart = cart.filter(c => c.id !== productId);
      updateCartUI();
      showToast('Item removed from cart');
    }

    function updateCartUI() {
      const badge = document.getElementById('cartBadge');
      const list = document.getElementById('cartItemsList');
      const subtotalEl = document.getElementById('cartSubtotal');
      const discountEl = document.getElementById('cartDiscount');
      const discountRow = document.getElementById('discountRow');
      const totalEl = document.getElementById('cartTotal');
      const checkoutTotalEl = document.getElementById('modalCheckoutTotal');

      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (badge) {
        badge.innerText = count;
        badge.classList.add('scale-125');
        setTimeout(() => badge.classList.remove('scale-125'), 200);
      }

      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const discount = subtotal * discountPercent;
      const total = Math.max(0, subtotal - discount);

      if (subtotalEl) subtotalEl.innerText = \`$\${subtotal.toFixed(2)}\`;
      if (discountEl) discountEl.innerText = \`-$\${discount.toFixed(2)}\`;
      if (discountRow) {
        if (discount > 0) discountRow.classList.remove('hidden');
        else discountRow.classList.add('hidden');
      }
      if (totalEl) totalEl.innerText = \`$\${total.toFixed(2)}\`;
      if (checkoutTotalEl) checkoutTotalEl.innerText = \`$\${total.toFixed(2)}\`;

      if (list) {
        if (cart.length === 0) {
          list.innerHTML = \`
            <div class="text-center py-16 space-y-2 text-slate-500">
              <i data-lucide="shopping-cart" class="w-10 h-10 mx-auto text-slate-600"></i>
              <p class="text-xs font-mono">Your shopping cart is empty.</p>
              <button onclick="toggleCartDrawer()" class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs mt-2">Explore Catalog</button>
            </div>
          \`;
        } else {
          list.innerHTML = cart.map(item => \`
            <div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <img src="\${item.image}" alt="\${item.title}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-white truncate">\${item.title}</h4>
                <div class="text-[11px] font-mono text-brand-400">$\${item.price.toFixed(2)}</div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="updateCartQuantity('\${item.id}', -1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs">-</button>
                <span class="font-mono text-xs font-bold w-4 text-center text-white">\${item.quantity}</span>
                <button onclick="updateCartQuantity('\${item.id}', 1)" class="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs">+</button>
                <button onclick="removeCartItem('\${item.id}')" class="p-1 text-slate-500 hover:text-rose-400 ml-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
              </div>
            </div>
          \`).join('');
        }
      }

      if (window.lucide) window.lucide.createIcons();
    }

    function toggleCartDrawer() {
      const drawer = document.getElementById('cartDrawer');
      if (!drawer) return;
      drawer.classList.toggle('hidden');
    }

    function applyCoupon() {
      const input = document.getElementById('couponInput');
      const status = document.getElementById('couponStatus');
      if (!input || !status) return;

      const code = input.value.trim().toUpperCase();
      if (code === 'IDEAPRINT' || code === 'SAVE15') {
        discountPercent = 0.15;
        status.innerText = '✓ Promo IDEAPRINT applied: 15% OFF entire order!';
        status.className = 'text-[11px] font-mono text-emerald-400 block';
        showToast('15% Discount applied successfully!');
        emitLog('action', 'Coupon IDEAPRINT applied: 15% discount granted');
      } else {
        discountPercent = 0;
        status.innerText = '✕ Invalid promo code. Try IDEAPRINT.';
        status.className = 'text-[11px] font-mono text-rose-400 block';
      }
      updateCartUI();
    }

    // Checkout Flow
    function openCheckoutModal() {
      if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
      }
      toggleCartDrawer();
      const modal = document.getElementById('checkoutModal');
      const form = document.getElementById('checkoutForm');
      const success = document.getElementById('orderSuccessView');
      if (modal) modal.classList.remove('hidden');
      if (form) form.classList.remove('hidden');
      if (success) success.classList.add('hidden');
    }

    function closeCheckoutModal() {
      const modal = document.getElementById('checkoutModal');
      if (modal) modal.classList.add('hidden');
    }

    function handleProcessOrder(e) {
      e.preventDefault();
      const btn = document.getElementById('confirmOrderBtn');
      if (btn) {
        btn.innerHTML = '<span class="animate-spin mr-2">⟳</span> Processing Payment...';
        btn.disabled = true;
      }

      emitLog('network', \`POST /api/v1/checkout - Processing payment for $\${document.getElementById('cartTotal').innerText} via Stripe...\`);

      setTimeout(() => {
        const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
        const form = document.getElementById('checkoutForm');
        const success = document.getElementById('orderSuccessView');
        const orderIdEl = document.getElementById('confirmedOrderId');

        if (orderIdEl) orderIdEl.innerText = orderId;
        if (form) form.classList.add('hidden');
        if (success) success.classList.remove('hidden');

        emitLog('network', \`200 OK: Order \${orderId} created successfully. Receipt dispatched via SendGrid.\`);
        showToast(\`Order \${orderId} Confirmed!\`);
      }, 1200);
    }

    function finishOrderAndReset() {
      cart = [];
      discountPercent = 0;
      updateCartUI();
      closeCheckoutModal();
      showToast('Order completed! Thank you.');
    }

    // Quick View Modal
    function openQuickView(productId) {
      const item = products.find(p => p.id === productId);
      if (!item) return;

      const modal = document.getElementById('quickViewModal');
      const content = document.getElementById('quickViewContent');
      if (!modal || !content) return;

      content.innerHTML = \`
        <div class="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
          <img src="\${item.image}" alt="\${item.title}" class="w-full h-72 object-cover" />
        </div>
        <div class="space-y-4">
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold uppercase">\${item.category}</span>
            <span class="text-amber-400">★ \${item.rating}</span>
          </div>
          <h2 class="text-xl font-bold text-white">\${item.title}</h2>
          <p class="text-xs text-slate-300 leading-relaxed">\${item.description}</p>
          <div class="text-2xl font-black font-mono text-white">$\${item.price.toFixed(2)}</div>
          <button onclick="addToCart('\${item.id}'); closeQuickView()" class="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 cursor-pointer">
            Add to Cart
          </button>
        </div>
      \`;

      modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    function closeQuickView() {
      const modal = document.getElementById('quickViewModal');
      if (modal) modal.classList.add('hidden');
    }

    // Add Product Modal
    function openAddProductModal() {
      const modal = document.getElementById('addProductModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeAddProductModal() {
      const modal = document.getElementById('addProductModal');
      if (modal) modal.classList.add('hidden');
    }

    function handleSaveNewProduct(e) {
      e.preventDefault();
      const title = document.getElementById('newProdTitle').value.trim();
      const cat = document.getElementById('newProdCat').value;
      const price = parseFloat(document.getElementById('newProdPrice').value) || 49.99;
      const desc = document.getElementById('newProdDesc').value.trim() || 'High quality newly published catalog item.';
      const img = document.getElementById('newProdImage').value.trim() || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80';

      const newId = 'PRD-00' + (products.length + 1);
      const newProduct = {
        id: newId,
        title,
        category: cat,
        price,
        rating: 5.0,
        reviewsCount: 1,
        image: img,
        badge: 'Just Added',
        inStock: true,
        description: desc
      };

      products.unshift(newProduct);
      renderCatalog();
      closeAddProductModal();
      showToast(\`Published "\${title}" to store\`);
      emitLog('network', \`201 CREATED: POST /api/v1/products - Created item \${newId}: "\${title}"\`);
    }

    // Filter Handlers
    function setCategory(cat) {
      activeCategory = cat;
      document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.getAttribute('data-cat') === cat) {
          btn.className = 'cat-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20';
        } else {
          btn.className = 'cat-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800';
        }
      });
      renderCatalog();
      emitLog('action', \`Switched category filter to "\${cat}"\`);
    }

    function handleSearch(val) {
      searchQuery = val;
      renderCatalog();
    }

    function handleSort(val) {
      sortMode = val;
      renderCatalog();
      emitLog('action', \`Sorted catalog by "\${val}"\`);
    }

    function resetFilters() {
      searchQuery = '';
      const input = document.getElementById('searchInput');
      if (input) input.value = '';
      setCategory('all');
    }

    // Toast Utility
    function showToast(msg) {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'px-4 py-2.5 rounded-xl bg-slate-900/95 border border-brand-500/40 text-white text-xs font-medium shadow-2xl flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0';
      toast.innerHTML = \`<span class="w-2 h-2 rounded-full bg-brand-400"></span> \${msg}\`;
      container.appendChild(toast);

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Bootstrap
    window.addEventListener('DOMContentLoaded', () => {
      renderCatalog();
      updateCartUI();
      emitLog('info', \`App initialized in sandbox: ${appTitle} v1.0.0 · Ready\`);
      emitLog('network', '200 OK: GET /api/v1/products - 8 items fetched from catalog database');
    });
  </script>
</body>
</html>`;
  }, [explicitHtmlFile, projectName, projectDescription, files]);

  // Open the sandbox in a standalone real browser tab
  const handleOpenInNewTab = () => {
    const blob = new Blob([sandboxHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCustomAiUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !onCodeRegenerate) return;
    onCodeRegenerate(customPrompt.trim());
    setCustomPrompt('');
  };

  return (
    <div
      className={`flex flex-col bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-zinc-950' : 'h-[720px]'
      }`}
    >
      {/* 1. Browser Simulation Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 backdrop-blur-md">
        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop View (100%)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'desktop' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            title="Tablet View (768px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'tablet' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile View (390px)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              device === 'mobile' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-2">
          <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-zinc-950 border border-white/10 text-[11px] font-mono text-zinc-300 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">https://{projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.app.preview</span>
            <span className="text-[9px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded uppercase font-mono">
              Live App
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            title="Toggle Developer Telemetry Console"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
              showConsole
                ? 'bg-ember/10 border-ember/30 text-ember'
                : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Console ({consoleLogs.length})</span>
          </button>

          <button
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload sandbox"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenInNewTab}
            title="Open in Full Browser Tab"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Quick AI Refine Bar */}
      {onCodeRegenerate && (
        <form
          onSubmit={handleCustomAiUpdate}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border-b border-white/5 text-xs font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-ember flex-shrink-0" />
          <input
            type="text"
            placeholder="Instruct AI to develop or modify features: e.g. 'Add coupon discount code', 'Make dark theme', 'Add reviews'..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isGenerating}
            className="flex-1 bg-transparent text-white placeholder-zinc-400 text-xs outline-none"
          />
          <button
            type="submit"
            disabled={isGenerating || !customPrompt.trim()}
            className="px-3 py-1 rounded-lg bg-ember hover:bg-ember-hover text-zinc-950 font-bold text-xs disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <span>{isGenerating ? 'Updating...' : 'Update App'}</span>
          </button>
        </form>
      )}

      {/* 3. The Live Iframe Sandbox Viewport */}
      <div className="flex-1 overflow-hidden bg-zinc-950 flex justify-center items-stretch relative">
        <div
          className={`h-full transition-all duration-300 flex flex-col ${
            device === 'desktop'
              ? 'w-full'
              : device === 'tablet'
              ? 'w-[768px] border-x border-white/10 shadow-2xl'
              : 'w-[390px] border-x border-white/10 shadow-2xl'
          }`}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={sandboxHtml}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin allow-popups"
            className="w-full h-full border-none bg-slate-950"
            title={projectName}
          />
        </div>
      </div>

      {/* 4. Collapsible Developer Console Drawer */}
      {showConsole && (
        <div className="h-44 bg-zinc-950 border-t border-white/10 flex flex-col font-mono text-[11px]">
          <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900 border-b border-white/5 text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-ember" />
              <span className="font-bold text-white">Runtime Console & Network Telemetry</span>
              <span className="text-[10px] text-zinc-400">({selectedStack})</span>
            </div>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scroll">
            {consoleLogs.length === 0 ? (
              <div className="text-zinc-400 italic">No console logs yet. Interact with the application above to view runtime telemetry.</div>
            ) : (
              consoleLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-zinc-400 text-[10px]">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                      log.type === 'network'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : log.type === 'action'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="text-zinc-200">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
