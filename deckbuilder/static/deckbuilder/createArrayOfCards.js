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
      function createFrame(versionID, art, name, id, faction){
        return "<div class='card-to-add'" +
                "id='" + id + 
                "' title='" + name + 
                "' data-version='" + versionID + 
                "' data-faction='" + faction + "'>"+
                "<img src='/media/"+ art +"' alt='"+ name + "' />" +
                "<input class='card-menu' type='button' value='Menú'>" +
                "<input class='sub-card' type='button' value='-'>" +
                "<input class='add-card' type='button' value='+'>" +
                "</input></div>";
      }
      console.log(data);
      document.getElementById("available-cards").innerHTML = ""
      $.each(data, function(i, item){
        document.getElementById("available-cards").innerHTML += createFrame(
          item.id, 
          item.card_art,
          item.card_id__card_name, 
          item.card_id,
          item.card_id__faction,
        )
      })
    },
    error: (error) => {
      console.log(error);
    }
  })
}

// Este código se ejecuta al cargar la página y cuando se clickea en buscar
$(function() {
  createArrayOfCards(" ")
});
$('.submit-button').click(function(){
  createArrayOfCards($('#user-query').val());
});
// Esta parte es para que se ejecute la busqueda cuando se apreta enter
$('#user-query').on('keypress', function (e) {
  if(e.which === 13){
     createArrayOfCards($('#user-query').val());
  }
});