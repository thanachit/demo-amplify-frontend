import { useState, useEffect } from 'react';
import { apiFetch } from './api';

const EDITABLE_COLS = ['name', 'description'];
const EMPTY_FORM = { name: '', description: '' };

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product ? { name: product.name, description: product.description } : EMPTY_FORM);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>{product ? 'Edit Product' : 'New Product'}</h3>
        <form onSubmit={handleSubmit}>
          {EDITABLE_COLS.map(col => (
            <div className="form-group" key={col}>
              <label>{col}</label>
              <input
                value={form[col]}
                onChange={e => setForm(f => ({ ...f, [col]: e.target.value }))}
                required
              />
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '0.95rem' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch('/items');
      setRows(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(form) {
    try {
      if (modal === 'create') {
        await apiFetch('/items', { method: 'POST', body: JSON.stringify(form) });
      } else {
        await apiFetch(`/items/${modal.id}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await apiFetch(`/items/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="loading" style={{ color: '#c47a8a' }}>{error}</p>;

  return (
    <>
      <div className="table-wrapper">
        <div className="table-toolbar">
          <h2>Products</h2>
          <button className="btn-primary" onClick={() => setModal('create')}>+ New Product</button>
        </div>
        {!rows.length ? <p className="loading">No products found.</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Description</th><th>Created At</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.description}</td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn-action" onClick={() => setModal(row)}>Edit</button>
                    <button className="btn-action btn-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

export default ProductList;
