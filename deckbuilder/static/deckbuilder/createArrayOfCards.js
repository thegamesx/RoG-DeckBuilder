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
          <img src='${"/media/" + card.card_art}' alt="${card.card_id__card_name}" />
          <input class='card-menu' type='button' value='Menú'>
          <input class='sub-card' type='button' value='-'>
          <input class='add-card' type='button' value='+'>
          </input></div>`;
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
  const containerWidth = container.offsetWidth || 800;
  const containerHeight = getAvailableCardsHeight();
  const maxCardHeight = Math.floor((containerHeight - 12) / rowsPerPage)
  const minCardWidth = maxCardHeight * 0.7158 + 12; // Ancho de la carta (calculado con relación de aspecto) más gap
  console.log("Altura maxima:",maxCardHeight, "Cartas por fila:", Math.max(1, Math.floor(containerWidth / minCardWidth)));

  //Cambiamos las dimensiones de la carta en el css
  container.style.setProperty('--card-height', maxCardHeight + 'px');
  container.style.setProperty('--card-width', minCardWidth + 'px');

  return Math.max(1, Math.floor(containerWidth / minCardWidth))
}

function getCardsPerPage() {
  return getCardsPerRow() * rowsPerPage;
}

function renderCardPage(cards) {
  if (window.screen.width >= 992){
    const cardsArray = document.getElementById("available-cards");
    cardsArray.innerHTML = "";
    const cardsPerPage = getCardsPerPage();
    console.log("Cartas por fila:", cardsPerPage)
    const start = currentCardPage * cardsPerPage;
    const end = start + cardsPerPage;
    cards.slice(start,end).forEach(card => cardsArray.innerHTML += createFrame(card));
    updateCardPageIndicator(searchResult.length, cardsPerPage);
  } else {
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
document.addEventListener("resize", () => {
  orderArrayOfCards();
})

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

// Tomamos el valor del input de búsqueda y el select de facciones para crear la query
function createQueryString(){
  var query = document.getElementById('user-query').value;
  var factionSelect = document.querySelector("#faction-select");
  if (factionSelect.value === ""){
    return query;
  } else {
    return `${query} f:${factionSelect.value}`;
  }
}

// Este código se ejecuta al cargar la página y cuando se clickea en buscar
$(function() {
  createArrayOfCards(" ")
});
$('#submit-button').click(function(){
  createArrayOfCards(createQueryString());
});
// Esta parte es para que se ejecute la busqueda cuando se apreta enter
$('#user-query').on('keypress', function (e) {
  if(e.which === 13){
     createArrayOfCards(createQueryString());
  }
});
// Esta parte es para que se ejecute la busqueda cuando se cambia el select de facciones
$("#faction-select").on('change', function(){
  createArrayOfCards(createQueryString());
});