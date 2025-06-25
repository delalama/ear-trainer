// src/utils/musicUtils.js

import * as Tone from 'tone';

let synth = null;

// Inicializa el sintetizador de Tone.js.
// Se llamará cuando haya una interacción del usuario (ej. clic en ejercicio).
export const initializeSynth = async () => {
  if (!synth) {
    try {
      // Importante: Tone.start() debe ser llamado después de una interacción del usuario.
      // Si esta función es llamada por un clic, ya estamos bien.
      await Tone.start();
      console.log('Contexto de audio de Tone.js iniciado:', Tone.context.state);

      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          // CAMBIO CLAVE AQUÍ: Usar "triangle" o "sawtooth" para un sonido más brillante
          // 'sine' (pura, suave) -> 'triangle' (un poco más rica) -> 'sawtooth' (brillante, con bordes) -> 'square' (más metálica)
          type: "triangle" // <<-- CAMBIADO A 'triangle' para un sonido más claro y con más cuerpo
          // type: "sawtooth" // Podrías probar 'sawtooth' si quieres aún más brillo
        },
        envelope: {
          attack: 0.005, // Ataque muy rápido
          decay: 0.2,    // <<-- AJUSTE: Decaimiento un poco más largo para que la nota tenga más "cuerpo"
          sustain: 0.1,  // <<-- AJUSTE: Sostenido un poco más para que no decaiga tan rápido
          release: 0.2   // <<-- AJUSTE: Liberación un poco más larga
        },
        // Volumen general del sintetizador. Puedes ajustarlo aquí.
        // Si -5 aún es bajo, prueba -3 o 0.
        volume: -5 // <<-- AJUSTE: Volumen general del sintetizador (desde -10), si quieres más fuerte puedes probar -3 o 0
      }).toDestination();
    } catch (error) {
      console.error("Error al iniciar el contexto de audio de Tone.js:", error);
      // Aquí podrías manejar el error, quizás mostrando un mensaje en la UI
    }
  }
};

// Detiene todas las notas sonando
export const stopAllNotes = () => {
  if (synth) {
    synth.releaseAll();
  }
};

// Reproduce una nota MIDI específica
export const playNote = async (midiNote) => {
  if (!synth) {
    // Si por alguna razón playNote se llama antes que initializeSynth, lo iniciamos aquí.
    // Esto es un fallback, lo ideal es que initializeSynth se llame con el primer clic.
    await initializeSynth();
  }
  const noteName = Tone.Midi(midiNote).toNote();
  // Duración: "4n" (negra) está bien para claridad. Puedes probar "2n" (blanca) para aún más duración.
  // Velocidad: 0.9 para un golpe más fuerte (entre 0 y 1).
  synth.triggerAttackRelease(noteName, "4n", Tone.now(), 0.9); // <<-- AJUSTE: Velocidad 0.9 (más fuerte)
  // La pausa entre notas se maneja en el componente `IntervalIdentification`
};

// Reproduce un acorde (Mayor o Disminuido)
export const playChord = async (rootMidi, type) => {
  if (!synth) {
    await initializeSynth();
  }
  let notesToPlay = [];
  if (type === 'major') {
    notesToPlay = [rootMidi, rootMidi + 4, rootMidi + 7];
  } else if (type === 'diminished') {
    notesToPlay = [rootMidi, rootMidi + 3, rootMidi + 6];
  } else {
    console.warn("Tipo de acorde no reconocido para playChord:", type);
    return;
  }

  const noteNames = notesToPlay.map(midi => Tone.Midi(midi).toNote());
  // Mantenemos "8n" para los acordes rápidos, ya que te gustó este sonido.
  synth.triggerAttackRelease(noteNames, "8n");
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const midiToNoteName = (midi) => {
  return Tone.Midi(midi).toNote();
};

export const MIN_MIDI_NOTE = 36;
export const MAX_MIDI_NOTE = 84;

export const INTERVAL_DATA = [
  // ... tus datos de intervalos ...
  { name: 'Unísono', shortName: 'UN', semitones: 0, direction: 'asc' },
  { name: '2ª menor', shortName: '2m', semitones: 1, direction: 'asc' },
  { name: '2ª Mayor', shortName: '2M', semitones: 2, direction: 'asc' },
  { name: '3ª menor', shortName: '3m', semitones: 3, direction: 'asc' },
  { name: '3ª Mayor', shortName: '3M', semitones: 4, direction: 'asc' },
  { name: '4ª Justa', shortName: '4J', semitones: 5, direction: 'asc' },
  { name: '4ª Aumentada / 5ª disminuida', shortName: '4A/5d', semitones: 6, direction: 'asc' },
  { name: '5ª Justa', shortName: '5J', semitones: 7, direction: 'asc' },
  { name: '6ª menor', shortName: '6m', semitones: 8, direction: 'asc' },
  { name: '6ª Mayor', shortName: '6M', semitones: 9, direction: 'asc' },
  { name: '7ª menor', shortName: '7m', semitones: 10, direction: 'asc' },
  { name: '7ª Mayor', shortName: '7M', semitones: 11, direction: 'asc' },
  { name: '8ª Justa (Octava)', shortName: '8J', semitones: 12, direction: 'asc' },
  // Intervalos descendentes
  { name: '2ª menor', shortName: '2m-D', semitones: -1, direction: 'desc' },
  { name: '2ª Mayor', shortName: '2M-D', semitones: -2, direction: 'desc' },
  { name: '3ª menor', shortName: '3m-D', semitones: -3, direction: 'desc' },
  { name: '3ª Mayor', shortName: '3M-D', semitones: -4, direction: 'desc' },
  { name: '4ª Justa', shortName: '4J-D', semitones: -5, direction: 'desc' },
  { name: '4ª Aumentada / 5ª disminuida', shortName: '4A/5d-D', semitones: -6, direction: 'desc' },
  { name: '5ª Justa', shortName: '5J-D', semitones: -7, direction: 'desc' },
  { name: '6ª menor', shortName: '6m-D', semitones: -8, direction: 'desc' },
  { name: '6ª Mayor', shortName: '6M-D', semitones: -9, direction: 'desc' },
  { name: '7ª menor', shortName: '7m-D', semitones: -10, direction: 'desc' },
  { name: '7ª Mayor', shortName: '7M-D', semitones: -11, direction: 'desc' },
  { name: '8ª Justa (Octava)', shortName: '8J-D', semitones: -12, direction: 'desc' },
];

export const getPlayableIntervals = (baseMidiNote, maxSemitonesJump) => {
    return INTERVAL_DATA.filter(interval => {
      const targetNote = baseMidiNote + interval.semitones;
      return targetNote >= MIN_MIDI_NOTE && targetNote <= MAX_MIDI_NOTE &&
             Math.abs(interval.semitones) <= maxSemitonesJump;
    });
};

export const getRandomNote = () => {
    const minMidi = 60; // C4
    const maxMidi = 72; // C5
    return Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
};