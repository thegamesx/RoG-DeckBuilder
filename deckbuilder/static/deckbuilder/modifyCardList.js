// Convierte un numero a romano
function toRoman(num) {
  if (isNaN(num) || num <= 0) return num;
  const lookup = {
    M:1000, CM:900, D:500, CD:400,
    C:100, XC:90, L:50, XL:40,
    X:10, IX:9, V:5, IV:4, I:1
  };
  let roman = '';
  for (let i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// Convierte el coste de una carta a iconos visuales
function renderCardCost(costStr, useRoman = false) {
  console.log(costStr, useRoman)
  if (!costStr) return '';

  // Extraemos número al principio (coste genérico)
  const match = costStr.match(/^(\d*)([A-Z]*)$/);
  if (!match) return costStr;

  const [, numberPart, factionPart] = match;
  let html = '';

  if (numberPart) {
    const displayNumber = useRoman ? toRoman(parseInt(numberPart)) : numberPart
    html += `<span class="generic-cost">${displayNumber}</span>`;
  }

  for (const letter of factionPart) {
    html += `<img src="${SEAL_BASE_PATH}${letter}.webp" alt="${letter}" class="faction-icon">`;
  }

  return html;
}

// Ordena toda la lista
function sortDeckList(deckType) {
  const sortBy = document.getElementById('sort-cards').value;
  const sortOrder = document.getElementById('sort-cards-order').value;
  const deckList = document.getElementById(deckType + '-deck-list');
  if (!deckList) return;

  const cards = Array.from(deckList.querySelectorAll('li.card-in-list'));
  if (cards.length === 0) return;

  cards.sort((a, b) => compareCards(
    getAttributeCardList(a, sortBy), getAttributeCardList(a, "name"),
    getAttributeCardList(b, sortBy), getAttributeCardList(b, "name"),
    sortOrder));

  deckList.innerHTML = '';
  cards.forEach(card => deckList.appendChild(card));
}

// Obtiene índice donde insertar la carta nueva, manteniendo orden
function getSortedInsertIndex(cards, newCard) {
  const sortBy = document.getElementById('sort-cards').value;
  const sortOrder = document.getElementById('sort-cards-order').value;
  for (let i = 0; i < cards.length; i++) {
    if (compareCards(
      getAttributeCardList(newCard, sortBy), getAttributeCardList(newCard, "name"),
      getAttributeCardList(cards[i], sortBy), getAttributeCardList(cards[i], "name"),
      sortOrder) < 0) {
      return i;
    }
  }
  return cards.length;
}

function addCard(cardTitle, cardID, cardVersionID, cardFaction, cardArt, cardCost, cardConvertedCost, cardRarity, cardType, targetDeck, quantity=1){
  let cardList = document.getElementById(targetDeck + '-deck-list');

  // Primero vemos si está el mensaje cuando el mazo está vacío, y lo ocultamos
  if (document.getElementById("empty-deck-message").hidden === false){
    document.getElementById("empty-deck-message").hidden = true;
  }

  // Nos fijamos si el titulo de la sección del mazo está oculto, si es así lo mostramos
  if (document.getElementById(targetDeck + "-deck-title").hidden){
    document.getElementById(targetDeck + "-deck-title").hidden = false;
  }
  console.log(cardTitle, cardID, cardVersionID, cardFaction, cardArt, cardCost, cardConvertedCost, cardRarity, cardType, targetDeck, quantity);
  if (cardList.querySelector(`#${targetDeck}-${cardID}`)) {
    const cardElement = cardList.querySelector(`#${targetDeck}-${cardID}`)
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
    newCard.id = `${targetDeck}-${cardID}`;
    newCard.setAttribute("data-card-id", cardID);
    newCard.setAttribute("data-version", cardVersionID);
    newCard.setAttribute("data-card-name", cardTitle);
    newCard.setAttribute("data-faction", cardFaction);
    newCard.setAttribute("data-quantity", quantity);
    newCard.setAttribute("data-cost", cardCost);
    newCard.setAttribute("data-converted-cost", cardConvertedCost);
    newCard.setAttribute("data-card-art", cardArt);
    newCard.setAttribute("data-rarity", cardRarity);
    newCard.setAttribute("data-type", cardType);
    if (document.getElementById("toggle-rarity-pin").checked) {
      newCard.innerHTML = `
        <span class="me-2 fw-bold text-end number-copies">${quantity}</span>
        <span class="rarity-dot me-1" rarity-value="${cardRarity}"></span>
        <span class="card-name">${cardTitle}</span>
        <span class="ms-auto text-end card-cost">${renderCardCost(cardCost)}</span>
      `;
    } else {
      newCard.innerHTML = `
        <span class="me-2 fw-bold text-end number-copies">${quantity}</span>
        <span class="me-1" rarity-value="${cardRarity}"></span>
        <span class="card-name">${cardTitle}</span>
        <span class="ms-auto text-end card-cost">${renderCardCost(cardCost)}</span>
      `;
    }

    const cards = Array.from(cardList.querySelectorAll('li.card-in-list'));
    const insertIndex = getSortedInsertIndex(cards, newCard);

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

// Opción para mostrar la rareza de las cartas en la lista
document.addEventListener("DOMContentLoaded", () => {
  const rarityPinToggle = document.getElementById("toggle-rarity-pin");

  if (rarityPinToggle) {
    rarityPinToggle.addEventListener("change", () => {
      const cards = document.querySelectorAll(".card-in-list");

      cards.forEach(card => {
        const raritySpan = card.querySelector("span[rarity-value]");
        if (rarityPinToggle.checked) {
          raritySpan.classList.add('rarity-dot');
        } else {
          raritySpan.classList.remove('rarity-dot');
        }
      });
    });
  }
});

// Opción para mostrar los costes de las cartas
document.getElementById("toggle-card-costs").addEventListener("change", () => {
  document.querySelectorAll(".card-in-list").forEach(card => {
    const costSpan = card.querySelector(".card-cost");
    if (document.getElementById("toggle-card-costs").checked){
      const cardCost = card.getAttribute("data-cost");
      costSpan.hidden = false;
      costSpan.innerHTML = renderCardCost(cardCost, useRoman = document.getElementById("toggle-roman-cost")?.checked);
    } else {
      costSpan.hidden = true;
    }
  });
});

// Opción para mostrar números romanos en el coste
document.getElementById("toggle-roman-cost").addEventListener("change", () => {
  document.querySelectorAll(".card-in-list").forEach(card => {
    const cardCost = card.getAttribute("data-cost");
    const costSpan = card.querySelector(".card-cost");
    costSpan.innerHTML = renderCardCost(cardCost, useRoman = document.getElementById("toggle-roman-cost")?.checked);
  });
});

// Evento para ordenar las cartas del mazo, en caso de que se seleccione una opción
document.getElementById('sort-cards').addEventListener('change', function() {
  sortDeckList('main');
  sortDeckList('side');
  sortDeckList('maybe');
});

document.getElementById('sort-cards-order').addEventListener('change', function() {
  sortDeckList('main');
  sortDeckList('side');
  sortDeckList('maybe');
});

// Elimina una carta del main. Pero se puede poner la opcion de agregar de otro mazo si se requiere
function findCard(cardID, preferredDeck = "main"){
  const card = document.querySelector(`#${preferredDeck}-${cardID}`);
  if (card) {
    subCard(card);
  }
}

// Se fija si se apreta el + o - de las cartas, y hace lo que corresponde
document.addEventListener('click', function(e) {
  const card = e.target.closest('.card-in-list');
  if (card) {
    subCard(card);
  }
});

document.querySelector('.available-cards').addEventListener('click', function(event) {
  if (event.target.matches('input.sub-card')) {
    const cardDiv = event.target.closest('div.card-to-add');
    findCard(cardDiv.getAttribute("data-card-id"));
  }
  if (event.target.matches('input.add-card')) {
    const cardDiv = event.target.closest('div.card-to-add');
    addCard(
      cardDiv.getAttribute("data-card-name"),
      cardDiv.getAttribute("data-card-id"),
      cardDiv.getAttribute("data-version"),
      cardDiv.getAttribute("data-faction"),
      cardDiv.querySelector("img").getAttribute("src"),
      cardDiv.getAttribute("data-cost"),
      cardDiv.getAttribute("data-converted-cost"),
      cardDiv.getAttribute("data-rarity"),
      cardDiv.getAttribute("data-type"),
      "main"
    )
  }
});

// Comandos para agregar cartas al mazo con el menu de las cartas
document.querySelector('.dropdown-menu').addEventListener('click', function(event) {
  let targetDeck = null;
  if (event.target.id === "menu-add-to-main") {
    targetDeck = "main";
  } else if (event.target.id === "menu-add-to-side") {
    targetDeck = "side";
  } else if (event.target.id === "menu-add-to-maybe") {
    targetDeck = "maybe";
  }
  if (targetDeck) {
    const triggeredDiv = event.target.closest('div[triggered-card-id]');
    if (!triggeredDiv) return;
    const cardId = triggeredDiv.getAttribute('triggered-card-id');
    const cardDiv = document.querySelector(`.card-to-add#${cardId}`);
    if (!cardDiv) return;
    const img = cardDiv.querySelector('img');
    addCard(
      cardDiv.getAttribute("data-card-name"),
      cardDiv.getAttribute("data-card-id"),
      cardDiv.getAttribute("data-version"),
      cardDiv.getAttribute("data-faction"),
      img ? img.getAttribute("src") : "",
      cardDiv.getAttribute("data-cost"),
      cardDiv.getAttribute("data-converted-cost"),
      cardDiv.getAttribute("data-rarity"),
      cardDiv.getAttribute("data-type"),
      targetDeck
    );
  }
});
$('.dropdown-menu').on("click", "#menu-add-to-main", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  console.log($(this).closest('img').attr("src"))
  addCard(
    cardDiv.attr("data-card-name"),
    cardDiv.attr("data-card-id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    cardDiv.attr("data-type"),
    "main",
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-side", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  addCard(
    cardDiv.attr("data-card-name"),
    cardDiv.attr("data-card-id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    cardDiv.attr("data-type"),
    "side",
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-maybe", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  addCard(
    cardDiv.attr("data-card-name"),
    cardDiv.attr("data-card-id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.children('img').attr("src"),
    cardDiv.attr("data-cost"),
    cardDiv.attr("data-converted-cost"),
    cardDiv.attr("data-rarity"),
    cardDiv.attr("data-type"),
    "maybe",
  )
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
          card.card_id,
          card.id,
          card.card_id__faction,
          "/media/" + card.card_art,
          card.card_id__cost,
          card.card_id__converted_cost,
          card.card_id__rarity,
          card.card_id__card_type,
          deckType,
          quantity=card.quantity,
        );
      });
    });
  };
});

