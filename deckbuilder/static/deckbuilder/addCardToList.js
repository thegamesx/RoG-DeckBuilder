$('.available-cards').on('click', 'a.add-card', function(){
    cardTitle = $(this).attr("title");
    cardID = $(this).attr("id");
    cardVersionID = $(this).attr("data-version");
    console.log(cardTitle);
    if ($('#card-list #'+cardID).length){
      $('#card-list #'+cardID).attr("data-quantity", function(index, value){
        return parseInt(value) + 1;
      });
      $('#card-list #'+cardID).html(function(index, content){
        newString = content.substring(content.indexOf("x"));
        return $('#card-list #'+cardID).attr("data-quantity") + newString
      });
    } else {
      document.getElementById("card-list").innerHTML += 
        "<div class='card-in-list' id='" + cardID + "' data-version='" + cardVersionID + "' data-card-name='" + cardTitle + "' data-quantity=1>"
      + "1x "
      + cardTitle
      + "</div>";
    }
  });