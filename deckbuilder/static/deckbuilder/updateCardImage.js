$(".card-item-in-list").hover(function () {
    // Poner como una variable global
    const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);

    var cardID = $(this).attr("id");
    console.log(cardID)

    $.each(loadedDeck.card_list, function (index, deck) { 
        $.each(deck, function(index2, card){
            if (card.id == cardID){
                artLink = card.card_art;
             }
        });  
    });    

    $("#card-art-display").attr("src", "/media/" + artLink);
    }
);