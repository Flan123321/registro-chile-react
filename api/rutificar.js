// Este es el código del servidor que Vercel ejecutará
// Se usa para OCULTAR el APIFY_TOKEN y realizar la consulta externa.

import fetch from 'node-fetch';

// Vercel carga este token automáticamente desde la variable de entorno
const APIFY_TOKEN = process.env.APIFY_TOKEN; 
const ACTOR_ID = 'datacach/rutificador';

// Función de utilidad para esperar (polling)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function rutificar(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  try {
    const { rutLimpio } = req.body;
    
    // 1. Verificar Token (si el token no existe, enviamos error 401)
    if (!APIFY_TOKEN) {
      // Este error es visible en los logs de Vercel si la variable no está cargada
      return res.status(401).json({ valido: false, mensaje: 'Error de configuración: APIFY_TOKEN faltante.' });
    }
    
    if (!rutLimpio) {
      return res.status(400).send({ valido: false, mensaje: 'RUT es requerido.' });
    }

    // 2. Ejecutar el Actor de Apify
    const runUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run?token=${APIFY_TOKEN}`;
    const payload = {
      searchType: "Rut",
      searchTerms: [rutLimpio],
      searchByLocation: false 
    };

    const runResponse = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Añadimos timeout por si la API de Apify está lenta
      timeout: 15000 
    });

    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // 3. Polling: Esperar hasta que el Actor termine (máx. 60 segundos)
    let isFinished = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!isFinished && attempts < maxAttempts) {
      await sleep(3000); 
      attempts++;

      const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`;
      const statusResponse = await fetch(statusUrl);
      const statusData = await statusResponse.json();

      if (statusData.data.status === 'SUCCEEDED') {
        isFinished = true;
      } else if (statusData.data.status === 'FAILED') {
        return res.status(200).json({ valido: false, mensaje: 'Consulta Apify fallida.' });
      }
    }

    if (!isFinished) {
        return res.status(200).json({ valido: false, mensaje: 'Tiempo de espera excedido. No se pudo verificar la existencia.' });
    }

    // 4. Obtener el resultado final del dataset
    const datasetUrl = `https://api.apify.com/v2/actor-runs/${runId}/datasets/last/items?token=${APIFY_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);
    const results = await datasetResponse.json();

    // 5. Analizar la respuesta de Apify
    const personaEncontrada = results.length > 0 && results[0].name && results[0].lastName;

    if (personaEncontrada) {
      res.status(200).json({ 
        valido: true, 
        mensaje: 'RUT Validado: Existe en el registro público.' 
      });
    } else {
      res.status(200).json({ 
        valido: false, 
        mensaje: 'RUT no asociado a una persona en el registro público.' 
      });
    }

  } catch (error) {
    // Si hay un error general de conexión (timeout, DNS, node-fetch), caemos aquí
    console.error('Error general del serverless function:', error.message);
    res.status(500).json({ valido: false, mensaje: 'Error interno del servidor. Revisar logs de Vercel.' });
  }
}