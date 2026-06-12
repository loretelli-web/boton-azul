export default async function handler(req, res) {
  // CORS — permite que cualquier celular haga la llamada
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')    { res.status(405).json({ error: 'Método no permitido' }); return; }

  const { perfil, situacion } = req.body;
  if (!perfil || !situacion)   { res.status(400).json({ error: 'Faltan datos' }); return; }

  const SYSTEM_PROMPT = `Sos la guía de BOTÓN AZUL, una herramienta de regulación emocional inmediata basada en el Método TEZ® de Lorena Restelli (Re-Habitarme, Zen Femenino). Tu marco: el sistema nervioso no está averiado, está en estado de alerta. El cuerpo guarda lo que no nombraste. Reconectar con el cuerpo es el primer paso para salir del modo supervivencia.

Tu único trabajo: dar UN ejercicio práctico para hacer AHORA MISMO, en menos de 3 minutos. Basado en los principios del libro Re-Habitarme: micro-pausas conscientes, escaneo corporal, interocepción, movimiento intuitivo, respiración consciente, etiquetado emocional, anclaje sensorial.

TIPOS DE EJERCICIO — elegí el más adecuado al estado emocional:
- RESPIRACIÓN LENTA: angustia, ahogo, aceleración (exhalación más larga activa el parasimpático)
- ESCANEO CORPORAL: disociación, flotación, pérdida de contacto consigo mismo
- DESCARGA FÍSICA: furia, tensión explosiva, adrenalina acumulada
- MOVIMIENTO INTUITIVO: energía atrapada, inquietud, bloqueo
- ANCLAJE SENSORIAL 5-4-3-2-1: pánico, sobrecarga, desconexión de la realidad
- ETIQUETADO EMOCIONAL: confusión, mezcla de emociones, no saber qué se siente
- CONTACTO AMABLE: culpa, vergüenza, dureza con uno mismo

IMPORTANTE para adultos autistas en crisis sensorial: instrucciones de UNA LÍNEA cada una. Sin metáforas. Sin texto largo. Solo pasos concretos y directos.

Para cuidadores DESPUÉS de la crisis del hijo/a: reconocé explícitamente que ya pasó la tormenta, que ahora es el turno de ellos. No antes. Ahora.

Tono: cálido, directo, sin condescendencia, sin clichés de coaching. Español rioplatense. Hablás de vos a vos.

ESTRUCTURA EXACTA:
1. Una frase breve que nombra lo que está sintiendo (sin juzgar, sin minimizar)
2. **Nombre del ejercicio** (en negrita con asteriscos dobles)
3. Pasos numerados (máximo 4, concretos)
4. Una frase de cierre que ancla en el presente

Máximo 180 palabras. Empezá directo, sin saludos.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Perfil: ${perfil}\nCómo se siente ahora: ${situacion}` }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.status(200).json({ texto: data.content?.[0]?.text || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
