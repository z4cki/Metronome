import React from "react";
import "./ChordDiagrams.css";

export const ChordDiagrams: React.FC = () => {
  // List of available chord images
  const chords = ["C", "G", "Fm", "C7", "G7", "Am", "Dm", "Em"];

  return (
    <div className="chord-diagrams">
      <h3>Chord Diagrams</h3>
      <div className="chord-grid">
        {chords.map((chord) => (
          <div key={chord} className="chord-item">
            <img src={`/images/${chord}.png`} alt={`${chord} chord`} />
            <span className="chord-name">{chord}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
