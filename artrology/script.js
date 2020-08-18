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
var canChangeAlpha = 0;
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
function followCursor() {
  IDfollowCursor = requestAnimationFrame(followCursor);
  
  if(Math.abs(cursorLerpY - 0.04) >= 0.002){cursorLerpY = lerp(cursorLerpY, 0.05, 0.005);}
  else{cursorLerpY = 0.04;}
  if(start == false){
    if(Math.abs(cursorLerpX - 0.06) >= 0.002){cursorLerpX = lerp(cursorLerpX, 0.06, 0.01);}
    else{cursorLerpY = 0.06;}
    x = lerp(x, mouseX, cursorLerpX);
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
  } else if (mouseState == 1 && eclipseR <= 0 && inputSubmitted == 1) {
    if(inputSubmitted == 1){
      randNum = Math.random() * (6 - 2) + 2;
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
  if (spotLightRadius < 30) {
    canChange = 0;
    spotLightRadius += 0.125;
    if (spotLightRadius > 30) {
      spotLightRadius = 30;
    }
  } 
  else if(spotLightRadius > 30){
    canChange = 0;
    spotLightRadius -= 0.125;
    if (spotLightRadius < 30) {
      spotLightRadius = 30;
    }
  }
  else {
    canChange = 1;
    //mouseStateUpdated = 0;
  }
  
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function SLR2() {
  IDSLR = requestAnimationFrame(SLR2);
  if (spotLightRadius < 42) {
    canChange = 0;
    spotLightRadius += 0.125;
    if (spotLightRadius > 42) {
      spotLightRadius = 42;
    }
  } 
  else {
    canChange = 1;
    //mouseStateUpdated = 0;
  }
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function SLR3() {
  IDSLR = requestAnimationFrame(SLR3);
  if (spotLightRadius > 22) {
    canChange = 0;
    spotLightRadius -= 0.125;
  } else {
    canChange = 1;
    //mouseStateUpdated = 0;
  }
  if (spotLightRadius < 22) {
    spotLightRadius = 22;
  }
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

function incEclipseR() {
  IDECR = requestAnimationFrame(incEclipseR);
  if (eclipseR < 23) {
    canChangeEclipse = 0;
    eclipseR += 0.04;
  } else {
    canChangeEclipse = 1;
  }
  if (eclipseR > 23) {
    eclipseR = 23;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function incEclipseR2() {
  IDECR = requestAnimationFrame(incEclipseR2);
  if (eclipseR < 41.5) {
    canChangeEclipse = 0;
    eclipseR += 0.06;
  } else {
    canChangeEclipse = 1;
  }
  if (eclipseR > 41.5) {
    eclipseR = 41.5;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function decEclipseR() {
  IDECR = requestAnimationFrame(decEclipseR);
  if (eclipseR > 0) {
    canChangeEclipse = 0;
    eclipseR -= 0.5;
  } else {
    canChangeEclipse = 1;
  }
  if (eclipseR < 0) {
    eclipseR = 0;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

function eclipseFadeout() {
  IDECA = requestAnimationFrame(eclipseFadeout);
  if (eclipseA1 > 0.1 || eclipseA2 > 0.06) {
    canChangeAlpha = 0;
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
  console.log(mouseState);
  if (canChange == 1) {
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
  }
}


$htmlAndBody.animate({ scrollTop: 0 }, "slow");
/*****************************filter setting*************************** */
var setting = false;
var $settingClass = $(".setting");
var $settingText = $(".settingText");
var $smallerST = $("#smallerST");
var $filterOnArea = $("#sbhOn");
var $filterOffArea = $("#sbhOff");
var $settingButton = $(".settingButton");
var $filterOn = $("#filterOn");
var $filterOff = $("#filterOff");
var $filterOnText = $("#filterOnText");
var $filterOffText = $("#filterOffText");

var settingDOM = document.getElementsByClassName("setting")[0];
var settingFontSize = 59;
var settingFontOpacity = 0.6;
var buttonFontSize = 55;
var settingBlur = 0.9;
//adjust font on window size
function adjustSettingFont(){
  let modifiedBlur;

  if(window.innerHeight < 1000){settingFontSize = Math.round(window.innerWidth * 0.0205);}
  else{settingFontSize = Math.round(window.innerWidth * 0.022);}
  settingDOM.style.setProperty("--settingFontSize", settingFontSize + "px");

  if(window.innerWidth < 1960 && window.innerWidth > 1700){
    settingFontOpacity = 0.6 + ((1960 - window.innerWidth)/200) * 0.1;
    settingFontOpacity.toFixed(2);
    settingBlur = 0.9;
  }
  else if(window.innerWidth < 1700){
    settingFontOpacity = 0.6 + ((1960 - window.innerWidth)/200) * 0.1;
    settingFontOpacity.toFixed(2);
    settingBlur = 1 - ((1700 - window.innerWidth)/200) * 0.25;
    settingBlur.toFixed(2);
  }
  else{
    settingFontOpacity = 0.6;
    settingBlur = 0.9;
  }
  if(settingFontOpacity > 1){settingFontOpacity = 1;}
  if(settingBlur < 0){settingBlur = 0;}
  modifiedBlur = settingBlur;

  if(window.innerHeight < 600){
    buttonFontSize = Math.round(window.innerHeight * 0.09);
    settingBlur = modifiedBlur - ((600 - window.innerHeight)/50) * 0.5;
    settingBlur.toFixed(2);
    $smallerST.css("line-height", "3");
  }
  else{buttonFontSize = 55;$smallerST.css("line-height", "10");}
  
  $settingText.css("opacity", settingFontOpacity);
  $settingButton.css("font-size", buttonFontSize + "px");
  $settingClass.css("filter", "blur(" + settingBlur + "px)");
}

if(setting == false){
  $document.ready(adjustSettingFont);
  $window.resize(adjustSettingFont);

  //hover button
  $filterOnArea.mouseover(function(){
    $filterOnText.html("lv<br>it<br>on");
    $filterOnText.css("margin-left", "75px");
  })
  $filterOnArea.mouseleave(function(){
    $filterOnText.html('leave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');
    $filterOnText.css("margin-left", "0px");
  })
  $filterOffArea.mouseover(function(){
    $filterOffText.html("tk<br>it<br>of");
    $filterOffText.css("margin-right", "55px");
  })
  $filterOffArea.mouseleave(function(){
    $filterOffText.html('take<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');
    $filterOffText.css("margin-right", "0px");
  })

  //click button
  $filterOn.click(function(){
    $(document.body).addClass("svgFilter");
    $(document.documentElement).addClass("svgFilter");

    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    setting = true;
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $settingClass.css("opacity", "0");
    },1100);
    setTimeout(function(){$settingClass.css("display", "none");}, 2100);
  });
  $filterOff.click(function(){
    $(document.documentElement).addClass("svgFilter");

    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    setting = true;
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $settingClass.css("opacity", "0");
    },1100);
    setTimeout(function(){$settingClass.css("display", "none");}, 2100);
  });
}
/******************************spotlight*********************************/
var mouseState = 1;
//var frameRate = 75;
var canChange = 1;
var canChangeEclipse = 1;

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
      addEvent(document, "mousemove", update);
    }, 5000);
    setTimeout(function() {
      //addEvent(document, "mousedown", updateR);
      start = false;
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
$settingClass.click(function(){
  if(setting){
    IDfollowCursor = requestAnimationFrame(followCursor);
    IDstart = requestAnimationFrame(startAnim);
    IDdarkness = requestAnimationFrame(darknessStartAnim);
    $document.ready(updateR);
  }
});

/********************spotlight change******************* */
var SLCtimer;
var sunsetStart = false;
var backtoSpotLight = false;
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
    sunsetR2= 54,
    sunsetG2 = 16,
    sunsetB2 = 11,
    sunsetA037 = 0.65;

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

$settingClass.click(function(){
  if(setting){IDhblur = requestAnimationFrame(hblurAnim);}
});
function hblurAnim(){
  setTimeout(function(){
    if(hblurDir == -1){
      hopacity = 0.9;
      hblur = 1.5;
    }
    else{
      hopacity = 0.8;
      hblur = 5;
    }
    hblurDir *= -1;
    h1.style.setProperty("opacity", hopacity);
    h1.style.setProperty("--hblur", hblur+"px");
    IDhblur = requestAnimationFrame(hblurAnim);
  }, 8500);
}

/*************************body roate********************************/
var bodyRY = parseInt(getComputedStyle(document.body).getPropertyValue("--bodyRotateY"),10);
var screenMax = 0.6 * window.screen.width;
var screenMin = -1*window.screen.width/2 + 0.04 * window.screen.width;
function bodyRotate(e){
  let sx = e.screenX - window.screen.width/2;
  if(sx > screenMax){sx = screenMax;}
  else if (sx < screenMin){sx = screenMin;}
  bodyRY = Math.round(scale(sx, screenMin, screenMax, -4, 8));
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

$settingClass.click(function(){
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
}

function textTwinkleBright($this, index){ 
  twinkleIDs[index] = requestAnimationFrame(function(){textTwinkleBright($this, index);});
  if($this.css("opacity") < 0.95 && twinkleDirects[index] == 1){ 
    $this.css("opacity", 0.95);
    $this.css("--glowPix1", "0.5px");
    $this.css("--glowPix2", "-0.5px");
    if(Math.abs($this.css("opacity")-0.95) <= 0.005){twinkleDirects[index] = -1;}
  }
  else if ($this.css("opacity") > 0.5 && twinkleDirects[index] == -1){
    $this.css("opacity", 0.5);
    $this.css("--glowPix1", "2px");
    $this.css("--glowPix2", "-2px");
    if(Math.abs($this.css("opacity")-0.5) <= 0.005){twinkleDirects[index] = 1;}
  }
}

let j;
for (j = 0; j < plaintexts.length; j++){
  //twinkleIntervs[j] = 0;
  //clearInterval(twinkleIntervs[j]);
  twinkleIDs[j] = undefined;
  cancelAnimationFrame(twinkleIDs[j]);
  twinkleDirects[j] = 1;
}


function selfTwinkle(){
  let k;
  for (k = 0; k < plaintexts.length; k++){
    let $argThis = $(plaintexts[k]);
    let index = parseInt($argThis.attr("id"), 10);
    //cancelAnimationFrame(twinkleIDs[index]);
    twinkleDirects[index] = -1;
    twinkleIDs[index] = requestAnimationFrame(function(){textTwinkle($argThis, index);});
  }//of for loop
}
$window.on("load", selfTwinkle);
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
var $rotateTextOne = $(".rotateTextOne");
var $rotateTextTwo = $(".rotateTextTwo");
var $timesDiv = $("#timesDiv");
var $namesDiv = $("#namesDiv");
var $root = $(":root");

$rotateBackCircle.click(function () {
  if(start == false && canChange == 1){
    moonCount = (moonCount + 1) % 3;

    if (moonCount == 1) {
      $rotate.toggleClass("one");
      $rotateTextTwo.removeClass("hide");
      $rotateTextOne.toggleClass("up");

      $timesDiv.removeClass("hideRotateLeft");
      $namesDiv.toggleClass("showRotateLeft");
      //$root.css("overflow-y", "auto");
    } else if (moonCount == 2) {
      $rotate.removeClass("one");
      $rotate.toggleClass("two");
      $rotateTextOne.removeClass("up");
      $rotateTextOne.toggleClass("hide");
      $rotateTextTwo.toggleClass("down");

      $namesDiv.removeClass("showRotateLeft");
      $namesDiv.toggleClass("hideRotateLeft");
      $timesDiv.toggleClass("showRotateLeft");
      //$root.css("overflow-y", "auto");
    } else {
      $rotate.removeClass("two");
      $rotateTextTwo.removeClass("down");
      $rotateTextOne.removeClass("hide");
      $rotateTextTwo.toggleClass("hide");

      $namesDiv.removeClass("hideRotateLeft");
      $timesDiv.removeClass("showRotateLeft");
      $timesDiv.toggleClass("hideRotateLeft");
      $htmlAndBody.animate({ scrollTop: 0 }, "slow");
      //$root.css("overflow-y", "hidden");
    }
    
    sunsetStart = false;
    backtoSpotLight = true;
    clearTimeout(SLCtimer);
    SLCtimer = setTimeout(function() {
      mouseState = 1;
      updateR();
      cancelSLCid();
      LR1.ID = requestAnimationFrame(function(){spotlightColor(LR1, 0, "--LR1", 7000);});
      LG1.ID = requestAnimationFrame(function(){spotlightColor(LG1, 0, "--LG1");});
      LB1.ID = requestAnimationFrame(function(){spotlightColor(LB1, 0, "--LB1", 9500);});
      LR2.ID = requestAnimationFrame(function(){spotlightColor(LR2, 0, "--LR2", 7000);});
      LG2.ID = requestAnimationFrame(function(){spotlightColor(LG2, 0, "--LG2");});
      LB2.ID = requestAnimationFrame(function(){spotlightColor(LB2, 0, "--LB2", 9500);});
      LA037.ID = requestAnimationFrame(function(){spotlightAlpha(LA037, 0.37, "--LA0-37");});
    }, 500);
  }
});

$rotateBackCircle.mouseover(function(){
  $rotateBackCircle.css("box-shadow", "0px 0px 10px #232323, 0px 0px 10px #3f3d52, 0px 0px 10px #3f3d52, 0px 0px 10px #232323")
  $rotate.css("box-shadow", "0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb, 0px 0px 10px #ebebeb")
  $rotateTextOne.css("color", "#191919");
  $rotateTextTwo.css("color", "#191919");
  document.getElementsByClassName("SelectionDiv")[0].style.setProperty("--blurPx", "1.25px");
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
      if (inputFocused == 1 && inputSubmitted == 0) {
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
var inputSubmitted = 0;

var $allNotNameInput = $("* :not(#nameInput):not(.inp):not(#inp):not(.border):not(.check):not(body)");
// var JQbodyNswitch = $("body > *:not(.switchDiv)");
// var JQswitchNinp = $(".switchDiv > *:not(#nameInput)");
var $inp = $(".inp");
function inputFocusIn() {
  inputFocused = 1;
  inputSubmitted = 0;
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
    if (inputFocused == 1 && inputSubmitted == 0) {
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
  if (inputFocused == 1 && JSinput.checkValidity() && canChange == 1) {
    let input = this.previousElementSibling.previousElementSibling;
    this.style.opacity = "0";
    let border = this.previousElementSibling;
    border.style.opacity = "1";

    validity = false;
    nameData = input.value; //get val
    input.value = "";
    inputSubmitted = 1;
    input.blur();

    //change spotlight state
    sunsetStart = true;
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

var $container = $("#circle");
var $slider = $("#slider");
var sliderW2 = $slider.width() / 2;
var sliderH2 = $slider.height() / 2;
const sliderRadius = 30;
var sliderDeg = 0;
var elP = $("#circle").offset();
var elPos = { x: elP.left, y: elP.top };
var sliderX = 0,
    sliderY = 0,
  lastX = 55,
  lastY = 35;
var mdown = false;
var sliderInterv = 0;
var sliderOpaInterv = 0;

var sliderOpacity = 1;
var MUsliderOpaSwitch = 0;
var MDsliderOpaSwitch = 0;
var sliderCanMove = 1;

$("#circle").mousedown(function () {
  mdown = true;
  // clearInterval(sliderInterv);
  // clearInterval(sliderOpaInterv);

  // sliderOpaInterv = setInterval(function () {
  //   MUsliderOpaSwitch = 0;
  //   if (MDsliderOpaSwitch == 0) {
  //     sliderOpacity = lerp(sliderOpacity, 0, 0.15);
  //   } else {
  //     sliderOpacity = lerp(sliderOpacity, 1, 0.15);
  //   }
  //   if (Math.abs(sliderOpacity - 0) < 0.01) {
  //     MDsliderOpaSwitch = 1;
  //   }
  //   else if (Math.abs(sliderOpacity - 1) < 0.01) {
  //     sliderCanMove = 1;
  //   }
  //   $slider.css("opacity", sliderOpacity);
  // }, 1000 / frameRate);

  // sliderInterv = setInterval(function () {
  //   if (MDsliderOpaSwitch) {
  //     sliderX = lastX + 15;
  //     sliderY = lastY + 15;
  //     $slider.css({ left: sliderX, top: sliderY });
  //   }
  // });
});

$window.mouseup(function () {
  mdown = false;
  lap = 0;
  changeVal = 1;
  // clearInterval(sliderInterv);
  // clearInterval(sliderOpaInterv);

  // sliderOpaInterv = setInterval(function () {
  //   MDsliderOpaSwitch = 0;
  //   sliderCanMove = 0;
  //   if (MUsliderOpaSwitch == 0) {
  //     sliderOpacity = lerp(sliderOpacity, 0, 0.15);
  //   } else {
  //     sliderOpacity = lerp(sliderOpacity, 1, 0.15);
  //   }
  //   if (Math.abs(sliderOpacity - 0) < 0.01) {
  //     MUsliderOpaSwitch = 1;
  //   }
  //   $slider.css("opacity", sliderOpacity);
  // }, 1000 / frameRate);

  // sliderInterv = setInterval(function () {
  //   if (MUsliderOpaSwitch) {
  //     sliderX = lastX - 25;
  //     sliderY = lastY - 15;
  //     $slider.css({ left: sliderX, top: sliderY });
  //   }
  // }, 1000 / frameRate);
});

var curYear = new Date().getFullYear();
var yearVal = curYear;
var curMonth = new Date().getMonth();
var monthVal = curMonth;
var lastMonthVal = curMonth;
var lap = 0;
var direction = 0;
var changeVal = 1;
$window.mousemove(function (e) {
  if (mdown && sliderCanMove == 1) {
    clearInterval(sliderInterv);

    var mPos = { x: e.pageX - elPos.x, y: e.pageY - elPos.y };
    var atan = Math.atan2(mPos.x - sliderRadius, mPos.y - sliderRadius);
    sliderDeg = -atan / (Math.PI / 180) + 180; // final (0-360 positive) degrees from mouse position
    sliderDeg = Math.round(sliderDeg);

    var tempX = Math.round(sliderRadius * Math.sin((sliderDeg * Math.PI) / 180)) + 25;
    var tempY = Math.round(sliderRadius * -Math.cos((sliderDeg * Math.PI) / 180)) + 15;

    sliderX = lerp(sliderX, tempX, 0.5);
    sliderY = lerp(sliderY, tempY, 0.5);
    $slider.css("left", sliderX + sliderRadius - sliderW2); 
    $slider.css("top", sliderY + sliderRadius - sliderH2);
    lastX = tempX;
    lastY = tempY;

    // AND FINALLY apply exact degrees to ball rotation
    $slider.css("transform", "rotate(" + sliderDeg + "deg");
    //
    // PRINT DEGREES
    
    monthVal = (curMonth - 5 + Math.ceil(sliderDeg / 30)) % 12 + 1;
    if(monthVal == 1 && lastMonthVal >= 4){
      yearVal += changeVal;
      lap += 1
      if(direction == -1){ lap = 0; changeVal = 1;}
      if(lap == 10){  changeVal += 1; lap = 0; }
      direction = 1;
    }
    else if(monthVal == 12 && lastMonthVal <= 8){
      yearVal -= changeVal; 
      lap += 1;
      if(direction == 1){ lap = 0; changeVal = 1;}
      if(lap == 10){  changeVal += 1; lap = 0; }
      direction = -1;
    }
    lastMonthVal = monthVal;
    
    let monthPadding = "";
    if(monthVal < 10){monthPadding = "0";}
    else{monthPadding = "";}
    $('input[name="monthnyear"]').val(yearVal + "." + monthPadding + monthVal);
    
    clearTimeout($.data(this, 'mousemoveTimer'));
    $.data(this, 'mousemoveTimer', setTimeout(function() {
      // not mousemoving
      lap = 0;
      changeVal = 1;
    }, 1000));
  }
});




/*******************showSign*************************************/