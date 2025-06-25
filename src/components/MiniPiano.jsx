// src/components/MiniPiano.jsx
import React from 'react';
import { playNote } from '../utils/musicUtils.js';
import './MiniPiano.css'; 

const MiniPiano = () => {
  const pianoKeys = [];
  const startMidi = 48; // Do3
  const endMidi = 71;   // Si4 (2 octavas completas)

  // Array para almacenar el posicionamiento en píxeles de cada tecla blanca
  // Esto es para que las teclas negras puedan referenciarse a sus respectivas teclas blancas
  const whiteKeyLeftPositions = [];
  let currentWhiteKeyOffset = 0; // Para calcular el 'left' de cada tecla blanca

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const isSharp = (midi % 12 === 1 || midi % 12 === 3 || midi % 12 === 6 || midi % 12 === 8 || midi % 12 === 10);

    if (isSharp) {
      pianoKeys.push(
        <button
          key={midi}
          data-midi={midi}
          className="piano-key sharp"
          onClick={() => playNote(midi)}
        ></button>
      );
    } else {
      // Tecla natural
      pianoKeys.push(
        <button
          key={midi}
          data-midi={midi}
          className="piano-key natural"
          onClick={() => playNote(midi)}
          style={{ left: `${currentWhiteKeyOffset}px` }} // Posicionamos aquí cada tecla blanca
        ></button>
      );
      whiteKeyLeftPositions.push(currentWhiteKeyOffset); // Guardar la posición para referencia
      currentWhiteKeyOffset += 40; // Cada tecla blanca tiene 40px de ancho
    }
  }

  return (
    <div className="mini-piano-wrapper">
      <h3>Piano Virtual</h3>
      <div className="piano-keyboard">
        {pianoKeys}
      </div>
    </div>
  );
};

export default MiniPiano;