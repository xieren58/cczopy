$(function(){
    $('.content a, .comment-content a').attr('target', '_blank');

    $("#back-to-top").click(function(){
        $("html, body").animate({'scrollTop': 0}, 400);
        return false;
    });
    $(window).scroll(function() {
        var top = $(document).scrollTop();
        var back = $("#back-to-top");
        if (top > 200 && back.is(":hidden")) {
            back.fadeIn();
        } else if(top < 200 && back.is(":visible")) {
            back.fadeOut();
        }
    });
});