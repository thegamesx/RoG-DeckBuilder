let currentCardPage = 0;
const rowsPerPage = 2;

// Guardamos el resultado de la query para poder paginar las cartas correctamente
let searchResult = null;

function createFrame(card){
  return `<div class='card-to-add'
          id="card-${card.card_id}"
          data-card-id="${card.card_id}"
          data-card-name="${card.card_id__card_name}" 
          data-version="${card.id}" 
          data-faction="${card.card_id__faction}"
          data-cost="${card.card_id__cost}"
          data-converted-cost="${card.card_id__converted_cost}"
          data-rarity="${card.card_id__rarity}"
          data-type="${card.card_id__card_type}">
            <div class="card-actions">
              <div class="card-buttons">
                <button class='add-card' type='button'>+</button>
                <button class='sub-card' type='button'>-</button>
              </div>
              <div class="dropdown">
                <button class="btn card-menu-button" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots-vertical card-menu-icon"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item menu-add-to-main" href="#">Agregar al mazo principal</a></li>
                  <li><a class="dropdown-item menu-add-to-side" href="#">Agregar al mazo secundario</a></li>
                  <li><a class="dropdown-item menu-add-to-maybe" href="#">Agregar a la sección de tal vez</a></li>
                </ul>
              </div>
            </div>
            <img src='${"/media/" + card.card_art}' alt="${card.card_id__card_name}" />
          </div>`;
}

// Calculamos el espacio vertical que tenemos para mostrar las cartas
function getAvailableCardsHeight() {
  const parent = document.querySelector('.column-left');
  if (!parent) return 400;

  const controls = parent.querySelector('.card-pagination-controls');
  const actionBar = document.getElementById("card-search-bar");
  let usedHeight = 0;
  if (controls) usedHeight += controls.offsetHeight;
  if (actionBar) usedHeight += actionBar.offsetHeight;

  const parentHeight = parent.offsetHeight || window.innerHeight;
  const availableHeight = parentHeight - usedHeight - 32; //padding

  return Math.max(availableHeight, 200);
}

function getCardsPerRow() {
  const container = document.getElementById("available-cards");
  const containerWidth = container.offsetWidth - 20 || 800;
  const containerHeight = getAvailableCardsHeight();
  const gap = 12;
  const maxCardHeight = Math.floor((containerHeight - gap) / rowsPerPage)
  const minCardWidth = maxCardHeight * 0.7158; // Ancho de la carta calculado con relación de aspecto

  let cardsPerRow = Math.floor((containerWidth + gap) / (minCardWidth + gap));

  //Cambiamos las dimensiones de la carta en el css
  container.style.setProperty('--card-height', maxCardHeight + 'px');
  container.style.setProperty('--card-width', minCardWidth + 'px');

  return Math.max(1, cardsPerRow)
}

function getCardsPerPage() {
  return getCardsPerRow() * rowsPerPage;
}

function renderCardPage(cards) {
  // Funcion para desktop
  if (window.screen.width >= 992){
    const cardsArray = document.getElementById("available-cards");
    cardsArray.innerHTML = "";
    const cardsPerPage = getCardsPerPage();
    updateCardPageIndicator(searchResult.length, cardsPerPage);
    const start = currentCardPage * cardsPerPage;
    const end = start + cardsPerPage;
    cards.slice(start,end).forEach(card => cardsArray.innerHTML += createFrame(card));
  } else {
  // Funcion para mobile
    const cardsArray = document.getElementById("available-cards-modal");
    cardsArray.innerHTML = "";
    const start = currentCardPage * 10;
    const end = start + 10;
    cards.slice(start,end).forEach(card => cardsArray.innerHTML += createFrame(card));

    const cardsModalElement = document.getElementById("search-results-modal");
    const cardsModal = new bootstrap.Modal(cardsModalElement);
    cardsModal.show();
  }
}

function orderArrayOfCards(){
  const cards = searchResult;
  const order = document.getElementById("array-order-button").getAttribute("data-value") || "asc";
  const sortBy = document.getElementById("attribute-order-select").value;
  cards.sort((a, b) => compareCards(
    getAttributeCardArray(a, sortBy), getAttributeCardArray(a, "name"),
    getAttributeCardArray(b, sortBy), getAttributeCardArray(b, "name"),
    order));
  renderCardPage(cards);
}

function updateCardPageIndicator(totalCards, cardsPerPage){
  const indicator = document.getElementById("card-page-indicator");
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  if (currentCardPage >= totalPages) {
    currentCardPage = totalPages - 1
  }
  indicator.textContent = `Página ${currentCardPage + 1} de ${totalPages}`;
  document.getElementById("card-page-prev").disabled = currentCardPage === 0;
  document.getElementById("card-page-next").disabled = currentCardPage >= totalPages - 1;
}

function createArrayOfCards(query){
  searchQuery = query;
  if (searchQuery == ""){
    searchQuery = " ";
  }
  $.ajax({
    url: "search/" + searchQuery,
    headers: {
      'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
    },
    type:"GET",
    dataType: "json",
    data:{ user_query: searchQuery },
    success: (data) => {
      
      console.log(data);
      const cardsArray = document.getElementById("available-cards")
      searchResult = data;
      if (data.context === null) {
        if (window.screen.width >= 992){
          cardsArray.innerHTML = 
            "<div class='text-center align-middle'>No se encontraron cartas</div>"; // Ver despues si hace falta cambiarlo
        } else {
          // Muestra un pop up si no se encontraron cartas en mobile
          $(".no-cards-alert").show();
            setTimeout(function(){
              $(".no-cards-alert").hide(); 
          }, 2000);
        }
        return;
      }
      currentCardPage = 0;
      orderArrayOfCards();
    },
    error: (error) => {
      console.log(error);
    }
  })
}

function getAvailableFactions(){
  const factionIcons = document.querySelectorAll(".faction-icon-filter");
  let factionList = [];

  factionIcons.forEach(function(icon) {
      if (icon.getAttribute("data-disabled") === "false") {
        factionList.push(icon.getAttribute("data-faction"));
      }
  });
  return factionList;
}

// Tomamos el valor del input de búsqueda y el select de facciones para crear la query
function createQueryString(){
  let query = document.getElementById('user-query').value;
  let factionAvailable = getAvailableFactions();
  if (factionAvailable.length > 0){
    // TODO: Agregar una opcion en la API para buscar multiples facciones a la vez
    let factionQuery = "f:(";
    factionAvailable.forEach(function(faction) {
      factionQuery += `${faction},`
    })
    // Le quitamos la ultima coma y cerramos parentesis
    factionQuery = factionQuery.slice(0, -1) + ")"
    console.log(`${query} ${factionQuery}`);
    return `${query} ${factionQuery}`;
  } else {
    return query;
  }
}

// Modificamos la página de cartas si se avanza o retrocede
document.getElementById("card-page-prev").addEventListener("click", () => {
  if (currentCardPage > 0) {
    currentCardPage--;
    orderArrayOfCards();
  }
});
document.getElementById("card-page-next").addEventListener("click", () => {
  const totalPages = Math.ceil(searchResult.length / getCardsPerPage());
  console.log(currentCardPage, totalPages)
  if (currentCardPage < totalPages - 1) {
    currentCardPage++;
    orderArrayOfCards();
  }
});

// Modificamos la lista si se cambia el tamaño de la ventana
window.onresize = () => {
  if (window.innerWidth > 992) {
    if (searchResult){
      orderArrayOfCards();
    } else {
      createArrayOfCards(" ");
    }
  }
}

// Esta parte gestiona el orden de las cartas
document.getElementById("attribute-order-select").addEventListener("change", () => {
  currentCardPage = 0;
  orderArrayOfCards();
});

document.querySelectorAll('#array-order .dropdown-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    const value = this.getAttribute('data-value');
    const icon = value === 'asc'
      ? '<i class="bi bi-arrow-up"></i>'
      : '<i class="bi bi-arrow-down"></i>';

    const btn = document.getElementById('array-order-button');
    btn.innerHTML = icon;
    btn.setAttribute('data-value', value);

    currentCardPage = 0;
    orderArrayOfCards();
  });
});

// Este código se ejecuta al cargar la página y cuando se clickea en buscar
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth > 992) createArrayOfCards(" ");
});
document.getElementById("submit-button").addEventListener("click", () => {
  createArrayOfCards(createQueryString());
});

// Esta parte es para que se ejecute la busqueda cuando se apreta enter
document.getElementById("user-query").addEventListener("keyup", ({key}) => {
  if(key === "Enter"){
     createArrayOfCards(createQueryString());
  }
});

// Gestiona los iconos para filtrar facciones
document.addEventListener("DOMContentLoaded", () => {
  const factionIcons = document.querySelectorAll(".faction-icon-filter");

  factionIcons.forEach(function(icon){
    icon.addEventListener("click", () => {
      // Invierte el estado de habilitado
      icon.setAttribute("data-disabled", (icon.getAttribute("data-disabled")) === "true" ? "false" : "true");
      createArrayOfCards(createQueryString());
    });
  });
});