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
        LASTNOWscroll = undefined;
        LASTNOWscrollV = undefined;
    }
  });
  
  var notIE = (document.documentMode === undefined),
      isChromium = window.chrome;
  if (notIE && !isChromium) {
      // checks for Firefox and other  NON IE Chrome versions
      $(window).on("focusout", function () {
        // blur
        LASTNOWscroll = undefined;
        LASTNOWscrollV = undefined;
      });
  } 
  else {
      // checks for IE and Chromium versions
      // bind blur event
      window.addEventListener("blur", function () {
        // blur
        LASTNOWscroll = undefined;
        LASTNOWscrollV = undefined;
      });
  }

/**************check mobile**********************/
window.mobileAndTabletCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
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


// =========================


function getBottomScrollBarHeight(el){
    let h = el.offsetHeight - el.clientHeight - el.clientTop*2;
    return h;
}

function setSideColumnHeight(){
    let scrollH = getBottomScrollBarHeight(flexContainer)
    let toSubtract = scrollH + sideColumn.clientTop*2;
    // $sideColumn.css(`height`, `${window.innerHeight - toSubtract}px)`);
    // $sideBorder.css(`height`, `${window.innerHeight - toSubtract}px)`);
    $sideColumn.css(`height`, `calc(100vh - ${toSubtract}px)`);
    $sideBorder.css(`height`, `calc(100vh - ${toSubtract}px)`);

    $(flexContainer).css(`height`, `${window.innerHeight}px`);
    // console.log(window.innerHeight)
    // document.body.clientHeight = window.innerHeight;
}

//FOLD / UNFOLD SIDE
let sideFolded = false;
let narrowScreen = false;
function resizeSide(){
    if(window.innerWidth <= 1250){
        if(!narrowScreen){
            $sideColumn.css(`transform`, `translateX(-150vw)`);
            $sideBorder.css(`transform`, `translateX(-150vw)`);
            $sideButton.css(`left`, `8px`);
            $flexBlog.css(`background-color`, ``);
            sideFolded = true;
            
            redirectable = true;
        }
        narrowScreen = true;

        $sideColumn.css(`width`, `${window.innerWidth - 90}px`);
        $sideBorder.css(`left`, `${window.innerWidth - 90}px`);
    }
    else{
        if(narrowScreen){
            $sideColumn.css(`transform`, ``);
            $sideBorder.css(`transform`, ``);
            $sideButton.css(`left`, `calc(50vw + 3.5px + 7px)`);
            $flexBlog.css(`background-color`, `var(--border-color)`);
            sideFolded = false;
        }
        narrowScreen = false;
        $backButton.css(`opacity`, `1`);
        $backButton.css(`filter`, buttonFilter);

        $sideColumn.css(`width`, `50vw`);
        $sideBorder.css(`left`, `50vw`);
    }
}

function resizeBlogMaxWidth(){
    if (window.innerWidth >= window.innerHeight) $flexBlog.css(`max-width`, `75vh`);
    else $flexBlog.css(`max-width`, `75vw`);
}

//============
//BUTTON EVETNS
//------------
//side button
let isMouseDown = false;
function mouseoverSideButton(){
    $sideButton.css(`transform`, `scale(1.15)`);
    if(!isMouseDown) $sideButton.css(`background-color`, `rgba(255,255,255,0)`);
    else $sideButton.css(`background-color`, `${buttonColor}`);
    $sideButton.css(`background-image`, `${buttonImage}`);
}
function mouseleaveSideButton(){
    $sideButton.css(`transform`, `scale(1)`);
    $sideButton.css(`background-color`, `rgba(255,255,255,0)`);
    $sideButton.css(`background-image`, `none`);
}

//------------
//back button
function mouseoverBackButton(){
    $backButton.css(`transform`, `scale(1.15)`);
    if(!isMouseDown) $backButton.css(`background-color`, `rgba(255,255,255,0)`);
    else $backButton.css(`background-color`, `${backButtonColor}`);
    $backButton.css(`background-image`, `${backButtonImage}`);
}
function mouseleaveBackButton(){
    $backButton.css(`transform`, `scale(1)`);
    $backButton.css(`background-color`, `rgba(255,255,255,0)`);
    $backButton.css(`background-image`, `none`);
}

//=====================
//WINDOW BUTTONS UP
function windowMouseupButtons(){
    // if(e.type == `touchend`) e.preventDefault();
    
    $sideButton.css(`transform`, `scale(1)`);
    $sideButton.removeClass(`squiggle`);
    $sideButton.removeClass(`buzz`);
    $sideButton.css(`filter`, buttonFilter);

    isMouseDown = false;
    $sideButton.css(`background-color`, `rgba(255,255,255,0)`);
    $sideButton.css(`background-image`, `none`);

    //back button
    $backButton.removeClass(`squiggle`);
    $backButton.removeClass(`buzz`);
    $backButton.css(`filter`, buttonFilter);
    if(!redirecting){
        $backButton.css(`transform`, `scale(1)`);
        $backButton.css(`background-color`, `rgba(255,255,255,0)`);
        $backButton.css(`background-image`, `none`);
    }
}

//BUTTONS DOWN
//side button
function mousedownSideButton(e){
    if(e.type == `touchstart`){
        e.preventDefault();
        firstTouch = e.changedTouches[0];
    }

    if(isMobileTablet) $sideButton.css(`filter`, `brightness(500%)`);
    $sideButton.css(`transform`, `scale(1.25)`);
    if(isMobileTablet){
        $sideButton.addClass(`buzz`);
    }
    else{
        $sideButton.addClass(`squiggle`);
    }

    isMouseDown = true;
    $sideButton.css(`background-color`, `${buttonColor}`);
    $sideButton.css(`background-image`, `${buttonImage}`);
}
//back button
function mousedownBackButton(e){
    if(e.type == `touchstart`){
        e.preventDefault();
        firstTouch = e.changedTouches[0];
    }

    if(isMobileTablet) $backButton.css(`filter`, `brightness(500%)`);
    $backButton.css(`transform`, `scale(1.25)`);
    if(isMobileTablet){
        $backButton.addClass(`buzz`);
    }
    else{
        $backButton.addClass(`squiggle`);
    }

    isMouseDown = true;
    $backButton.css(`background-color`, `${backButtonColor}`);
    $backButton.css(`background-image`, `${backButtonImage}`);
}

//BUTTONS UP
//side button
function mouseupSideButton(e){
    if(e.type == `touchend`){
        e.preventDefault();

        lastTouch = e.changedTouches[0];
        touchDist = Math.pow((firstTouch.screenX - lastTouch.screenX), 2) + Math.pow((firstTouch.screenY - lastTouch.screenY), 2);
    }
    else{
        touchDist = 0;
    }

    if(touchDist < restraint){
        if(narrowScreen){
            if(sideFolded){
                sideFolded = false;
        
                $sideColumn.css(`transform`, ``);
                $sideBorder.css(`transform`, ``);
                $sideButton.css(`left`, `calc(calc(100vw - 90px) + 3.5px + 7px)`);
                $flexBlog.css(`background-color`, `var(--border-color)`);
                //
                redirectable = false;
                $backButton.css(`opacity`, `0`);
                $backButton.css(`filter`, `${buttonFilter} blur(10px)`);
            }
            else{
                sideFolded = true;
        
                $sideColumn.css(`transform`, `translateX(-150vw)`);
                $sideBorder.css(`transform`, `translateX(-150vw)`);
                $flexBlog.css(`background-color`, ``);
                $sideButton.css(`left`, `7px`)
                //
                redirectable = true;
                $backButton.css(`opacity`, `1`);
                $backButton.css(`filter`, buttonFilter);
            }
        }
        else{
            if(sideFolded){
                sideFolded = false;
        
                $sideColumn.css(`transform`, ``);
                $sideBorder.css(`transform`, ``);
                $sideButton.css(`left`, `calc(50vw + 3.5px + 8px)`);
                $flexBlog.css(`background-color`, `var(--border-color)`);
            }
            else{
                sideFolded = true;
        
                $sideColumn.css(`transform`, `translateX(-150vw)`);
                $sideBorder.css(`transform`, `translateX(-150vw)`);
                $sideButton.css(`left`, `8px`);
                $flexBlog.css(`background-color`, ``);
            }
        }
    //
    }
//
}
//back button
let IDredirectBack, redirecting = false, redirectable = true;
function mouseupBackbutton(e){
    if(e.type == `touchend`){
        e.preventDefault();

        lastTouch = e.changedTouches[0];
        touchDist = Math.pow((firstTouch.screenX - lastTouch.screenX), 2) + Math.pow((firstTouch.screenY - lastTouch.screenY), 2);
    }
    else{
        touchDist = 0;
    }

    if(touchDist < restraint && !redirecting && redirectable){
        clearRequestTimeout(IDredirectBack);
        redirecting = true;
        $backButton.css(`opacity`, `0`);
        $backButton.css(`filter`, `${buttonFilter} blur(10px)`);
        $backButton.css(`background-image`, `none`);

        $(flexContainer).css(`opacity`, `0`);
        $(flexContainer).css(`filter`, `${buttonFilter} blur(10px)`);
        $sideColumn.css(`opacity`, `0`);
        $sideColumn.css(`filter`, `${buttonFilter} blur(10px)`);
        $sideBorder.css(`opacity`, `0`);
        $sideBorder.css(`filter`, `${buttonFilter} blur(10px)`);
        $sideButton.css(`opacity`, `0`);
        $sideButton.css(`filter`, `${buttonFilter} blur(10px)`);

        if(mode == `light`) $(`body`).css(`background-color`, `rgba(255,255,255,0)`);
        if(mode == `dark`) $(`body`).css(`background-color`, `black`);

        IDredirectBack = requestTimeout(function(){
            location.href = backLink;
        }, 700);
    }
}

//--------------
//ADD BUTTON EVENT LISTENERS
let firstTouch, lastTouch, touchDist = 0, restraint = 1250;
function buttonEvents(){
    $(window).on(`mouseup touchend`, windowMouseupButtons);

    $sideButton.mouseover(mouseoverSideButton);
    $sideButton.mouseleave(mouseleaveSideButton);
    $sideButton.on(`mousedown touchstart`, mousedownSideButton);
    $sideButton.on(`mouseup touchend`, mouseupSideButton);

    $backButton.mouseover(mouseoverBackButton);
    $backButton.mouseleave(mouseleaveBackButton);
    $backButton.on(`mousedown touchstart`, mousedownBackButton);
    $backButton.on(`mouseup touchend`, mouseupBackbutton);

    var flexClickTimeStart;
    var flexClickTime;
    flexContainer.addEventListener(`mousedown`, function(){
        flexClickTimeStart = new Date().getTime();
    });
    flexContainer.addEventListener(`mouseup`, function(){
        flexClickTime = new Date().getTime() - flexClickTimeStart;
        if(flexClickTime < 150){
            if(narrowScreen){
                if(!sideFolded){
                    sideFolded = true;
            
                    $sideColumn.css(`transform`, `translateX(-150vw)`);
                    $sideBorder.css(`transform`, `translateX(-150vw)`);
                    $flexBlog.css(`background-color`, ``);
                    $sideButton.css(`left`, `7px`)
                    //
                    redirectable = true;
                    $backButton.css(`opacity`, `1`);
                    $backButton.css(`filter`, buttonFilter);
                }
            }
            else{
                if(!sideFolded){
                    sideFolded = true;
            
                    $sideColumn.css(`transform`, `translateX(-150vw)`);
                    $sideBorder.css(`transform`, `translateX(-150vw)`);
                    $sideButton.css(`left`, `8px`);
                    $flexBlog.css(`background-color`, ``);
                }
            }
        //
        }
    });
}


//=============
//SCROLL HORIZONTALLY
let canHscroll = true;
function scrollHorizontal(){
    $flexBlog.on(`scroll`, function(){
        if( this.scrollTop >= (this.scrollHeight - this.offsetHeight)){
            canHscroll = true;
        }
        else if(this.scrollTop == 0) canHscroll = true;
        else canHscroll = false;
    });
    $flexBlog.on(`mouseleave`, function(){
        canHscroll = true;
    });

    flexContainer.addEventListener(`wheel`, function(e){
        if(canHscroll){
            let delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            // console.log(delta)
            if(Number.isInteger(delta) && navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
                delta = delta > 0 ? 150 
                      : delta < 0 ? -150
                      : 0;
            }
            
            scrollDeltaH += delta * 0.015;
            // e.preventDefault();
    
            cancelAnimationFrame(IDscroll);
            IDscroll = requestAnimationFrame(smoothScrolling);
        }
    });
}
//smoothing
let NOWscroll, LASTNOWscroll, IDscroll, curDeltaH=0, scrollDeltaH=0;
function smoothScrolling(timestamp){
    if (LASTNOWscroll === undefined) LASTNOWscroll = timestamp;
    NOWscroll = timestamp;
    let dt = (NOWscroll - LASTNOWscroll)/1000;
    LASTNOWscroll = NOWscroll;

    scrollDeltaH = lerp(scrollDeltaH, 0, 1 - Math.pow(0.05, dt));
    let current = flexContainer.scrollLeft;
    let target = current + scrollDeltaH;

    flexContainer.scrollLeft = target;
    if(target <0 || target > maxScrollLength(flexContainer)) scrollDeltaH = 0;

    cancelAnimationFrame(IDscroll);
    if(Math.abs(scrollDeltaH) >= 0.1) {
        IDscroll = requestAnimationFrame(smoothScrolling);
    }
    else{
        LASTNOWscroll = undefined;
    }
}

//-------------------------
function maxScrollLength(el){
    return Math.max( el.scrollWidth, el.offsetWidth, el.clientWidth) - el.clientWidth;
}


//=============================================================================
//********************* *****************************************************/
//===================================
//variables
let flexContainer = document.getElementsByClassName(`row-flex-container`)[0];

let sideColumn = document.getElementsByClassName(`side-column-container`)[0];
let $sideColumn = $(`.side-column-container`);
let $sideButton = $(`#side-button`);
let $sideBorder = $(`#column-border`);
let $backButton = $(`#back-button`);
let $flexBlog = $(`.flex-blog`);
$flexBlog.css(`background-color`, `var(--border-color)`);

let buttonColor = `rgba(255,255,255,0)`;
let buttonImage = `url("./page-assets/button.png")`;
let backButtonImage = `url("../pages-assets/zhu-yan.png")` ;
let backButtonColor = `black` ;
let backLink = `../index.html` ;

let mode = `light`;
let buttonFilter = `contrast(0%) brightness(70%)`;
//==========
//LIGHT AND DARK MODE
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // dark mode
    mode = `dark`;
    backButtonColor = `white`;
    buttonFilter = `contrast(0%) brightness(180%)`;
}
$sideButton.css(`filter`, buttonFilter);
$backButton.css(`filter`, buttonFilter);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newColorScheme = e.matches ? "dark" : "light";
    if (newColorScheme == `dark`) {
        backButtonColor = `white`; 
        mode = `dark`;
        buttonFilter = `contrast(0%) brightness(180%)`;
        $sideButton.css(`filter`, buttonFilter);
        $backButton.css(`filter`, buttonFilter);
    }
    else {
        backButtonColor = `black`; 
        mode = `light`;
        buttonFilter = `contrast(0%) brightness(70%)`;
        $sideButton.css(`filter`, buttonFilter);
        $backButton.css(`filter`, buttonFilter);
  }
});

//MAIN
let isMobileTablet = mobileAndTabletCheck();
//===
requestTimeout(function(){
    $(`#transition`).addClass(`away`);
    requestTimeout(function(){$(`#transition`).css(`display`, `none`);}, 750);
}, 100);

//===
//resize
setSideColumnHeight();
resizeSide();
window.addEventListener(`resize`, setSideColumnHeight);
window.addEventListener(`resize`, resizeSide);
window.addEventListener(`resize`, resizeBlogMaxWidth);

buttonEvents();
scrollHorizontal();

if(isMobileTablet){
    let ua = window.navigator.userAgent;
    let iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    let webkit = !!ua.match(/WebKit/i);
    let iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
    
    if(!iOSSafari){
        window.addEventListener(`orientationchange`, function(){
            location.reload();
        });
    } 
}
