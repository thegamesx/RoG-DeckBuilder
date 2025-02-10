$(function(){
    $(".img-on-hover").hide();
    $(document).mousemove(function(e){
        $(".img-on-hover img").css('left', (e.pageX+170)+"px");
        $(".img-on-hover img").css('top', (e.pageY+130)+"px");
    });
});

$(document).on({
    mouseenter: function(){
        console.log($(this).attr("data-card-art"));
        $(".img-on-hover img").attr("src", "/media/" + $(this).attr("data-card-art"));
        $(".img-on-hover").show();
    },
    mouseleave: function(){
        $(".img-on-hover").hide();
    }
}, ".card-list .card-in-list");