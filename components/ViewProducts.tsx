'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/csv-utils';

interface ViewProductsProps {
  onProductsLoaded?: (products: Product[]) => void;
}

export default function ViewProducts({ onProductsLoaded }: ViewProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      onProductsLoaded?.(data); // Pass products to parent if callback provided
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  // Product modal state - now managed internally
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product modal functions
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };
  const getProductPlans = (product: Product) => {
    if (!product.pricing_plans) return [];
    try {
      const plans = JSON.parse(product.pricing_plans);
      return plans.map((plan: any) => plan.name).filter(Boolean);
    } catch {
      return [];
    }
  };

  const getProductAddons = (product: Product) => {
    if (!product.custom_elements) return [];
    try {
      const addons = JSON.parse(product.custom_elements);
      return addons.map((addon: any) => addon.name).filter(Boolean);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="text-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading amazing products...</p>
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-2xl shadow-xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 cursor-pointer border border-gray-100 overflow-hidden group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                {/* Card Content */}
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {product.name}
                      </h3>
                      <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full mb-4 shadow-lg">
                        {product.category || 'Uncategorized'}
                      </span>
                    </div>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Plans Section */}
                  {getProductPlans(product).length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-700">Available Plans</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getProductPlans(product).slice(0, 3).map((plan: string, index: number) => (
                          <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow">
                            {plan}
                          </span>
                        ))}
                        {getProductPlans(product).length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-medium">
                            +{getProductPlans(product).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add-ons Section */}
                  {getProductAddons(product).length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-700">Add-ons</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getProductAddons(product).slice(0, 2).map((addon: string, index: number) => (
                          <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium shadow-sm hover:shadow-md transition-shadow">
                            {addon}
                          </span>
                        ))}
                        {getProductAddons(product).length > 2 && (
                          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-medium">
                            +{getProductAddons(product).length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Website Link */}
                  {product.website_link && (
                    <div className="pt-4 border-t border-gray-100 mt-6">
                      <a
                        href={product.website_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-300 hover:scale-105 transform"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!isLoading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No products yet</h3>
          <p className="text-gray-600 text-lg">Get started by adding your first amazing product</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeProductModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <p className="text-gray-600">Product Details</p>
                  </div>
                </div>
                <button
                  onClick={closeProductModal}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Information Form */}
              <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Name
                      </label>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <p className="text-lg font-medium text-gray-900">{selectedProduct.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Category
                      </label>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                          {selectedProduct.category || 'Uncategorized'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                    </label>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  </div>

                  {selectedProduct.website_link && (
                    <div className="mt-6 space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Website Link
                      </label>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <a
                          href={selectedProduct.website_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {selectedProduct.website_link}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Features Section */}
                {selectedProduct.key_features && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Key Features
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProduct.key_features}</p>
                    </div>
                  </div>
                )}

                {/* Setup Fee Section */}
                {selectedProduct.setup_fee && selectedProduct.setup_fee > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Setup Fee
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-2xl font-bold text-orange-600">${selectedProduct.setup_fee}</p>
                    </div>
                  </div>
                )}

                {/* Pricing Plans Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Pricing Plans
                  </h3>

                  {selectedProduct.pricing_plans ? (
                    <div className="space-y-4">
                      {JSON.parse(selectedProduct.pricing_plans).map((plan: any, index: number) => (
                        <div key={plan.id || index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                            <span className="text-xs text-gray-500 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                              Plan {index + 1}
                            </span>
                          </div>

                          {/* Plan Features */}
                          {plan.features && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Features:</p>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan.features}</p>
                              </div>
                            </div>
                          )}

                          {/* Pricing Options */}
                          {plan.pricingOptions && plan.pricingOptions.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-3">Pricing Options:</p>
                              <div className="space-y-2">
                                {plan.pricingOptions.map((option: any) => (
                                  <div key={option.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center space-x-3">
                                        <span className="text-sm font-semibold text-gray-900">{option.frequency}</span>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">Option {option.id}</span>
                                      </div>
                                      <span className="text-lg font-bold text-blue-600">${option.price}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(!plan.features || !plan.pricingOptions || plan.pricingOptions.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No additional details configured</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-gray-500 italic text-center">No pricing plans configured</p>
                    </div>
                  )}
                </div>

                {/* Add-ons Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Add-ons
                  </h3>

                  {selectedProduct.custom_elements ? (
                    <div className="space-y-4">
                      {JSON.parse(selectedProduct.custom_elements).map((addon: any, index: number) => (
                        <div key={addon.id || index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xl font-bold text-gray-900">{addon.name}</h4>
                            <span className="text-xs text-gray-500 bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                              Add-on {index + 1}
                            </span>
                          </div>

                          {/* Addon Description */}
                          {addon.description && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Description:</p>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">{addon.description}</p>
                              </div>
                            </div>
                          )}

                          {/* Addon Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Type</p>
                              <p className="text-sm text-purple-700 font-semibold">{addon.type}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Frequency</p>
                              <p className="text-sm text-green-700 font-semibold">{addon.frequency}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Additional Cost</p>
                              <p className="text-lg text-blue-700 font-bold">+${addon.additional_cost}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <p className="text-gray-500 italic text-center">No add-ons configured</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end pt-8 border-t border-gray-200 mt-8">
                <button
                  onClick={closeProductModal}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 