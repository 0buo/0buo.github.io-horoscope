var $loadingBG = $(".loadingBG");
var $loadingMoon = $(".loadingMoon");
var $loadingShade = $(".loadingShade");
var $allNotLoading = $("* :not(.loadingBG):not(.loadingMoon):not(.loadingShade)");


function finishLoading(){
    $allNotLoading.addClass("displayAll");
    setTimeout(function(){
        $loadingShade.addClass("loadHalf");
    }, 750)

    setTimeout(function(){
        $allNotLoading.removeClass("displayAll");
        $.getScript("./overlayScroll/jquery.overlayScrollbars.min.js")
            .done(function(){
                $.getScript("./script.js")
                    .done(function(){
                        $loadingShade.addClass("loadFull");
                        setTimeout(function(){
                            $loadingBG.css("display", "none");
                            $(".setting").css("opacity", "1");
                        }, 1000);
                    })
                    .fail(function(){
                        alert("loading failed..");
                        return;
                    });
            })
            .fail(function(){
                alert("loading failed..");
                return;
            });
    }, 1500);
}