'use client';

import { useState } from 'react';
import ProductsConfig from '@/components/ProductsConfig';
import QuoteConfig from '@/components/QuoteConfig';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'config'>('products');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage products and configure quote settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products Config
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quote Config
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'products' && <ProductsConfig />}
          {activeTab === 'config' && <QuoteConfig />}
        </div>
      </div>
    </div>
  );
} 