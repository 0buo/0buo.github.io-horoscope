/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function (fn, delay) {
    if (!window.requestAnimationFrame &&
        !window.webkitRequestAnimationFrame &&
        !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
        !window.oRequestAnimationFrame &&
        !window.msRequestAnimationFrame)
        return window.setTimeout(fn, delay);

    var start = new Date().getTime(),
        handle = new Object();

    function loop() {
        var current = new Date().getTime(),
            delta = current - start;

        delta >= delay ? fn.call() : handle.value = requestAnimationFrame(loop);
    };

    handle.value = requestAnimationFrame(loop);
    return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function (handle) {
    if (handle === undefined) { handle = { value: undefined }; }
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
        window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
            window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
                window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
                    window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
                        window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
                            clearTimeout(handle);
};


//***CHANGE "isMbile" TO WORDPRESS WAY OF DETECTING MOBILE
var isMobile = false; //initiate as false
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
    isMobile = true;
}

//======================================================================

const headerLottieMain = () => {
    const navBarHeight = 100;
    const lottieDiv = document.querySelector(`.headerLottie-lottie`);
    //set lottie div size responsively
    const setLottieDivSize = () => {
        if (window.innerWidth >= window.innerHeight) {
            if (window.innerHeight > 430) {
                //0.97 * window height because the lottie animation has 2% margin top
                lottieDiv.style.setProperty(`height`, `${window.innerHeight * 0.97 - navBarHeight}px`);
                lottieDiv.style.setProperty(`width`, `auto`);
            }
            else {
                lottieDiv.style.setProperty(`width`, `50%`);
                lottieDiv.style.setProperty(`height`, `auto`);
            }
        }
        else {
            lottieDiv.style.setProperty(`height`, `auto`);
            lottieDiv.style.setProperty(`width`, `100%`);
        }
    };
    
    
    //set header background height responsively
    const titleFlexContainer = document.querySelector(`.headerLottie-title-container`);
    const setHeaderPeopleHeight = () => {
        const headerBg = document.querySelector(`.headerLottie-bg`);
        const titleFlexHeight = parseFloat(getComputedStyle(titleFlexContainer).getPropertyValue(`height`));
        headerBg.style.setProperty(`height`, `${titleFlexHeight}px`);
    }
    
    
    //LOTTIE
    //Lottie web doc: https://airbnb.io/lottie/#/web
    //***CHANGE "isMbile" TO WORDPRESS WAY OF DETECTING MOBILE
    const lottieData = isMobile ? "header-lottie/mobile/mobile-header-anim.json" : "header-lottie/desktop/desktop-header-anim.json"
    const playHeaderAnim = () => {
        const headerAnim = bodymovin.loadAnimation({
            container: lottieDiv,
            path: lottieData,
            renderer: `svg`,
            autoplay: false,
            loop: false,
            name: `HeaderImageAnimation`,
        });
    
        //***CHANGE "isMbile" TO WORDPRESS WAY OF DETECTING MOBILE
        //DESKTOP
        if (!isMobile) {
            //opening animation
            headerAnim.addEventListener(`DOMLoaded`, function () {
                headerAnim.playSegments([0, 320], true);
    
                //looping animation
                const loopHeaderAnim = () => {
                    headerAnim.playSegments([321, 1200], true);
                }
                headerAnim.addEventListener(`complete`, loopHeaderAnim);
    
                //set size of lottie div
                setLottieDivSize();
                window.addEventListener(`resize`, setLottieDivSize);
                //set height of header background after lottie is loaded
                setHeaderPeopleHeight();
                window.addEventListener(`resize`, setHeaderPeopleHeight);
            })
        }
        //MOBILE
        else {
            //disable people bg when playing mobile anim
            const headerPeople = document.querySelector(`.headerLottie-people-container`);
            const headerPeopleAnimationCSS = getComputedStyle(headerPeople).getPropertyValue(`animation`);
            headerPeople.style.setProperty(`animation`, `none`);
            headerPeople.style.setProperty(`opacity`, `0`);
    
            headerAnim.addEventListener(`DOMLoaded`, function () {
                headerAnim.playSegments([0, 349], true);
                headerAnim.addEventListener(`complete`, () => {
                    headerAnim.pause();
                    //enable people bg after mobile anim completed
                    headerPeople.style.setProperty(`transition`, `opacity 2s ease`);
                    headerPeople.style.setProperty(`animation`, headerPeopleAnimationCSS);
                    headerPeople.style.setProperty(`opacity`, `0.3`);
                });
    
                //set size of lottie div
                setLottieDivSize();
                window.addEventListener(`resize`, setLottieDivSize);
                //set height of header background after lottie is loaded
                setHeaderPeopleHeight();
                window.addEventListener(`resize`, setHeaderPeopleHeight);
            })
        }
    }
    
    
    //TITLE TRANSITION
    const mainTitle = document.querySelector(`.headerLottie-main-title`);
    const subTitle = document.querySelector(`.headerLottie-sub-title`);
    
    const showTitle = () => {
        mainTitle.classList.remove(`headerLottie-title-hidden`);
        subTitle.classList.remove(`headerLottie-title-hidden`);
    }
    
    const hideTitle = () => {
        mainTitle.classList.add(`headerLottie-title-hidden`);
        subTitle.classList.add(`headerLottie-title-hidden`);
    }
    
    const titleTransitionWhenScroll = () => {
        window.addEventListener(`scroll`, () => {
            const titleFlexHeight = parseFloat(getComputedStyle(titleFlexContainer).getPropertyValue(`height`));
            if (window.scrollY > titleFlexHeight / 1.5) {
                hideTitle();
            }
            else {
                showTitle();
            }
        });
    }
    
    requestTimeout(playHeaderAnim, 600);
    requestTimeout(showTitle, 500);
    titleTransitionWhenScroll();
}

headerLottieMain();

