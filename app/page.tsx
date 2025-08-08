'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/csv-utils';
import QuoteForm from '@/components/QuoteForm';
import ViewProducts from '@/components/ViewProducts';
import QuoteHistory from '@/components/QuoteHistory';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'quote'>('quote');
  const [products, setProducts] = useState<Product[]>([]);

  // Quote Generator States
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log('Loaded products:', data.length);
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Reset quote form when switching tabs
  const handleTabChange = (tab: 'products' | 'quote') => {
    setActiveTab(tab);
    if (tab === 'products') {
      setShowQuoteForm(false);
      setSelectedQuote(null);
    }
  };

  return (
    //toggle for the entire ap
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {/* Header with Software Name and Toggle */}
        <div className="flex justify-between items-center mb-12">
          {/* Software Name - Left Side */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-2xl transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                SaaS Quote Generator
              </h1>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                by GrowthJockey
              </h3>
            </div>
          </div>

          {/* Tab Navigation - Right Side */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>

            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTabChange('quote')}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-500 flex items-center space-x-2 relative overflow-hidden group ${activeTab === 'quote'
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white shadow-xl transform scale-105'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                >
                  {/* Active Tab Glow Effect */}
                  {activeTab === 'quote' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl animate-pulse opacity-30"></div>
                  )}

                  <div className="relative flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${activeTab === 'quote' ? 'bg-white/20' : 'bg-purple-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="font-bold">Quote Generator</span>
                  </div>
                </button>

                <button
                  onClick={() => handleTabChange('products')}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-500 flex items-center space-x-2 relative overflow-hidden group ${activeTab === 'products'
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white shadow-xl transform scale-105'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                >
                  {/* Active Tab Glow Effect */}
                  {activeTab === 'products' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl animate-pulse opacity-30"></div>
                  )}

                  <div className="relative flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${activeTab === 'products' ? 'bg-white/20' : 'bg-blue-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="font-bold">View Products</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {/* Tab 1: View Products */}
          {activeTab === 'products' && (
            <ViewProducts
              onProductsLoaded={setProducts}
            />
          )}

          {/* Tab 2: Quote Generator */}
          {activeTab === 'quote' && (
            <div className="max-w-6xl mx-auto">
              {!showQuoteForm ? (
                <QuoteHistory
                  setShowQuoteForm={setShowQuoteForm}
                  setSelectedQuote={setSelectedQuote}
                />
              ) : (
                <QuoteForm
                  products={products}
                  onCancel={() => setShowQuoteForm(false)}
                  initialData={selectedQuote}
                />
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
} 