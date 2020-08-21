var $document = $(document);
var $htmlAndBody = $("html, body");
var $window = $(window);

/***change pseudo prop */
var UID = {
	_current: 0,
  getNew: function(){ this._current++; return this._current; },
  _props: {},
  addProp: function(id, prop, value) {
    this._props[id] = {
      prop : prop,
      value: value
    };
  },
  isPropExist: function(prop, value) {
    for (const id in this._props) {
      if (this._props.hasOwnProperty(id)) {
        const element = this._props[id];
        if (element.prop == prop && element.value == value) {
          return id;
        }
      }
    }
    return false;
  }
};

HTMLElement.prototype.pseudoStyle = function(element,prop,value){
	var _this = this;
	var _sheetId = 'pseudoStyles';
	var _head = document.head || document.getElementsByTagName('head')[0];
	var _sheet = document.getElementById(_sheetId) || document.createElement('style');
      _sheet.id = _sheetId;

  var regx = new RegExp('\\b' + 'pseudoStyle' + '.*?\\b', 'g');
  _this.className = _this.className.replace(regx, '');

  var currentID = UID.isPropExist(prop, value);
  if (currentID != false) {
    _this.className +=  ' ' + 'pseudoStyle' + currentID; 
  }
  else { 
    var newID = UID.getNew();
    UID.addProp(newID, prop, value);
    
    _this.className  += '  ' + 'pseudoStyle' + newID; 
    _sheet.innerHTML += ' .' + 'pseudoStyle' + newID + ':' + element + '{' + prop + ':' + value + '}';
    _head.appendChild(_sheet);
  }
  
  return this;
};

//vector class
/*
Simple 2D JavaScript Vector Class
Hacked from evanw's lightgl.js
https://github.com/evanw/lightgl.js/blob/master/src/vector.js
from https://gist.github.com/winduptoy/a1aa09c3499e09edbd33
*/

function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

/* INSTANCE METHODS */

Vector.prototype = {
	negative: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},
	add: function(v) {
		if (v instanceof Vector) {
			this.x += v.x;
			this.y += v.y;
		} else {
			this.x += v;
			this.y += v;
		}
		return this;
	},
	subtract: function(v) {
		if (v instanceof Vector) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
	},
	multiply: function(v) {
		if (v instanceof Vector) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
	},
	divide: function(v) {
		if (v instanceof Vector) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		} else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
		return this;
	},
	equals: function(v) {
		return this.x == v.x && this.y == v.y;
	},
	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	cross: function(v) {
		return this.x * v.y - this.y * v.x
	},
	length: function() {
		return Math.sqrt(this.dot(this));
	},
	normalize: function() {
		return this.divide(this.length());
	},
	min: function() {
		return Math.min(this.x, this.y);
	},
	max: function() {
		return Math.max(this.x, this.y);
	},
	toAngles: function() {
		return -Math.atan2(-this.y, this.x);
	},
	angleTo: function(a) {
		return Math.acos(this.dot(a) / (this.length() * a.length()));
	},
	toArray: function(n) {
		return [this.x, this.y].slice(0, n || 2);
	},
	clone: function() {
		return new Vector(this.x, this.y);
	},
	set: function(x, y) {
		this.x = x; this.y = y;
		return this;
	}
};

/* STATIC METHODS */
Vector.negative = function(v) {
	return new Vector(-v.x, -v.y);
};
Vector.add = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
	else return new Vector(a.x + b, a.y + b);
};
Vector.subtract = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
	else return new Vector(a.x - b, a.y - b);
};
Vector.multiply = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
	else return new Vector(a.x * b, a.y * b);
};
Vector.divide = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
	else return new Vector(a.x / b, a.y / b);
};
Vector.equals = function(a, b) {
	return a.x == b.x && a.y == b.y;
};
Vector.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
};
Vector.cross = function(a, b) {
	return a.x * b.y - a.y * b.x;
};
//vector class end
//other useful func
const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};

function addEvent(obj, evt, fn) {
  if (obj.addEventListener) {
    obj.addEventListener(evt, fn, false);
  } else if (obj.attachEvent) {
    obj.attachEvent("on" + evt, fn);
  }
}

//spotlight funcs
var lightV;
const lightMass = 15;
const shadeMass = 5;
const G = 0.2;
var velocity = new Vector(0, 0);
var acceleration = new Vector(0, 0);
//var accModifier = 1;
var shadeX = document.body.offsetWidth * 0.6;
var shadeY = document.body.offsetHeight;
var shadeV = new Vector(shadeX, shadeY);
//var canChangeAlpha = 0;
//var eclipseSpeed = 0.125;
var x = 0.5*window.innerWidth;
var y = 1.5*window.innerHeight;

var maxToLightDistIndex = 0.6;
var maxDistToLightCenter =
  document.body.clientWidth >= document.body.clientHeight
    ? Math.pow(document.body.clientWidth * maxToLightDistIndex, 2)
    : Math.pow(document.body.clientHeight * maxToLightDistIndex, 2);
//var alphaBias = 0.2;
var randNum = 0;

$window.resize(function(){
  maxDistToLightCenter =
  document.body.clientWidth >= document.body.clientHeight
    ? Math.pow(document.body.clientWidth * maxToLightDistIndex, 2)
    : Math.pow(document.body.clientHeight * maxToLightDistIndex, 2);
  });

var cursorLerpX = 0.005;
var cursorLerpY = 0.005;
var cursorLerpXdest = 0.07;
var cursorLerpYdest = 0.06;

var finishLerpCursorLerpX = false;
var finishLerpCursorLerpY = false;
function followCursor() {
  IDfollowCursor = requestAnimationFrame(followCursor);
  
  if(start == false){
    if(!finishLerpCursorLerpX){
      if(Math.abs(cursorLerpX - cursorLerpXdest) >= 0.002){cursorLerpX = lerp(cursorLerpX, cursorLerpXdest, 0.008);}
      else{cursorLerpY = cursorLerpXdest; finishLerpCursorLerpY = true;}
    }
    
    x = lerp(x, mouseX, cursorLerpX);
  }
  if(!finishLerpCursorLerpY){
    if(Math.abs(cursorLerpY - cursorLerpYdest) >= 0.002){cursorLerpY = lerp(cursorLerpY, cursorLerpYdest, 0.008);}
    else{cursorLerpY = cursorLerpYdest; finishLerpCursorLerpX = true;}
  }
  y = lerp(y, mouseY, cursorLerpY);

  document.documentElement.style.setProperty("--cursorX", x + "px");
  document.documentElement.style.setProperty("--cursorY", y + "px");

  lightV = new Vector(x, y); //lightV is the attracting gravity
  acceleration.multiply(0);
  shadeX = shadeV.x;
  shadeY = shadeV.y;

  if (mouseState != 1) {
    let force = Vector.subtract(lightV, shadeV); //get direction
    let d = force.length(); //get distance between the 2
    //constrain d
    if (d > 25) {
      d = 25;
    } else if (d < 10) {
      d = 10;
    }
    force.normalize(); //distance doesn't matter here, we just want this vector for direction
    let strength = (G * lightMass * shadeMass) / (d * d);
    force.multiply(strength);

    //apply force
    let f = Vector.divide(force, shadeMass);
    acceleration.add(f);
    velocity.add(acceleration);
    shadeV.add(velocity);

    //change alpha and acc modifier
    if(mouseState == 0){maxToLightDistIndex = 0.6;}
    else if(mouseState == 2){maxToLightDistIndex = 0.2;}

    let distanceToLightCenter =
      Math.pow(shadeX - x, 2) + Math.pow(shadeY - y, 2);

    //let aBias = Math.pow(document.body.clientWidth * alphaBias, 2);
    let d2 = distanceToLightCenter; //+ aBias;
    //if (d2 > maxDistToLightCenter) {d2 = maxDistToLightCenter;}

    let A1 = scale(d2, 10000, maxDistToLightCenter, 0.04, 0.98);
    let A2 = scale(d2, 10000, maxDistToLightCenter, 0.14, 1);
    //eclipseA1 = lerp(eclipseA1, A1, 0.4);
    //eclipseA2 = lerp(eclipseA2, A2, 0.4);
    eclipseA1 = 1 - A1;
    eclipseA2 = 1 - A2;

    document.documentElement.style.setProperty("--eclipseA1", eclipseA1);
    document.documentElement.style.setProperty("--eclipseA2", eclipseA2);
    //fadeInEcA1 = eclipseA1;
    //fadeInEcA2 = eclipseA2;
  } else if (mouseState == 1 && eclipseR <= 0 && (nameInputSubmitted == 1 || timeInputSubmitted)) {
    if(nameInputSubmitted == 1){
      randNum = Math.random() * (4.5 - 1.5) + 1.5;
    }
    else if(timeInputSubmitted){
      randNum = Math.random() * (3.8 - 0.8) + 0.8;
    }
    let randSign = Math.random() * (0.1 + 0.1) - 0.1;
    randNum = randSign > 0 ? randNum : -1 * randNum;
    shadeV = new Vector(
      mouseX + document.body.clientWidth * randNum,
      mouseY + document.body.clientHeight * randNum
    );

    if (shadeX < x) {
      velocity.x = 0.01;
    } else {
      velocity.x = -0.01;
    }
    if (shadeY < y) {
      velocity.y = 0.01;
    } else {
      velocity.y = -0.01;
    }
  }
  document.documentElement.style.setProperty("--eclipseX", shadeX + "px");
  document.documentElement.style.setProperty("--eclipseY", shadeY + "px");
}

//variables for function update
var mouseX = 0.5 * window.innerWidth,
    mouseY = 1.15 * window.innerHeight;
//var followInterv = 0;

var IDfollowCursor;
function update(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  //clearInterval(followInterv);
  //followInterv = setInterval(followCursor, 1000 / frameRate, mouseX, mouseY);
  cancelAnimationFrame(IDfollowCursor);
  IDfollowCursor = requestAnimationFrame(followCursor);
}

//var mouseStateUpdated = 0;

function SLR1() {
  IDSLR = requestAnimationFrame(SLR1);
  if (spotLightRadius < 32) {
    //canChange = 0;
    spotLightRadius += 0.125;
    if (spotLightRadius > 32) {
      spotLightRadius = 32;
    }
  } 
  else if(spotLightRadius > 32){
    //canChange = 0;
    spotLightRadius -= 0.125;
    if (spotLightRadius < 32) {
      spotLightRadius = 32;
    }
  }
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function SLR2() {
  IDSLR = requestAnimationFrame(SLR2);
  if (spotLightRadius < 42) {
    //canChange = 0;
    spotLightRadius += 0.125;
    if (spotLightRadius > 42) {
      spotLightRadius = 42;
    }
  }
  else if(spotLightRadius > 42){
    //canChange = 0;
    spotLightRadius -= 0.125;
    if (spotLightRadius < 42) {
      spotLightRadius = 42;
    }
  } 
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function SLR3() {
  IDSLR = requestAnimationFrame(SLR3);
  if (spotLightRadius > 24) {
    //canChange = 0;
    spotLightRadius -= 0.125;
    if (spotLightRadius < 24) {
      spotLightRadius = 24;
    }
  } 
  else if(spotLightRadius < 24){
    //canChange = 0;
    spotLightRadius += 0.125;
    if (spotLightRadius > 24) {
      spotLightRadius = 24;
    }
  }
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function incEclipseR() {
  IDECR = requestAnimationFrame(incEclipseR);
  if (eclipseR < 23) {
    //canChangeEclipse = 0;
    eclipseR += 0.04;
  } 
  // else {
  //   canChangeEclipse = 1;
  // }
  if (eclipseR > 23) {
    eclipseR = 23;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function incEclipseR2() {
  IDECR = requestAnimationFrame(incEclipseR2);
  if (eclipseR < 41.5) {
    //canChangeEclipse = 0;
    eclipseR += 0.06;
  } 
  // else {
  //   canChangeEclipse = 1;
  // }
  if (eclipseR > 41.5) {
    eclipseR = 41.5;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function decEclipseR() {
  IDECR = requestAnimationFrame(decEclipseR);
  if (eclipseR > 0) {
    //canChangeEclipse = 0;
    eclipseR -= 0.5;
  } 
  // else {
  //   canChangeEclipse = 1;
  // }
  if (eclipseR < 0) {
    eclipseR = 0;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function eclipseFadeout() {
  IDECA = requestAnimationFrame(eclipseFadeout);
  if (eclipseA1 > 0.1 || eclipseA2 > 0.06) {
    //canChangeAlpha = 0;
    if (eclipseA1 > 0.02) {
      eclipseA1 -= 0.03125;
    } else if (eclipseA1 < 0.02) {
      eclipseA1 = 0.02;
    }
    if (eclipseA2 > 0.01) {
      eclipseA2 -= 0.03125;
    } else if (eclipseA2 < 0.01) {
      eclipseA2 = 0.01;
    }
  }

  if (eclipseA1 < 0.02) {
    eclipseA1 = 0.02;
  }
  if (eclipseA2 < 0.01) {
    eclipseA2 = 0.01;
  }
  document.documentElement.style.setProperty("--eclipseA1", eclipseA1);
  document.documentElement.style.setProperty("--eclipseA2", eclipseA2);
}

var IDSLR,
    IDECA,
    IDECR;
function updateR() {
  //if (canChange == 1) {
    //if (mouseStateUpdated == 0) {
      //mouseStateUpdated = 1;
      //mouseState = (mouseState + 1) % 3;
    //}
    // clearInterval(interv);
    // clearInterval(eclipseInterv);
    // clearInterval(eclipseFadeInterv);
    cancelAnimationFrame(IDSLR);
    cancelAnimationFrame(IDECA);
    cancelAnimationFrame(IDECR);
    if (mouseState == 1) {
      velocity.multiply(0); //reset eclipse velocity

      IDSLR = requestAnimationFrame(SLR1);
      IDECA = requestAnimationFrame(eclipseFadeout);
      IDECR = requestAnimationFrame(decEclipseR);
      // interv = setInterval(incR1, 1000 / frameRate);
      // eclipseFadeInterv = setInterval(eclipseFadeout, 1000 / frameRate);
      // eclipseInterv = setInterval(decEclipseR, 1000 / frameRate);
    } 
    else if (mouseState == 2) {
      IDSLR = requestAnimationFrame(SLR3);
      IDECR = requestAnimationFrame(incEclipseR);
      // interv = setInterval(decR, 1000 / frameRate);
      // eclipseInterv = setInterval(incEclipseR, 1000 / frameRate);
    } 
    else if (mouseState == 0) {
      IDSLR = requestAnimationFrame(SLR2);
      IDECR = requestAnimationFrame(incEclipseR2);
      // interv = setInterval(incR2, 1000 / frameRate);
      // eclipseInterv = setInterval(incEclipseR2, 1000 / frameRate);
    }
  //}
}


$htmlAndBody.animate({ scrollTop: 0 }, "slow");
/*****************************filter setting*************************** */
var setting = false;
var $settingClass = $(".setting");
var $settingText = $(".settingText");
var $smallerST = $("#smallerST");

var $settingButton = $(".settingButton");
var $filterOn = $("#filterOn");
var $filterOff = $("#filterOff");
var $filterOnText = $("#filterOnText");
var $filterOffText = $("#filterOffText");

var settingDOM = document.getElementsByClassName("setting")[0];
var settingFontSize = 59;
var settingFontOpacity = 0;
var buttonFontSize = 55;
var settingBlur = 0.9;
//adjust font on window size
function adjustSettingFont(event){
  if(setting == false){
    let modifiedBlur;
    let modifiedButtonFontSize;

    if(window.innerHeight < 1000){settingFontSize = Math.round(window.innerWidth * 0.021);}
    else{settingFontSize = Math.round(window.innerWidth * 0.023);}
    if(settingFontSize < 20){settingFontSize = 20;}
    settingDOM.style.setProperty("--settingFontSize", settingFontSize + "px");
    let smaller = Math.round(settingFontSize*0.85)
    settingDOM.style.setProperty("--smallerSettingFontSize", smaller + "px");
    
    if(window.innerWidth < 1960 && window.innerWidth > 1700){
      settingFontOpacity = 0.75 + ((1960 - window.innerWidth)/200) * 0.1;
      settingFontOpacity.toFixed(2);
      settingBlur = 0.75;
    }
    else if(window.innerWidth < 1700){
      settingFontOpacity = 0.75 + ((1960 - window.innerWidth)/200) * 0.1;
      settingFontOpacity.toFixed(2);
      settingBlur = 0.75 - ((1700 - window.innerWidth)/250) * 0.25;
      settingBlur.toFixed(2);
    }
    else{
      settingFontOpacity = 0.75;
      settingBlur = 0.9;
    }
    if(settingFontOpacity > 1){settingFontOpacity = 1;}
    else if(settingFontOpacity < 0.75){settingFontOpacity = 0.75;}
    if(settingBlur < 0){settingBlur = 0;}
    else if(settingBlur > 0.9){settingBlur = 0.9;}
    modifiedBlur = settingBlur;

    if(window.innerWidth < 800 && window.innerWidth >= 700){buttonFontSize = 50; modifiedButtonFontSize = buttonFontSize;}
    else if(window.innerWidth < 700 && window.innerWidth >= 540){buttonFontSize = 45; modifiedButtonFontSize = buttonFontSize;}
    else if(window.innerWidth < 540 && window.innerWidth >= 400){buttonFontSize = 30; modifiedButtonFontSize = buttonFontSize;}
    else if(window.innerWidth < 400 && window.innerWidth >= 350){buttonFontSize = 25; modifiedButtonFontSize = buttonFontSize;}
    else if(window.innerWidth < 350){buttonFontSize = 20; modifiedButtonFontSize = buttonFontSize; }

    if(window.innerHeight < 600){
      buttonFontSize = Math.round(window.innerHeight * 0.09);
      if(modifiedButtonFontSize < buttonFontSize){buttonFontSize = modifiedButtonFontSize;}
      settingBlur = modifiedBlur - ((600 - window.innerHeight)/50) * 0.5;
      settingBlur.toFixed(2);
    }

    if(window.innerHeight >= 600 && window.innerWidth >= 1024){buttonFontSize = 55;}
    
    if(settingBlur < 0){settingBlur = 0;}
    else if(settingBlur > 0.9){settingBlur = 0.9;}

    $settingText.css("opacity", settingFontOpacity);
    $settingButton.css("font-size", buttonFontSize + "px");
    $settingClass.css("filter", "blur(" + settingBlur + "px)");
  }
  else{$(this).off(event);}
}

//events
$document.ready(adjustSettingFont);
$window.resize(adjustSettingFont);

//hover button
setTimeout(function(){
  $settingButton.one("mouseover", function(){
    setTimeout(function(){
      if(setting == false){
        $filterOnText
          .html('lev<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');
        setTimeout(function(){
          $filterOnText
            .html('leve<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 150);
        setTimeout(function(){
          $filterOnText
            .html('leave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 300);
        setTimeout(function(){
          $filterOnText
            .html('l eave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 450);
        setTimeout(function(){
          $filterOnText
            .html('l eav e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 600);
        setTimeout(function(){
          $filterOnText
            .html('l e av e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 750);
        setTimeout(function(){
          $filterOnText
            .html('l e a v e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 900);
          
        $filterOffText.html('tk<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');
        setTimeout(function(){
          $filterOffText
            .html('tak<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 150);
        setTimeout(function(){
          $filterOffText
            .html('take<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 300);
        setTimeout(function(){
          $filterOffText
            .html('t ake<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 450);
        setTimeout(function(){
          $filterOffText
            .html('ta ke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 600);
        setTimeout(function(){
          $filterOffText
            .html('ta k e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 750);
        setTimeout(function(){
          $filterOffText
            .html('t a k e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 900);
      }
    }, 500);
  });
}, 1000);


//click button
$filterOn.click(function(){
  if(setting == false){
    setting = true;
    $(document.body).addClass("svgFilter");
    $(document.documentElement).addClass("svgFilter");

    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $settingClass.css("opacity", "0");
    },1100);
    setTimeout(function(){$settingClass.css("display", "none");}, 2100);

    $filterOn.css("cursor", "grabbing");

    $filterOn.off();
    $filterOff.off();
  }
});

$filterOff.click(function(){
  if(setting == false){
    setting = true;
    $(document.documentElement).addClass("svgFilter");

    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $settingClass.css("opacity", "0");
      $(".plaintext").css("font-weight", "600");
    },1100);
    setTimeout(function(){$settingClass.css("display", "none");}, 2100);

    $filterOff.css("cursor", "grabbing"); 
    
    $filterOn.off();
    $filterOff.off();
  }
});

/******************************spotlight*********************************/
var mouseState = 1;
//var frameRate = 75;
//var canChange = 1;
//var canChangeEclipse = 1;

var spotLightRadius = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--radius"),
  10
);
var eclipseR = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--eclipseR"),
  10
);
var eclipseA1 = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--eclipseA1"),
  10
);
var eclipseA2 = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue("--eclipseA2"),
  10
);
var fadeInEcA1 = eclipseA1;
var fadeInEcA2 = eclipseA2;
//var interv = 0;
//var eclipseInterv = 0;
//var eclipseFadeInterv = 0;

function startAnim(){
  if(start){
    setTimeout(function() {
      mouseY = 0.2 * window.innerHeight;
      cancelAnimationFrame(IDfollowCursor);
      IDfollowCursor = requestAnimationFrame(followCursor);
    }, 5000);
    setTimeout(function() {
      start = false;
      cursorLerpY = 0.005;
      addEvent(document, "mousemove", update);
      cancelAnimationFrame(IDstart);
    }, 9000);
  }
}
function darknessStartAnim(){
  cancelAnimationFrame(IDdarkness);
  if(Math.abs(darkness - 0.93) >= 0.005){
    darkness = lerp(darkness, 0.93, 0.005);
    IDdarkness = requestAnimationFrame(darknessStartAnim);
  }
  else{darkness = 0.93; }
  document.documentElement.style.setProperty("--darkness", darkness);
}

var start = true;
var IDstart;
var IDdarkness;
var darkness = 0.99;

$settingButton.one("click", function(){
  if(setting){
    IDfollowCursor = requestAnimationFrame(followCursor);
    IDstart = requestAnimationFrame(startAnim);
    IDdarkness = requestAnimationFrame(darknessStartAnim);
    updateR();
  }
});

/********************spotlight change******************* */
var SLCtimer;
var sunsetStart = false;
var backtoSpotLight = false;
var nightStart = false;
var LR1 = {val: 0, ID: undefined},
    LG1 = {val: 0, ID: undefined},
    LB1 = {val: 0, ID: undefined},
    LR2 = {val: 0, ID: undefined},
    LG2 = {val: 0, ID: undefined},
    LB2 = {val: 0, ID: undefined},
    LA037 = {val: 0.37, ID: undefined};
var sunsetR1 = 61,
    sunsetG1 = 34,
    sunsetB1 = 35,
    sunsetR2= 76,
    sunsetG2 = 17,
    sunsetB2 = 6,
    sunsetA037 = 0.65;

var nightR1 = 34,
    nightG1 = 34,
    nightB1 = 52,
    nightR2= 23,
    nightG2 = 30,
    nightB2 = 48,
    nightA037 = 0.65;

function cancelSLCid(){
  cancelAnimationFrame(LR1.ID);
  cancelAnimationFrame(LR2.ID);
  cancelAnimationFrame(LG1.ID);
  cancelAnimationFrame(LG2.ID);
  cancelAnimationFrame(LB1.ID);
  cancelAnimationFrame(LB2.ID);
  cancelAnimationFrame(LA037.ID);
}

function sunsetColor(src, dst, varString, time=8000){
  if(src.val == dst){ return; }
  let curColor = src.val;
  $({ c: curColor }).stop().animate({ c: dst }, {
    duration: time,
    easing: "easeInOutElastic", 
    step: function(now) {
      if(backtoSpotLight){return;}
      if(nightStart){return;}
      src.val = Math.round(now);
      if(src.val > 255){src.val = 255;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}
function sunsetAlpha(src, dst, varString, time=5000){
  if(src.val == dst){ return; }
  let curAlpha = src.val;
  $({ a: curAlpha }).stop().animate({ a: dst }, {
    duration: time,
    easing: "easeInOutBack", 
    step: function(now) {
      if(backtoSpotLight){return;}
      if(nightStart){return;}
      src.val = now;
      if(src.val > 1){src.val = 1;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}

function nightColor(src, dst, varString, time=8000){
  if(src.val == dst){ return; }
  let curColor = src.val;
  $({ c: curColor }).stop().animate({ c: dst }, {
    duration: time,
    easing: "easeInOutElastic", 
    step: function(now) {
      if(backtoSpotLight){return;}
      if(sunsetStart){return;}
      src.val = Math.round(now);
      if(src.val > 255){src.val = 255;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}
function nightAlpha(src, dst, varString, time=5000){
  if(src.val == dst){ return; }
  let curAlpha = src.val;
  $({ a: curAlpha }).stop().animate({ a: dst }, {
    duration: time,
    easing: "easeInOutBack", 
    step: function(now) {
      if(backtoSpotLight){return;}
      if(sunsetStart){return;}
      src.val = now;
      if(src.val > 1){src.val = 1;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}

function spotlightColor(src, dst, varString, time=8000){
  if(src.val == dst){ return; }
  let curColor = src.val;
  $({ c: curColor }).stop().animate({ c: dst }, {
    duration: time,
    easing: "easeInOutQuad", 
    step: function(now) {
      if(sunsetStart){return;}
      if(nightStart){return;}
      src.val = Math.round(now);
      if(src.val > 255){src.val = 255;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}
function spotlightAlpha(src, dst, varString, time=5000){
  if(src.val == dst){ return; }
  let curAlpha = src.val;
  $({ a: curAlpha }).stop().animate({ a: dst }, {
    duration: time,
    easing: "easeInOutQuad", 
    step: function(now) {
      if(sunsetStart){return;}
      if(nightStart){return;}
      src.val = now;
      if(src.val > 1){src.val = 1;}
      else if(src.val < 0){src.val = 0;}
      document.documentElement.style.setProperty(varString, src.val);
    },
    complete: function(){ 
      cancelAnimationFrame(src.ID);
    }
  });
}

/******************************header blur ************************/
var hopacity = 0.85;
var hblur = 4.5;
var $h1 = $("h1");
var h1 = document.getElementsByTagName("h1")[0];
var hblurDir = -1;
var IDhblur;

$settingButton.one("click", function(){
  if(setting){IDhblur = requestAnimationFrame(hblurAnim);}
});
function hblurAnim(){
  setTimeout(function(){
    if(hblurDir == -1){
      hopacity = 0.9;
      hblur = 1.25;
    }
    else{
      hopacity = 0.8;
      hblur = 5;
    }
    hblurDir *= -1;
    h1.style.setProperty("opacity", hopacity);
    h1.style.setProperty("--hblur", hblur+"px");
    cancelAnimationFrame(IDhblur);
    IDhblur = requestAnimationFrame(hblurAnim);
  }, 7000);
}

/*************************body roate********************************/
var bodyRY = parseInt(getComputedStyle(document.body).getPropertyValue("--bodyRotateY"),10);
var screenMax = 0.6 * window.screen.width;
var screenMin = -1*window.screen.width/2 + 0.04 * window.screen.width;
var leftDeg = -1.5;
var rightDeg = 1.5;
function bodyRotate(e){
  let sx = e.screenX - window.screen.width/2;
  if(sx > screenMax){sx = screenMax;}
  else if (sx < screenMin){sx = screenMin;}

  if(setting){leftDeg = -4; rightDeg = 8;} 
  bodyRY = Math.round(scale(sx, screenMin, screenMax, leftDeg, rightDeg));
  document.body.style.setProperty("--bodyRotateY", bodyRY+"deg");
  //let sy = e.screenY;
}

addEvent(document, "mousemove", bodyRotate);

/*********************cloud displacement map*****************************/
var cloudFilter = document.getElementById("cloud-filter");
var cloudDisp = document.getElementById("cloud-disp");
//var $cloudFilter = $("#cloud-filter");
//var $cloudDisp = $("#cloud-disp");
var IDbf;
var IDoc;
var IDsc;

var baseFrequency = 0.07;
var octave = 1;
var cloudScale = 100;

var bfMax = 0.025;
var bfMiddle = 0.015;
var bfMin = 0.007;
var scaleMax = 110;
var scaleMiddle = 90;
var scaleMin = 37;
var ocMax = 10;
var ocMiddle = 6;
var ocMin = 1;

var bfDir = -1;
var scDir = -1;
var ocDir = 1;

$settingButton.one("click", function(){
  if(setting){
    if(start){
      IDbf = requestAnimationFrame(cloudBfStart);
      IDsc = requestAnimationFrame(cloudScStart);
      IDoc = requestAnimationFrame(cloudOcStart);
    }
  }
});

function cloudBfStart(){
  let curBf = baseFrequency;
  $({ bf: curBf }).animate({ bf: bfMin }, {
    duration: 11000,
    easing: "easeOutQuad", 
    step: function(now, fx) {
      baseFrequency = now;
      cloudFilter.setAttribute("baseFrequency", baseFrequency);
    },
    complete: function(){
      bfDir = 1;
      cancelAnimationFrame(IDbf);
      IDbf = requestAnimationFrame(cloudBfDrift);
    }
  });
}
function cloudScStart(){
  let curSc = cloudScale;
  $({ sc: curSc }).animate({ sc: scaleMin }, {
    duration: 19500,
    easing: "easeOutQuad",
    step: function(now, fx) {
      cloudScale = now;
      cloudDisp.setAttribute("scale", cloudScale);
    },
    complete: function(){
      ScDir = 1;
      cancelAnimationFrame(IDsc);
      IDsc = requestAnimationFrame(cloudScDrift);
    }
  });
}
function cloudOcStart(){
  let curOc = octave;
  $({ oc: curOc }).animate({ oc: scaleMax }, {
    duration: 14500,
    easing: "easeOutQuad",
    step: function(now, fx) {
      octave = Math.round(now);
      cloudFilter.setAttribute("numOctaves", octave);
    },
    complete: function(){
      OcDir = -1;
      cancelAnimationFrame(IDoc);
      IDoc = requestAnimationFrame(cloudOcDrift);
    }
  });
}

function cloudBfDrift(){
  if(bfDir == -1){
    let curBf = baseFrequency;
    $({ bf: curBf }).animate({ bf: bfMin }, {
      duration: 35000,
      easing: "easeInOutSine",
      step: function(now, fx) {
        baseFrequency = now;
        cloudFilter.setAttribute("baseFrequency", baseFrequency);
      },
      complete: function(){
        bfDir = 1;
        cancelAnimationFrame(IDbf);
        IDbf = requestAnimationFrame(cloudBfDrift);
      }
    });
  }
  else{
    let curBf = baseFrequency;
    $({ bf: curBf }).animate({ bf: bfMiddle }, {
      duration: 35000,
      easing: "easeOutSine",
      step: function(now, fx) {
        baseFrequency = now;
        cloudFilter.setAttribute("baseFrequency", baseFrequency);
      },
      complete: function(){
        bfDir = -1;
        cancelAnimationFrame(IDbf);
        IDbf = requestAnimationFrame(cloudBfDrift);
      }
    });
  }
}

function cloudScDrift(){
  if(scDir == -1){
    let curSc = cloudScale;
    $({ sc: curSc }).animate({ sc: scaleMin }, {
      duration: 25000,
      easing: "easeOutSine",
      step: function(now, fx) {
        cloudScale = now;
        cloudDisp.setAttribute("scale", cloudScale);
      },
      complete: function(){
        ScDir = 1;
        cancelAnimationFrame(IDsc);
        IDsc = requestAnimationFrame(cloudScDrift);
      }
    });
  }
  else{
    let curSc = cloudScale;
    $({ sc: curSc }).animate({ sc: scaleMiddle }, {
      duration: 25000,
      easing: "easeOutSine",
      step: function(now) {
        cloudScale = now;
        cloudDisp.setAttribute("scale", cloudScale);
      },
      complete: function(){
        ScDir = -1;
        cancelAnimationFrame(IDsc);
        IDsc = requestAnimationFrame(cloudScDrift);
      }
    });
  }
}

function cloudOcDrift(){
  if(ocDir == -1){
    let curOc = octave;
    $({ oc: curOc }).animate({ oc: scaleMiddle }, {
      duration: 20000,
      easing: "easeOutSine",
      step: function(now) {
        octave = Math.round(now);
        cloudFilter.setAttribute("numOctaves", octave);
      },
      complete: function(){
        OcDir = 1;
        cancelAnimationFrame(IDoc);
        IDoc = requestAnimationFrame(cloudOcDrift);
      }
    });
  }
  else{
    let curOc = octave;
    $({ oc: curOc }).animate({ oc: scaleMax }, {
      duration: 20000,
      easing: "easeOutSine",
      step: function(now) {
        octave = Math.round(now);
        cloudFilter.setAttribute("numOctaves", octave);
      },
      complete: function(){
        OcDir = -1;
        cancelAnimationFrame(IDoc);
        IDoc = requestAnimationFrame(cloudOcDrift);
      }
    });
  }
}


/*******************plaintext font size******************************** */
var $rotateTextOne = $(".rotateTextOne");
var $rotateTextTwo = $(".rotateTextTwo");
var $plaintext = $(".plaintext");
var $timeInput = $("#timeInput");

var plaintextFontSize = 30;
var moonMarginL = 6;
var hMarginL = 6;
var hFontSize = 72;
function adjustElementSize(){
  if(window.innerWidth < 1000 && window.innerWidth >= 800){
    plaintextFontSize = 28; 
    moonMarginL = 5; 
    hFontSize = 66;
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "35%");
    $timeInput.css("width", "55%");
  }
  else if(window.innerWidth < 800 && window.innerWidth >= 700){
    plaintextFontSize = 26; 
    moonMarginL = 5; 
    hFontSize = 60;
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "35%");
    $timeInput.css("width", "55%");
  }
  else if(window.innerWidth < 700 && window.innerWidth >= 600){
    plaintextFontSize = 24;
    moonMarginL = 20;
    hMarginL = 4;
    hFontSize = 55; 
    $rotateTextOne.css("display", "none");
    $rotateTextTwo.css("display", "none");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "initial");
    timeButtonMouseOverFunc = 1;
    $plaintext.css("margin-right", "18px");
    $timeInput.css("width", "100%");
  }
  else if(window.innerWidth < 600 && window.innerWidth >= 500){
    plaintextFontSize = 22;
    moonMarginL = 16;
    hMarginL = 3;
    hFontSize = 52; 
    $rotateTextOne.css("display", "none");
    $rotateTextTwo.css("display", "none");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "initial");
    timeButtonMouseOverFunc = 1;
    $plaintext.css("margin-right", "18px");
    $timeInput.css("width", "100%");
  }
  else if(window.innerWidth < 500 && window.innerWidth >= 400){
    plaintextFontSize = 20;
    moonMarginL = 16;
    hMarginL = 3;
    hFontSize = 48; 
    $rotateTextOne.css("display", "none");
    $rotateTextTwo.css("display", "none");
    $h1.text("Self-Help Guide : Art-trology");
    $yearMonthButton.css("display", "initial");
    timeButtonMouseOverFunc = 1;
    $plaintext.css("margin-right", "18px");
    $timeInput.css("width", "100%");
  }
  else if(window.innerWidth <400){
    plaintextFontSize = 20; 
    moonMarginL = 16; 
    hMarginL = 3; 
    hFontSize = 46;
    $rotateTextOne.css("display", "none");
    $rotateTextTwo.css("display", "none");
    $h1.text("Self-Help Guide : Art-trology");
    $yearMonthButton.css("display", "initial");
    timeButtonMouseOverFunc = 1;
    $plaintext.css("margin-right", "18px");
    $timeInput.css("width", "100%");
  }
  else{
    plaintextFontSize = 30; 
    moonScale = 1; 
    moonMarginL = 6; 
    hMarginL = 3; 
    hFontSize = 75;
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "35%");
    $timeInput.css("width", "55%");
  }
  document.documentElement.style.setProperty("--plaintextFontSize", plaintextFontSize + "px");
  document.documentElement.style.setProperty("--moonMarginL", moonMarginL + "vw");
  document.documentElement.style.setProperty("--hMoonMarginL", hMarginL + "vw");
  document.documentElement.style.setProperty("--hFontSize", hFontSize + "px");
}
$document.ready(adjustElementSize);
$window.resize(adjustElementSize);
/********************twinkle plain text***********************************/
var plaintexts = document.getElementsByClassName("plaintext");
//var twinkleIntervs = new Array(plaintexts.length);
var twinkleIDs = new Array(plaintexts.length);
var twinkleDirects = new Array(plaintexts.length);


function textTwinkle($this, index){
  twinkleIDs[index] = requestAnimationFrame(function(){textTwinkle($this, index);});
  if($this.css("opacity") < 0.55 && twinkleDirects[index] == 1){ 
    $this.css("opacity", 0.55);
    $this.css("--glowPix1", "3.5px");
    $this.css("--glowPix2", "-3.5px");
    if(Math.abs($this.css("opacity")-0.55) <= 0.005){twinkleDirects[index] = -1;}
  }
  else if ($this.css("opacity") > 0.15 && twinkleDirects[index] == -1){
    $this.css("opacity", 0.15);
    $this.css("--glowPix1", "1.5px");
    $this.css("--glowPix2", "-1.5px");
    if(Math.abs($this.css("opacity")-0.15) <= 0.005){twinkleDirects[index] = 1;}
  }
  else if($this.css("opacity") >= 0.55 && twinkleDirects[index] == 1){twinkleDirects[index] = -1;}
  else if($this.css("opacity") <= 0.15 && twinkleDirects[index] == -1){twinkleDirects[index] = 1;}
}

function textTwinkleBright($this, index){ 
  twinkleIDs[index] = requestAnimationFrame(function(){textTwinkleBright($this, index);});
  if($this.css("opacity") < 0.98 && twinkleDirects[index] == 1){ 
    $this.css("opacity", 0.98);
    $this.css("--glowPix1", "0.5px");
    $this.css("--glowPix2", "-0.5px");
    if(Math.abs($this.css("opacity")-0.98) <= 0.005){twinkleDirects[index] = -1;}
  }
  else if ($this.css("opacity") > 0.5 && twinkleDirects[index] == -1){
    $this.css("opacity", 0.5);
    $this.css("--glowPix1", "2px");
    $this.css("--glowPix2", "-2px");
    if(Math.abs($this.css("opacity")-0.5) <= 0.005){twinkleDirects[index] = 1;}
  }
  else if($this.css("opacity") >= 0.98 && twinkleDirects[index] == 1){twinkleDirects[index] = -1;}
  else if($this.css("opacity") <= 0.5 && twinkleDirects[index] == -1){twinkleDirects[index] = 1;}
}

let j;
for (j = 0; j < plaintexts.length; j++){
  //twinkleIntervs[j] = 0;
  //clearInterval(twinkleIntervs[j]);
  twinkleIDs[j] = undefined;
  cancelAnimationFrame(twinkleIDs[j]);
  twinkleDirects[j] = 1;
}

const openingTextStart = 0;
const openingTextEnd = 2;
function selfTwinkle(start, end){
  let k;
  for (k = start; k < end+1; k++){
    let $argThis = $(plaintexts[k]);
    let index = parseInt($argThis.attr("id"), 10);
    twinkleDirects[index] = -1;
    twinkleIDs[index] = requestAnimationFrame(function(){textTwinkle($argThis, index);});
  }//of for loop
}
function cancelTwinkle(start, end){
  let k;
  for (k = start; k < end+1; k++){
    let $argThis = $(plaintexts[k]);
    let index = parseInt($argThis.attr("id"), 10);
    cancelAnimationFrame(twinkleIDs[index]);
  }//of for loop
}
$window.on("load", function(){selfTwinkle(openingTextStart, openingTextEnd);});
//$window.focus(selfTwinkle);


var i;
for(i = 0; i < plaintexts.length; i++){
  addEvent(plaintexts[i], "mouseover", function(){
    if(parseFloat($(this).parent().css("opacity")) > 0 && parseFloat($(this).parent().parent().css("opacity")) > 0 && start == false){
      let $argThis = $(this);
      let index = parseInt($argThis.attr("id"), 10);
      clearTimeout($.data(this, 'mouseoverTimer'));
      $.data(this, 'mouseoverTimer', setTimeout(function() {
        // mouseover over ms
        //clearInterval(twinkleIntervs[index]);
        cancelAnimationFrame(twinkleIDs[index]);
        twinkleDirects[index] = 1;
        //twinkleIntervs[index] = setInterval(textTwinkleBright, 1000/frameRate, $argThis, index);
        twinkleIDs[index] = requestAnimationFrame(function(){textTwinkleBright($argThis, index);});
      }, 4000));
    }
  });
  
  addEvent(plaintexts[i], "mouseleave", function(){
    if(parseFloat($(this).parent().css("opacity")) > 0 && parseFloat($(this).parent().parent().css("opacity")) > 0 && start == false){
      let $argThis = $(this);
      let index = parseInt($argThis.attr("id"), 10);
      clearTimeout($.data(this, 'mouseoverTimer'));
      $.data(this, 'mouseoverTimer', setTimeout(function() {
        // mouseover over ms
        //clearInterval(twinkleIntervs[index]);
        cancelAnimationFrame(twinkleIDs[index]);
        twinkleDirects[index] = -1;
        //twinkleIntervs[index] = setInterval(textTwinkle, 1000 / frameRate, $argThis, index);
        twinkleIDs[index] = requestAnimationFrame(function(){textTwinkle($argThis, index);});
      }, 10000));
    }
  })
}//of for loop

/**********************************rotation*************************************/
var moonCount = 0;
var $rotateBackCircle = $(".rotateBackCircle");
var $rotate = $(".rotate");

var $timesDiv = $("#timesDiv");
var $namesDiv = $("#namesDiv");

var moonCountTimeOut;
var moonCanSwitch0 = false;
var moonCanSwitch1 = true;
var moonCanSwitch2 = false;
var nameTextStart = 3;
var nameTextEnd = 3;
var timeTextStart = 4;
var timeTextEnd = 4;

//var moonClickTimeOut;
$rotate.click(function () {
  // clearTimeout(moonClickTimeOut);
  // moonClickTimeOut = setTimeout(function(){
                      //&& canChange == 1 ){
  if(start == false){ 
      //moonCount = (moonCount + 1) % 3;
      if(moonCanSwitch0){moonCount = 0; moonCanSwitch0 = false;}
      else if(moonCanSwitch1){moonCount = 1; moonCanSwitch1 = false;}
      else if(moonCanSwitch2){moonCount = 2; moonCanSwitch2 = false;}
      else{moonCount = -1;}

      if (moonCount == 1) {
        $namesDiv.css("display", "initial");
        selfTwinkle(nameTextStart, nameTextEnd);
        setTimeout(function(){
          $rotate.toggleClass("one");
          $rotateTextTwo.removeClass("hide");
          $rotateTextOne.toggleClass("up");
    
          $timesDiv.removeClass("hideRotateLeft");
          $namesDiv.toggleClass("showRotateLeft");
          setTimeout(function(){
            if($namesDiv.css("opacity") == "1"){moonCanSwitch2 = true;}
          }, 1100);
        }, 250);
      } 
      else if (moonCount == 2) {
        $timesDiv.css("display", "initial");
        selfTwinkle(timeTextStart, timeTextEnd);
        setTimeout(function(){
          cancelTwinkle(nameTextStart, nameTextEnd);
          $rotate.removeClass("one");
          $rotate.toggleClass("two");
          $rotateTextOne.removeClass("up");
          $rotateTextOne.toggleClass("hide");
          $rotateTextTwo.toggleClass("down");
    
          $namesDiv.removeClass("showRotateLeft");
          $namesDiv.toggleClass("hideRotateLeft");
          $timesDiv.toggleClass("showRotateLeft");
          setTimeout(function(){
            if($namesDiv.css("opacity") == "0"){$namesDiv.css("display", "none"); moonCanSwitch0 = true;}
          }, 1100);
        }, 250);
      } 
      else if(moonCount == 0) {
        cancelTwinkle(timeTextStart, timeTextEnd);
        $rotate.removeClass("two");
        $rotateTextTwo.removeClass("down");
        $rotateTextOne.removeClass("hide");
        $rotateTextTwo.toggleClass("hide");
  
        $namesDiv.removeClass("hideRotateLeft");
        $timesDiv.removeClass("showRotateLeft");
        $timesDiv.toggleClass("hideRotateLeft");
        $htmlAndBody.animate({ scrollTop: $rotateBackCircle.offset().top / 3 }, "slow");
        moonCountTimeOut = setTimeout(function(){
          if($timesDiv.css("opacity") == "0"){$timesDiv.css("display", "none"); moonCanSwitch1 = true;}
        }, 1200);
      }
      
      nameInputSubmitted = 0;
      timeInputSubmitted = false;

      sunsetStart = false;
      nightStart = false;
      backtoSpotLight = true;
      clearTimeout(SLCtimer);
      SLCtimer = setTimeout(function() {
        mouseState = 1;
        updateR();
        cancelSLCid();
        LR1.ID = requestAnimationFrame(function(){spotlightColor(LR1, 0, "--LR1");});
        LG1.ID = requestAnimationFrame(function(){spotlightColor(LG1, 0, "--LG1");});
        LB1.ID = requestAnimationFrame(function(){spotlightColor(LB1, 0, "--LB1");});
        LR2.ID = requestAnimationFrame(function(){spotlightColor(LR2, 0, "--LR2");});
        LG2.ID = requestAnimationFrame(function(){spotlightColor(LG2, 0, "--LG2");});
        LB2.ID = requestAnimationFrame(function(){spotlightColor(LB2, 0, "--LB2");});
        LA037.ID = requestAnimationFrame(function(){spotlightAlpha(LA037, 0.37, "--LA0-37");});
      }, 500);
    }
   //}, 100);
});

$rotate.mousedown(function(){
  $rotate.css("cursor", "grabbing");
});
$rotate.mouseup(function(){
  $rotate.css("cursor", "grab");
})

$rotateBackCircle.mouseover(function(){
  $rotateBackCircle.css("box-shadow", "0px 0px 10px #232323, 0px 0px 10px #3f3d52, 0px 0px 10px #3f3d52, 0px 0px 10px #232323")
  $rotate.css("box-shadow", "0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb")
  $rotateTextOne.css("color", "#191919");
  $rotateTextTwo.css("color", "#191919");
  document.getElementsByClassName("SelectionDiv")[0].style.setProperty("--blurPx", "1px");
});
$rotateBackCircle.mouseleave(function(){
  $rotateBackCircle.css("box-shadow", "8px -8px 10px #232323, -8px 8px 10px #3f3d52, 8px 8px 10px #3f3d52, -8px -8px 10px #232323")
  $rotate.css("box-shadow", "8px 8px 10px #ebebeb, -8px -8px 10px #ebebeb, 8px -8px 10px #ebebeb, -8px 8px 10px #ebebeb")
  $rotateTextOne.css("color", "#1b1b24");
  $rotateTextOne.css("color", "#1b1b24");
  document.getElementsByClassName("SelectionDiv")[0].style.setProperty("--blurPx", "3.5px");
});

/*****************************input box line*************************************/

//detect which animation event and change check's transition delay accordingly
function whichAnimationEndEvent() {
  var t,
    el = document.createElement("fakeelement");

  var animations = {
    animation: "animationend",
    OAnimation: "oAnimationEnd",
    MozAnimation: "animationend",
    WebkitAnimation: "webkitAnimationEnd"
  };

  for (t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
}

function whichAnimationStartEvent() {
  var t,
    el = document.createElement("fakeelement");

  var animations = {
    animation: "animationstart",
    OAnimation: "oAnimationStart",
    MozAnimation: "animationstart",
    WebkitAnimation: "webkitAnimationStart"
  };

  for (t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
}

var animationEndEvent = whichAnimationEndEvent();
var animationStartEvent = whichAnimationStartEvent();

var validAnimationEnd = 0;

var borderName = document.getElementById("borderName");
var canFlash = 0;
//animation event name
addEvent(borderName, animationStartEvent, function (e) {
  canFlash = 1;
  if (e.animationName == "inputFormButton") {
    borderName.nextElementSibling.style.transitionDelay = "0s";
    validAnimationEnd = 0;
  } else if (e.animationName == "inputBackToLine") {
    borderName.nextElementSibling.style.transitionDelay = "1s";
  }
});

addEvent(borderName, animationEndEvent, function (e) {
  canFlash = 0;
  if (e.animationName == "inputFormButton") {
    validAnimationEnd = 1;
    if (bufferRevealBarCode == 1) {
      let checkName = document.getElementsByClassName("check")[0];
      if (inputFocused == 1 && nameInputSubmitted == 0) {
        checkName.style.opacity = "1";
        let border = checkName.previousElementSibling;
        border.style.opacity = "0";
      } else {
        checkName.style.opacity = "0";
        let border = checkName.previousElementSibling;
        border.style.opacity = "1";
      }
    }
  }
});

var validity = false;
var JQinput = $("#inp");
var JQborder = $(".border");
JQinput.on("input", function () {
  if (validity != this.checkValidity()) {
    validity = this.checkValidity();
    if (canFlash == 1) {
      JQborder.fadeOut(250).fadeIn(260);
    }
  }
});

//check if focus and blur if focused
var inputFocused = 0;
var nameInputSubmitted = 0;

var $allNotNameInput = $("* :not(#nameInput):not(.inp):not(#inp):not(.border):not(.check):not(body)");
// var JQbodyNswitch = $("body > *:not(.switchDiv)");
// var JQswitchNinp = $(".switchDiv > *:not(#nameInput)");
var $inp = $(".inp");
function inputFocusIn() {
  inputFocused = 1;
  nameInputSubmitted = 0;
  $allNotNameInput.addClass("inputFocused");

  $inp.css("filter", "blur(1px)");
  $inp.css("-ms-filter", "blur(1px)");
  $inp.css("-ms-filter", "blur(1px)");
  $inp.css("-web-kit-filter", "blur(1px)");
}
function inputFocusOut() {
  inputFocused = 0;
  $allNotNameInput.removeClass("inputFocused");

  $inp.css("filter", "blur(.5px)");
  $inp.css("-ms-filter", "blur(.5px)");
  $inp.css("-ms-filter", "blur(.5px)");
  $inp.css("-web-kit-filter", "blur(.5px)");
}

var JSinput = document.getElementById("inp");
JSinput.addEventListener("focusin", inputFocusIn);
JSinput.addEventListener("focusout", inputFocusOut);

//check hover and click
var JQcheck = $(".check");
var bufferRevealBarCode = 0;
JQcheck.mouseover(function () {
  if (validAnimationEnd == 1) {
    bufferRevealBarCode = 0;
    if (inputFocused == 1 && nameInputSubmitted == 0) {
      this.style.opacity = "1";
      let border = this.previousElementSibling;
      border.style.opacity = "0";
    } else {
      this.style.opacity = "0";
      let border = this.previousElementSibling;
      border.style.opacity = "1";
    }
  } else {
    bufferRevealBarCode = 1;
  }
});

JQcheck.mouseleave(function () {
  this.style.opacity = "0";
  let border = this.previousElementSibling;
  border.style.opacity = "1";
  bufferRevealBarCode = 0;
});

addEvent(JSinput, "invalid", function () {
  JQcheck.css("opacity", "0");
  let border = this.nextElementSibling;
  border.style.opacity = "1";
  //bufferRevealBarCode = 0;
});

var nameData = "";
JQcheck.mousedown(function () {
                                                    //&& canChange == 1) {
  if (inputFocused == 1 && JSinput.checkValidity()){ 
    let input = this.previousElementSibling.previousElementSibling;
    this.style.opacity = "0";
    let border = this.previousElementSibling;
    border.style.opacity = "1";

    validity = false;
    nameData = input.value; //get val
    input.value = "";
    nameInputSubmitted = 1;
    input.blur();

    //change spotlight state
    sunsetStart = true;
    nightStart = false;
    backtoSpotLight = false;
    clearTimeout(SLCtimer);
    SLCtimer = setTimeout(function() {
      mouseState = 0;
      updateR();
      cancelSLCid();
      LR1.ID = requestAnimationFrame(function(){sunsetColor(LR1, sunsetR1, "--LR1", 9500);});
      LG1.ID = requestAnimationFrame(function(){sunsetColor(LG1, sunsetG1, "--LG1");});
      LB1.ID = requestAnimationFrame(function(){sunsetColor(LB1, sunsetB1, "--LB1", 7500);});
      LR2.ID = requestAnimationFrame(function(){sunsetColor(LR2, sunsetR2, "--LR2", 9000);});
      LG2.ID = requestAnimationFrame(function(){sunsetColor(LG2, sunsetG2, "--LG2");});
      LB2.ID = requestAnimationFrame(function(){sunsetColor(LB2, sunsetB2, "--LB2", 7500);});
      LA037.ID = requestAnimationFrame(function(){sunsetAlpha(LA037, sunsetA037, "--LA0-37");});
    }, 500);
  }
});

/************ ***********time input******************************/

var frameRate = 60;

var $TIcircle = $("#circle");
var $TIslider = $("#slider");
var $TIcontainer = $("#TIcontainer");
var timeContainer = document.getElementById("timeContainer");
var $yearMonthButton = $("#yearMonthButton");
var IDsliderRotate,
    IDcircleRotate;
//slider vars    
const sliderW2 = $TIslider.width() / 2;
const sliderH2 = $TIslider.height() / 2;
const sliderRadius = 30;
var elPos = { x: $("#TIcontainer").offset().left, y: $("#TIcontainer").offset().top };
var sliderPos = {x: $TIslider.offset().left, y:$TIslider.offset().top};
var TIsliderX = 0,
    TIsliderY = 0;
var sliderMdown = false;
//circle vars
const circleW2 = $TIcircle.width() / 2;
const circleH2 = $TIcircle.height() / 2;
const circleRdius = 50;
var circlePos = {x: $TIcircle.offset().left, y: $TIcircle.offset().top};
var TIcircleX = 0.
    TIcircleY = 0;
var circleMdown = false;

var yearSubmitted = "";
var monthSubmitted = "";

//time input funcs
var curYear = new Date().getFullYear();
var yearVal = curYear;
var curMonth = new Date().getMonth() + 1;
var monthVal = curMonth;
var lastMonthVal = curMonth;
var lap = 0;
var direction = 0;
var changeVal = 1;
var monthPadding = monthVal >= 10 ? "" : "0";
var degIncrement = 30;

function rotateSlider(deg){
  if(sliderMdown){
    let curDeg = deg;
    $({d: curDeg}).animate({d: curDeg + degIncrement},{
      duration: 600,
      easing: "easeInOutBack",
      step: function(now){
        sliderDeg = now % 360;
        TIsliderX = sliderRadius * Math.sin((sliderDeg * Math.PI) / 180);
        TIsliderY = sliderRadius * -Math.cos((sliderDeg * Math.PI) / 180);
        //console.log((TIsliderX + sliderRadius - sliderW2) + " ; " + (TIsliderY + sliderRadius - sliderH2));
        $TIslider.css("left", TIsliderX + sliderRadius - sliderW2); 
        $TIslider.css("top", TIsliderY + sliderRadius - sliderH2);
        $TIslider.css("transform", "rotate(" + sliderDeg + "deg");
        calculateTime(sliderDeg);
      },
      complete: function(){
        cancelAnimationFrame(IDsliderRotate);
        IDsliderRotate = requestAnimationFrame(function(){rotateSlider(sliderDeg);});
      }
    });
  }
}
function rotateCircle(deg){
  if(circleMdown){
    let curDeg = deg;
    $({d: curDeg}).animate({d: curDeg - degIncrement},{
      duration: 600,
      easing: "easeInOutBack",
      step: function(now){
        circleDeg = (360 + now) % 360;
        TIcircleX = circleRdius * Math.sin((circleDeg * Math.PI) / 180);
        TIcircleY = circleRdius * -Math.cos((circleDeg * Math.PI) / 180);
        //console.log((TIcircleX + circleRdius - circleW2) + " ; " + (TIcircleY + circleRdius - circleH2));
        $TIcircle.css("left", TIcircleX + circleRdius - circleW2); 
        $TIcircle.css("top", TIcircleY + circleRdius - circleH2);
        $TIcircle.css("transform", "rotate(" + circleDeg + "deg");
        calculateTime(circleDeg);
      },
      complete: function(){
        cancelAnimationFrame(IDcircleRotate);
        IDcircleRotate = requestAnimationFrame(function(){rotateCircle(circleDeg);});
      }
    });
  }
}

$document.ready(function(){$yearMonthButton.text(yearVal + " . " + monthPadding + monthVal);})
function calculateTime(deg){
  deg = Math.round(deg);
  monthVal = (curMonth + Math.ceil(deg / 30)) % 12 + 1;
  if(sliderMdown && circleMdown == false){
    if(monthVal == 1 && lastMonthVal == 12){
      yearVal += changeVal;
      lap += 1
      //if(direction == -1){ lap = 0; changeVal = 1; degIncrement = 30;}
      if(degIncrement <= 210){
        if(lap == 3) { degIncrement += 30;}
        if(lap == 6) { degIncrement += 30;}
        if(lap == 9) { degIncrement += 30;}
      }
      if(lap == 9){  changeVal += 1; lap = 0; }
      //direction = 1;
    }
  }
  else if(sliderMdown == false && circleMdown){
    if(monthVal == 12 && lastMonthVal == 1){
      yearVal -= changeVal; 
      lap += 1;
      //if(direction == 1){ lap = 0; changeVal = 1; degIncrement = 30;}
      if(degIncrement <= 210){
        if(lap == 3) { degIncrement += 30;}
        if(lap == 6) { degIncrement += 30;}
        if(lap == 9) { degIncrement += 30;}
      }
      if(lap == 9){  changeVal += 1; lap = 0; }
      //direction = -1;
    }
  }
  lastMonthVal = monthVal;
  
  if(monthVal < 10){monthPadding = "0";}
  else{monthPadding = "";}
  $yearMonthButton.text(yearVal + " . " + monthPadding + monthVal);
}

//events
//mouse up window
var TIcircle = document.getElementById("circle"),
    TIslider = document.getElementById("slider");
var TIMdown = false;

$window.mouseup(function () {
  if(moonCount == 2){
    clearTimeout(sliderTimeOut);
    clearTimeout(circleTimeOut);
    sliderMdown = false;
    circleMdown = false;
    cancelAnimationFrame(IDsliderRotate);
    cancelAnimationFrame(IDcircleRotate);

    lap = 0;
    changeVal = 1;
    degIncrement = 30;
    TIMdown = false;
    TIcircle.style.setProperty("--circleBlur", "4.5px");
    TIslider.style.setProperty("--sliderBlur", "4.5px");
    timeContainer.style.setProperty("--timeContainerBlur", "3px");

    $(document.body).css("cursor", "pointer");
  }
});
//slider mouse down

let sliderMDPos = { x: sliderPos.x - elPos.x, y: sliderPos.y - elPos.y };
let sliderAtan = Math.atan2(sliderMDPos.x - sliderRadius, sliderMDPos.y - sliderRadius);
var sliderDeg = -sliderAtan / (Math.PI / 180) + 180;
var sliderTimeOut;
$TIslider.mousedown(function () {
  clearTimeout(sliderTimeOut);
  sliderTimeOut = setTimeout(function(){
    TIMdown = true;
    sliderMdown = true;
    timeInputSubmitted = false;
    TIslider.style.setProperty("--sliderBlur", "1.25px");
    timeContainer.style.setProperty("--timeContainerBlur", "1px");
    IDsliderRotate = requestAnimationFrame(function(){rotateSlider(sliderDeg);});

    $(document.body).css("cursor", "grabbing");
  }, 400);
});
//circle mouse down
let circleMDPos = { x: circlePos.x - elPos.x, y: circlePos.y - elPos.y };
let circleAtan = Math.atan2(circleMDPos.x - circleRdius, circleMDPos.y - circleRdius);
var circleDeg = -circleAtan / (Math.PI / 180) + 180;
var circleTimeOut;
$TIcircle.mousedown(function () {
  clearTimeout(circleTimeOut);
  circleTimeOut = setTimeout(function(){
    circleMdown = true;
    TIMdown = true;
    timeInputSubmitted = false;
    TIcircle.style.setProperty("--circleBlur", "1.25px");
    timeContainer.style.setProperty("--timeContainerBlur", "1px");
    IDcircleRotate = requestAnimationFrame(function(){rotateCircle(circleDeg);});

    $(document.body).css("cursor", "grabbing");
  }, 400);
});


$TIcircle.mouseover(function(){
  if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "1px");}
})
$TIcircle.mouseleave(function(){
  if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "3px");}
})
$TIslider.mouseover(function(){
  if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "1px");}
})
$TIslider.mouseleave(function(){
  if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "3px");}
})

var timeContainerTimeOut;
var timeButtonMouseOverFunc = 0;
addEvent(timeContainer, "mouseover", function(){
  if(!TIMdown){
    clearTimeout(timeContainerTimeOut);
    timeContainerTimeOut = setTimeout(function(){
      if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "1px");}

      if(timeButtonMouseOverFunc == 0){
        timeContainer.style.setProperty("padding-left", "60px");
        timeContainer.style.setProperty("padding-right", "60px");
        let yearStr = yearVal.toString();
        $yearMonthButton.text(yearStr.charAt(2) + yearStr.charAt(3) + "." + monthVal);
      }
      else{
        $yearMonthButton.css("color", "#c4c2cc");
      }
    }, 100);
  }
});
addEvent(timeContainer, "mouseleave", function(){
  if(!TIMdown){
    clearTimeout(timeContainerTimeOut);
    timeContainerTimeOut = setTimeout(function(){
      if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "3px");}
      timeContainer.style.setProperty("padding-left", "0px");
      timeContainer.style.setProperty("padding-right", "0px");
      $yearMonthButton.css("color", "#2a2835");
      $yearMonthButton.text(yearVal + " . " + monthPadding + monthVal);
    }, 100);
  }
});

var timeInputSubmitted = false;

$yearMonthButton.click(function(){
  yearSubmitted = yearVal;
  monthSubmitted = monthVal;
  timeInputSubmitted = true;
  console.log(yearSubmitted + " . " + monthSubmitted);

  //change spotlight state
  sunsetStart = false;
  backtoSpotLight = false;
  nightStart = true;
  clearTimeout(SLCtimer);
  SLCtimer = setTimeout(function() {
    mouseState = 2;
    updateR();
    cancelSLCid();
    LR1.ID = requestAnimationFrame(function(){nightColor(LR1, nightR1, "--LR1");});
    LG1.ID = requestAnimationFrame(function(){nightColor(LG1, nightG1, "--LG1");});
    LB1.ID = requestAnimationFrame(function(){nightColor(LB1, nightB1, "--LB1", 8500);});
    LR2.ID = requestAnimationFrame(function(){nightColor(LR2, nightR2, "--LR2");});
    LG2.ID = requestAnimationFrame(function(){nightColor(LG2, nightG2, "--LG2", 7900);});
    LB2.ID = requestAnimationFrame(function(){nightColor(LB2, nightB2, "--LB2", 9000);});
    LA037.ID = requestAnimationFrame(function(){nightAlpha(LA037, nightA037, "--LA0-37");});
  }, 500);
});
$yearMonthButton.mousedown(function(){
  $yearMonthButton.css("cursor", "grabbing");
});
$yearMonthButton.mouseup(function(){
  $yearMonthButton.css("cursor", "grab");
});

/*******************showSign*************************************/