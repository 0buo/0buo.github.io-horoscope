const lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
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
    threshold = 100, //required min distance traveled to be considered swipe
    //restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        if(el !== window) e.preventDefault()
    }, false)
  
    touchsurface.addEventListener('touchmove', function(e){
        if(el !== window) e.preventDefault() // prevent scrolling when inside DIV
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
        handleswipe(swipedir)
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
let NOWmainScroll, LASTNOWmainScroll;
class Menus{
    constructor(){
        this.mainMenu = document.getElementById(`main-menu`);
        this.$mainMenu = $(`#main-menu`);
        this.pastMenu = document.getElementById(`past-menu`);
        this.$pastMenu = $(`#past-menu`);

        this.$optionCircles = $(`.option-circle`);
        this.main();
    }

    reorient(){
        if(window.innerWidth < 650 || isMobileTablet){
            this.$mainMenu.removeClass(`horizontal`);
            this.$mainMenu.addClass(`vertical`);
            this.$pastMenu.removeClass(`horizontal`);
            this.$pastMenu.addClass(`vertical`);
        }
        else{
            this.$mainMenu.removeClass(`vertical`);
            this.$mainMenu.addClass(`horizontal`);
            this.$pastMenu.removeClass(`vertical`);
            this.$pastMenu.addClass(`horizontal`);
        }
    }

    rotate(timestamp){
        if(LASTNOWmainScroll === undefined){
            LASTNOWmainScroll = timestamp;
        }
        NOWmainScroll = timestamp;
        let dt = (NOWmainScroll - LASTNOWmainScroll)/1000;
        LASTNOWmainScroll = NOWmainScroll;

        let currentScrollMain = parseFloat(getComputedStyle(this.mainMenu).getPropertyValue("--scrollDeg"));
        let currentScrollPast = parseFloat(getComputedStyle(this.pastMenu).getPropertyValue("--scrollDeg"));

        let targetScrollMain = currentScrollMain + this.deltaY;
        let targetScrollPast = currentScrollPast + this.deltaY;

        this.deltaY = lerp(this.deltaY, 0, 1 - Math.pow(0.1,dt));

        currentScrollMain = lerp(currentScrollMain, targetScrollMain, 1 - Math.pow(0.15, dt));
        currentScrollPast = lerp(currentScrollPast, targetScrollPast, 1 - Math.pow(0.15, dt));

        this.mainMenu.style.setProperty(`--scrollDeg`, currentScrollMain + `deg`);
        this.pastMenu.style.setProperty(`--scrollDeg`, currentScrollPast + `deg`);

        cancelAnimationFrame(this.IDMainScroll);
        cancelAnimationFrame(this.IDMainSwipe);
        if(this.isScroll && !this.isSwipe) this.IDMainScroll = requestAnimFrame(this.rotate.bind(this));
        else if(this.isSwipe && !this.isScroll) this.IDMainSwipe = requestAnimFrame(this.rotate.bind(this));
    }

    select(){
        this.$optionCircles.bind(`mousedown touchstart`, function(){
            let $thisCircle = $(this);
            $thisCircle.css(`background-color`, `black`);
            $thisCircle.css(`transform`, `matrix(1.5,0,0,1.5,0,0)`);
            $thisCircle.addClass(`squiggle`);
            $thisCircle.parent().addClass(`squiggle`);
        });
        $(window).bind(`mouseup touchend`, function(){
            this.$optionCircles.css(`background-color`, `transparent`);
            this.$optionCircles.css(`transform`, `matrix(1,0,0,1,0,0)`);
            this.$optionCircles.removeClass(`squiggle`);
            this.$optionCircles.parent().removeClass(`squiggle`);
        }.bind(this));

    }

    main(){
        //=========
        //START WITH RANDOM DEG
        let seedRandom = new Math.seedrandom();
        let randDeg = Math.floor(seedRandom() * 360);
        this.mainMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);
        this.pastMenu.style.setProperty(`--scrollDeg`, randDeg+`deg`);

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
        //scroll
        window.addEventListener(`wheel`, function(event){
            this.isSwipe = false;
            this.isScroll = true;

            //event.preventDefault();
            this.deltaY += event.deltaY * -0.2;
            cancelAnimationFrame(this.IDMainScroll);
            cancelAnimationFrame(this.IDMainSwipe);
            this.IDMainScroll = requestAnimFrame(this.rotate.bind(this));
        }.bind(this));
        //touch
        swipedetect(window, function(swipedir){
            this.isScroll = false;
            this.isSwipe = true;

            if(swipedir == `left`) this.deltaY += -175 * -0.75;
            if (swipedir == `right`) this.deltaY += 175 * -0.75;

            cancelAnimationFrame(this.IDMainScroll);
            cancelAnimationFrame(this.IDMainSwipe);
            this.IDMainSwipe = requestAnimFrame(this.rotate.bind(this));
        }.bind(this));

        //=========
        //SELECT CIRCLE
        this.select();
    }
}


let isMobileTablet = mobileAndTabletCheck();
//if mobile change html svg displacement attribute sacle
if(isMobileTablet){
    document.getElementById(`displacement0`).setAttribute(`scale`, `30`);
    document.getElementById(`displacement1`).setAttribute(`scale`, `39`);
    document.getElementById(`displacement2`).setAttribute(`scale`, `24`);
    document.getElementById(`displacement3`).setAttribute(`scale`, `30`);
    document.getElementById(`displacement4`).setAttribute(`scale`, `21`);
}
menus = new Menus();

