// Actualizar esto luego, dar más opciones

function subCard(cardListObject){
  cardListObject.attr("data-quantity", function(index, value){
    return parseInt(value) - 1;
  });
  if (cardListObject.attr("data-quantity") == 0){
    cardListObject.remove();
  } else {
    cardListObject.html(function(index, content){
      newString = content.substring(content.indexOf("x"));
      return cardListObject.attr("data-quantity") + newString
    });
  }
}

function findCard(cardID){
  $('.card-in-list').each(function(index){
    if ($(this).attr("id") == cardID){
      subCard($(this))
    }
  })
}

$(".main-card-list").on('click', 'div.card-in-list', function(){
  subCard($(this));
});

$('.available-cards').on('click', 'input.sub-card', function(){
  findCard($(this).closest("div").attr("id"));
});