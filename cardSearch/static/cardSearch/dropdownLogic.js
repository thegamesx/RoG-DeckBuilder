let currentSortField = 'card_id__card_name';
let currentOrder = 'des';

// Actualizó los parametros de la URL según el campo y orden seleccionados y actualiza la página
function updateURLParams(){
    const params = new URLSearchParams(window.location.search);
    params.set('sort_by', currentSortField);
    params.set('order', currentOrder);
    params.set('page', '1'); // resetear página al ordenar
    window.location.search = params.toString();
}

// Cuando se hace click en un elemento del dropdown, actualizamos la página con los nuevos parámetros
document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        // Cambiamos el atributo data-query del botón del dropdown.
        // De esta forma no importa que dropdown usamos, siempre se van a tomar los valores correctos.
        this.closest('.dropdown').querySelector('button').setAttribute("data-query", this.getAttribute("data-query"));

        currentSortField = document.getElementById("sort-field-button").getAttribute('data-query');
        currentOrder = document.getElementById("sort-direction-button").getAttribute('data-query');
        updateURLParams();
    });
});