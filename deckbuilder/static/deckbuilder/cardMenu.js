// Menu para elegir donde van las cartas
$(function(){
    const $menu = $("#card-menu");
    $menu.hide().slideUp("fast");

    $('.available-cards').on('click', 'input.card-menu', function(){
        const cardId = $(this).closest("div").attr("id");

        const pos = $(this).offset();

        $menu.css({
            left: `${pos.left}px`,
            top: `${pos.top}px`,
        });
        $menu.attr("triggered-card-id", cardId);

        // Si el mismo botón ya está mostrando el menú, lo ocultamos (toggle)
        if (!$menu.is(':visible')) {
            $menu.slideDown("fast");
        }
    });

    // Esconde el menú si hacemos click fuera de la ventana
    $(document).on("mouseup", function(event){
        // Arreglar de que se cierra la ventana cuando haces click en otro menu teniendo uno ya abierto
        if(!$(event.target).closest("#card-menu").length){
            $menu.slideUp("fast");
        }
    });
});
