// Ver como hacer el menu para poder agregar la carta en diferentes lugares

$(function(){
    $(".dropdown-menu").hide();
    $(".dropdown-menu").slideUp("fast");
});


$('.available-cards').on('click', 'input.card-menu', function(){
    // Esconde otro menú si está visible

    var cardPosition = $(this).offset()

    $(".dropdown-menu").css('left', (cardPosition.left)+"px");
    $(".dropdown-menu").css('top', (cardPosition.top)+"px");
    $(".dropdown-menu").attr("triggered-card-id", $(this).closest("div").attr("id"));
    $(".dropdown-menu").show();
});

// Esconde el menú si hacemos click fuera de la ventana
$(document).on("mouseup", function(event){
    // Arreglar de que se cierra la ventana cuando haces click en otro menu teniendo uno ya abierto
    if(!$(event.target).closest(".dropdown-menu").length){
        $(".dropdown-menu").slideUp("fast");
    }
});

