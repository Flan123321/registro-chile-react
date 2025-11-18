import React, { useState, useEffect } from 'react';
import './index.css'; 
import { regionesYComunas } from './chileData';
// Importamos la conexión a la nube
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

function App() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false); // Para evitar doble click

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    region: '',
    comuna: ''
  });

  // 1. CONEXIÓN EN VIVO A FIREBASE
  useEffect(() => {
    // Consultamos la colección "registros" ordenados por fecha de sistema
    const q = query(collection(db, "registros"), orderBy("fechaSistema", "desc"));

    // onSnapshot escucha cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datosNube = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistros(datosNube);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      setForm({ ...form, region: value, comuna: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 2. GUARDAR EN LA NUBE
  const handleAgregar = async (e) => {
    e.preventDefault();
    
    if (!form.nombre || !form.apellido || !form.rut || !form.region || !form.comuna) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setEnviando(true); // Bloqueamos el botón mientras sube
      
      await addDoc(collection(db, "registros"), {
        ...form,
        fechaVisible: new Date().toLocaleDateString('es-CL'), // Fecha legible
        fechaSistema: Date.now() // Fecha numérica para ordenar
      });

      // Limpiamos formulario
      setForm({
        nombre: '',
        apellido: '',
        rut: '',
        region: '',
        comuna: ''
      });

    } catch (error) {
      console.error("Error al guardar: ", error);
      alert("Error de conexión. Revisa tu internet o la configuración.");
    } finally {
      setEnviando(false); // Desbloqueamos el botón
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 text-center md:text-left border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Registro Nacional</h1>
          <p className="text-slate-500 mt-2">Base de Datos Centralizada - Chile</p>
        </header>

        {/* AVISO DE SEGURIDAD */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r shadow-sm">
          <div className="flex">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-yellow-800">Aviso de Confidencialidad</h3>
               <div className="mt-1 text-sm text-yellow-700">
                 <p>Los registros se guardan permanentemente en la nube. No se pueden borrar ni editar posteriormente.</p>
               </div>
             </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Nuevo Ingreso</h2>
          <form onSubmit={handleAgregar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            
            {/* Selectores */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Región</label>
              <select name="region" value={form.region} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm">
                <option value="">Seleccionar...</option>
                {Object.keys(regionesYComunas).map(reg => <option key={reg} value={reg}>{reg}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comuna</label>
              <select name="comuna" value={form.comuna} onChange={handleChange} disabled={!form.region} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm disabled:bg-slate-100">
                <option value="">Seleccionar...</option>
                {form.region && regionesYComunas[form.region].map(com => <option key={com} value={com}>{com}</option>)}
              </select>
            </div>

            {/* Inputs Texto */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RUT</label>
              <input type="text" name="rut" value={form.rut} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="12.345.678-9" />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombres</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Nombres" />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Apellidos</label>
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Apellidos" />
            </div>

            {/* Botón con estado de carga */}
            <div className="lg:col-span-6 mt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={enviando}
                className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 text-white
                  ${enviando ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}`}
              >
                {enviando ? 'Guardando...' : 'Subir a la Nube'}
              </button>
            </div>
          </form>
        </div>

        {/* TABLA DE DATOS */}
        <div className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-500 text-sm">Sincronizando con la base de datos...</p>
            </div>
          ) : (
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
                        No hay registros en la nube aún. ¡Sé el primero!
                      </td>
                    </tr>
                  ) : (
                    registros.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-3 border-r border-slate-200 font-mono text-xs text-slate-500">{item.fechaVisible}</td>
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
          )}
        </div>

      </div>
    </div>
  );
}

export default App;git add .
git commit -m "Conectado a Firebase Prod"
git push