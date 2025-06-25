// src/components/IntervalTrainer.jsx
import React, { useState, useEffect } from 'react';
import {
  MIN_MIDI_NOTE,
  MAX_MIDI_NOTE,
  getPlayableIntervals,
  midiToNoteName,
  getRandomNote,
  playNote
} from '../utils/musicUtils.js';

const IntervalTrainer = () => {
  const [currentReferenceNote, setCurrentReferenceNote] = useState(null);
  const [correctInterval, setCorrectInterval] = useState(null); // Debe contener el objeto completo del intervalo
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [maxJump, setMaxJump] = useState(12);

  const jumpOptions = [
    { value: 2, label: 'Hasta 2ª Mayor' },
    { value: 4, label: 'Hasta 3ª Mayor' },
    { value: 7, label: 'Hasta 5ª Justa' },
    { value: 12, label: 'Hasta Octava' },
    { value: 14, label: 'Hasta 9ª Mayor' },
    { value: 17, label: 'Hasta 11ª Justa' },
    { value: 21, label: 'Hasta 13ª Mayor' },
  ];

  useEffect(() => {
    startNewRound(true); // Al cargar o cambiar maxJump, siempre empieza una cadena nueva
  }, [maxJump]);

  useEffect(() => {
    if (currentReferenceNote !== null && correctInterval !== null) {
      const playRefOnNewRound = async () => {
        await playNote(currentReferenceNote);
        // Aseguramos que correctInterval.name exista antes de usarlo
        setFeedback(`Canta un **${correctInterval.name} ${correctInterval.direction.toUpperCase()}** desde ${midiToNoteName(currentReferenceNote)}.`);
      };
      const timeoutId = setTimeout(playRefOnNewRound, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [currentReferenceNote, correctInterval]);


  const startNewRound = (isNewChain = false) => {
    setFeedback('');
    setShowAnswer(false);

    let refNote = currentReferenceNote;

    // Si es una nueva cadena (inicio del ejercicio o cambio de Salto Máximo)
    // O si no hay una nota de referencia previa (primera carga)
    // Elegimos una nota aleatoria.
    if (isNewChain || refNote === null) {
      refNote = getRandomNote();
    } else if (correctInterval !== null) {
      // SI NO es una nueva cadena, calculamos la nueva refNote a partir del intervalo anterior
      refNote = refNote + correctInterval.semitones;
    }

    let possibleIntervals = []; // Inicializamos como array vacío
    let selectedInterval = null; // Inicializamos como null
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // Límite para evitar bucles infinitos

    do {
      // Intentamos obtener intervalos jugables desde la refNote actual
      possibleIntervals = getPlayableIntervals(refNote, maxJump);

      if (possibleIntervals.length > 0) {
        // Si hay intervalos jugables, selecciona uno y sal del bucle
        selectedInterval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
        break; // Sale del do...while
      }

      // Si no hay intervalos jugables desde esta refNote, intentamos con una nueva refNote aleatoria
      refNote = getRandomNote();
      attempts++;

    } while (attempts < MAX_ATTEMPTS); // Continuar mientras no se encuentre un intervalo y no se excedan los intentos

    // Si después de los intentos no se encontró un intervalo válido
    if (!selectedInterval) {
      setFeedback('No se pudo encontrar un intervalo jugable con los ajustes actuales. Intenta ajustar el Salto Máximo.');
      setCurrentReferenceNote(null);
      setCorrectInterval(null);
      return;
    }
    
    // Una vez que tenemos un selectedInterval válido
    setCurrentReferenceNote(refNote);
    setCorrectInterval(selectedInterval);
  };

  const handlePlayReferenceNote = async () => {
    if (currentReferenceNote !== null) {
      await playNote(currentReferenceNote);
      setFeedback('Nota de referencia reproducida.');
    }
  };

  const handlePlayIntervalEndNote = async () => {
    if (currentReferenceNote && correctInterval) {
      setFeedback('Reproduciendo la nota final del intervalo...');
      await playNote(currentReferenceNote + correctInterval.semitones);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    if (correctInterval) {
      setFeedback(`El intervalo era: **${correctInterval.name} ${correctInterval.direction.toUpperCase()}**.`);
    }
  };

  return (
    <div className="exercise-container">
      <h2>Entrenador de Cadenas de Intervalos</h2>
      <p>La nota base del siguiente intervalo es el resultado del intervalo anterior.</p>

      <div className="settings-panel">
        <label htmlFor="maxJump">Salto Máximo:</label>
        <select
          id="maxJump"
          value={maxJump}
          onChange={(e) => setMaxJump(parseInt(e.target.value))}
        >
          {jumpOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {currentReferenceNote && correctInterval ? (
        <>
          <p>Nota de Referencia: <strong>{midiToNoteName(currentReferenceNote)}</strong></p>

          <button onClick={handlePlayReferenceNote}>
            Reproducir Nota de Referencia
          </button>

          <button onClick={handlePlayIntervalEndNote}>
            Reproducir Nota Final del Intervalo
          </button>

          <button onClick={handleShowAnswer} disabled={showAnswer}>
            Mostrar Respuesta
          </button>

          <button onClick={() => startNewRound(false)}>
            Siguiente Intervalo
          </button>

          <div className="feedback-area">
            <p>{feedback}</p>
          </div>
        </>
      ) : (
        <p>{feedback || 'Cargando ejercicio o no hay intervalos jugables. Ajusta el salto máximo.'}</p>
      )}
    </div>
  );
};

export default IntervalTrainer;