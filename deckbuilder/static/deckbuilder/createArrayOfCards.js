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
      function createFrame(versionID, art, name, id){
        return "<a href='#' id='" + id + "' class='add-card' title='" + name + "' data-version='" + versionID + "'>"+
                    "<img src='/media/"+ art +"' alt='"+ name +"'/>"+
                  "</a>";
      }
      console.log(data);
      document.getElementById("available-cards").innerHTML = ""
      $.each(data, function(i, item){
        document.getElementById("available-cards").innerHTML += createFrame(
          item.id, 
          item.card_art,
          item.card_id__card_name, 
          item.card_id)
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
  createArrayOfCards(document.getElementById('user-query').value)
});