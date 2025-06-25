// src/components/IntervalComparison.jsx
import React, { useState, useEffect } from 'react';
import {
  getPlayableIntervals,
  midiToNoteName,
  getRandomNote,
  playNote
} from '../utils/musicUtils.js';

const IntervalComparison = () => {
  const [currentReferenceNote, setCurrentReferenceNote] = useState(null);
  const [interval1, setInterval1] = useState(null);
  const [interval2, setInterval2] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [maxJump, setMaxJump] = useState(12);

  const jumpOptions = [
    { value: 2, label: 'Hasta 2ª Mayor' },
    { value: 4, label: 'Hasta 3ª Mayor' },
    { value: 7, label: 'Hasta 5ª Justa' },
    { value: 12, label: 'Hasta Octava' },
  ];

  // Inicia una nueva ronda cuando el componente se monta o cambia el salto máximo
  useEffect(() => {
    startNewRound();
  }, [maxJump]);

  // --- NUEVO useEffect para reproducción automática al inicio de la ronda ---
  useEffect(() => {
    // Solo reproduce si la nota de referencia y ambos intervalos ya están definidos
    if (currentReferenceNote !== null && interval1 !== null && interval2 !== null) {
      // Usamos setTimeout para dar un pequeño respiro si la UI acaba de cargar
      // y para asegurar que la reproducción se inicie correctamente.
      const playOnMount = async () => {
        await handlePlayBothIntervals(); // Reutilizamos la función existente
      };
      // Pequeño retardo para evitar posibles problemas de renderizado o para dar tiempo a cargar
      const timeoutId = setTimeout(playOnMount, 300); 
      return () => clearTimeout(timeoutId); // Limpia el timeout si el componente se desmonta o se re-renderiza
    }
  }, [currentReferenceNote, interval1, interval2]); // Dependencias para re-disparar cuando los datos cambian

  const startNewRound = () => {
    let refNote;
    let possibleIntervals;
    let selectedInterval1, selectedInterval2;

    do {
      refNote = getRandomNote();
      possibleIntervals = getPlayableIntervals(refNote, maxJump);

      if (possibleIntervals.length < 2) continue;

      selectedInterval1 = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
      selectedInterval2 = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];

    } while (Math.abs(selectedInterval1.semitones) === Math.abs(selectedInterval2.semitones) || possibleIntervals.length < 2);
    
    setCurrentReferenceNote(refNote);
    setInterval1(selectedInterval1);
    setInterval2(selectedInterval2);
    setFeedback('');
    setShowAnswer(false);
  };

  const handlePlayBothIntervals = async () => {
    if (currentReferenceNote && interval1 && interval2) {
      setFeedback('Reproduciendo primer intervalo...');
      await playNote(currentReferenceNote);
      await new Promise(resolve => setTimeout(resolve, 600));
      await playNote(currentReferenceNote + interval1.semitones);
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      setFeedback('Reproduciendo segundo intervalo...');
      await playNote(currentReferenceNote);
      await new Promise(resolve => setTimeout(resolve, 600));
      await playNote(currentReferenceNote + interval2.semitones);

      setFeedback('¿Cuál es más grande?');
    }
  };

  const checkAnswer = (chosenInterval) => {
    setShowAnswer(true);
    const size1 = Math.abs(interval1.semitones);
    const size2 = Math.abs(interval2.semitones);

    if (size1 > size2 && chosenInterval === 'first') {
      setFeedback('¡Correcto! El primer intervalo es más grande.');
    } else if (size2 > size1 && chosenInterval === 'second') {
      setFeedback('¡Correcto! El segundo intervalo es más grande.');
    } else {
      setFeedback(`Incorrecto. El ${size1 > size2 ? 'primer' : 'segundo'} intervalo era más grande.`);
    }
  };

  return (
    <div className="exercise-container">
      <h2>Ejercicio 2: Comparación de Intervalos</h2>
      <p>Escucha los dos intervalos y decide cuál de ellos es el más grande.</p>

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
      
      {currentReferenceNote && interval1 && interval2 ? (
        <>
          <button onClick={handlePlayBothIntervals}>
            Escuchar Ambos Intervalos
          </button>
          
          <div className="feedback-area">
            <p>{feedback}</p>
            {showAnswer && (
              <p>
                Intervalo 1: **{interval1.name} {interval1.direction.toUpperCase()}** ({Math.abs(interval1.semitones)} semitonos)<br/>
                Intervalo 2: **{interval2.name} {interval2.direction.toUpperCase()}** ({Math.abs(interval2.semitones)} semitonos)
              </p>
            )}
          </div>

          <div className="answer-buttons">
            <button onClick={() => checkAnswer('first')} disabled={showAnswer}>
              El Primero es Más Grande
            </button>
            <button onClick={() => checkAnswer('second')} disabled={showAnswer}>
              El Segundo es Más Grande
            </button>
          </div>
          
          <button onClick={startNewRound}>
            Siguiente Ronda
          </button>
        </>
      ) : (
        <p>Cargando ejercicio...</p>
      )}
    </div>
  );
};

export default IntervalComparison;