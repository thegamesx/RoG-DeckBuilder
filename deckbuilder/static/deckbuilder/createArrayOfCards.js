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
      function createFrame(versionID, art, name, id, faction, cost, convertedCost, rarity, type){
        return `<div class='card-to-add'
                id="card-${id}"
                data-card-id="${id}"
                data-card-name="${name}" 
                data-version="${versionID}" 
                data-faction="${faction}"
                data-cost="${cost}"
                data-converted-cost="${convertedCost}"
                data-rarity="${rarity}"
                data-type="${type}">
                <img src='${art}' alt="${name}" />
                <input class='card-menu' type='button' value='Menú'>
                <input class='sub-card' type='button' value='-'>
                <input class='add-card' type='button' value='+'>
                </input></div>`;
      }
      console.log(data);
      const cardsArray = document.getElementById("available-cards")
      if (data.context === null) {
        cardsArray.innerHTML = 
        "<div class='text-center align-middle'>No se encontraron cartas</div>"; // Ver despues si hace falta cambiarlo
        return;
      }
      cardsArray.innerHTML = ""
      $.each(data, function(i, card){
        cardsArray.innerHTML += createFrame(
          card.id, 
          "/media/" + card.card_art,
          card.card_id__card_name, 
          card.card_id,
          card.card_id__faction,
          card.card_id__cost,
          card.card_id__converted_cost,
          card.card_id__rarity,
          card.card_id__card_type,
        )
      })
      orderArrayOfCards();
    },
    error: (error) => {
      console.log(error);
    }
  })
}

function orderArrayOfCards(){
  const cardsArray = document.getElementById("available-cards")
  const cards = Array.from(cardsArray.querySelectorAll('.card-to-add'));
  const order = document.getElementById("array-order-button").getAttribute("data-value") || "asc";
  const sortBy = document.getElementById("attribute-order-select").value;
  cards.sort((a, b) => compareCards(a, b, sortBy, order));
  cardsArray.innerHTML = ""
  cards.forEach(card => cardsArray.appendChild(card));
}

document.getElementById("attribute-order-select").addEventListener("change", () => {
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