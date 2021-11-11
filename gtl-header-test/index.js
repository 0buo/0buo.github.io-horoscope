//LOTTIE
//Lottie web doc: https://airbnb.io/lottie/#/web
const lottieDiv = document.querySelector(`.header-lottie`);
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
    })
}


//PAN PEOPLE
const panHeaderPeople = () => {
    const headerPeople = document.querySelector(`.header-people-container`);
    let curPosition = parseFloat(getComputedStyle(headerPeople).getPropertyValue(`background-position`));
    headerPeople.style.setProperty(`background-position`, `${curPosition + -0.25 * window.devicePixelRatio}px`);

    requestAnimationFrame(panHeaderPeople);
}

//set lottie div size responsively
const setLottieDivSize = () => {
    if (window.innerWidth >= window.innerHeight) {
        lottieDiv.style.setProperty(`height`, `100vh`);
        lottieDiv.style.setProperty(`width`, `auto`);
    }
    else {
        lottieDiv.style.setProperty(`height`, `auto`);
        lottieDiv.style.setProperty(`width`, `100vw`);
    }
};
setLottieDivSize();
window.addEventListener(`resize`, setLottieDivSize);

requestAnimationFrame(panHeaderPeople);
playHeaderAnim();
