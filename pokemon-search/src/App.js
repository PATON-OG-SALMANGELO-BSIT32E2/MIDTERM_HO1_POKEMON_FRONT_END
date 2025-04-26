import React, { useState } from 'react';
import './App.css';

function App() {
  const [pokemon, setPokemon] = useState(null);
  const [error, setError] = useState(null);

  const fetchPokemon = async (name) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Pokémon not found');
      }
      const data = await response.json();
      setPokemon(data);
      setError(null);
    } catch (err) {
      setPokemon(null);
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.elements.pokemonName.value.trim();
    if (name) {
      fetchPokemon(name);
    }
  };

  return (
    <div className="App">
      <h1>Pokémon Search</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="pokemonName" placeholder="Enter Pokémon name" required />
        <button type="submit">Search</button>
      </form>
      {error && <p>{error}</p>}
      {pokemon && (
        <div className="pokemon-details">
          <h2>{pokemon.name}</h2>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          <p><strong>Height:</strong> {pokemon.height}</p>
          <p><strong>Weight:</strong> {pokemon.weight}</p>
          <p><strong>Type:</strong> {pokemon.types.map(type => type.type.name).join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default App;
