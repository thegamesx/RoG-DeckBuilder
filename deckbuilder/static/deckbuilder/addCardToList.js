function addCard(cardTitle, cardID, cardVersionID, cardFaction, cardArt, quantity=1){
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
        "<div class='card-in-list' id='" + cardID 
        + "' data-version='" + cardVersionID 
        + "' data-card-name='" + cardTitle 
        + "' data-faction='" + cardFaction 
        + "' data-quantity='" + quantity
        + "' data-card-art='" + cardArt +"'>"
        + quantity + "x "
        + cardTitle
        + "</div>";
    }
}

$(function(){
  const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);
  console.log(loadedDeck);

  if (loadedDeck){
    $("#deck-name-input").val(loadedDeck.deckname);
    $("#deck-description").val(loadedDeck.description);
    $("#visibility").val(loadedDeck.visibility);
    // Agregar formato luego
  
    $.each(loadedDeck.card_list, function(index, card){
      addCard(
        card.card_id__card_name,
        card.card_id,
        card.id,
        card.card_id__faction,
        card.card_art,
        quantity=card.quantity,
      );
    });
  };
});

$('.available-cards').on('click', 'a.add-card', function(){
  addCard(
    $(this).attr("title"),
    $(this).attr("id"),
    $(this).attr("data-version"),
    $(this).attr("data-faction"),
  )
  });