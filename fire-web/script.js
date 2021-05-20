function main(){
    let centers = document.getElementsByClassName(`center`);

    let demoVid = document.getElementById(`demoVid`);
    let lastScrollTop = document.documentElement.scrollTop;

    function onResize(){
        for(let i = 0; i < centers.length; i++){
            let margin = (window.innerWidth - centers[i].offsetWidth) / 2;
            centers[i].style.setProperty(`margin-left`, `${margin}px`);
        }       
    }

    function autoPlay(){
        if (document.documentElement.scrollTop > lastScrollTop){
            if (document.documentElement.scrollTop >= demoVid.offsetTop - window.innerHeight) {
                demoVid.muted = true;
                demoVid.play();
            }
        }
        else{
            if (document.documentElement.scrollTop < demoVid.offsetTop - window.innerHeight) {
                demoVid.pause();
            }
        }
        lastScrollTop = document.documentElement.scrollTop
    }

    onResize();
    window.addEventListener(`resize`, onResize);
    window.addEventListener(`scroll`, autoPlay);
}

main();