function createFrame(link, art, name, id){
    return "<a href='"+ link +"' id='card-" + id + "'>"+
                "<img src='"+ art +"' alt='"+ name +"'/>"+
              "</a>";
  }