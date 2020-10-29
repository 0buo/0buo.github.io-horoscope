function shuffle(array) {
	var currentIndex = array.length, 
		temporaryValue, 
		randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  var rand = new Math.seedrandom(new Date().getTime().toString(), { entropy: true });
	  randomIndex = Math.floor(rand() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
}
//========


const $loadingBG = $(".loadingBG");
const $loadingMoon = $(".loadingMoon");
const $loadingShade = $(".loadingShade");
const $allNotLoading = $("* :not(.loadingBG):not(.loadingMoon):not(.loadingShade)");


function finishLoading(){
    $allNotLoading.addClass("displayAll");
    setTimeout(function(){
        $loadingShade.addClass("loadHalf");
    }, 750)

    setTimeout(function(){
        $allNotLoading.removeClass("displayAll");
        $.getScript("./overlayScroll/jquery.overlayScrollbars.min.js")
        .done(function(){
            $.getScript("./script.js")
                .done(function(){
                    $loadingShade.addClass("loadFull");
                    setTimeout(function(){
                        $loadingBG.css("display", "none");
                        $(".setting").css("opacity", "1");
                    }, 1500);
                })
                .fail(function(){
                    alert("loading failed..");
                    return;
                });
        })
        .fail(function(){
            alert("loading failed..");
            return;
        });
    }, 1500);
}


function onFileParsed(){
    if(files_loaded == 3){
        finishLoading();
    }
}


function loadTextFromFiles(){
    $.get(`./sign-text/sign-decode-inner-html.txt`, function(data){
        signs_decode_array = data.split(`<|TheNextSign|>`);
    }).done(()=>{
        ++files_loaded;
        onFileParsed();
    }).fail(()=>{
        alert(`loading sign text failed..`);
    });

    $.get(`./sign-text/sign-element-inner-html.txt`, function(data){
        signs_element_array = data.split(`<|TheNextSign|>`);
    }).done(()=>{
        ++files_loaded;
        onFileParsed();
    }).fail(()=>{
        alert(`loading sign text failed..`);
    });

    $.get(`./sign-text/sign-reading-inner-html.txt`, function(data){
        let signs_writing_arr = data.split(`<|TheNextSign|>`);

        //is today a new day? if so randomize the text
        let today = new Date().getDate()
        if(localStorage.getItem(`date`) === null){
            can_randomize_sign_text = true;
            localStorage.setItem(`date`, today);
        }
        else if (localStorage.getItem(`date`) != today){
            can_randomize_sign_text = true;
            localStorage.setItem(`date`, today);
        }
        else{
            can_randomize_sign_text = false;
        }

        console.log(`update arstro- text? ${can_randomize_sign_text}`);
        //parse through sign writings
        if(can_randomize_sign_text){
            for (var i = 0; i < signs_writing_arr.length; i++){
                signs_reading_2d_arr[i] = shuffle(signs_writing_arr[i].split(`<|Pparse|>`));
            }
            localStorage.removeItem(`today-text`);
            localStorage.setItem(`today-text`, JSON.stringify(signs_reading_2d_arr));
        }
        else{
            signs_reading_2d_arr = JSON.parse(localStorage.getItem(`today-text`));
            //alert(signs_reading_2d_arr[0][4]);
        }
    }).done(()=>{
        ++files_loaded;
        onFileParsed();
    }).fail(()=>{
        alert(`loading sign text failed..`);
    });
}

//REFRESH LOCAL STORAGE
// localStorage.removeItem(`date`);
// localStorage.removeItem(`today-text`);
//console.log(`local storage refreshed`);

//==
let files_loaded = 0;
let can_randomize_sign_text = false;
//GLOBAL VARS
var signs_decode_array;
var signs_element_array;
var signs_reading_2d_arr = new Array();
$(window).on(`load`, loadTextFromFiles);



//OPEN WINDOW IN POP UP
var windowObjectReference = null; // global variable

function openRequestedPopup(url, windowName) {
  if(windowObjectReference == null || windowObjectReference.closed) {
    let size = 0.45*window.innerWidth;
    let pos = (0.5 - 0.225) * window.innerWidth;
    windowObjectReference = window.open(url, windowName,
        `toolbar=no,
        location=no,
        status=no,
        menubar=no,
        scrollbars=yes,
        resizable=yes,
        top: ${pos},
        left: ${pos},
        width=${size},
        height=${size}`);
  } else {
    windowObjectReference.focus();
  };
}