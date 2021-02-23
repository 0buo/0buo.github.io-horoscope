function getBottomScrollBarHeight(el){
    let h = el.offsetHeight - el.clientHeight - el.clientTop*2;
    return h;
}

function setSideColumnHeight(){
    let scrollH = getBottomScrollBarHeight(flexContainer) + sideColumn.clientTop*2;
    $sideColumn.css(`height`, `calc(100vh - ${scrollH}px)`);
}

let flexContainer = document.getElementsByClassName(`row-flex-container`)[0];
let sideColumn = document.getElementsByClassName(`side-column-container`)[0];
let $sideColumn = $(`.side-column-container`);

setSideColumnHeight();