$.ajax({
    url: 'search/',
    type: 'GET',
    headers: {
        'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
    },
    dataType: 'json',
    success: function(response){
        // Ver que poner aca
        console.log(response)
    },
    error: function(error){
        console.error(error);
    }
});