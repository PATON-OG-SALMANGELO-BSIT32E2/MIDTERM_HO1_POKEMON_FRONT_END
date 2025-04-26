document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pokemon-form');
    const input = document.getElementById('pokemon-input');
    const details = document.getElementById('pokemon-details');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const pokemonName = input.value.trim().toLowerCase();

        if (pokemonName === '') return;

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            if (!response.ok) {
                throw new Error('Pokémon not found');
            }
            const data = await response.json();
            displayPokemon(data);
        } catch (error) {
            details.innerHTML = `<p>${error.message}</p>`;
        }

        input.value = '';
    });

    function displayPokemon(pokemon) {
        details.innerHTML = `
            <h2>${pokemon.name}</h2>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <p><strong>Height:</strong> ${pokemon.height}</p>
            <p><strong>Weight:</strong> ${pokemon.weight}</p>
            <p><strong>Type:</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        `;
    }
});
