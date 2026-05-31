"""
Vita — Voiceover generator con Edge TTS (gratis, sin API key).

Voz: es-MX-JorgeNeural — masculina mexicana, grave, mide su entonación.
Equivalente cercano a "Edoardo Dark Measured" de ElevenLabs.

SSML usado para:
  - <prosody rate="-8%"> → un toque más lento que el default (más "measured")
  - <break time="800ms"/> → pausas naturales antes de cifras y conceptos clave
  - <emphasis level="strong"> → énfasis en números económicos

Genera: demo-assets/narracion.mp3
"""
import asyncio
import os
import sys

import edge_tts

OUT = os.path.join(
    os.path.dirname(__file__), "..", "..", "demo-assets", "narracion.mp3"
)
VOICE = "es-MX-JorgeNeural"

# Texto plano — Edge TTS le mete su propia prosodia neuronal.
# Los puntos y los puntos suspensivos guían las pausas. Cifras escritas en
# letras para que las pronuncie en español correcto.
SCRIPT = """En Santa Cruz, un productor de soya con doce hectáreas... pierde más de cuatrocientos bolivianos al mes. Por un solo mal diagnóstico de plagas.

Vita usa visión artificial para identificar plagas y enfermedades en soya, maíz, sorgo y arroz. Una foto desde el celular. Ocho segundos. Diagnóstico de nivel agrónomo.

El productor abre la app. Toma una foto de la hoja afectada. Gemini analiza la imagen, identifica la plaga, calcula severidad y confianza. Le entrega tratamiento orgánico, tratamiento químico con dosis exacta por hectárea, y la decisión económica en bolivianos. Cuánto cuesta tratar. Cuánto recupera. Si va a llover en las próximas cuarenta y ocho horas... Vita le dice que espere.

Las cooperativas y SENASAG acceden al panel Vita. Ven los focos de infestación por zona, en tiempo real. Datos agregados anónimos. Política pública informada por inteligencia artificial.

Setenta bolivianos al mes el productor. Mil al mes la cooperativa. Retorno seis punto cinco veces el primer mes. Margen bruto del noventa y nueve por ciento.

Vita. Visión inteligente para tu cosecha.
"""


async def main() -> None:
    print(f"[tts] generating voiceover with {VOICE}")
    communicate = edge_tts.Communicate(
        text=SCRIPT,
        voice=VOICE,
        rate="-8%",     # un toque más lento para tono "measured"
        pitch="-3Hz",   # un poco más grave para tono "dark"
        volume="+0%",
    )
    await communicate.save(OUT)
    size = os.path.getsize(OUT)
    print(f"[tts] saved {OUT} ({size:,} bytes)")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"FATAL: {e}", file=sys.stderr)
        sys.exit(1)
