// Este es el código del servidor que Vercel ejecutará
// Se usa para ocultar el APIFY_TOKEN y realizar la consulta externa.

import fetch from 'node-fetch';

// Vercel carga este token automáticamente desde las Environment Variables
const APIFY_TOKEN = process.env.APIFY_TOKEN; 
const ACTOR_ID = 'datacach/rutificador'; // ID del actor de Nombrerutyfirma

// Función de utilidad para esperar (polling)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default async function rutificar(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method Not Allowed' });
  }

  try {
    const { rutLimpio } = req.body; // Recibimos el RUT sin formato (ej: 12345678K)
    
    if (!rutLimpio || !APIFY_TOKEN) {
      return res.status(400).send({ error: 'RUT o token de Apify faltante.' });
    }

    // 1. Ejecutar el Actor de Apify
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
    });

    const runData = await runResponse.json();
    const runId = runData.data.id;
    
    // 2. Polling: Esperar hasta que el Actor termine (máx. 60 segundos)
    let isFinished = false;
    let attempts = 0;
    const maxAttempts = 20; // Revisa cada 3 segundos, máximo 20 veces (60s)

    while (!isFinished && attempts < maxAttempts) {
      await sleep(3000); // Esperar 3 segundos
      attempts++;

      const statusUrl = `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`;
      const statusResponse = await fetch(statusUrl);
      const statusData = await statusResponse.json();

      if (statusData.data.status === 'SUCCEEDED') {
        isFinished = true;
      } else if (statusData.data.status === 'FAILED') {
        return res.status(500).json({ valido: false, error: 'Consulta Apify fallida.' });
      }
    }

    if (!isFinished) {
        return res.status(504).json({ valido: false, error: 'Tiempo de espera excedido para Apify.' });
    }

    // 3. Obtener el resultado final del dataset
    const datasetUrl = `https://api.apify.com/v2/actor-runs/${runId}/datasets/last/items?token=${APIFY_TOKEN}`;
    const datasetResponse = await fetch(datasetUrl);
    const results = await datasetResponse.json();

    // 4. Analizar la respuesta de Apify
    const personaEncontrada = results.length > 0 && results[0].name && results[0].lastName;

    if (personaEncontrada) {
      // Si Apify encuentra nombre y apellido, lo consideramos válido
      res.status(200).json({ 
        valido: true, 
        nombreEncontrado: results[0].name,
        apellidoEncontrado: results[0].lastName,
        mensaje: 'RUT Validado con éxito.' 
      });
    } else {
      // Apify no encontró una persona asociada al RUT
      res.status(200).json({ 
        valido: false, 
        mensaje: 'RUT matemáticamente válido, pero no existe en el registro público.' 
      });
    }

  } catch (error) {
    console.error('Error al procesar la consulta de Apify:', error);
    res.status(500).json({ valido: false, error: 'Error interno del servidor.' });
  }
}