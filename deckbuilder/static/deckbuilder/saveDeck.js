// Arma el JSON para guardar el mazo en la base de datos.

$(".save-button").click(function(){
    deckname = $("#deck-name-input").val();
    if (deckname.trim().length === 0) {
      alert("El nombre del mazo no puede estar vacio.");
    } else {
      const loadedDeck = JSON.parse(document.getElementById('loaded-deck').textContent);

      // Revisar la construcción del mazo para determinar si está armado correctamente:
      // Esto incluye la proporción y cant de cartas como también que no contenga cartas prohibidas
      // También revisar que el mazo contenga al menos 1 carta
      // Me parece que lo mejor seria hacer esto en el modelo

      if (loadedDeck){
        current_deck_id = loadedDeck.deck_id;
      } else {
        current_deck_id = null;
      }

      let deckJSON = {
        deckname: deckname,
        deck_id: current_deck_id,
        description: $("#deck-description").val(),
        visibility: $("#visibility").val(),
        format: "Eterno", // Cambiar esto luego
        faction: [],
        cards: {
          main: [],
          side: [],
          maybe: [],
        },
      };

      $(".card-in-list").each(function(index){

        let card = {
          id: $(this).attr("id"),
          quantity: $(this).attr("data-quantity"),
          version: $(this).attr("data-version"),
          name: $(this).attr("data-card-name"),
        };
        
        if (!deckJSON.faction.some(str => str.includes($(this).attr("data-faction")))){
          deckJSON.faction.push($(this).attr("data-faction"));
        }

        whichDeck = $(this).closest("div.card-list").attr("id");

        if (whichDeck == "main-card-list"){
          deckJSON.cards.main.push(card);
        }
        if (whichDeck == "side-card-list"){
          deckJSON.cards.side.push(card);
        }
        if (whichDeck == "maybe-card-list"){
          deckJSON.cards.maybe.push(card);
        }
        
      });

      console.log(deckJSON);
      jsonstring = JSON.stringify(deckJSON);

      const csrftoken = getCookie('csrftoken');
      $.ajax({
        url: "saveDeck",
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin',
        type:"POST",
        dataType: "json",
        contentType: "application/json",
        data: jsonstring,
        success: (data) => {
          alert("Mazo guardado con éxito.");
          console.log(data);
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
})