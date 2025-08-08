'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/csv-utils';

interface PricingOption {
  id: string;
  frequency: string;
  price: number;
}

interface PricingPlan {
  id: string;
  name: string;
  features: string;
  pricingOptions: PricingOption[];
}

interface CustomElement {
  id: string;
  name: string;
  description: string;
  additional_cost: number;
  type: string;
  frequency: string;
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  website_link: string;
  key_features: string;
  setup_fee: number;
  pricing_plans: PricingPlan[];
  custom_elements: CustomElement[];
}

export default function ProductsConfig() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    website_link: '',
    key_features: '',
    setup_fee: 0,
    pricing_plans: [],
    custom_elements: [],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Ensure consistent data structure before saving
      const normalizedPricingPlans = formData.pricing_plans.map((plan, planIndex) => {
        // Ensure we only have the correct structure with sequential IDs
        return {
          id: (planIndex + 1).toString(),
          name: plan.name,
          features: plan.features,
          pricingOptions: (plan.pricingOptions || []).map((option, optionIndex) => ({
            id: (optionIndex + 1).toString(),
            frequency: option.frequency,
            price: option.price
          }))
        };
      });

      const productData = {
        ...formData,
        pricing_plans: JSON.stringify(normalizedPricingPlans),
        custom_elements: JSON.stringify(formData.custom_elements),
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: editingProduct ? 'update' : 'add',
          product: productData,
          products: editingProduct 
            ? products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p)
            : undefined,
        }),
      });

      if (response.ok) {
        await fetchProducts();
        resetForm();
      } else {
        alert('Failed to save product.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product.');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          product,
        }),
      });

      if (response.ok) {
        await fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product.');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Normalize pricing plans to ensure consistent structure
    let pricingPlans = [];
    try {
      const parsedPlans = JSON.parse(product.pricing_plans || '[]');
      pricingPlans = parsedPlans.map((plan: any, planIndex: number) => ({
        id: (planIndex + 1).toString(),
        name: plan.name,
        features: plan.features || '',
        pricingOptions: (plan.pricingOptions || []).map((option: any, optionIndex: number) => ({
          id: (optionIndex + 1).toString(),
          frequency: option.frequency,
          price: option.price
        }))
      }));
    } catch (error) {
      console.error('Error parsing pricing plans:', error);
      pricingPlans = [];
    }

    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      website_link: product.website_link,
      key_features: product.key_features,
      setup_fee: product.setup_fee,
      pricing_plans: pricingPlans,
      custom_elements: JSON.parse(product.custom_elements || '[]'),
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      website_link: '',
      key_features: '',
      setup_fee: 0,
      pricing_plans: [],
      custom_elements: [],
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Products Configuration</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Details Section */}
            <div className="card bg-blue-50 border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Product Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., SaaS, Software, Service"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your product"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website Link
                </label>
                <input
                  type="url"
                  value={formData.website_link}
                  onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                  className="input-field"
                  placeholder="https://yourproduct.com"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <textarea
                  value={formData.key_features}
                  onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="List the key features of your product"
                  required
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="card bg-green-50 border-green-200">
              <h4 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pricing
              </h4>
              
              {/* Setup Cost Sub-section */}
              <div className="mb-8">
                <h5 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Setup Cost
                </h5>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.setup_fee === 0 ? '' : formData.setup_fee}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ 
                        ...formData, 
                        setup_fee: value === '' ? 0 : parseFloat(value) || 0 
                      });
                    }}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Pricing Plans Sub-section */}
              <div className="mb-8">
                
                <div className="mb-4">
                  
                  <div className="flex justify-between mb-4">
                  <h5 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Pricing Plans
                  </h5>

                    <button
                      type="button"
                                              onClick={() => {
                          const newPlan: PricingPlan = {
                            id: (formData.pricing_plans.length + 1).toString(),
                            name: '',
                            features: '',
                            pricingOptions: [],
                          };
                          setFormData({
                            ...formData,
                            pricing_plans: [...formData.pricing_plans, newPlan]
                          });
                        }}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Add Plan
                    </button>
                  </div>
                  
                  {formData.pricing_plans.map((plan, planIndex) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <h6 className="font-medium text-gray-900">Plan {planIndex + 1}</h6>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              pricing_plans: formData.pricing_plans.filter(p => p.id !== plan.id)
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      {/* Plan Name and Features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Plan Name</label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => {
                              const updatedPlans = [...formData.pricing_plans];
                              updatedPlans[planIndex] = { ...plan, name: e.target.value };
                              setFormData({ ...formData, pricing_plans: updatedPlans });
                            }}
                            className="input-field text-sm"
                            placeholder="e.g., Basic, Pro, Enterprise"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Features</label>
                          <textarea
                            value={plan.features}
                            onChange={(e) => {
                              const updatedPlans = [...formData.pricing_plans];
                              updatedPlans[planIndex] = { ...plan, features: e.target.value };
                              setFormData({ ...formData, pricing_plans: updatedPlans });
                            }}
                            className="input-field text-sm"
                            rows={2}
                            placeholder="List the features included in this plan"
                          />
                        </div>
                      </div>

                      {/* Pricing Options Section */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="text-sm font-medium text-gray-700">Pricing Options</h6>
                          <button
                            type="button"
                            onClick={() => {
                              const newPricingOption: PricingOption = {
                                id: ((plan.pricingOptions || []).length + 1).toString(),
                                frequency: 'Monthly',
                                price: 0,
                              };
                              const updatedPlans = [...formData.pricing_plans];
                              updatedPlans[planIndex] = {
                                ...plan,
                                pricingOptions: [...(plan.pricingOptions || []), newPricingOption]
                              };
                              setFormData({ ...formData, pricing_plans: updatedPlans });
                            }}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            Add Frequency
                          </button>
                        </div>

                        {(plan.pricingOptions || []).map((option, optionIndex) => {
                          const availableFrequencies = ['Monthly', 'Quarterly', 'Yearly', 'One-time'].filter(
                            freq => !(plan.pricingOptions || []).some((opt, idx) => idx !== optionIndex && opt.frequency === freq)
                          );
                          
                          return (
                            <div key={option.id} className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                                <select
                                  value={option.frequency}
                                  onChange={(e) => {
                                    const updatedPlans = [...formData.pricing_plans];
                                    const updatedOptions = [...(plan.pricingOptions || [])];
                                    updatedOptions[optionIndex] = { ...option, frequency: e.target.value };
                                    updatedPlans[planIndex] = { ...plan, pricingOptions: updatedOptions };
                                    setFormData({ ...formData, pricing_plans: updatedPlans });
                                  }}
                                  className="input-field text-xs"
                                >
                                  {availableFrequencies.map(freq => (
                                    <option key={freq} value={freq}>{freq}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={option.price === 0 ? '' : option.price}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const updatedPlans = [...formData.pricing_plans];
                                    const updatedOptions = [...(plan.pricingOptions || [])];
                                    updatedOptions[optionIndex] = { 
                                      ...option, 
                                      price: value === '' ? 0 : parseFloat(value) || 0 
                                    };
                                    updatedPlans[planIndex] = { ...plan, pricingOptions: updatedOptions };
                                    setFormData({ ...formData, pricing_plans: updatedPlans });
                                  }}
                                  className="input-field text-xs"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedPlans = [...formData.pricing_plans];
                                    const updatedOptions = (plan.pricingOptions || []).filter((_, idx) => idx !== optionIndex);
                                    updatedPlans[planIndex] = { ...plan, pricingOptions: updatedOptions };
                                    setFormData({ ...formData, pricing_plans: updatedPlans });
                                  }}
                                  className="text-red-600 hover:text-red-800 text-xs p-1"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {(plan.pricingOptions || []).length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-2">
                            No pricing options added yet. Click "Add Frequency" to add pricing options.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons Sub-section */}
              <div className="mb-4">
                
                <div className="mb-4">
                  <div className="flex justify-between mb-4">
                    <h5 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    Add-ons
                  </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const newElement: CustomElement = {
                          id: Date.now().toString(),
                          name: '',
                          description: '',
                          additional_cost: 0,
                          type: 'Addon',
                          frequency: 'Monthly',
                        };
                        setFormData({
                          ...formData,
                          custom_elements: [...formData.custom_elements, newElement]
                        });
                      }}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Add Add-ons
                    </button>
                  </div>
                  
                  {formData.custom_elements.map((element, index) => (
                    <div key={element.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <h6 className="font-medium text-gray-900">Add-on {index + 1}</h6>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              custom_elements: formData.custom_elements.filter(e => e.id !== element.id)
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={element.name}
                            onChange={(e) => {
                              const updatedElements = [...formData.custom_elements];
                              updatedElements[index] = { ...element, name: e.target.value };
                              setFormData({ ...formData, custom_elements: updatedElements });
                            }}
                            className="input-field text-sm"
                            placeholder="e.g., Custom Integration, Training, Support"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Additional Cost</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={element.additional_cost === 0 ? '' : element.additional_cost}
                            onChange={(e) => {
                              const value = e.target.value;
                              const updatedElements = [...formData.custom_elements];
                              updatedElements[index] = { 
                                ...element, 
                                additional_cost: value === '' ? 0 : parseFloat(value) || 0 
                              };
                              setFormData({ ...formData, custom_elements: updatedElements });
                            }}
                            className="input-field text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={element.type}
                            onChange={(e) => {
                              const updatedElements = [...formData.custom_elements];
                              updatedElements[index] = { ...element, type: e.target.value };
                              setFormData({ ...formData, custom_elements: updatedElements });
                            }}
                            className="input-field text-sm"
                          >
                            <option value="Addon">Addon</option>
                            <option value="Upgrade">Upgrade</option>
                            <option value="Custom Service">Custom Service</option>
                            <option value="Support Package">Support Package</option>
                            <option value="SLA Enhancement">SLA Enhancement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                          <select
                            value={element.frequency}
                            onChange={(e) => {
                              const updatedElements = [...formData.custom_elements];
                              updatedElements[index] = { ...element, frequency: e.target.value };
                              setFormData({ ...formData, custom_elements: updatedElements });
                            }}
                            className="input-field text-sm"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="One-time">One-time</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={element.description}
                          onChange={(e) => {
                            const updatedElements = [...formData.custom_elements];
                            updatedElements[index] = { ...element, description: e.target.value };
                            setFormData({ ...formData, custom_elements: updatedElements });
                          }}
                          className="input-field text-sm"
                          rows={3}
                                                      placeholder="Describe this add-on"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          // Parse pricing plans and add-ons from JSON strings
          const pricingPlans = typeof product.pricing_plans === 'string' 
            ? JSON.parse(product.pricing_plans || '[]') 
            : product.pricing_plans || [];
          
          const customElements = typeof product.custom_elements === 'string' 
            ? JSON.parse(product.custom_elements || '[]') 
            : product.custom_elements || [];

          return (
            <div key={product.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col h-full">
                {/* Product Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Description */}
                <div className="flex-1">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                  
                  {/* Plan Names */}
                  {pricingPlans.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Plans:</h4>
                      <div className="flex flex-wrap gap-1">
                        {pricingPlans.map((plan: any, index: number) => (
                          <span 
                            key={plan.id || index} 
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {plan.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add-on Names */}
                  {customElements.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Add-ons:</h4>
                      <div className="flex flex-wrap gap-1">
                        {customElements.map((element: any, index: number) => (
                          <span 
                            key={element.id || index} 
                            className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {element.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Website Link */}
                {product.website_link && (
                  <div className="border-t border-gray-200 pt-3 mt-auto">
                    <a
                      href={product.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first product</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
} 