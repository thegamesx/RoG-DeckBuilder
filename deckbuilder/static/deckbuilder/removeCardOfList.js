$(".card-list").on('click', 'div.card-in-list', function(){
    $(this).attr("data-quantity", function(index, value){
      return parseInt(value) - 1;
    });
    if ($(this).attr("data-quantity") == 0){
      $(this).remove();
    } else {
      $(this).html(function(index, content){
        newString = content.substring(content.indexOf("x"));
        return $(this).attr("data-quantity") + newString
      });
    }
  });