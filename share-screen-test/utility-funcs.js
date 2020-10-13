//UTILITY FUNCS
//=============
const lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
};

// ----------------------
// requestAnimationFrame() shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function(fn, delay) {
	if( !window.requestAnimationFrame      	&& 
		!window.webkitRequestAnimationFrame && 
		!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
		!window.oRequestAnimationFrame      && 
		!window.msRequestAnimationFrame)
			return window.setTimeout(fn, delay);
			
	var start = new Date().getTime(),
		handle = new Object();
		
	function loop(){
		var current = new Date().getTime(),
			delta = current - start;
			
		delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
	};
	
	handle.value = requestAnimFrame(loop);
	return handle;
};
/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function(handle) {
	if(handle === undefined){handle = {value: undefined};}
	window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
	window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
	window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
	window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
	window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
	window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
	clearTimeout(handle);
};


//-------------------------
//WEB FUNCS
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

function getSource(){
	const tristan = {
		img: `./textures/images/tristan.jpg`,
		map: `./textures/filters/tristan-depth.jpg`,
		imgV: `./textures/images/tristan-v.jpg`,
		mapV: `./textures/filters/tristan-depth-v.jpg`,
		ui: 1,
		name: `Tristan<br>Espinoza`
	},
	alvaro = {
		img: `./textures/images/alvaro.jpg`,
		map: `./textures/filters/alvaro-depth.jpg`,
		imgV: `./textures/images/alvaro-v.jpg`,
		mapV: `./textures/filters/alvaro-depth-v.jpg`,
		ui: 2,
		name: `Alvaro<br>Azcarraga`
	},
	zheng = {
		img: `./textures/images/zheng.jpg`,
		map: `./textures/filters/zheng-depth.jpg`,
		imgV: `./textures/images/zheng-v.jpg`,
		mapV: `./textures/filters/zheng-depth-v.jpg`,
		ui: 3,
		name: `Zheng<br>Fang`
	},
	zhengyang = {
		img: `./textures/images/zhengyang.jpg`,
		map: `./textures/filters/zhengyang-depth.jpg`,
		imgV: `./textures/images/zhengyang-v.jpg`,
		mapV: `./textures/filters/zhengyang-depth-v.jpg`,
		ui: 4,
		name: `Zhengyang<br>Huang`
	},
	zhengzhou = {
		img: `./textures/images/zhengzhou.jpg`,
		map: `./textures/filters/zhengzhou-depth.jpg`,
		imgV: `./textures/images/zhengzhou-v.jpg`,
		mapV: `./textures/filters/zhengzhou-depth-v.jpg`,
		ui: 5,
		name: `Zhengzhou<br>Huang`
	},
	dasul = {
		img: `./textures/images/dasul.jpg`,
		map: `./textures/filters/dasul-depth.jpg`,
		imgV: `./textures/images/dasul-v.jpg`,
		mapV: `./textures/filters/dasul-depth-v.jpg`,
		ui: 6,
		name: `Dasul<br>Kim`
	},
	sam = {
		img: `./textures/images/sam.jpg`,
		map: `./textures/filters/sam-depth.jpg`,
		imgV: `./textures/images/sam-v.jpg`,
		mapV: `./textures/filters/sam-depth-v.jpg`,
		ui: 7,
		name: `Sam<br>Malabre`
	};

	var arr = [tristan, alvaro, zheng, zhengyang, zhengzhou, dasul, sam];
	shuffle(arr);

	var img_urls = arr.reduce((accumulator, cur) => {accumulator.push(cur.img); return accumulator;}, []);
	var filter_urls = arr.reduce((accumulator, cur) => {accumulator.push(cur.map); return accumulator;}, []);
	var img_urls_v = arr.reduce((accumulator, cur) => {accumulator.push(cur.imgV); return accumulator;}, []);
	var filter_urls_v = arr.reduce((accumulator, cur) => {accumulator.push(cur.mapV); return accumulator;}, []);
	var ui_id_nums = arr.reduce((accumulator, cur) => {accumulator.push(cur.ui); return accumulator;}, []);
	var artist_names = arr.reduce((accumulator, cur) => {accumulator.push(cur.name); return accumulator;}, []);

	return {
		imgs: img_urls,
		maps: filter_urls,
		imgsV: img_urls_v,
		mapsV: filter_urls_v,
		uis: ui_id_nums,
		names: artist_names
	};
}

function resizeCanvas(){
	if(window.innerWidth >= window.innerHeight){
		if(0.5625 * window.innerWidth < window.innerHeight){
			let w = 16 / 9 * window.innerHeight;
			let left = window.innerWidth / 2 - w / 2;
			bgCanvas.style.setProperty(`height`, `100vh`);
			bgCanvas.style.setProperty(`width`, w + `px`);
			bgCanvas.style.setProperty(`top`, `0`);
			bgCanvas.style.setProperty(`left`, `${left}px`);
		}
		else{
			bgCanvas.style.setProperty(`height`, `56.25vw`);
			bgCanvas.style.setProperty(`width`, `100vw`);
			bgCanvas.style.setProperty(`top`, `calc(50vh - 28.125vw)`);
			bgCanvas.style.setProperty(`left`, `0`);
		}
	}
	else if(window.innerWidth < window.innerHeight){
		if(0.5625 * window.innerHeight < window.innerWidth){
			let h = 16 / 9 * window.innerWidth;
			let top = window.innerHeight / 2 - h / 2;
			bgCanvas.style.setProperty(`width`, `100vw`);
			bgCanvas.style.setProperty(`height`, h + `px`);
			bgCanvas.style.setProperty(`left`, `0`);
			bgCanvas.style.setProperty(`top`, `${top}px`);
		}
		else{
			bgCanvas.style.setProperty(`height`, `100vh`);
			bgCanvas.style.setProperty(`width`, `56.25vh`);
			bgCanvas.style.setProperty(`top`, `0`);
			bgCanvas.style.setProperty(`left`, `calc(50vw - 28.125vh)`);
		}
	}

}

//============
//START BLURRY

var toBlurs = document.getElementsByClassName(`startBlurry`);
function startBlur(){
    for(var i = 0; i < toBlurs.length; i++){
        toBlurs[i].classList.add(`blurred`);
    }
}
function endBlur(){
    for(var i = 0; i < toBlurs.length; i++){
        toBlurs[i].classList.remove(`blurred`);
    }
}

//DETECT MOBILE
//=============
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}


//=============
startBlur();

//GLOBAL VARS
//===========
//loading
var loading = document.getElementById(`loading`);
var loading_text = document.getElementById(`loading-text`);
var loading_text2 = document.getElementById(`loading-text2`);


//sources
const sourceArr = getSource();
var img_urls = sourceArr.imgs,
	filter_urls = sourceArr.maps,
	img_urls_v = sourceArr.imgsV,
	filter_urls_v = sourceArr.mapsV,
	ui_id_nums = sourceArr.uis,
	artist_names = sourceArr.names;

//canvas
const bgCanvas = document.getElementById(`glCanvas`);
resizeCanvas();
window.addEventListener(`resize`, resizeCanvas);

//switch imgs
var global_img_index = 0;

var switchButton = document.getElementById(`switchImg`);
var cur_artist_name = document.getElementById(`artist-name`);
var ui_is_dispersed = false;
var ui_ids = [`ui1`, `ui2`, `ui3`, `ui4`, `ui5`, `ui6`, `ui7`];
var selected_ui = document.getElementById(`ui${ui_id_nums[global_img_index]}`);
selected_ui.style.setProperty(`z-index`, `1`);

var cur_ui; //for effects 
var switch_same_ui = true;

cur_artist_name.innerHTML = artist_names[global_img_index];