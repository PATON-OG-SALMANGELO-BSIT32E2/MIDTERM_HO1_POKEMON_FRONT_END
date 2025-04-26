import React, { useState, useEffect } from "react";

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 12;
  const [selectedType, setSelectedType] = useState("");
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=251");
        const data = await response.json();
        const allPokemonUrls = data.results.map((p) => p.url);

        const pokemonData = await Promise.all(
          allPokemonUrls.map((url) => fetch(url).then((res) => res.json()))
        );

        // Fetch species data to determine generation
        const updatedPokemon = await Promise.all(
          pokemonData.map(async (p) => {
            const speciesResponse = await fetch(p.species.url);
            const speciesData = await speciesResponse.json();
            const generation = speciesData.generation.name.replace("generation-", "Gen ");

            return {
              ...p,
              generation,
              pokedexNumber: p.id, // Sort by Pokédex number
            };
          })
        );

        setPokemon(updatedPokemon.sort((a, b) => a.pokedexNumber - b.pokedexNumber));
      } catch (error) {
        console.error("Error fetching Pokémon details:", error);
      }
    };

    fetchPokemonData();

    fetch("https://pokeapi.co/api/v2/type")
      .then((response) => response.json())
      .then((data) => setTypes(data.results.map((t) => t.name)))
      .catch((error) => console.error("Error fetching types:", error));
  }, []);

  const openModal = async (pokemonData) => {
    try {
      const speciesResponse = await fetch(pokemonData.species.url);
      const speciesData = await speciesResponse.json();

      const evolutionResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionResponse.json();

      const evolutionChain = [];
      let currentEvolution = evolutionData.chain;

      while (currentEvolution) {
        evolutionChain.push({
          name: currentEvolution.species.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentEvolution.species.url.split("/")[6]}.png`,
        });

        currentEvolution = currentEvolution.evolves_to[0];
      }

      setSelectedPokemon({
        name: pokemonData.name,
        image: pokemonData.sprites.front_default,
        height: pokemonData.height,
        weight: pokemonData.weight,
        types: pokemonData.types.map((t) => t.type.name),
        abilities: pokemonData.abilities.map((a) => a.ability.name),
        generation: pokemonData.generation,
        evolutionChain: evolutionChain,
      });
    } catch (error) {
      console.error("Error fetching evolution details:", error);
    }
  };

  const closeModal = () => {
    setSelectedPokemon(null);
  };

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;

  const filteredPokemons = pokemon
    .filter((p) => p.name.includes(search.toLowerCase()))
    .filter(
      (p) => !selectedType || p.types.some((t) => t.type.name === selectedType)
    );

  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

  return (
    <div style={{ textAlign: "center", fontFamily: "Arial" }}>
      <h1>Pokemon Dex</h1>

      <input
        type="text"
        placeholder="Search Pokémon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "8px", fontSize: "16px", marginBottom: "20px", borderRadius: "5px" }}
      />

      <div>
        <label style={{ fontSize: "18px", marginRight: "10px" }}>
          Filter by Type:
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: "8px", fontSize: "16px" }}
        >
          <option value="">All Types</option>
          {types.map((type, index) => (
            <option key={index} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px auto",
        maxWidth: "600px",
      }}>
        {currentPokemons.map((p, index) => (
          <div
            key={index}
            onClick={() => openModal(p)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f8f8f8",
            }}
          >
            <img src={p.sprites.front_default} alt={p.name} style={{ width: "100px", height: "100px" }} />
            <p style={{ fontSize: "18px", fontWeight: "bold" }}>{p.name}</p>
            <p style={{ fontSize: "14px", color: "gray" }}>{p.generation}</p>
          </div>
        ))}
      </div>

      {selectedPokemon && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", background: "#fff",
          padding: "20px", boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
          borderRadius: "10px", textAlign: "center", zIndex: 1000
        }}>
          <h2>{selectedPokemon.name.toUpperCase()}</h2>
          <img src={selectedPokemon.image} alt={selectedPokemon.name} style={{ width: "150px", height: "150px" }} />
          <p><strong>Height:</strong> {selectedPokemon.height}</p>
          <p><strong>Weight:</strong> {selectedPokemon.weight} kg</p>
          <p><strong>Type:</strong> {selectedPokemon.types.join(", ")}</p>
          <p><strong>Abilities:</strong> {selectedPokemon.abilities.join(", ")}</p>
          <p><strong>Generation:</strong> {selectedPokemon.generation}</p>

          {selectedPokemon.evolutionChain.length > 1 && (
  <div>
    <h3>Evolution Chain</h3>
    {selectedPokemon.evolutionChain.map((evo, index) => (
      <div 
        key={index}
        onClick={() => {
          const evolvedPokemon = pokemon.find(p => p.name === evo.name);
          if (evolvedPokemon) openModal(evolvedPokemon);
        }}
        style={{ cursor: "pointer", display: "inline-block", margin: "10px" }}
      >
        <img 
          src={evo.image} 
          alt={evo.name} 
          style={{ width: "80px", border: "2px solid #ddd", borderRadius: "10px" }} 
        />
        <p>{evo.name}</p>
      </div>
    ))}
  </div>
)}

          <button onClick={closeModal} style={{ marginTop: "10px", padding: "5px 10px", cursor: "pointer" }}>Close</button>
        </div>
      )}
<div style={{ marginTop: "20px" }}>
  <button 
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
    disabled={currentPage === 1}
    style={{ padding: "10px", marginRight: "10px", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
  >
    Previous
  </button>
  
  <span>Page {currentPage}</span>
  
  <button 
    onClick={() => setCurrentPage((prev) => (indexOfLastPokemon < filteredPokemons.length ? prev + 1 : prev))}
    disabled={indexOfLastPokemon >= filteredPokemons.length}
    style={{ padding: "10px", marginLeft: "10px", cursor: indexOfLastPokemon >= filteredPokemons.length ? "not-allowed" : "pointer" }}
  >
    Next
  </button>
</div>

    </div>
    
    
    
  );
}

export default App;
