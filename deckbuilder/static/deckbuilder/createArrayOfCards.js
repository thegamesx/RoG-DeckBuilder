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
      function createFrame(versionID, art, name, id, faction, cost, convertedCost, rarity){
        return `<div class='card-to-add'
                id="card-${id}"
                title="${name}" 
                data-version="${versionID}" 
                data-faction="${faction}"
                data-cost="${cost}"
                data-converted-cost="${convertedCost}"
                data-rarity="${rarity}">
                <img src='${art}' alt="${name}" />
                <input class='card-menu' type='button' value='Menú'>
                <input class='sub-card' type='button' value='-'>
                <input class='add-card' type='button' value='+'>
                </input></div>`;
      }
      console.log(data);
      if (data.context === null) {
        document.getElementById("available-cards").innerHTML = 
        "<div class='text-center align-middle'>No se encontraron cartas</div>"; // Ver despues si hace falta cambiarlo
        return;
      }
      document.getElementById("available-cards").innerHTML = ""
      $.each(data, function(i, card){
        document.getElementById("available-cards").innerHTML += createFrame(
          card.id, 
          "/media/" + card.card_art,
          card.card_id__card_name, 
          card.card_id,
          card.card_id__faction,
          card.card_id__cost,
          card.card_id__converted_cost,
          card.card_id__rarity,
        )
      })
    },
    error: (error) => {
      console.log(error);
    }
  })
}

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