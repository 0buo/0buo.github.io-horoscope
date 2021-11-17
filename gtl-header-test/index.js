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


//======================================================================
//main header functions
const lottieDiv = document.querySelector(`.header-lottie`);
//set lottie div size responsively
const setLottieDivSize = () => {
    const navBarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--nav-bar-height`));
    console.log(window.innerHeight);
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
        lottieDiv.style.setProperty(`width`, `calc(100% - ${navBarHeight}px)`);
    }
};


//set header background height responsively
const titleFlexContainer = document.querySelector(`.title-container`);
const setHeaderPeopleHeight = () => {
    const headerBg = document.querySelector(`.header-bg`);
    const titleFlexHeight = parseFloat(getComputedStyle(titleFlexContainer).getPropertyValue(`height`));
    headerBg.style.setProperty(`height`, `${titleFlexHeight}px`);
}


//LOTTIE
//Lottie web doc: https://airbnb.io/lottie/#/web
const playHeaderAnim = () => {
    const headerAnim = bodymovin.loadAnimation({
        container: lottieDiv,
        path: `header-animation.json`,
        renderer: `svg`,
        autoplay: false,
        loop: false,
        name: `HeaderImageAnimation`,
    });

    //opening animation
    headerAnim.addEventListener(`DOMLoaded`, function () {
        headerAnim.playSegments([0, 320], true);

        //looping animation
        function loopHeaderAnim() {
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

//PAN PEOPLE
const panHeaderPeople = () => {
    const headerPeople = document.querySelector(`.header-people-container`);
    let curPosition = parseFloat(getComputedStyle(headerPeople).getPropertyValue(`background-position`));
    headerPeople.style.setProperty(`background-position`, `${curPosition + -0.25 * window.devicePixelRatio}px`);

    requestAnimationFrame(panHeaderPeople);
}


//TITLE TRANSITION
const mainTitle = document.querySelector(`.main-title`);
const subTitle = document.querySelector(`.sub-title`);

const showTitle = () => {
    mainTitle.classList.remove(`title-hidden`);
    subTitle.classList.remove(`title-hidden`);
}

const hideTitle = () => {
    mainTitle.classList.add(`title-hidden`);
    subTitle.classList.add(`title-hidden`);
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

requestAnimationFrame(panHeaderPeople);
playHeaderAnim();
requestTimeout(showTitle, 500);
titleTransitionWhenScroll();