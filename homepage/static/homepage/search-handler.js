function searchProcess (query, category){
    searchQuery = query;
    if (searchQuery == ""){
        searchQuery = " ";
    }
    jsonstring = JSON.stringify({ user_query: searchQuery, cat: category });
    const csrftoken = getCookie('csrftoken');
    console.log(searchQuery);
    console.log(category);
    $.post({
      headers: {'X-CSRFToken': csrftoken},
      type:"POST",
      dataType: "json",
      contentType: "application/json",
      data: jsonstring,
      success: (data) => {
        console.log(data);
      },
      error: (error) => {
        console.log(error);
      }
    });
}

$("#home-search-button").click(function (e) { 
    searchProcess($('#home-search-input').val(), $("input[name='searchcategory']:checked").attr("data-cat"))
});
$('#home-search-input').on('keypress', function (e) {
    if(e.which === 13){
        searchProcess($(this).val(), $("input[name='searchcategory']:checked").attr("data-cat"));
    }
});