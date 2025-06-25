// src/App.jsx
import React, { useState } from 'react';
import IntervalChainTrainer from './components/IntervalTrainer.jsx';
import IntervalComparison from './components/IntervalComparison.jsx';
import IntervalIdentification from './components/IntervalIdentification.jsx';
import FixedIntervalTrainer from './components/FixedIntervalTrainer.jsx';
import MiniPiano from './components/MiniPiano.jsx'; // Importamos el nuevo componente
import './App.css';
import { initializeSynth } from './utils/musicUtils.js';

function App() {
  const [activeExercise, setActiveExercise] = useState(null);

  const handleExerciseClick = (exerciseName) => {
    initializeSynth(); // Asegurarse de que el sintetizador se inicializa al iniciar cualquier ejercicio
    setActiveExercise(exerciseName);
  };

  const renderExercise = () => {
    switch (activeExercise) {
      case 'intervalChain':
        return <IntervalChainTrainer />;
      case 'intervalComparison':
        return <IntervalComparison />;
      case 'intervalIdentification':
        return <IntervalIdentification />;
      case 'fixedInterval':
        return <FixedIntervalTrainer />;
      default:
        return (
          <div className="welcome-section">
            <h1>¡Bienvenido a la App de Entrenamiento Auditivo!</h1>
            <p>Selecciona un ejercicio del menú de navegación para empezar tu entrenamiento.</p>
            <p>También puedes usar el piano virtual de abajo para escuchar notas.</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <h1>App de Entrenamiento Auditivo</h1>
      <nav className="main-nav">
        <ul>
          <li><a href="#" onClick={() => handleExerciseClick('intervalChain')}>Entrenador de Cadenas de Intervalos</a></li>
          <li><a href="#" onClick={() => handleExerciseClick('intervalComparison')}>Comparación de Intervalos</a></li>
          <li><a href="#" onClick={() => handleExerciseClick('intervalIdentification')}>Identificación de Intervalos</a></li>
          <li><a href="#" onClick={() => handleExerciseClick('fixedInterval')}>Entrenador de Intervalos Fijos</a></li>
        </ul>
      </nav>
      <hr /> {/* Línea divisoria */}

      {/* Aquí insertamos el MiniPiano */}
      <MiniPiano />

      <hr /> {/* Otra línea divisoria, si la quieres entre el piano y los ejercicios */}

      {renderExercise()}
    </div>
  );
}

export default App;