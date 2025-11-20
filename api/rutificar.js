import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

// --- 1. DATOS DE REGIONES Y COMUNAS ---
const regionesYComunas = {
  "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
  "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
  "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
  "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
  "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
  "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Til Til", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
  "Libertador Gral. Bernardo O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
  "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
  "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
  "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
  "Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
  "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
  "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
  "Aysén del Gral. Carlos Ibáñez del Campo": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
  "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos (Ex Navarino)", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

// --- 2. CONFIGURACIÓN FIREBASE (Tus credenciales) ---
const firebaseConfig = {
  apiKey: "AIzaSyAAFQTs3e1fMUKeNFLRRJmYUruiWBUpfB4",
  authDomain: "registro-chile.firebaseapp.com",
  projectId: "registro-chile",
  storageBucket: "registro-chile.firebasestorage.app",
  messagingSenderId: "878816207410",
  appId: "1:878816207410:web:0a9d2fbdcb53e4c4aa922b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 3. FUNCIONES DE UTILIDAD (Fuera del componente) ---

// Función para validar el Dígito Verificador del RUT (Check matemático)
const validarRut = (rut) => {
    if (!rut) return false;
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length < 8) return false;

    let total = 0;
    let factor = 2;
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        total += cuerpo[i] * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }

    const dvEsperado = 11 - (total % 11);
    let dvCalculado;

    if (dvEsperado === 11) {
        dvCalculado = '0';
    } else if (dvEsperado === 10) {
        dvCalculado = 'K';
    } else {
        dvCalculado = String(dvEsperado);
    }

    return dv === dvCalculado;
};

// Función para dar formato al RUT (XX.XXX.XXX-X)
const formatearRut = (rut) => {
    if (!rut) return '';
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rut.length === 0) return '';
    
    let cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return `${cuerpo}-${dv}`;
};

// --- NUEVA FUNCIÓN: Enmascara el RUT (17.***.***-K) ---
const maskRut = (fullRut) => {
    if (!fullRut) return '';
    const cleanedRut = fullRut.replace(/[^0-9kK]/g, ''); // 17456789K
    const dv = cleanedRut.slice(-1); // K
    const body = cleanedRut.slice(0, -1); // 17456789

    // Tomamos los primeros dos dígitos (17) y el DV (K).
    // El resto son asteriscos con el formato de puntos.
    if (body.length < 2) return fullRut; // Si es muy corto, mostramos completo (error de ingreso)
    
    const start = body.substring(0, 2);
    
    return `${start}.***.***-${dv}`;
};

// --- NUEVA FUNCIÓN: Enmascara el Nombre (J. P. S.) ---
const maskName = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/); // Separa por espacios
    // Devuelve la primera letra de cada parte, seguida de un punto.
    return parts.map(part => `${part.charAt(0)}.` ).join(' ');
};


// --- 4. COMPONENTE PRINCIPAL ---
function App() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [rutInvalido, setRutInvalido] = useState(null); 

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    region: '',
    comuna: ''
  });

  // Conexión a Firebase en tiempo real
  useEffect(() => {
    const q = query(collection(db, "registros"), orderBy("fechaSistema", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datosNube = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistros(datosNube);
      setCargando(false);
    }, (error) => {
      console.error("Error al leer datos:", error);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const rutLimpio = value.replace(/[^0-9kK]/g, '');
      const rutFormateado = formatearRut(rutLimpio);
      setForm({ ...form, rut: rutFormateado });
      setRutInvalido(null);
    } else if (name === 'region') {
      setForm({ ...form, region: value, comuna: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const limpiarFormulario = () => {
    setForm({ nombre: '', apellido: '', rut: '', region: '', comuna: '' });
  };

  const getErrorText = () => {
    switch (rutInvalido) {
      case 'math':
        return 'ERROR: Dígito Verificador incorrecto. Verifique el número.';
      case 'duplicate':
        return 'ERROR: Este RUT ya existe. Solo se permite un registro por RUT.';
      case 'apify':
        return 'ADVERTENCIA: RUT no asociado a una persona en el registro público.';
      default:
        return 'RUT Inválido.';
    }
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    
    if (!form.nombre || !form.apellido || !form.rut || !form.region || !form.comuna) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setEnviando(true);
    const rutLimpio = form.rut.replace(/[^0-9kK]/g, '').toUpperCase();

    // 1. Validación de Dígito Verificador
    if (!validarRut(form.rut)) {
      setRutInvalido('math');
      alert("ERROR: El RUT es matemáticamente INCORRECTO y ha sido rechazado.");
      limpiarFormulario();
      setEnviando(false);
      return;
    }
    
    // 2. Validación de Unicidad
    // Comprueba duplicidad limpiando ambos RUTs de formato (lo que garantiza la seguridad)
    const rutExistente = registros.some(r => r.rut.replace(/[^0-9kK]/g, '').toUpperCase() === rutLimpio);

    if (rutExistente) {
      setRutInvalido('duplicate');
      alert(`ERROR: El RUT ${form.rut} ya se encuentra registrado. Solo se permite un registro por RUT.`);
      limpiarFormulario();
      setEnviando(false);
      return;
    }

    // 3. Validación de Existencia Real (a través del Backend Proxy)
    try {
      const proxyResponse = await fetch('/api/rutificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rutLimpio }), 
      });

      const data = await proxyResponse.json();

      if (!data.valido) {
        setRutInvalido('apify');
        alert(`REGISTRO RECHAZADO: El RUT es válido, pero no se encontró en el registro público (${data.mensaje}).`);
        limpiarFormulario();
        setEnviando(false);
        return;
      }
      
      // 4. Si es válido en todas las etapas, guardar en Firebase
      setRutInvalido(null);
      await addDoc(collection(db, "registros"), {
        ...form,
        fechaVisible: new Date().toLocaleDateString('es-CL'),
        fechaSistema: Date.now()
      });

      limpiarFormulario();

    } catch (error) {
      console.error("Error en la conexión al proxy de Apify:", error);
      alert("Error crítico al validar el RUT (Problema de conexión al Servidor Serverless).");
    } finally {
      setEnviando(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 text-center md:text-left border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-800">Registro Nacional</h1>
          <p className="text-slate-500 mt-2">Cuadratura de Votos - Chile</p>
        </header>

        {/* --- AVISO ACTUALIZADO --- */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r shadow-sm">
          <div className="flex">
             <div className="flex-shrink-0">
               <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
               </svg>
             </div>
             <div className="ml-3">
               <h3 className="text-sm font-medium text-yellow-800">Especificación Técnica: Auditoría Cívica</h3>
               <div className="mt-1 text-sm text-yellow-700">
                 <p>
                   Este registro cuantifica la participación para verificar la cuadratura de votos en las actas electorales del Servel.
                 </p>
                 <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li><span className="font-semibold">Filtro Nivel 1 (DV):</span> Chequeo criptográfico del Dígito Verificador del RUT.</li>
                    <li><span className="font-semibold">Filtro Nivel 2 (Unicidad):</span> Prevención estricta de duplicidad de registros.</li>
                    <li><span className="font-semibold">Filtro Nivel 3 (Trazabilidad):</span> Validación externa de existencia en el registro público.</li>
                 </ul>
               </div>
             </div>
          </div>
        </div>
        {/* --- FIN AVISO ACTUALIZADO --- */}

        {/* --- FORMULARIO DE INGRESO --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">Nuevo Ingreso</h2>
          <form onSubmit={handleAgregar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Región</label>
              <select name="region" value={form.region} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm text-slate-700">
                <option value="">Seleccionar...</option>
                {Object.keys(regionesYComunas).map(reg => (<option key={reg} value={reg}>{reg}</option>))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comuna</label>
              <select name="comuna" value={form.comuna} onChange={handleChange} disabled={!form.region} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-sm text-slate-700 disabled:bg-slate-100">
                <option value="">Seleccionar...</option>
                {form.region && regionesYComunas[form.region].map(com => (<option key={com} value={com}>{com}</option>))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RUT</label>
              <input 
                type="text" 
                name="rut" 
                value={form.rut} 
                onChange={handleChange}
                className={`w-full p-2.5 border rounded-lg focus:ring-2 outline-none text-sm text-slate-700
                  ${rutInvalido !== null ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`}
                placeholder="12.345.678-9"
                maxLength={12} 
              />
               {rutInvalido !== null && (
                <p className="text-red-500 text-xs mt-1 font-semibold">{getErrorText()}</p>
              )}
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombres</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700" placeholder="Ingresa los nombres" />
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Apellidos</label>
              <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700" placeholder="Ingresa los apellidos" />
            </div>

            <div className="lg:col-span-6 mt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={enviando}
                className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-2 text-white
                  ${enviando ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}`}
              >
                {enviando ? 'Validando RUT...' : 'Subir Registro'}
              </button>
            </div>
          </form>
        </div>

        {/* --- TABLA DE DATOS (LISTADO) --- */}
        <div className="bg-white rounded-lg shadow-md border border-slate-300 overflow-hidden">
          <div className="p-4 bg-slate-100 border-b border-slate-300 text-sm font-bold text-slate-700 flex justify-between items-center">
            <span>Listado de Registros Válidos (Solo Lectura)</span>
            <span>Total: <span className="text-indigo-600 text-lg">{registros.length}</span></span>
          </div>

          {cargando ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-500 text-sm">Sincronizando con la base de datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-200 border-b border-slate-300">
                  <tr>
                    <th className="px-6 py-4 font-extrabold border-r border-slate-300">Fecha</th>
                    <th className="px-6 py-4 font-extrabold border-r border-slate-300">RUT (Parcial)</th>
                    <th className="px-6 py-4 font-extrabold border-r border-slate-300">Apellidos (Iniciales)</th>
                    <th className="px-6 py-4 font-extrabold border-r border-slate-300">Nombres (Iniciales)</th>
                    <th className="px-6 py-4 font-extrabold border-r border-slate-300">Región</th>
                    <th className="px-6 py-4 font-extrabold">Comuna</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                        No hay registros cargados.
                      </td>
                    </tr>
                  ) : (
                    registros.map((item) => (
                      <tr key={item.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-3 border-r border-slate-200 font-mono text-xs text-slate-500">{item.fechaVisible}</td>
                        {/* Se aplica enmascaramiento aquí */}
                        <td className="px-6 py-3 border-r border-slate-200 font-mono font-bold text-slate-700">{maskRut(item.rut)}</td>
                        <td className="px-6 py-3 border-r border-slate-200">{maskName(item.apellido)}</td>
                        <td className="px-6 py-3 border-r border-slate-200">{maskName(item.nombre)}</td>
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

export default App;