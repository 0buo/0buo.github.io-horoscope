function main(){
    let centers = document.getElementsByClassName(`center`);

    let shuoming = document.getElementById(`shuoming-image`);

    function onResize(){
        for(let i = 0; i < centers.length; i++){
            let margin = (window.innerWidth - centers[i].offsetWidth) / 2;
            centers[i].style.setProperty(`margin-left`, `${margin}px`);
            console.log(margin)
        }       
    }

    onResize();
    window.addEventListener(`resize`, onResize);
}

main();