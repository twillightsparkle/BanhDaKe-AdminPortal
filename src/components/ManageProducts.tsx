import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { sizeService } from '../services/api';
import type { Product, ProductVariation, SizeOption } from '../types';
import { getLocalizedString, createLocalizedString } from '../types';

interface SpecificationItem {
  keyEn: string;
  keyVi: string;
  valueEn: string;
  valueVi: string;
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Product>) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave }) => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('en');
  const [availableSizes, setAvailableSizes] = useState<SizeOption[]>([]);
  const [formData, setFormData] = useState({
    nameEn: product.name.en,
    nameVi: product.name.vi,
    shortDescriptionEn: product.shortDescription?.en || '',
    shortDescriptionVi: product.shortDescription?.vi || '',
    detailDescriptionEn: product.detailDescription.en,
    detailDescriptionVi: product.detailDescription.vi,
    image: product.image,
    images: product.images?.join('\n') || product.image || '', // Show all images, one per line
    inStock: product.inStock,
    weight: (product.weight || 0).toString()
  });

  // Form-specific types (string values for input controls)
  interface FormSizeOption {
    sizeOptionId: string; // ID of the selected size option from dropdown
    price: string;
    stock: string;
  }

  interface FormVariation {
    colorEn: string;
    colorVi: string;
    image: string;
    sizeOptions: FormSizeOption[];
  }

  const [variations, setVariations] = useState<FormVariation[]>([
    { colorEn: '', colorVi: '', image: '', sizeOptions: [{ sizeOptionId: '', price: '', stock: '' }] }
  ]);

  // Initialize variations after sizes are loaded
  useEffect(() => {
    if (availableSizes.length > 0 && product.variations && product.variations.length > 0) {
      const initialVariations = product.variations.map(v => ({
        colorEn: v.color.en,
        colorVi: v.color.vi,
        image: v.image || '',
        sizeOptions: v.sizeOptions.map(so => {
          // Find the matching size option from available sizes based on EU and US values
          const matchingSizeOption = availableSizes.find(size => 
            size.EU === so.size.EU && size.US === so.size.US
          );
          return {
            sizeOptionId: matchingSizeOption?._id || '',
            price: so.price.toString(),
            stock: so.stock.toString()
          };
        })
      }));
      setVariations(initialVariations);
      
      // Update collapsed states to match the new variations length
      setCollapsedVariations(new Array(initialVariations.length).fill(true));
      setCollapsedSizeOptions(new Array(initialVariations.length).fill(true));
    }
  }, [availableSizes, product.variations]);

  // Track which variations, size options are collapsed
  const [collapsedVariations, setCollapsedVariations] = useState<boolean[]>(
    new Array(variations.length).fill(true)
  );
  const [collapsedSizeOptions, setCollapsedSizeOptions] = useState<boolean[]>(
    new Array(variations.length).fill(true)
  );

  // Fetch available sizes on component mount
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const sizes = await sizeService.getAllSizes();
        setAvailableSizes(sizes);
      } catch (error) {
        console.error('Failed to fetch sizes:', error);
      }
    };
    
    fetchSizes();
  }, []);

  // SearchableSelect component for size selection
  interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }

  const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
    value, 
    onChange, 
    options, 
    placeholder = "Select..." 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setIsOpen(true);
    };

    const handleOptionSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    };

    const handleClear = () => {
      onChange('');
      setSearchTerm('');
      setIsOpen(false);
    };

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    };

    return (
      <div className="searchable-select" ref={selectRef}>
        <div className="searchable-select-input-container">
          <input
            type="text"
            className="searchable-select-input"
            value={isOpen ? searchTerm : displayValue}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            placeholder={placeholder}
          />
          {value && (
            <button
              type="button"
              className="searchable-select-clear"
              onClick={handleClear}
            >
              ×
            </button>
          )}
          <button
            type="button"
            className="searchable-select-arrow"
            onClick={toggleDropdown}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
        {isOpen && (
          <div className="searchable-select-dropdown">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className="searchable-select-option"
                  onClick={() => handleOptionSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="searchable-select-no-results">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Initialize specifications from product data
  const [specifications, setSpecifications] = useState<SpecificationItem[]>(() => {
    if (product.specifications && product.specifications.length > 0) {
      return product.specifications.map(spec => ({
        keyEn: spec.key.en,
        keyVi: spec.key.vi,
        valueEn: spec.value.en,
        valueVi: spec.value.vi
      }));
    }
    return [{ keyEn: '', keyVi: '', valueEn: '', valueVi: '' }];
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleVariationChange = (index: number, field: keyof FormVariation, value: string) => {
    setVariations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSizeOptionChange = (variationIndex: number, sizeIndex: number, field: keyof FormSizeOption, value: string) => {
    setVariations(prev => {
      const copy = [...prev];
      const sizeOptions = [...copy[variationIndex].sizeOptions];
      sizeOptions[sizeIndex] = { ...sizeOptions[sizeIndex], [field]: value };
      copy[variationIndex] = { ...copy[variationIndex], sizeOptions };
      return copy;
    });
  };

  const addSizeOption = (variationIndex: number) => {
    setVariations(prev => {
      const copy = [...prev];
      copy[variationIndex] = {
        ...copy[variationIndex],
        sizeOptions: [...copy[variationIndex].sizeOptions, { sizeOptionId: '', price: '', stock: '' }]
      };
      return copy;
    });
  };

  const removeSizeOption = (variationIndex: number, sizeIndex: number) => {
    setVariations(prev => {
      const copy = [...prev];
      if (copy[variationIndex].sizeOptions.length > 1) {
        copy[variationIndex] = {
          ...copy[variationIndex],
          sizeOptions: copy[variationIndex].sizeOptions.filter((_: FormSizeOption, i: number) => i !== sizeIndex)
        };
      }
      return copy;
    });
  };

  const addVariation = () => {
    setVariations(prev => [...prev, { colorEn: '', colorVi: '', image: '', sizeOptions: [{ sizeOptionId: '', price: '', stock: '' }] }]);
    setCollapsedVariations(prev => [...prev, false]); // New variations start expanded
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(prev => prev.filter((_, i) => i !== index));
      setCollapsedVariations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleVariationCollapse = (index: number) => {
    setCollapsedVariations(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
    setCollapsedSizeOptions(prev => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };
  const toggleSizeOptionsCollapse = (index: number) => {
    setCollapsedSizeOptions(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleSpecificationChange = (index: number, field: keyof SpecificationItem, value: string) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addSpecification = () => {
    setSpecifications(prev => [...prev, { keyEn: '', keyVi: '', valueEn: '', valueVi: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(prev => prev.filter((_, i) => i !== index));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert specifications to the required format
    const specificationsArray = specifications
      .filter(spec => spec.keyEn.trim() || spec.keyVi.trim()) // Only include specifications with at least one key
      .map(spec => ({
        key: createLocalizedString(spec.keyEn || spec.keyVi, spec.keyVi || spec.keyEn),
        value: createLocalizedString(spec.valueEn || spec.valueVi, spec.valueVi || spec.valueEn)
      }));

    // Parse images array from textarea (one URL per line)
    const imagesArray = formData.images
      .split('\n')
      .map(url => url.trim())
      .filter(url => url);

    // Use first image as main image, fallback to existing main image
    const mainImage = imagesArray.length > 0 ? imagesArray[0] : formData.image;

    const variationPayload: ProductVariation[] = variations
      .filter(v => (v.colorEn || v.colorVi) && v.sizeOptions.some((so: FormSizeOption) => so.sizeOptionId.trim() !== ''))
      .map(v => ({
        color: createLocalizedString(v.colorEn || v.colorVi, v.colorVi || v.colorEn),
        image: v.image || '',
        sizeOptions: v.sizeOptions
          .filter((so: FormSizeOption) => so.sizeOptionId.trim() !== '')
          .map((so: FormSizeOption) => {
            const sizeOption = availableSizes.find(size => size._id === so.sizeOptionId);
            return {
              size: {
                EU: sizeOption!.EU,
                US: sizeOption!.US
              },
              price: parseFloat(so.price) || 0,
              stock: parseInt(so.stock) || 0,
            };
          })
      }));

    const updates: Partial<Product> = {
      name: createLocalizedString(formData.nameEn, formData.nameVi),
      detailDescription: createLocalizedString(formData.detailDescriptionEn, formData.detailDescriptionVi),
      image: mainImage,
      images: imagesArray.length > 0 ? imagesArray : [formData.image],
      inStock: formData.inStock,
      specifications: specificationsArray,
      weight: parseFloat(formData.weight) || 0,
      variations: variationPayload,
    };
    // Only include shortDescription if provided
    if (formData.shortDescriptionEn.trim() || formData.shortDescriptionVi.trim()) {
      (updates as any).shortDescription = createLocalizedString(formData.shortDescriptionEn, formData.shortDescriptionVi);
    }

    onSave(product._id, updates);
    onClose();
  };

   // Duplicate a variation (deep copy)
  const duplicateVariation = (variationIndex: number) => {
    setVariations(prev => {
      const toCopy = prev[variationIndex];
      // Deep copy sizeOptions
      const copiedSizeOptions = toCopy.sizeOptions.map(so => ({ ...so }));
      // Add 'Copy' to color fields to indicate duplication
      const newVariation = {
        ...toCopy,
        colorEn: toCopy.colorEn ? `${toCopy.colorEn} (Copy)` : '',
        colorVi: toCopy.colorVi ? `${toCopy.colorVi} (Copy)` : '',
        sizeOptions: copiedSizeOptions,
        image: toCopy.image
      };
      // Insert after the original
      const newArr = [...prev];
      newArr.splice(variationIndex + 1, 0, newVariation);
      return newArr;
    });
    setCollapsedVariations(prev => {
      const newArr = [...prev];
      newArr.splice(variationIndex + 1, 0, true); // New duplicated variation starts expanded
      return newArr;
    })
  };

  // State for bulk price input per variation
  const [bulkPrices, setBulkPrices] = useState<{ [variationIdx: number]: string }>({});

  // Set all prices in a variation
  const setAllPricesInVariation = (variationIdx: number) => {
    const price = bulkPrices[variationIdx];
    if (price !== undefined && price !== '') {
      setVariations(prev => prev.map((v, idx) => idx === variationIdx ? {
        ...v,
        sizeOptions: v.sizeOptions.map(so => ({ ...so, price: price }))
      } : v));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="language-tabs">
            <button 
              type="button" 
              className={currentLanguage === 'en' ? 'active' : ''}
              onClick={() => setCurrentLanguage('en')}
            >
              English
            </button>
            <button 
              type="button" 
              className={currentLanguage === 'vi' ? 'active' : ''}
              onClick={() => setCurrentLanguage('vi')}
            >
              Vietnamese
            </button>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`edit-name-${currentLanguage}`}>
                Product Name ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
              </label>
              <input
                type="text"
                id={`edit-name-${currentLanguage}`}
                name={`name${currentLanguage === 'en' ? 'En' : 'Vi'}`}
                value={currentLanguage === 'en' ? formData.nameEn : formData.nameVi}
                onChange={handleChange}
                required
              />
            </div>

            {/* Price moved to variations */}
          </div>

          <div className="form-group">
            <label htmlFor={`edit-shortDescription-${currentLanguage}`}>
              Short Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
            </label>
            <input
              type="text"
              id={`edit-shortDescription-${currentLanguage}`}
              name={`shortDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              value={currentLanguage === 'en' ? formData.shortDescriptionEn : formData.shortDescriptionVi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`edit-detailDescription-${currentLanguage}`}>
              Detail Description ({currentLanguage === 'en' ? 'English' : 'Vietnamese'})
            </label>
            <textarea
              id={`edit-detailDescription-${currentLanguage}`}
              name={`detailDescription${currentLanguage === 'en' ? 'En' : 'Vi'}`}
              value={currentLanguage === 'en' ? formData.detailDescriptionEn : formData.detailDescriptionVi}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-images">Product Images (one URL per line)</label>
            <textarea
              id="edit-images"
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
              rows={4}
            />
            <small className="form-help">Enter each image URL on a new line. The first image will be used as the main product image.</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-weight">Weight (Kilograms)</label>
              <input
                type="number"
                id="edit-weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                required
                min="0"
                placeholder="0"
                step="any"
              />
              <small className="form-help">Product weight in Kilograms (used for shipping calculations)</small>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                />
                In Stock
              </label>
            </div>
          </div>

          {/* Variations Editor */}
          <div className="form-group">
            <label>Variations (Color x Size)</label>
            <div className="specifications-container">
              {variations.map((v, index) => (
                <div key={index} className="specification-item">
                  <div className="specification-header" onClick={() => toggleVariationCollapse(index)} style={{ cursor: 'pointer' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {collapsedVariations[index] ? '▶' : '▼'} 
                      {(v.colorEn || v.colorVi) ? (
                        <span>{v.colorEn || v.colorVi}</span>
                      ) : (
                        <span>Variation {index + 1}</span>
                      )}
                      {collapsedVariations[index] && v.image && (
                        <img 
                          src={v.image} 
                          alt="Variation thumbnail" 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </span>
                    <div className="specification-actions" onClick={(e) => e.stopPropagation()}>
                      {variations.length > 1 && (
                        <button type="button" className="remove-spec-btn" onClick={() => removeVariation(index)}>✕</button>
                      )}
                      <button type="button" className="duplicate-spec-btn" onClick={() => duplicateVariation(index)} title="Duplicate Variation">⧉</button>
                    </div>
                  </div>
                  
                  {!collapsedVariations[index] && (
                    <div className="specification-fields">
                      {/* Color and Image - Main elements */}
                      <div className="spec-row">
                        <div className="spec-field">
                          <label>Color (English)</label>
                          <input type="text" value={v.colorEn} onChange={(e) => handleVariationChange(index, 'colorEn', e.target.value)} />
                        </div>
                        <div className="spec-field">
                          <label>Color (Vietnamese)</label>
                          <input type="text" value={v.colorVi} onChange={(e) => handleVariationChange(index, 'colorVi', e.target.value)} />
                        </div>
                      </div>
                      <div className="spec-row">
                        <div className="spec-field">
                          <label>Image URL</label>
                          <input type="text" value={v.image} onChange={(e) => handleVariationChange(index, 'image', e.target.value)} placeholder="https://..." />
                          {v.image && (
                            <div className="image-preview">
                              <img 
                                src={v.image} 
                                alt="Variation preview" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover', 
                                  borderRadius: '4px', 
                                  marginTop: '8px',
                                  border: '1px solid #ddd'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                                onLoad={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'block';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Size Options - Sub-group */}
                      <div 
                        className="size-options-header" 
                        onClick={() => toggleSizeOptionsCollapse(index)} 
                        style={{ cursor: 'pointer', marginTop: '12px', color: '#007bff', fontWeight: 'bold', textDecoration: 'underline' }}
                      >
                        <span>{collapsedSizeOptions[index] ? 'Show' : 'Hide'} Size Options</span>
                      </div>
                      {!collapsedSizeOptions[index] && (
                      <div className="size-options-section">
                        <div className="bulk-price-update">
                          <input
                          type="number"
                          min="0"
                          placeholder="New price"
                          value={bulkPrices[index] || ''}
                          onChange={e => setBulkPrices(prev => ({...prev, [index]: e.target.value}))}
                          style={{ marginRight: '8px', width: '120px' }}
                          />
                          <button
                          type="button"
                          onClick={() => {
                            setAllPricesInVariation(index);
                            setBulkPrices(prev => ({...prev, [index]: ''}));
                          }}
                          style={{ padding: '4px 10px' }}
                          >
                          Set All Price
                          </button>
                        </div>
                        <label>Size Options</label>
                        {v.sizeOptions.map((so: FormSizeOption, sizeIndex: number) => (
                          <div key={sizeIndex} className="size-option-item">
                            <div className="spec-row">
                              <div className="spec-field">
                                <label>Size</label>
                                <SearchableSelect
                                  value={so.sizeOptionId}
                                  onChange={(value) => handleSizeOptionChange(index, sizeIndex, 'sizeOptionId', value)}
                                  options={availableSizes.map(size => ({
                                    value: size._id,
                                    label: `EU ${size.EU} / US ${size.US}`
                                  }))}
                                  placeholder="Select Size"
                                />
                              </div>
                              <div className="spec-field">
                                <label>Price</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  value={so.price} 
                                  onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'price', e.target.value)} 
                                  onWheel={(e) => e.currentTarget.blur()}
                                />
                              </div>
                              <div className="spec-field">
                                <label>Stock</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  value={so.stock} 
                                  onChange={(e) => handleSizeOptionChange(index, sizeIndex, 'stock', e.target.value)} 
                                  onWheel={(e) => e.currentTarget.blur()}
                                />
                              </div>
                              <div className="spec-field">
                                {v.sizeOptions.length > 1 && (
                                  <button 
                                    type="button" 
                                    className="remove-spec-btn" 
                                    onClick={() => removeSizeOption(index, sizeIndex)}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="add-spec-btn" 
                          onClick={() => addSizeOption(index)}
                        >
                          + Add Size Option
                        </button>
                      </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className="add-spec-btn" onClick={addVariation}>+ Add Variation</button>
            </div>
          </div>

          <div className="form-group">
            <label>Specifications</label>
            <div className="specifications-container">
              {specifications.map((spec, index) => (
                <div key={index} className="specification-item">
                  <div className="specification-header">
                    <span>Specification {index + 1}</span>
                    <div className="specification-actions">
                      {specifications.length > 1 && (
                        <button 
                          type="button" 
                          className="remove-spec-btn"
                          onClick={() => removeSpecification(index)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="specification-fields">
                    <div className="spec-row">
                      <div className="spec-field">
                        <label>Key (English)</label>
                        <input
                          type="text"
                          value={spec.keyEn}
                          onChange={(e) => handleSpecificationChange(index, 'keyEn', e.target.value)}
                          placeholder="e.g., Material"
                        />
                      </div>
                      <div className="spec-field">
                        <label>Key (Vietnamese)</label>
                        <input
                          type="text"
                          value={spec.keyVi}
                          onChange={(e) => handleSpecificationChange(index, 'keyVi', e.target.value)}
                          placeholder="e.g., Chất liệu"
                        />
                      </div>
                    </div>
                    
                    <div className="spec-row">
                      <div className="spec-field">
                        <label>Value (English)</label>
                        <input
                          type="text"
                          value={spec.valueEn}
                          onChange={(e) => handleSpecificationChange(index, 'valueEn', e.target.value)}
                          placeholder="e.g., Canvas and suede"
                        />
                      </div>
                      <div className="spec-field">
                        <label>Value (Vietnamese)</label>
                        <input
                          type="text"
                          value={spec.valueVi}
                          onChange={(e) => handleSpecificationChange(index, 'valueVi', e.target.value)}
                          placeholder="e.g., Canvas và da lộn"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="add-spec-btn"
                onClick={addSpecification}
              >
                + Add Specification
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageProducts: React.FC = () => {
  const { products, updateProduct, deleteProduct } = useAdmin();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
  getLocalizedString(product.name, 'en').toLowerCase().includes(searchTerm.toLowerCase()) ||
  getLocalizedString(product.name, 'vi').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (product.shortDescription ? getLocalizedString(product.shortDescription, 'en') : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  (product.shortDescription ? getLocalizedString(product.shortDescription, 'vi') : '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = (id: string, updates: Partial<Product>) => {
    updateProduct(id, updates);
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="manage-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <p>View, edit, and delete your products</p>
      </div>

      <div className="products-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="products-count">
          {filteredProducts.length} of {products.length} products
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={getLocalizedString(product.name)} />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="product-content">
              <h3>{getLocalizedString(product.name)}</h3>
              <p className="product-description">{product.shortDescription ? getLocalizedString(product.shortDescription) : ''}</p>
              <div className="product-details">
                {(() => {
                  const allPrices = (product.variations || []).flatMap(v => 
                    (v.sizeOptions || []).map(so => so.price)
                  ).filter(p => typeof p === 'number');
                  const min = allPrices.length ? Math.min(...allPrices) : 0;
                  const max = allPrices.length ? Math.max(...allPrices) : 0;
                  const priceText = min === max ? `${min.toLocaleString('vi-VN')} VNĐ` : `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} VNĐ`;
                  const totalStock = (product.variations || []).reduce((sum, v) => 
                    sum + (v.sizeOptions || []).reduce((sizeSum, so) => sizeSum + (so.stock || 0), 0), 0
                  );
                  return (
                    <>
                      <span className="product-price">{priceText}</span>
                      <span className={`product-stock ${totalStock < 5 ? 'low-stock' : ''}`}>Stock: {totalStock}</span>
                    </>
                  );
                })()}
                <span className="product-weight">
                  Weight: {product.weight || 0}kg
                </span>
              </div>
              <div className="product-status">
                <span className={`status-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="product-actions">
              <button 
                onClick={() => handleEdit(product)}
                className="edit-button"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(product._id, getLocalizedString(product.name))}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your search.</p>
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ManageProducts;

