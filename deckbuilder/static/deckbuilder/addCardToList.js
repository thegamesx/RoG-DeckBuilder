function addCard(cardTitle, cardID, cardVersionID, cardFaction, cardArt, targetDeck, quantity=1){
  const deckListID = targetDeck + '-card-list';
  
  if ($('#'+ deckListID +' #'+cardID).length){
    $('#'+ deckListID +' #'+cardID).attr("data-quantity", function(index, value){
      return parseInt(value) + 1;
    });
    $('#'+deckListID+' #'+cardID).html(function(index, content){
      newString = content.substring(content.indexOf("x"));
      return $('#'+deckListID+' #'+cardID).attr("data-quantity") + newString
    });
  } else {
    document.getElementById(deckListID).innerHTML += 
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
        "main",
        quantity=card.quantity,
      );
    });
  };
});

$('.available-cards').on('click', 'input.add-card', function(){
  addCard(
    $(this).closest("div").attr("title"),
    $(this).closest("div").attr("id"),
    $(this).closest("div").attr("data-version"),
    $(this).closest("div").attr("data-faction"),
    $(this).closest('img').attr("src"),
    "main"
  )
});

$('.dropdown-menu').on("click", "#menu-add-to-main", function() {
  cardDiv = $(".card-to-add#"+$(this).closest("div[triggered-card-id]").attr("triggered-card-id"))
  addCard(
    cardDiv.attr("title"),
    cardDiv.attr("id"),
    cardDiv.attr("data-version"),
    cardDiv.attr("data-faction"),
    cardDiv.closest('img').attr("src"),
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
    cardDiv.closest('img').attr("src"),
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
    cardDiv.closest('img').attr("src"),
    "maybe",
  )
});