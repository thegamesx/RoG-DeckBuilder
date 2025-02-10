$(".card-item").hover(function () {
    // Poner como una variable global
    const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);

    var cardID = $(this).attr("id");
    cardID = cardID.substring(cardID.indexOf("-") + 1);
    console.log(cardID)

    $.each(loadedDeck.card_list, function (index, card) { 
         if (card.id == cardID){
            artLink = card.card_art;
         }
    });    

    $("#card-art-display").attr("src", "/media/" + artLink);
    }
);