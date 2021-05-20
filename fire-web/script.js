function main(){
    let centers = document.getElementsByClassName(`center`);

    let demoVid = document.getElementById(`demoVid`);

    function onResize(){
        for(let i = 0; i < centers.length; i++){
            let margin = (window.innerWidth - centers[i].offsetWidth) / 2;
            centers[i].style.setProperty(`margin-left`, `${margin}px`);
        }       
    }

    function autoPlay(){
        if (document.documentElement.scrollTop >= demoVid.offsetTop - window.innerHeight) {
            demoVid.muted = true;
            demoVid.play();
        }
    }

    onResize();
    window.addEventListener(`resize`, onResize);
    window.addEventListener(`scroll`, autoPlay);
}

main();