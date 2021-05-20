function main(){
    let logo = document.getElementById(`logo`);
    let paragraph = document.getElementsByTagName(`p`);

    function centerContent(){
        let margin = (window.innerWidth - logo.offsetWidth) / 2;
        logo.style.setProperty(`margin-left`, `${margin}px`);

        for(let i = 0; i < paragraph.length; i++){
            let margin = (window.innerWidth - paragraph[i].offsetWidth) / 2;
            paragraph[i].style.setProperty(`margin-left`, `${margin}px`);
            console.log(margin)
        }
    }

    centerContent();
    window.addEventListener(`resize`, centerContent);
}

main();