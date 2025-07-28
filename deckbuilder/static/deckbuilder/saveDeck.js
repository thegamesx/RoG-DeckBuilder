// Arma el JSON para guardar el mazo en la base de datos.

async function saveDeck() {
  deckname = document.getElementById("deck-name-title").textContent;
  
  if (deckname.trim().length === 0) {
    console.warn("El nombre del mazo no puede estar vacio.");
    return;
  }
  const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent || null);
  const current_deck_id = loadedDeck ? loadedDeck.deck_id : null;

  // Revisar la construcción del mazo para determinar si está armado correctamente:
  // Esto incluye la proporción y cant de cartas como también que no contenga cartas prohibidas
  // También revisar que el mazo contenga al menos 1 carta
  // Me parece que lo mejor seria hacer esto en el modelo

  let deckJSON = {
    deckname: deckname,
    deck_id: current_deck_id,
    description: document.getElementById("deck-description").value,
    visibility: document.getElementById("visibility").value,
    format: "Eterno", // TODO: Cambiar esto luego
    faction: [],
    cards: {
      main: [],
      side: [],
      maybe: [],
    },
  };

  document.querySelectorAll(".card-in-list").forEach(cardElement => {

    const card = {
      id: cardElement.getAttribute("id").replace("card-", ""),
      quantity: cardElement.getAttribute("data-quantity"),
      version: cardElement.getAttribute("data-version"),
      name: cardElement.getAttribute("data-card-name"),
    };
    
    const faction = cardElement.getAttribute("data-faction");
    if (!deckJSON.faction.some(str => str.includes(faction))){
      deckJSON.faction.push(faction);
    }

    whichDeck = cardElement.closest(".list-group").id;

    if (whichDeck == "main-deck-list") deckJSON.cards.main.push(card);
    else if (whichDeck == "side-deck-list") deckJSON.cards.side.push(card);
    else if (whichDeck == "maybe-deck-list") deckJSON.cards.maybe.push(card);
    
  });

  console.log("JSON del mazo a guardar:", deckJSON);

  try{
    const response = await fetch("saveDeck", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify(deckJSON),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Mazo guardado con éxito:", data);
    // Mostrar un mensaje no intrusivo de que se guardó el mazo de forma automatica
  } catch (error) {
    console.error("Error al guardar el mazo:", error);
    // Mostrar un mensaje no intrusivo de que hubo un error al guardar el mazo
  }
}

function debounce(func, delay = 500) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const autoSaveDeck = debounce(saveDeck, 5000);

// Si no se detecta actividad en el mazo, se guarda automáticamente cada 5 segundos
document.addEventListener("DOMContentLoaded", () => {
  const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);
  console.log(loadedDeck);
    if (loadedDeck) {
      console.log("Mazo cargado, se activará el guardado automático.");
      document.getElementById("deck-description").addEventListener("input", autoSaveDeck);
      document.getElementById("visibility").addEventListener("change", autoSaveDeck);
      document.getElementById("deck-name-title").addEventListener("blur", autoSaveDeck);
    } else {
      console.log("No hay mazo cargado. Se espera a que se ingresen los datos para guardarlo.");

      // Si se carga la página sin un mazo, se muestra el modal para crear uno nuevo
      const loadedDeck = document.getElementById("loaded-deck");
      const modalElement = document.getElementById("new-deck-modal");
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();

      const deckNameInput = document.getElementById("new-deck-name");

      document.getElementById("confirm-new-deck").addEventListener("click", () => {
        const format = document.getElementById("new-deck-format").value;
        
        if (deckNameInput.value.trim().length === 0) {
          deckNameInput.classList.add("is-invalid");
          deckNameInput.focus();
          return;
        } else {
          deckNameInput.classList.remove("is-invalid");
        }

        // Guardar el nombre del mazo en el DOM
        document.getElementById("deck-name-title").textContent = deckNameInput.value.trim();

        // TODO: Guardar el formato en algún lugar
        // Por ejemplo: document.getElementById("deck-format").value = format;

        modal.hide();
        autoSaveDeck(); // Guardar el mazo automáticamente al crear uno nuevo
        document.getElementById("deck-description").addEventListener("input", autoSaveDeck);
        document.getElementById("visibility").addEventListener("change", autoSaveDeck);
        document.getElementById("deck-name-title").addEventListener("blur", autoSaveDeck);
      });

      // Permitir que el usuario confirme el nombre del mazo con Enter
      deckNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmButton.click();
        }
      });

      // Si hace click en cancelar, redirigir a sus mazos
      document.getElementById("cancel-new-deck").addEventListener("click", () => {
        console.log("Cancelando creación de mazo.");
        window.location.href = "/decks/user/";
      });
    
    }
});


