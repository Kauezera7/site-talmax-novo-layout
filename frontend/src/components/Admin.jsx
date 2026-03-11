import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Image as ImageIcon, List } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    image: null,
    features: [''],
    models: [{ type: '', code: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/categories')
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      setProducts(prods);
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setLoading(false);
    }
  };

  // Funções para lidar com o formulário
  const handleAddFeature = () => setFormData({...formData, features: [...formData.features, '']});
  const handleRemoveFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({...formData, features: newFeatures});
  };

  const handleAddModel = () => setFormData({...formData, models: [...formData.models, { type: '', code: '' }]});
  const handleRemoveModel = (index) => {
    const newModels = formData.models.filter((_, i) => i !== index);
    setFormData({...formData, models: newModels});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);
    
    // Organiza os dados extras (JSON)
    const extraData = {
      features: formData.features.filter(f => f !== ''),
      models: formData.models.filter(m => m.type !== '' || m.code !== '')
    };
    data.append('extra_data', JSON.stringify(extraData));

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: data
      });
      if (res.ok) {
        alert("Produto cadastrado com sucesso!");
        setFormData({
          name: '', category_id: '', description: '', image: null,
          features: [''], models: [{ type: '', code: '' }]
        });
        fetchData();
      }
    } catch (err) {
      alert("Erro ao salvar produto");
    }
  };

  if (loading) return <div className="admin-loading">Carregando Painel...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1><Package size={24} /> Painel Administrativo Talmax</h1>
      </header>

      <div className="admin-grid">
        {/* Formulário de Cadastro */}
        <section className="admin-card">
          <h2><Plus size={20} /> Novo Produto</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nome do Produto</label>
              <input 
                type="text" required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Pedras Ninja para Metal"
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select 
                required
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea 
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group">
              <label><ImageIcon size={16} /> Foto do Produto</label>
              <input 
                type="file" 
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
              />
            </div>

            {/* Seção de Características */}
            <div className="admin-section">
              <label>Características Principais</label>
              {formData.features.map((feature, index) => (
                <div key={index} className="dynamic-input">
                  <input 
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      setFormData({...formData, features: newFeatures});
                    }}
                    placeholder="Ex: Caixa com 10 unidades"
                  />
                  <button type="button" onClick={() => handleRemoveFeature(index)}><Trash2 size={16}/></button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={handleAddFeature}>+ Adicionar Linha</button>
            </div>

            {/* Seção de Modelos / Opções */}
            <div className="admin-section">
              <label>Modelos / Códigos</label>
              {formData.models.map((model, index) => (
                <div key={index} className="dynamic-input-group">
                  <input 
                    placeholder="Tipo (Ex: W2)"
                    value={model.type}
                    onChange={(e) => {
                      const newModels = [...formData.models];
                      newModels[index].type = e.target.value;
                      setFormData({...formData, models: newModels});
                    }}
                  />
                  <input 
                    placeholder="Código (Ex: 19120)"
                    value={model.code}
                    onChange={(e) => {
                      const newModels = [...formData.models];
                      newModels[index].code = e.target.value;
                      setFormData({...formData, models: newModels});
                    }}
                  />
                  <button type="button" onClick={() => handleRemoveModel(index)}><Trash2 size={16}/></button>
                </div>
              ))}
              <button type="button" className="btn-add" onClick={handleAddModel}>+ Adicionar Modelo</button>
            </div>

            <button type="submit" className="btn-submit"><Save size={18} /> SALVAR NO SITE</button>
          </form>
        </section>

        {/* Lista de Produtos Atuais */}
        <section className="admin-card">
          <h2><List size={20} /> Produtos no Banco</h2>
          <div className="admin-list">
            {products.map(p => (
              <div key={p.id} className="admin-item">
                <img src={p.main_image || '/img/placeholder.png'} alt={p.name} />
                <div className="item-info">
                  <strong>{p.name}</strong>
                  <span>{p.category_name}</span>
                </div>
                <button className="btn-delete"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
