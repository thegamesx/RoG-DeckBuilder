$(".delete-button").click(function(){
    deck_id = $(this).attr("data-deck-id");
    console.log(deck_id);

    const csrftoken = getCookie('csrftoken');

    $.ajax({
    url: "delete/" + deck_id,
    headers: {'X-CSRFToken': csrftoken},
    mode: 'same-origin',
    type:"DELETE",
    success: (data) => {
        alert("Mazo borrado con éxito.");
        console.log(data);
        location.reload();
    },
    error: (error) => {
        console.log(error);
    }
    });
})