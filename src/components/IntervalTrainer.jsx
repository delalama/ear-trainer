// src/components/IntervalTrainer.jsx
import React, { useState, useEffect } from 'react';
import {
  MIN_MIDI_NOTE,
  MAX_MIDI_NOTE,
  getPlayableIntervals, // Esta función ya debería devolver objetos completos
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

  // Inicia una nueva ronda cuando el componente se monta o cambia el salto máximo
  useEffect(() => {
    startNewRound(true);
  }, [maxJump]);

  // Reproducción automática de la nota de referencia al inicio de la ronda
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

    if (isNewChain || refNote === null) {
      refNote = getRandomNote();
    } else if (correctInterval !== null) {
      refNote = refNote + correctInterval.semitones;
    }

    let possibleIntervals;
    let selectedInterval;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    do {
      if (attempts === MAX_ATTEMPTS) {
        setFeedback('No se pudo encontrar una cadena de intervalos jugable. Intenta ajustar el Salto Máximo o reinicia el ejercicio.');
        setCurrentReferenceNote(null);
        setCorrectInterval(null); // Asegurarse de limpiar si hay error
        return;
      }
      
      // Obtener los intervalos jugables desde la refNote actual
      possibleIntervals = getPlayableIntervals(refNote, maxJump);

      // Si no hay intervalos jugables desde la nota actual, generar una nueva nota de referencia
      if (possibleIntervals.length === 0) {
        refNote = getRandomNote(); // Generar una nueva nota de referencia
      }
      attempts++;
    } while (possibleIntervals.length === 0);
    
    // Una vez que tenemos una refNote de la que se pueden sacar intervalos jugables
    selectedInterval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
    
    // ¡LA CLAVE: asegurarse de que selectedInterval sea un objeto de intervalo completo!
    setCurrentReferenceNote(refNote);
    setCorrectInterval(selectedInterval); // selectedInterval ya es un objeto completo de INTERVAL_DATA
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
    if (correctInterval) { // Verificación adicional por seguridad
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

      {currentReferenceNote && correctInterval ? ( // Aseguramos que correctInterval exista antes de renderizar
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
        <p>Cargando ejercicio o no hay intervalos jugables. Ajusta el salto máximo o reinicia.</p>
      )}
    </div>
  );
};

export default IntervalTrainer;