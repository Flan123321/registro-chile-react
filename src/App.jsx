import React, { useState, useEffect } from 'react';
import './index.css'; 
import { regionesYComunas } from './chileData'; // <--- IMPORTANTE: Importamos la data externa

function App() {
  // 1. Estado: Intentamos leer 'registros' desde LocalStorage. Si no existe, iniciamos array vacío.
  const [registros, setRegistros] = useState(() => {
    const guardado = localStorage.getItem('registrosCL');
    return guardado ? JSON.parse(guardado) : [];
  });

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    region: '',
    comuna: ''
  });

  // 2. Efecto: Cada vez que 'registros' cambie, lo guardamos en LocalStorage
  useEffect(() => {
    localStorage.setItem('registrosCL', JSON.stringify(registros));
  }, [registros]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      // Al cambiar región, reseteamos la comuna
      setForm({ ...form, region: value, comuna: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAgregar = (e) => {
    e.preventDefault();
    
    if (!form.nombre || !form.apellido || !form.rut || !form.region || !form.comuna) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Creamos el objeto
    const nuevoRegistro = {
      id: Date.now(), // ID único basado en el tiempo
      fecha: new Date().toLocaleDateString('es-CL'), // Agregamos fecha de ingreso
      ...form
    };

    // Guardamos (Append only)
    setRegistros([...registros, nuevoRegistro]);

    // Limpiamos formulario
    setForm({
      nombre: '',
      apellido: '',
      rut: '',
      region: '',
      comuna: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <header className="mb-8 text-center md:text-left border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Registro Nacional</h1>
          <p className="text-slate-500 mt-2">Sistema de ingreso inmutable - Base de datos Local</p>
        </header>

        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Nuevo Ingreso</h2>
          <form onSubmit={handleAgregar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            
            {/* Selector Región */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Región</label>
              <select 
                name="region" 
                value={form.region} 
                onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 text-sm"
              >
                <option value="">Seleccionar Región...</option>
                {Object.keys(regionesYComunas).map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            {/* Selector Comuna */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comuna</label>
              <select 
                name="comuna" 
                value={form.comuna} 
                onChange={handleChange}
                disabled={!form.region}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-700 text-sm disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">Seleccionar Comuna...</option>
                {form.region && regionesYComunas[form.region].map(com => (
                  <option key={com} value={com}>{com}</option>
                ))}
              </select>
            </div>

            {/* Inputs Simples */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RUT</label>
              <input 
                type="text" name="rut" value={form.rut} onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="12.345.678-9"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombres</label>
              <input 
                type="text" name="nombre" value={form.nombre} onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Nombres del usuario"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Apellidos</label>
              <input 
                type="text" name="apellido" value={form.apellido} onChange={handleChange}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Apellidos del usuario"
              />
            </div>

            {/* Botón Guardar */}
            <div className="lg:col-span-6 mt-2 flex justify-end">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar Persona
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO TIPO EXCEL */}
        <div className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="px-6 py-4 font-extrabold border-r border-slate-300">Fecha</th>
                  <th className="px-6 py-4 font-extrabold border-r border-slate-300">RUT</th>
                  <th className="px-6 py-4 font-extrabold border-r border-slate-300">Apellidos</th>
                  <th className="px-6 py-4 font-extrabold border-r border-slate-300">Nombres</th>
                  <th className="px-6 py-4 font-extrabold border-r border-slate-300">Región</th>
                  <th className="px-6 py-4 font-extrabold">Comuna</th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                      La base de datos está vacía. Añade el primer registro arriba.
                    </td>
                  </tr>
                ) : (
                  registros.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-3 border-r border-slate-200 font-mono text-xs text-slate-500">{item.fecha}</td>
                      <td className="px-6 py-3 border-r border-slate-200 font-mono font-bold text-slate-700">{item.rut}</td>
                      <td className="px-6 py-3 border-r border-slate-200">{item.apellido}</td>
                      <td className="px-6 py-3 border-r border-slate-200">{item.nombre}</td>
                      <td className="px-6 py-3 border-r border-slate-200">{item.region}</td>
                      <td className="px-6 py-3 font-medium text-indigo-900 bg-indigo-50/30">{item.comuna}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
             <span className="text-xs text-slate-500 font-medium">Total Registros: {registros.length}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;