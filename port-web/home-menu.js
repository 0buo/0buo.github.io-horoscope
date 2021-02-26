const lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
};
const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

/**************************request time out****************************** */
// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function(fn, delay) {
	if( !window.requestAnimationFrame      	&& 
		!window.webkitRequestAnimationFrame && 
		!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
		!window.oRequestAnimationFrame      && 
		!window.msRequestAnimationFrame)
			return window.setTimeout(fn, delay);
			
	var start = new Date().getTime(),
		handle = new Object();
		
	function loop(){
		var current = new Date().getTime(),
			delta = current - start;
			
		delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
	};
	
	handle.value = requestAnimFrame(loop);
	return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function(handle) {
  if(handle === undefined){handle = {value: undefined};}
  window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
  window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
  window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
  window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
  window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
  window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
  clearTimeout(handle);
};

/**************check mobile**********************/
window.mobileAndTabletCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

/*********************check tab or window out of focus*********************** */
var vis = (function(){
    var stateKey, 
        eventKey, 
        keys = {
                hidden: "visibilitychange",
                webkitHidden: "webkitvisibilitychange",
                mozHidden: "mozvisibilitychange",
                msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
  })();
  // check if current tab is active or not
  vis(function(){
    // if(vis()){                   
    // } 
    if(vis() == false) {
    // tab not focused
        LASTNOWmainScroll = undefined;
    }
  });
  
  var notIE = (document.documentMode === undefined),
      isChromium = window.chrome;
  if (notIE && !isChromium) {
      // checks for Firefox and other  NON IE Chrome versions
      $(window).on("focusout", function () {
        // blur
        LASTNOWmainScroll = undefined;
      });
  } 
  else {
      // checks for IE and Chromium versions
      // bind blur event
      window.addEventListener("blur", function () {
        // blur
        LASTNOWmainScroll = undefined;
      });
  }


/***********************DETECT SWIPE********************** */
function swipedetect(el, callback){
  
    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}

    var movedir, previousMove, currentMove, moveDistX, moveDistY, moveRestraint = 1;
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        movedir = `none`;
        moveDistX = 0; 
        moveDistY = 0;
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        if(el !== window) e.preventDefault()
    }, false)
  
    touchsurface.addEventListener('touchmove', function(e){
        if(el !== window) e.preventDefault() // prevent scrolling when inside DIV
        let touches = e.changedTouches;
        

        let l = touches.length;
        for (let i = 0; i < l; i++){
            if(previousMove === undefined) previousMove = touches[i];
            currentMove = touches[i];
            moveDistX = currentMove.pageX - previousMove.pageX;
            moveDistY = currentMove.pageY - previousMove.pageY;

            if(Math.abs(moveDistY) <= moveRestraint){
                movedir = (moveDistX < 0) ? `left` : `right`;
            }
            else movedir = `none`;
            previousMove = currentMove;
            handleswipe(swipedir, movedir);
        }
    }, false)
  
    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
                                            //&& Math.abs(distY) <= restraint
            if (Math.abs(distX) >= threshold                                  ){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            // else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
            //     swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            // }
        }
        handleswipe(swipedir, movedir);
        if(el !== window) e.preventDefault()
    }, false)
}
  
//USAGE:
/*
var el = document.getElementById('someel')
swipedetect(el, function(swipedir){
    swipedir contains either "none", "left", "right", "top", or "down"
    if (swipedir =='left')
        alert('You just swiped left!')
})
*/

//==================================================================
//************main scripts**************
let NOWmainScroll, LASTNOWmainScroll, IDmenuDisplay, IDredirect, redirecting = false;
class Menus{
    constructor(){
        this.$title = $(`#title`);

        this.videoBG = document.getElementById(`buo-video`);
        this.$videoBG = $(`#buo-video`);

        this.mainMenu = document.getElementById(`main-menu`);
        this.$mainMenu = $(`#main-menu`);
        this.pastMenu = document.getElementById(`past-menu`);
        this.$pastMenu = $(`#past-menu`);
        this.newMenu = document.getElementById(`new-menu`);
        this.$newMenu = $(`#new-menu`);
        this.undoneMenu = document.getElementById(`undone-menu`);
        this.$undoneMenu = $(`#undone-menu`);

        this.optionCircles = document.getElementsByClassName(`option-circle`)
        this.$optionCircles = $(`.option-circle`);
        this.main();
    }

    reorient(){
        if(!isMobileTablet){
            if(window.innerWidth < 650){
                this.$title.css(`display`, `none`);
    
                this.$mainMenu.removeClass(`horizontal`);
                this.$mainMenu.addClass(`vertical`);
                this.$pastMenu.removeClass(`horizontal`);
                this.$pastMenu.addClass(`vertical`);
                this.$newMenu.removeClass(`horizontal`);
                this.$newMenu.addClass(`vertical`);
                this.$undoneMenu.removeClass(`horizontal`);
                this.$undoneMenu.addClass(`vertical`);
    
                this.$videoBG.removeClass(`horizontal-bg`);
                this.$videoBG.addClass(`vertical-bg`);
    
                //font
                this.$optionCircles.prev().css(`font-size`, `var(--small-font-size)`);
                this.$optionCircles.prev().css(`line-height`, `var(--small-lineH)`);
    
                //if height too small
                if(window.innerHeight < 800){
                    let scaleFactor = Math.min(window.innerHeight / 800, 1);
                    $(`.vertical`).css(`transform`, `rotateZ(-90deg) scale(${scaleFactor})`);
    
                    if(window.innerHeight < 530){
                        let h = 530 - Math.max(window.innerHeight, 465);
                        let redFactor = scale(h, 0, 65, 0, 255);
                        this.$optionCircles.css(`border-color`, `rgb(${redFactor}, 0,0)`);
                    }
                    else{
                        this.$optionCircles.css(`border-color`, `black`);
                    }
                }
                else{
                    $(`.vertical`).css(`transform`, ``);
                }
            }
            else{
                $(`.vertical`).css(`transform`, ``);
                this.$optionCircles.css(`border-color`, `black`);
    
                this.$title.css(`display`, `initial`);
                
                this.$mainMenu.removeClass(`vertical`);
                this.$mainMenu.addClass(`horizontal`);
                this.$pastMenu.removeClass(`vertical`);
                this.$pastMenu.addClass(`horizontal`);
                this.$newMenu.removeClass(`vertical`);
                this.$newMenu.addClass(`horizontal`);
                this.$undoneMenu.removeClass(`vertical`);
                this.$undoneMenu.addClass(`horizontal`);
    
                this.$videoBG.addClass(`horizontal-bg`);
                this.$videoBG.removeClass(`vertical-bg`);
    
                //font
                this.$optionCircles.prev().css(`font-size`, `var(--large-font-size)`);
                this.$optionCircles.prev().css(`line-height`, `var(--large-lineH)`);
            }
        }
        //==============================================================================
        if(isMobileTablet){
            if(window.innerWidth < window.innerHeight){
                $(`.horizontal`).css(`transform`, ``);
                this.$optionCircles.css(`border-color`, `black`);

                this.$title.css(`display`, `none`);
    
                this.$mainMenu.removeClass(`horizontal`);
                this.$mainMenu.addClass(`vertical`);
                this.$pastMenu.removeClass(`horizontal`);
                this.$pastMenu.addClass(`vertical`);
                this.$newMenu.removeClass(`horizontal`);
                this.$newMenu.addClass(`vertical`);
                this.$undoneMenu.removeClass(`horizontal`);
                this.$undoneMenu.addClass(`vertical`);
    
                this.$videoBG.removeClass(`horizontal-bg`);
                this.$videoBG.addClass(`vertical-bg`);
    
                //font
                this.$optionCircles.prev().css(`font-size`, `var(--small-font-size)`);
                this.$optionCircles.prev().css(`line-height`, `var(--small-lineH)`);
                
                //if height too small
                if(window.innerHeight < 800){
                    let scaleFactor = Math.min(window.innerHeight / 800, 1);
                    $(`.vertical`).css(`transform`, `rotateZ(-90deg) scale(${scaleFactor})`);
    
                    if(window.innerHeight < 530){
                        let h = 530 - Math.max(window.innerHeight, 465);
                        let redFactor = scale(h, 0, 65, 0, 255);
                        this.$optionCircles.css(`border-color`, `rgb(${redFactor}, 0,0)`);
                    }
                    else{
                        this.$optionCircles.css(`border-color`, `black`);
                    }
                }
                else{
                    $(`.vertical`).css(`transform`, ``);
                }
            }
            else{
                $(`.vertical`).css(`transform`, ``);
                this.$optionCircles.css(`border-color`, `black`);
    
                this.$title.css(`display`, `initial`);
                
                this.$mainMenu.removeClass(`vertical`);
                this.$mainMenu.addClass(`horizontal`);
                this.$pastMenu.removeClass(`vertical`);
                this.$pastMenu.addClass(`horizontal`);
                this.$newMenu.removeClass(`vertical`);
                this.$newMenu.addClass(`horizontal`);
                this.$undoneMenu.removeClass(`vertical`);
                this.$undoneMenu.addClass(`horizontal`);
    
                this.$videoBG.addClass(`horizontal-bg`);
                this.$videoBG.removeClass(`vertical-bg`);
    
                //font
                this.$optionCircles.prev().css(`font-size`, `var(--small-font-size)`);
                this.$optionCircles.prev().css(`line-height`, `var(--small-lineH)`);

                //if width too small
                if(window.innerWidth < 785){
                    let scaleFactor = Math.min(window.innerWidth / 785, 1);
                    $(`.horizontal`).css(`transform-origin`, `left`);
                    $(`.horizontal`).css(`transform`, `scale(${scaleFactor})`);
    
                    // if(window.innerWidth < 515){
                    //     let h = 515 - Math.max(window.innerHeight, 450);
                    //     let redFactor = scale(h, 0, 65, 0, 255);
                    //     this.$optionCircles.css(`border-color`, `rgb(${redFactor}, 0,0)`);
                    // }
                    // else{
                    //     this.$optionCircles.css(`border-color`, `black`);
                    // }
                }
                else{
                    $(`.horizontal`).css(`transform`, ``);
                }
            }
        }
    //====
    }

    rotate(timestamp){
        if(LASTNOWmainScroll === undefined){
            LASTNOWmainScroll = timestamp;
        }
        NOWmainScroll = timestamp;
        let dt = (NOWmainScroll - LASTNOWmainScroll)/1000;
        LASTNOWmainScroll = NOWmainScroll;

        let currentScrollMain = parseFloat(getComputedStyle(this.mainMenu).getPropertyValue("--scrollDeg"));
        // let currentScrollPast = parseFloat(getComputedStyle(this.pastMenu).getPropertyValue("--scrollDeg"));
        // let currentScrollNew = parseFloat(getComputedStyle(this.newMenu).getPropertyValue("--scrollDeg"));
        // let currentScrollUndone = parseFloat(getComputedStyle(this.undoneMenu).getPropertyValue("--scrollDeg"));

        let targetScrollMain = currentScrollMain + this.deltaY;
        // let targetScrollPast = currentScrollPast + this.deltaY;
        // let targetScrollNew = currentScrollNew + this.deltaY;
        // let targetScrollUndone = currentScrollUndone + this.deltaY;

        this.deltaY = lerp(this.deltaY, 0, 1 - Math.pow(0.1,dt));

        currentScrollMain = lerp(currentScrollMain, targetScrollMain, 1 - Math.pow(0.35, dt));
        // currentScrollPast = lerp(currentScrollPast, targetScrollPast, 1 - Math.pow(0.15, dt));
        // currentScrollNew = lerp(currentScrollNew, targetScrollNew, 1 - Math.pow(0.15, dt));
        // currentScrollUndone = lerp(currentScrollUndone, targetScrollUndone, 1 - Math.pow(0.15, dt));

        this.mainMenu.style.setProperty(`--scrollDeg`, currentScrollMain + `deg`);
        this.pastMenu.style.setProperty(`--scrollDeg`, currentScrollMain + `deg`);
        this.newMenu.style.setProperty(`--scrollDeg`, currentScrollMain + `deg`);
        this.undoneMenu.style.setProperty(`--scrollDeg`, currentScrollMain + `deg`);

        cancelAnimationFrame(this.IDMainScroll);
        cancelAnimationFrame(this.IDMainSwipe);

        if(Math.abs(currentScrollMain - targetScrollMain) > 0.1){
            if(this.isScroll && !this.isSwipe) this.IDMainScroll = requestAnimFrame(this.rotate.bind(this));
            else if(this.isSwipe && !this.isScroll) this.IDMainSwipe = requestAnimFrame(this.rotate.bind(this));    
        }
        else{
            LASTNOWmainScroll = undefined;
        }
    }

    select(){
        //test transform matrix
        // this.$optionCircles.mouseover(function(){
        //     console.log($(this).css(`transform`))
        // })

        var firstTouch, endTouch, touchDist= 500, smallTouchRestraint = 46, largeTouchRestraint = 105, originalBorderColor;
        //JQUERY DOWN
        this.$optionCircles.on(`mousedown touchstart`, function(e){
            if(e.type == `touchstart`) {
                e.preventDefault();
                firstTouch = e.changedTouches[0];
            }

            let $thisCircle = $(this);
            let preview = $thisCircle.parent().attr(`preview`);
            let preColor = $thisCircle.parent().attr(`pre-color`);
            let preGradient = $thisCircle.parent().attr(`pre-gradient`);

            originalBorderColor = $thisCircle.css(`border-color`);
            $thisCircle.css(`border-color`, `black`)

            if (!preColor && !preGradient) $thisCircle.css(`background-color`, `black`);
            else if (preColor && !preGradient) $thisCircle.css(`background-color`, `${preColor}`);
            else if (!preColor && preGradient) $thisCircle.css(`background-image`, `${preGradient}`);
            
            if(!isMobileTablet){
                $thisCircle.addClass(`squiggle-less-rotate`);
                $thisCircle.prev().addClass(`squiggle`);
            }
            else{
                if(window.innerHeight > window.innerWidth) $thisCircle.addClass(`buzz-rotate`);
                else $thisCircle.addClass(`buzz`);
                $thisCircle.prev().addClass(`buzz`);
            }
            
            //===========
            //NOT PREVIEW
            if(!preview){
                // $thisCircle.css(`transform`, `matrix(1.5,0,0,1.5,0,0)`);
                $thisCircle.css(`width`, `90px`);
                $thisCircle.css(`height`, `90px`);
                $thisCircle.css(`top`, `calc(50% - 29px)`);
                $thisCircle.css(`right`, `-4.5%`);
            }
            //=======
            //PREVIEW
            else{
                if(!isMobileTablet){
                    document.getElementById(`displacement0`).setAttribute(`scale`, `13`);
                    document.getElementById(`displacement1`).setAttribute(`scale`, `16`);
                    document.getElementById(`displacement2`).setAttribute(`scale`, `11`);
                    document.getElementById(`displacement3`).setAttribute(`scale`, `13`);
                    document.getElementById(`displacement4`).setAttribute(`scale`, `10`);
                }

                // if(!isMobileTablet && window.innerWidth >= 575){
                if( !isMobileTablet && window.innerWidth >= 650){
                    // $thisCircle.css(`transform`, `matrix(9.5,0,0,9.5,0,0)`);
                    $thisCircle.css(`width`, `580px`);
                    $thisCircle.css(`height`, `580px`);
                    $thisCircle.css(`top`, `calc(50% - 280px)`);
                    $thisCircle.css(`right`, `-34%`);
                    $thisCircle.css(`border-width`, `10px`);
                }
                else {
                    // $thisCircle.css(`transform`, `rotate(90deg)`);
                    $thisCircle.css(`width`, `330px`);
                    $thisCircle.css(`height`, `330px`);
                    $thisCircle.css(`top`, `calc(50% - 155px)`);
                    $thisCircle.css(`right`, `-24%`);
                    $thisCircle.css(`border-width`, `10px`);
                }
                $thisCircle.css(`background-image`, `url(${preview})`);
            }
        });

        //JQUERY UP
        $(window).on(`mouseup touchend`, function(e){
            if(e.type == `touchend`) e.preventDefault();

            if(!isMobileTablet){
                document.getElementById(`displacement0`).setAttribute(`scale`, `10`);
                document.getElementById(`displacement1`).setAttribute(`scale`, `13`);
                document.getElementById(`displacement2`).setAttribute(`scale`, `8`);
                document.getElementById(`displacement3`).setAttribute(`scale`, `10`);
                document.getElementById(`displacement4`).setAttribute(`scale`, `7`);
            }

            this.$optionCircles.css(`border-color`, originalBorderColor);
            this.$optionCircles.css(`background-image`, `none`);
            this.$optionCircles.removeClass(`squiggle-less-rotate`);
            this.$optionCircles.prev().removeClass(`squiggle`);
            this.$optionCircles.removeClass(`buzz-rotate`);
            this.$optionCircles.removeClass(`buzz`);
            this.$optionCircles.prev().removeClass(`buzz`);
            if(!redirecting){
                this.$optionCircles.css(`width`, `60px`);
                this.$optionCircles.css(`height`, `60px`);
                this.$optionCircles.css(`top`, `calc(50% - 17px)`);
                this.$optionCircles.css(`right`, `-3%`);
                this.$optionCircles.css(`border-width`, `4px`);
                this.$optionCircles.css(`transform`, `scale(1) rotate(0deg)`);
                this.$optionCircles.css(`background-color`, `transparent`);
            }
            //
        }.bind(this));

        //JQUERY CIRCLE UP
        this.$optionCircles.on(`mouseup touchend`, {$main: this.$mainMenu, $new: this.$newMenu, $past: this.$pastMenu, $undone: this.$undoneMenu, $title: this.$title, $video: this.$videoBG}, function(e){
            if(e.type == `touchend`){
                e.preventDefault();
                endTouch = e.changedTouches[0];

                if(isMobileTablet){
                    if(window.innerHeight >= window.innerWidth) touchDist = Math.abs(endTouch.pageY - firstTouch.pageY);
                    else touchDist = Math.abs(endTouch.pageX - firstTouch.pageX);
                }
                else touchDist = 0
            }
            else{
                touchDist = 0;
            }
            let $thisCircle = $(this);
            let $main = e.data.$main;
            let $past = e.data.$past;
            let $new = e.data.$new;
            let $undone = e.data.$undone;
            let $title = e.data.$title;
            let $video = e.data.$video;

            if(!$thisCircle.parent().parent().parent().attr('class').includes(`menu-disappear`) && touchDist < largeTouchRestraint){             
                //if hit 'new'
                if ($thisCircle.parent().attr('id') == `face3` && touchDist < smallTouchRestraint){
                    $title.html(`New + in Progress`);
                    
                    $new.css(`display`, `initial`);
                    $main.addClass(`menu-disappear`);
                    $past.addClass(`menu-disappear`);
                    $undone.addClass(`menu-disappear`);
                    $new.removeClass(`menu-disappear`);
                    
                    clearRequestTimeout(IDmenuDisplay);
                    IDmenuDisplay = requestTimeout(function(){
                        $main.css(`display`, `none`);
                        $past.css(`display`, `none`);
                        $undone.css(`display`, `none`);
                    }.bind($main), 1100)
                }
                //if hit 'past'
                else if ($thisCircle.parent().attr('id') == `face4` && touchDist < smallTouchRestraint){
                    $title.html(`Past Projects`);

                    $past.css(`display`, `initial`);
                    $main.addClass(`menu-disappear`);
                    $new.addClass(`menu-disappear`);
                    $undone.addClass(`menu-disappear`);
                    $past.removeClass(`menu-disappear`);
                    
                    clearRequestTimeout(IDmenuDisplay);
                    IDmenuDisplay = requestTimeout(function(){
                        $main.css(`display`, `none`);
                        $new.css(`display`, `none`);
                        $undone.css(`display`, `none`);
                    }.bind($main), 1100)
                }
                //if hit 'undone'
                else if ($thisCircle.parent().attr('id') == `face2` && touchDist < smallTouchRestraint){
                    $title.html(`Projects Undone`);

                    $undone.css(`display`, `initial`);
                    $main.addClass(`menu-disappear`);
                    $new.addClass(`menu-disappear`);
                    $past.addClass(`menu-disappear`);
                    $undone.removeClass(`menu-disappear`);
                    
                    clearRequestTimeout(IDmenuDisplay);
                    IDmenuDisplay = requestTimeout(function(){
                        $main.css(`display`, `none`);
                        $new.css(`display`, `none`);
                        $past.css(`display`, `none`);
                    }.bind($main), 1100)
                }
                //if hit 'back'
                else if (($thisCircle.parent().attr('id') == `face12` || 
                         $thisCircle.parent().attr('id') == `face15` ||
                         $thisCircle.parent().attr('id') == `face18` )  && touchDist < smallTouchRestraint){
                    $title.html(`Zhengyang Huang`);

                    $main.css(`display`, `initial`);
                    $main.removeClass(`menu-disappear`);
                    $past.addClass(`menu-disappear`);
                    $new.addClass(`menu-disappear`);
                    $undone.addClass(`menu-disappear`);
    
                    clearRequestTimeout(IDmenuDisplay);
                    IDmenuDisplay = requestTimeout(function(){
                        $past.css(`display`, `none`);
                        $new.css(`display`, `none`);
                        $undone.css(`display`, `none`);
                    }.bind($past), 1100)
                }
                //if hit project
                else if ($thisCircle.parent().attr(`link`) && !redirecting){

                    if( ($thisCircle.parent().attr(`preview`) && touchDist < largeTouchRestraint) || (!$thisCircle.parent().attr(`preview`) && touchDist < smallTouchRestraint) ){
                        redirecting = true;
                        let link = $thisCircle.parent().attr(`link`);

                        clearRequestTimeout(IDredirect);

                        $thisCircle.parent().parent().parent().css(`opacity`, `0`);
                        $thisCircle.parent().parent().parent().css(`filter`, `blur(10px) brightness(50%)`);
                        $thisCircle.css(`background-color`, `black`);

                        $video.css(`opacity`, `0`);
                        $(`#bg-image`).css(`opacity`, `0`);
                        $title.css(`opacity`, `0`);

                        IDredirect = requestTimeout(function(){
                            location.href = link;
                        }.bind(link), 1000);
                    }
                }
                //
            }        
        });
    }

    main(){
        //=========
        //START WITH RANDOM DEG
        let seedRandom = new Math.seedrandom();
        let randDeg = Math.floor(seedRandom() * 360);
        this.mainMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);
        this.pastMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);
        this.newMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);
        this.undoneMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);

        //=========
        //IF VID NOT PLAYING
        let BGvideoPromise = this.videoBG.play();
        var BGimage = new Image;
        var $videoBG = this.$videoBG;
        if(window.innerWidth < 650) BGimage.classList.add(`vertical-bg`);
        else BGimage.classList.add(`horizontal-bg`);
        BGimage.classList.add(`noselect`);
        BGimage.id = `bg-image`;
        if (BGvideoPromise !== undefined) {
            BGvideoPromise.then(_ => {
                // Autoplay started!
            }).catch(error => {
                // Autoplay not allowed!
                if(error.name == `NotAllowedError` || error.name == `PermissionDeniedError`){
                    BGimage.src = `menu-assets/buo-thumbnail.jpg`;
                    BGimage.onload = ()=>{
                        document.body.prepend(BGimage);
                        $videoBG.css(`display`, `none`);
                    };
                }
                else{
                    this.videoBG.muted = true;
                    this.videoBG.play();
                }
            });
          }

        //replay video after window out of focus
        window.addEventListener(`focus`, ()=>{this.videoBG.play();});

        //=========
        //ORIENTATION OF MENU
        this.reorient();
        $(window).resize(this.reorient.bind(this));

        //=========
        //SCROLL / TOUCH INTERACTIVE
        NOWmainScroll = undefined;
        LASTNOWmainScroll = undefined;
        this.isScroll = false;
        this.isSwipe = false;
        this.deltaY = 0;
        this.IDMainScroll = undefined;
        this.IDMainSwipe = undefined;
        
        //scroll
        window.addEventListener(`wheel`, function(event){
            this.isSwipe = false;
            this.isScroll = true;

            // event.preventDefault();
            this.deltaY += event.deltaY * -0.5;

            cancelAnimationFrame(this.IDMainScroll);
            cancelAnimationFrame(this.IDMainSwipe);
            this.IDMainScroll = requestAnimFrame(this.rotate.bind(this));
        }.bind(this));
        
        //touch
        swipedetect(window, function(swipedir, movedir){
            // console.log(swipedir, movedir);
            if(movedir == `left` || movedir == `right`){
                this.isScroll = false;
                this.isSwipe = true;
    
                if(movedir == `left`) this.deltaY += -175 * -0.085;
                if (movedir == `right`) this.deltaY += 175 * -0.085;
    
                cancelAnimationFrame(this.IDMainScroll);
                cancelAnimationFrame(this.IDMainSwipe);
                this.IDMainSwipe = requestAnimFrame(this.rotate.bind(this));
            }

            if(swipedir == `left` || swipedir == `right`){
                this.isScroll = false;
                this.isSwipe = true;
    
                if(swipedir == `left`) this.deltaY += -175 * -3;
                if (swipedir == `right`) this.deltaY += 175 * -3;
    
                cancelAnimationFrame(this.IDMainScroll);
                cancelAnimationFrame(this.IDMainSwipe);
                this.IDMainSwipe = requestAnimFrame(this.rotate.bind(this));
            }
        }.bind(this));

        //=========
        //SELECT CIRCLE
        this.select();
    }
}


let isMobileTablet = mobileAndTabletCheck();

requestTimeout(function(){
    $(`#transition`).addClass(`away`);
    requestTimeout(function(){$(`#transition`).css(`display`, `none`)}, 750);
}, 100);
menus = new Menus();

