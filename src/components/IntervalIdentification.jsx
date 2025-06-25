// src/components/IntervalIdentification.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  getPlayableIntervals,
  midiToNoteName, // Aseguramos que se importa correctamente ya que existe en musicUtils.js
  getRandomNote,
  playNote,
  playChord,
  INTERVAL_DATA
} from '../utils/musicUtils.js';

const IntervalIdentification = () => {
  const [currentReferenceNote, setCurrentReferenceNote] = useState(null);
  const [correctInterval, setCorrectInterval] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackColor, setFeedbackColor] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [maxJump, setMaxJump] = useState(12);

  const roundTimeoutRef = useRef(null);

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
    return () => {
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    startNewRound();
  }, [maxJump]);

  useEffect(() => {
    if (currentReferenceNote !== null && correctInterval !== null) {
      const playOnNewRound = async () => {
        if (roundTimeoutRef.current) {
          clearTimeout(roundTimeoutRef.current);
        }
        await handlePlayInterval();
      };
      const timeoutId = setTimeout(playOnNewRound, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [currentReferenceNote, correctInterval]);

  const startNewRound = () => {
    if (roundTimeoutRef.current) {
      clearTimeout(roundTimeoutRef.current);
    }

    let refNote;
    let possibleIntervals;
    let selectedInterval;

    do {
      refNote = getRandomNote();
      possibleIntervals = getPlayableIntervals(refNote, maxJump);
    } while (possibleIntervals.length === 0);
    
    setCurrentReferenceNote(refNote);
    selectedInterval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
    setCorrectInterval(selectedInterval);
    
    setFeedback('');
    setFeedbackColor('');
    setShowAnswer(false);
  };

  const handlePlayInterval = async () => {
    if (currentReferenceNote && correctInterval) {
      await playNote(currentReferenceNote);
      await new Promise(resolve => setTimeout(resolve, 1000)); // PAUSA AUMENTADA a 1000ms
      await playNote(currentReferenceNote + correctInterval.semitones);
    }
  };

  const checkAnswer = async (chosenIntervalSemis, chosenIntervalDirection) => {
    if (showAnswer) return;

    setShowAnswer(true);
    let isCorrect;

    if (chosenIntervalSemis === correctInterval.semitones && chosenIntervalDirection === correctInterval.direction) {
      setFeedback('¡Correcto! Esa es la respuesta.');
      setFeedbackColor('green');
      await playChord(currentReferenceNote, 'major');
      isCorrect = true;
    } else {
      setFeedback(`Incorrecto. El intervalo era: **${correctInterval.name} ${correctInterval.direction.toUpperCase()}**.`);
      setFeedbackColor('red');
      await playChord(currentReferenceNote, 'diminished');
      isCorrect = false;
    }

    roundTimeoutRef.current = setTimeout(() => {
      startNewRound();
    }, 500); // AMBOS CASOS A 500ms
  };

  const allPossibleIntervalOptions = INTERVAL_DATA.filter(interval => {
    if (interval.semitones === 0) return true;
    return Math.abs(interval.semitones) <= maxJump;
  });

  const GRID_COLUMNS = 6; 

  return (
    <div className="exercise-container">
      <h2>Ejercicio 3: Identificación de Intervalos</h2>
      <p>Escucha el intervalo y selecciona su nombre correcto.</p>

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
          <button onClick={handlePlayInterval} disabled={showAnswer}>
            Escuchar Intervalo
          </button>
          
          <div className="feedback-area" style={{ color: feedbackColor }}>
            <p dangerouslySetInnerHTML={{ __html: feedback }}></p>
          </div>

          <div 
            className="interval-buttons-grid" 
            style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}
          >
            {allPossibleIntervalOptions.map((interval) => (
              <button 
                key={`${interval.name}-${interval.direction}`}
                onClick={() => checkAnswer(interval.semitones, interval.direction)} 
                disabled={showAnswer}
                className="interval-grid-button"
              >
                {interval.shortName}
              </button>
            ))}
          </div>
          
          <button onClick={startNewRound} disabled={showAnswer}>
            Siguiente Ronda
          </button>
        </>
      ) : (
        <p>Cargando ejercicio...</p>
      )}
    </div>
  );
};

export default IntervalIdentification;