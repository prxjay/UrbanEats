import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { addFoodItem } from '../../services/foodService';
import { uploadImage } from '../../services/foodService';
import { toast } from 'react-toastify';

const categories = ['Biryani', 'Cake', 'Burger', 'Pizza', 'Rolls', 'Salad', 'Ice cream'];
const offers = ['None', '10% OFF', '15% OFF', '20% OFF'];

const AddFood = () => {
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    name: '', description: '', price: '', category: 'Biryani', dietType: 'Veg', offer: 'None'
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(d => ({ ...d, [name]: value }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setImage(file);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!image) { toast.error('Please select a food image.'); return; }
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage(image);
      const priceVal = Number(data.price);
      const computedDeliveryTime = Math.min(35, Math.max(17, Math.round(17 + ((priceVal - 100) / 400) * 18)));

      await addFoodItem({ ...data, imageUrl, price: priceVal, deliveryTime: computedDeliveryTime, isSoldOut: false });

      toast.success('Food item added successfully!');
      setData({ name: '', description: '', category: 'Biryani', price: '', dietType: 'Veg', offer: 'None' });
      setImage(null);
    } catch (error) {
      toast.error('Error adding food: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Add Food Item</h2>
      <form onSubmit={onSubmitHandler}>
        <div className="row g-4">
          {/* Left Column - Image Upload */}
          <div className="col-lg-4">
            <div className="card border-0 bg-white shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-3" style={{ color: 'var(--text-secondary)' }}>
                <i className="bi bi-image me-2"></i>Food Photo
              </h5>
              <label
                htmlFor="food-image"
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed ${isDragging ? 'var(--primary)' : image ? 'var(--accent)' : 'var(--gray-300)'}`,
                  borderRadius: '16px', padding: '24px', cursor: 'pointer', minHeight: '240px',
                  background: isDragging ? 'var(--primary-light)' : image ? '#f0fdf4' : 'var(--gray-50)',
                  transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
                }}
              >
                {image ? (
                  <>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      background: 'var(--accent)', color: '#fff', borderRadius: '20px',
                      padding: '4px 12px', fontSize: '12px', fontWeight: 600,
                    }}>
                      <i className="bi bi-check-circle me-1"></i>Image Selected
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gray-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                    }}>
                      <i className="bi bi-cloud-arrow-up" style={{ fontSize: '28px', color: 'var(--gray-400)' }}></i>
                    </div>
                    <p className="fw-semibold text-center mb-1" style={{ color: 'var(--text-secondary)' }}>
                      Drag & drop or click to upload
                    </p>
                    <p className="small text-center" style={{ color: 'var(--text-muted)', margin: 0 }}>
                      JPG, PNG, WEBP supported
                    </p>
                  </>
                )}
              </label>
              <input type="file" id="food-image" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />

              {image && (
                <button type="button" onClick={() => setImage(null)}
                  className="btn btn-sm btn-outline-danger mt-3 w-100">
                  <i className="bi bi-x-circle me-1"></i>Remove Image
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="col-lg-8">
            <div className="card border-0 bg-white shadow-sm p-4">
              <h5 className="fw-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
                <i className="bi bi-info-circle me-2"></i>Item Details
              </h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Food Name <span className="text-danger">*</span></label>
                  <input type="text" name="name" className="form-control" placeholder="e.g. Chicken Biryani" required value={data.name} onChange={onChangeHandler} style={{ borderRadius: '10px', border: '1.5px solid var(--gray-200)', padding: '10px 14px' }} />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                  <textarea name="description" className="form-control" rows={3} placeholder="Describe this dish — ingredients, taste, portion size..." required value={data.description} onChange={onChangeHandler} style={{ borderRadius: '10px', border: '1.5px solid var(--gray-200)', padding: '10px 14px', resize: 'none' }} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category <span className="text-danger">*</span></label>
                  <select name="category" className="form-select" value={data.category} onChange={onChangeHandler} style={{ borderRadius: '10px', border: '1.5px solid var(--gray-200)', padding: '10px 14px' }}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Diet Type <span className="text-danger">*</span></label>
                  <div className="d-flex gap-3 mt-1">
                    {['Veg', 'Non-Veg'].map(type => (
                      <label key={type} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        background: data.dietType === type ? (type === 'Veg' ? '#f0fdf4' : '#fef2f2') : 'var(--gray-50)',
                        border: `1.5px solid ${data.dietType === type ? (type === 'Veg' ? 'var(--accent)' : 'var(--danger)') : 'var(--gray-200)'}`,
                        borderRadius: '10px', padding: '10px 18px', flex: 1, justifyContent: 'center',
                        transition: 'all 0.2s ease', fontWeight: 600, fontSize: '14px',
                        color: data.dietType === type ? (type === 'Veg' ? 'var(--accent)' : 'var(--danger)') : 'var(--text-muted)',
                      }}>
                        <input type="radio" name="dietType" value={type} checked={data.dietType === type} onChange={onChangeHandler} style={{ display: 'none' }} />
                        <span style={{ width: '10px', height: '10px', borderRadius: type === 'Veg' ? '50%' : '0', background: type === 'Veg' ? 'var(--accent)' : 'var(--danger)', display: 'inline-block' }}></span>
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Price (₹) <span className="text-danger">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</span>
                    <input type="number" name="price" className="form-control" placeholder="199" required min={1} value={data.price} onChange={onChangeHandler}
                      style={{ borderRadius: '10px', border: '1.5px solid var(--gray-200)', padding: '10px 14px 10px 30px' }} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Offer / Discount</label>
                  <select name="offer" className="form-select" value={data.offer} onChange={onChangeHandler} style={{ borderRadius: '10px', border: '1.5px solid var(--gray-200)', padding: '10px 14px' }}>
                    {offers.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="col-12 mt-2">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary fw-bold"
                    style={{ borderRadius: '12px', padding: '12px 32px', background: 'var(--primary)', border: 'none', fontSize: '15px' }}>
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Uploading...</>
                    ) : (
                      <><i className="bi bi-plus-circle me-2"></i>Add Food Item</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFood;