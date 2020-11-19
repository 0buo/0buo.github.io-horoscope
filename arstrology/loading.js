function shuffle(array) {
	var currentIndex = array.length, 
		temporaryValue, 
		randomIndex;
  
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  var rand = new Math.seedrandom(new Date().getDate().toString());
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
                    throw `loading script.js failed`;
                    // return;
                });
        })
        .fail(function(){
            alert("loading failed..");
            throw `loading overlayScrollbars.min.js failed`;
            // return;
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
        alert(`loading text failed..`);
        throw `loading sign text failed..`;
    });

    $.get(`./sign-text/sign-element-inner-html.txt`, function(data){
        signs_element_array = data.split(`<|TheNextSign|>`);
    }).done(()=>{
        ++files_loaded;
        onFileParsed();
    }).fail(()=>{
        alert(`loading text failed..`);
        throw `loading sign text failed..`;
    });

    $.get(`./sign-text/sign-reading-inner-html.txt`, function(data){
        let signs_writing_arr = data.split(`<|TheNextSign|>`);

        //is today a new day? if so randomize the text
        let today = new Date().getDate()
        if(can_answer){
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
        alert(`loading text failed..`);
        throw `loading sign text failed..`;
    });
}



function loadAphorism(){
    $.get(`./sign-text/aphorisms.txt`, function(data){
        let today = new Date().getDate()
        if(localStorage.getItem(`date`) === null){
            can_answer = true;
            localStorage.setItem(`date`, today);
        }
        else if (localStorage.getItem(`date`) != today){
            can_answer = true;
            localStorage.setItem(`date`, today);
        }
        else{
            can_answer = false;
        }
        console.log(`can answer question?: ${can_answer}`);

        if(can_answer){
            let aphorisms_arr = data.split(`<|next|>`);
            today_aphorism = shuffle(aphorisms_arr)[0];
            localStorage.removeItem(`today-aphorism`);
            localStorage.setItem(`today-aphorism`, JSON.stringify(today_aphorism));
        }
        else{
            today_aphorism = JSON.parse(localStorage.getItem(`today-aphorism`));
            //console.log(today_aphorism);
        }

        let aphorism_prefix = `The aphorism of art for the day: <br> <br> <br> <br> <br> <br> &nbsp &nbsp &nbsp `;
        let aphorism_postfix = ` <br> <br> <br> <br> <br> <br> right ? <br>     .    .    .    Come  back  tomorrow.`;
        today_aphorism = aphorism_prefix + today_aphorism + aphorism_postfix;
    }).done(()=>{
        loadTextFromFiles();
    }).fail(()=>{
        alert(`loading text failed..`);
        throw `loading aphorism text failed..`;
    });
}

//DETECT MOBILE
//=============
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}
//BROWSER ALERT
//============
// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';
// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

//==
let files_loaded = 0;
let can_randomize_sign_text = false;
//GLOBAL VARS
var can_answer = false;
var today_aphorism;
var signs_decode_array;
var signs_element_array;
var signs_reading_2d_arr = new Array();
if(!isMobile){$(window).on(`load`, loadAphorism);}
else{alert(`Hello, this site is not supported on mobile. Please view the site with a computer.`);}



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

//REFRESH LOCAL STORAGE
localStorage.removeItem(`date`);
localStorage.removeItem(`today-text`);
console.log(`local storage refreshed`);