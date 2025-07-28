// Función común para comparar dos cartas segun sortBy
function compareCards(a, b, sortBy) {
  let aValue, bValue;
  switch (sortBy) {
    case 'cost':
      aValue = parseInt(a.getAttribute('data-converted-cost'));
      bValue = parseInt(b.getAttribute('data-converted-cost'));
      break;
    case 'faction':
      aValue = a.getAttribute('data-faction');
      bValue = b.getAttribute('data-faction');
      break;
    case 'name':
      aValue = a.getAttribute('data-card-name').toLowerCase();
      bValue = b.getAttribute('data-card-name').toLowerCase();
      break;
    case 'type':
      aValue = a.getAttribute('data-version');
      bValue = b.getAttribute('data-version');
      break;
    default:
      return 0;
  }

  // Si son iguales, desempatar por nombre
  if (aValue === bValue) {
    const nameA = a.getAttribute('data-card-name').toLowerCase();
    const nameB = b.getAttribute('data-card-name').toLowerCase();
    return nameA.localeCompare(nameB);
  }

  // Comparación principal
  if (typeof aValue === "number" && typeof bValue === "number") {
    return aValue - bValue;
  } else {
    return aValue.localeCompare(bValue);
  }
}

// Ordena toda la lista
function sortDeckList(deckType, sortBy) {
  const deckList = document.getElementById(deckType + '-deck-list');
  if (!deckList) return;

  const cards = Array.from(deckList.querySelectorAll('li.card-in-list'));
  if (cards.length === 0) return;

  cards.sort((a, b) => compareCards(a, b, sortBy));

  deckList.innerHTML = '';
  cards.forEach(card => deckList.appendChild(card));
}

// Obtiene índice donde insertar la carta nueva, manteniendo orden
function getSortedInsertIndex(cards, newCard, sortBy) {
  for (let i = 0; i < cards.length; i++) {
    if (compareCards(newCard, cards[i], sortBy) < 0) {
      return i;
    }
  }
  return cards.length;
}

function addCard(cardTitle, cardID, cardVersionID, cardFaction, cardArt, cardCost, cardConvertedCost, cardRarity, targetDeck, quantity=1){
  let cardList = document.getElementById(targetDeck + '-deck-list');

  // Primero vemos si está el mensaje cuando el mazo está vacío, y lo ocultamos
  if (document.getElementById("empty-deck-message").hidden === false){
    document.getElementById("empty-deck-message").hidden = true;
  }

  // Nos fijamos si el titulo de la sección del mazo está oculto, si es así lo mostramos
  if (document.getElementById(targetDeck + "-deck-title").hidden){
    document.getElementById(targetDeck + "-deck-title").hidden = false;
  }
  console.log(cardTitle, cardID, cardVersionID, cardFaction, cardArt, cardCost, cardConvertedCost, cardRarity, targetDeck, quantity);
  if (cardList.querySelector(`#${cardID}`)) {
    let cardElement = cardList.querySelector(`#${cardID}`)
    const newQuantity = parseInt(cardElement.getAttribute("data-quantity") || "0") + 1;
    cardElement.setAttribute("data-quantity", newQuantity);

    const quantitySpan = cardElement.querySelector(".number-copies");
    quantitySpan.textContent = newQuantity;
  } else {
    const newCard = document.createElement('li');

    newCard.className = "list-group-item d-flex justify-content-start align-items-center card-item card-in-list fade-in";
    // Si la opción de colorear por facción está activada, le agregamos la clase correspondiente
    if (document.getElementById("toggle-faction-color").checked) {
      if (cardFaction) {
        newCard.classList.add(`card-faction-${cardFaction}`);
      }
    }
    newCard.id = cardID;
    newCard.setAttribute("data-version", cardVersionID);
    newCard.setAttribute("data-card-name", cardTitle);
    newCard.setAttribute("data-faction", cardFaction);
    newCard.setAttribute("data-quantity", quantity);
    newCard.setAttribute("data-converted-cost", cardConvertedCost);
    newCard.setAttribute("data-card-art", cardArt);
    newCard.setAttribute("data-rarity", cardRarity);
    newCard.innerHTML = `
      <span class="me-2 fw-bold text-end number-copies">${quantity}</span>
      <span class="rarity-dot me-1" rarity-value="${cardRarity}"></span>
      <span class="card-name">${cardTitle}</span>
      <span class="ms-auto text-end card-cost">${cardCost}</span>
    `;

    const sortBy = document.getElementById('sort-cards').value;
    const cards = Array.from(cardList.querySelectorAll('li.card-in-list'));
    const insertIndex = getSortedInsertIndex(cards, newCard, sortBy);

    if (insertIndex >= cards.length) {
      cardList.appendChild(newCard);
    } else {
      cardList.insertBefore(newCard, cards[insertIndex]);
    }

    // Eliminamos la animación una vez que termina
    newCard.addEventListener('animationend', () => {
      newCard.classList.remove('fade-in');
    });

  }
  autoSaveDeck(); // Guardamos el mazo automáticamente al agregar una carta
}

// Resta una copia de una carta del mazo, eliminandola si llega a cero
function subCard(cardListObject){
  let quantity = parseInt(cardListObject.getAttribute('data-quantity')) || 0;
  let deckType = cardListObject.parentElement.getAttribute('id');
  quantity--;

  if (quantity <= 0){
    cardListObject.classList.add("fade-out");
    setTimeout(() => {
      cardListObject.remove();

      // Escondemos el titulo de un mazo si este no tiene cartas
      if (document.getElementById(deckType).children.length === 0) {
        const titleId = deckType.replace("-list", "-title");
        const titleEl = document.getElementById(titleId);
        if (titleEl) titleEl.hidden = true;
      }

      // Si el mazo queda vacío, mostramos el mensaje de mazo vacío
      if (document.getElementById("main-deck-list").children.length === 0 &&
          document.getElementById("side-deck-list").children.length === 0 &&
          document.getElementById("maybe-deck-list").children.length === 0) {
        document.getElementById("empty-deck-message").hidden = false;
      } else {
        document.getElementById("empty-deck-message").hidden = true;
      }

    }, 300); // Espera 300ms para que se vea la animación de desvanecimiento
  } else {
    cardListObject.setAttribute("data-quantity", quantity);
    const quantitySpan = cardListObject.querySelector(".number-copies");
    if (quantitySpan) {
      quantitySpan.textContent = quantity;
    }
  }
  autoSaveDeck(); // Guardamos el mazo automáticamente al eliminar una carta
}

// Opción para colorear el fondo de las cartas según su facción (ver si poner en otro lado)
document.addEventListener("DOMContentLoaded", () => {
  const factionColorToggle = document.getElementById("toggle-faction-color");

  if (factionColorToggle) {
    factionColorToggle.addEventListener("change", () => {
      const cards = document.querySelectorAll(".card-in-list");

      cards.forEach(card => {
        // Limpiamos clases anteriores
        card.classList.forEach(cls => {
          if (cls.startsWith("card-faction-")) {
            card.classList.remove(cls);
          }
        });

        if (factionColorToggle.checked) {
          const faction = card.dataset.faction;
          if (faction) {
            card.classList.add(`card-faction-${faction}`);
          }
        }
      });
    });
  }
});

// Elimina una carta del main. Pero se puede poner la opcion de agregar de otro mazo si se requiere
function findCard(cardID, preferredDeck = "main-deck-list"){
  const selector = `#${preferredDeck} .card-in-list[id="${cardID}"]`;
  const card = document.querySelector(selector);
  if (card) {
    subCard(card);
  }
}

// Elimina una carta del mazo al hacer click en ella en la lista (ver si poner algo un poco más especifico)
document.addEventListener('click', function(e) {
  const card = e.target.closest('.card-in-list');
  if (card) {
    subCard(card);
  }
});

document.querySelector('.available-cards').addEventListener('click', function(event) {
  if (event.target.matches('input.sub-card')) {
    const parentDiv = event.target.closest('div');
    findCard(parentDiv.id);
  }
});

// Carga el mazo guardado al cargar la página
$(function(){
  const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);
  console.log(loadedDeck);

  if (loadedDeck){
    document.getElementById("deck-name-title").textContent = loadedDeck.deckname || "Sin nombre";
    // TODO: Revisar estos dos luego, una vez que les encuentre un lugar
    $("#deck-description").val(loadedDeck.description);
    $("#visibility").val(loadedDeck.visibility);
    // Agregar formato luego
    
    $.each(loadedDeck.card_list, function(deckType, deck){
      $.each(deck, function(index, card){
        addCard(
          card.card_id__card_name,
          "card-" + card.card_id,
          card.id,
          card.card_id__faction,
          "/media/" + card.card_art,
          card.card_id__cost,
          card.card_id__converted_cost,
          card.card_id__rarity,
          deckType,
          quantity=card.quantity,
        );
      });
    });
  };
});

// Evento para ordenar las cartas del mazo, en caso de que se seleccione una opción
document.getElementById('sort-cards').addEventListener('change', function() {
  const sortBy = this.value;
  sortDeckList('main', sortBy);
  sortDeckList('side', sortBy);
  sortDeckList('maybe', sortBy);
});

// Comandos para agregar cartas al mazo (modificar luego para dejar de usar jQuery)
$('.available-cards').on('click', 'input.add-card', function(){
  addCard(
    $(this).closest("div").attr("title"),
    $(this).closest("div").attr("id"),
    $(this).closest("div").attr("data-version"),
    $(this).closest("div").attr("data-faction"),
    $(this).siblings('img').attr("src"),
    $(this).closest("div").attr("data-cost"),
    $(this).closest("div").attr("data-converted-cost"),
    $(this).closest("div").attr("data-rarity"),
    "main"
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-main", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  console.log($(this).closest('img').attr("src"))
  addCard(
    cardDiv.attr("title"),
    cardDiv.attr("id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    "main",
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-side", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  addCard(
    cardDiv.attr("title"),
    cardDiv.attr("id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    "side",
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-maybe", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  addCard(
    cardDiv.attr("title"),
    cardDiv.attr("id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    "maybe",
  )
});