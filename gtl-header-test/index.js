const lottieDiv = document.querySelector(`.header-lottie`);
//set lottie div size responsively
const setLottieDivSize = () => {
    if (window.innerWidth >= window.innerHeight) {
        if (window.innerHeight > 430) {
            lottieDiv.style.setProperty(`height`, `100vh`);
            lottieDiv.style.setProperty(`width`, `auto`);
        }
        else {
            lottieDiv.style.setProperty(`width`, `50vw`);
            lottieDiv.style.setProperty(`height`, `auto`);
        }
    }
    else {
        lottieDiv.style.setProperty(`height`, `auto`);
        lottieDiv.style.setProperty(`width`, `100vw`);
    }
};
setLottieDivSize();
window.addEventListener(`resize`, setLottieDivSize);

//set header background height responsively
const setHeaderPeopleHeight = () => {
    const headerBg = document.querySelector(`.header-bg`);
    const titleFlexHeight = parseFloat(getComputedStyle(document.querySelector(`.title-container`)).getPropertyValue(`height`));
    console.log(titleFlexHeight);
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

requestAnimationFrame(panHeaderPeople);
playHeaderAnim();
