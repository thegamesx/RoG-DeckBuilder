function searchProcess (query, category){
    searchQuery = query;
    if (searchQuery == ""){
        searchQuery = " ";
    }
    $.ajax({
    url: "/" + category + "/search/" + searchQuery,
    headers: {
      'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
    },
    type:"GET",
    dataType: "json",
    data:{ user_query: searchQuery },
    success: (data) => {
      
    },
    error: (error) => {
      console.log(error);
    }
  })
}

$(".search-button").click(function (e) { 
    searchProcess($(this).siblings(".search-input").val())
});
$('.search-input').on('keypress', function (e) {
    if(e.which === 13){
        searchProcess($(this).val());
    }
});