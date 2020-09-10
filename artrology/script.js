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

/****************************check tab or window out of focus******************************** */
var vis = (function(){
  var stateKey, 
      eventKey, 
      keys = {
              hidden: "visibilitychange",
              webkitHidden: "webkitvisibilitychange",
              mozHidden: "mozvisibilitychange",
              msHidden: "msvisibilitychange"
  };
  for (stateKey in keys) {
      if (stateKey in document) {
          eventKey = keys[stateKey];
          break;
      }
  }
  return function(c) {
      if (c) document.addEventListener(eventKey, c);
      return !document[stateKey];
  }
})();
// check if current tab is active or not
vis(function(){
  // if(vis()){
  // //tab focused
  //   setTimeout(function(){            
  //   //selfTwinkle(openingTextStart, openingTextEnd);
  //   },300);		                   
  // } 
  if(vis() == false) {
  // tab not focused
    lastNOWfollow = undefined;
    lastNOWslr1 = undefined;
    lastNOWslr2 = undefined;
    lastNOWslr3 = undefined;
    lastNOWincE = undefined;
    lastNOWincE2 = undefined;
    lastNOWdecE = undefined;
    lastNOWecA = undefined;

    lastNOWref = undefined;
    //cancelTwinkle(openingTextStart, openingTextEnd);
  }
});

var notIE = (document.documentMode === undefined),
    isChromium = window.chrome;
if (notIE && !isChromium) {
    // checks for Firefox and other  NON IE Chrome versions
    $window.on("focusout", function () {
      // blur
      lastNOWfollow = undefined;
      lastNOWslr1 = undefined;
      lastNOWslr2 = undefined;
      lastNOWslr3 = undefined;
      lastNOWincE = undefined;
      lastNOWincE2 = undefined;
      lastNOWdecE = undefined;
      lastNOWecA = undefined;

      lastNOWref = undefined;
    });
} 
else {
    // checks for IE and Chromium versions
    // bind blur event
    addEvent(window, "blur", function () {
      // blur
      lastNOWfollow = undefined;
      lastNOWslr1 = undefined;
      lastNOWslr2 = undefined;
      lastNOWslr3 = undefined;
      lastNOWincE = undefined;
      lastNOWincE2 = undefined;
      lastNOWdecE = undefined;
      lastNOWecA = undefined;

      lastNOWref = undefined;
    });
}

/*********************** on resize ************************ */
$(function(){
  let left = 0.15 * window.innerWidth;
  if (left > 250){left = 250;}
  // else if(left < 100){left = 100;}
  timeContainer.style.setProperty("--timeContainerLeft", left + "px");
});
$window.resize(function(){
  maxDistToLightCenter =
    window.innerWidth >= window.innerHeight
    ? Math.pow(window.innerWidth * maxToLightDistIndex, 2)
    : Math.pow(window.innerHeight * maxToLightDistIndex, 2);

  screenMax = -1*window.innerWidth/2 + 0.75 * window.innerWidth;
  screenMin = -1*window.innerWidth/2 + 0.04 * window.innerWidth;

  let t = 0.5*window.innerHeight - 210;
  t = t + scrollinstance.scroll().position.y;
  $scan.css("top", t+"px");
  $block.css("top", t+"px");

  let left = 0.15 * window.innerWidth;
  if (left > 250){left = 250;}
  // else if(left < 100){left = 100;}
  timeContainer.style.setProperty("--timeContainerLeft", left + "px");

  console.log($scrollContainer.outerHeight());
  });


/**************************************************************************** */
//spotlight funcs
var lightV;
const lightMass = 15;//15, 50
const shadeMass = 1; //5, 1
const G = 2; //0.2, 10
var velocity = new Vector(0, 0);
var acceleration = new Vector(0, 0);
//var accModifier = 1;
var shadeX = 0;
var shadeY = 0;
var shadeV = new Vector(shadeX, shadeY);
//var canChangeAlpha = 0;
//var eclipseSpeed = 0.125;

//variables for function update
var mouseX = 0.5 * window.innerWidth,
    mouseY = 1.15 * window.innerHeight;
var LdestX = 0.5*window.innerWidth,
    LdestY = 1.15*window.innerHeight;

var maxToLightDistIndex = 0.9;
var maxDistToLightCenter =
  window.innerWidth >= window.innerHeight
    ? Math.pow(window.innerWidth * maxToLightDistIndex, 2)
    : Math.pow(window.innerHeight * maxToLightDistIndex, 2);
//var alphaBias = 0.2;
var randNum = 0;


var cursorLerpX = 0.9;
var cursorLerpY = 0.2;

var finishLerpCursorLerpX = false;
var finishLerpCursorLerpY = false;

var lastNOWfollow;
function followCursor(timestamp) {
  IDfollowCursor = requestAnimationFrame(followCursor);

  if(lastNOWfollow === undefined){
    lastNOWfollow = timestamp;
  }
  NOWfollow = timestamp;
  let dt = (NOWfollow - lastNOWfollow)/1000;
  lastNOWfollow = NOWfollow;

  //draw code
  if(start == false){
    if(Math.abs(cursorLerpX - 0.2) >= 0.0005){cursorLerpX = lerp(cursorLerpX, 0.2, 1-Math.pow(0.85, dt));}
    else{cursorLerpX = 0.2;}
    if(Math.abs(cursorLerpY - 0.2) >= 0.0005){cursorLerpY = lerp(cursorLerpY, 0.2, 1-Math.pow(0.85, dt));}
    else{cursorLerpY = 0.2;}
    LdestX = lerp(LdestX, mouseX, 1-Math.pow(cursorLerpX, dt)); 
  }
  LdestY = lerp(LdestY, mouseY, 1-Math.pow(cursorLerpY, dt)); 
  document.documentElement.style.setProperty("--cursorY", LdestY + "px");
  document.documentElement.style.setProperty("--cursorX", LdestX + "px");
  

  lightV = new Vector(LdestX, LdestY); //lightV is the attracting gravity
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
    force.multiply(dt);

    //apply force
    let f = Vector.divide(force, shadeMass);
    acceleration.add(f);
    velocity.add(acceleration);
    shadeV.add(velocity);

    //change alpha and acc modifier
    let distanceToLightCenter =
      Math.pow(shadeX - LdestX, 2) + Math.pow(shadeY - LdestY, 2);

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
  } 
  else if (mouseState == 1 && eclipseR <= 0 && (nameInputSubmitted == 1 || timeInputSubmitted)) {
    if(nameInputSubmitted == 1){
      randNum = Math.random() * (2.4 - 1.4) + 1.4;
      maxToLightDistIndex = 0.9;
      maxDistToLightCenter =
        window.innerWidth >= window.innerHeight
        ? Math.pow(window.innerWidth * maxToLightDistIndex, 2)
        : Math.pow(window.innerHeight * maxToLightDistIndex, 2);
    }
    else if(timeInputSubmitted){
      randNum = Math.random() * (1.7 - 0.7) + 0.7;
      maxToLightDistIndex = 0.5;
      maxDistToLightCenter =
        window.innerWidth >= window.innerHeight
        ? Math.pow(window.innerWidth * maxToLightDistIndex, 2)
        : Math.pow(window.innerHeight * maxToLightDistIndex, 2);
    }
    let randSign = Math.random() * (0.1 + 0.1) - 0.1;
    randNum = randSign > 0 ? randNum : -1 * randNum;
    shadeV = new Vector(
      mouseX + document.body.clientWidth * randNum,
      mouseY + document.body.clientHeight * randNum
    );
  }
  document.documentElement.style.setProperty("--eclipseX", shadeX + "px");
  document.documentElement.style.setProperty("--eclipseY", shadeY + "px");
}


//var followInterv = 0;

var IDfollowCursor;
var mouseFollowing = true;
var limitedCursor = false;

var NOWfollow;
function update(e) {
  if(mouseFollowing){
    mouseX = e.clientX;
    mouseY = e.clientY;
    if(limitedCursor){
      if(mouseX < 0.45*window.innerWidth){mouseX = 0.45*window.innerWidth;}
      else if(mouseX > 0.55*window.innerWidth){mouseX = 0.55*window.innerWidth;}
      if(mouseY < 0.4*window.innerHeight){mouseY = 0.4*window.innerHeight;}
      else if(mouseY > 0.6*window.innerHeight){mouseY = 0.6*window.innerHeight;}
    }
  }
  //clearInterval(followInterv);
  //followInterv = setInterval(followCursor, 1000 / frameRate, mouseX, mouseY);
  cancelAnimationFrame(IDfollowCursor);
  IDfollowCursor = requestAnimationFrame(followCursor);
}

//var mouseStateUpdated = 0;
var NOWslr1, lastNOWslr1;
function SLR1(timestamp) {
  IDSLR = requestAnimationFrame(SLR1);

  if(lastNOWslr1 === undefined){
    lastNOWslr1 = timestamp;
  }
  NOWslr1 = timestamp;
  let dt = (NOWslr1 - lastNOWslr1)/1000;
  lastNOWslr1 = NOWslr1;
  lastNOWslr2 = timestamp;
  lastNOWslr3 = timestamp;

  if (spotLightRadius < 34) {
    //canChange = 0;
    spotLightRadius += 3.788 * dt; //0.125
    if (spotLightRadius > 34) {
      spotLightRadius = 34;
    }
  } 
  else if(spotLightRadius > 34){
    //canChange = 0;
    spotLightRadius -= 3.788 * dt;
    if (spotLightRadius < 34) {
      spotLightRadius = 34;
    }
  }
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

var NOWslr2, lastNOWslr2;
function SLR2(timestamp) {
  IDSLR = requestAnimationFrame(SLR2);

  if(lastNOWslr2 === undefined){
    lastNOWslr2 = timestamp;
  }
  NOWslr2 = timestamp;
  let dt = (NOWslr2 - lastNOWslr2)/1000;
  lastNOWslr2 = NOWslr2;
  lastNOWslr1 = timestamp;
  lastNOWslr3 = timestamp;

  if (spotLightRadius < 47) {
    //canChange = 0;
    spotLightRadius += 3.788 * dt;
    if (spotLightRadius > 47) {
      spotLightRadius = 47;
    }
  }
  else if(spotLightRadius > 47){
    //canChange = 0;
    spotLightRadius -= 3.788 * dt;
    if (spotLightRadius < 47) {
      spotLightRadius = 47;
    }
  } 
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

var NOWslr3, lastNOWslr3;
function SLR3(timestamp) {
  IDSLR = requestAnimationFrame(SLR3);

  if(lastNOWslr3 === undefined){
    lastNOWslr3 = timestamp;
  }
  NOWslr3 = timestamp;
  let dt = (NOWslr3 - lastNOWslr3)/1000;
  lastNOWslr3 = NOWslr3;
  lastNOWslr2 = timestamp;
  lastNOWslr1 = timestamp;

  if (spotLightRadius > 25) {
    //canChange = 0;
    spotLightRadius -= 3.788 * dt;
    if (spotLightRadius < 25) {
      spotLightRadius = 25;
    }
  } 
  else if(spotLightRadius < 25){
    //canChange = 0;
    spotLightRadius += 3.788 * dt;
    if (spotLightRadius > 25) {
      spotLightRadius = 25;
    }
  }
  // else {
  //   canChange = 1;
  //   //mouseStateUpdated = 0;
  // }
  
  document.documentElement.style.setProperty("--radius", spotLightRadius + "vmax");
}

var NOWincE, lastNOWincE;
function incEclipseR(timestamp) {
  IDECR = requestAnimationFrame(incEclipseR);

  if(lastNOWincE === undefined){
    lastNOWincE = timestamp;
  }
  NOWincE = timestamp;
  let dt = (NOWincE - lastNOWincE)/1000;
  lastNOWincE = NOWincE;
  lastNOWincE2 = timestamp;
  lastNOWdecE = timestamp;
  lastNOWecA = timestamp;

  if (eclipseR < 26) {
    //canChangeEclipse = 0;
    eclipseR += 2.4 * dt; //0.08

    if (eclipseR > 26) {
      eclipseR = 26;
    }
  }
  else if(eclipseR > 26){
    eclipseR -= 2.4 * dt;

    if (eclipseR < 26) {
      eclipseR = 26;
    }
  }
  // else {
  //   canChangeEclipse = 1;
  // }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

var NOWincE2, lastNOWincE2;
function incEclipseR2(timestamp) {
  IDECR = requestAnimationFrame(incEclipseR2);

  if(lastNOWincE2 === undefined){
    lastNOWincE2 = timestamp;
  }
  NOWincE2 = timestamp;
  let dt = (NOWincE2 - lastNOWincE2)/1000;
  lastNOWincE2 = NOWincE2;
  lastNOWincE = timestamp;
  lastNOWdecE = timestamp;
  lastNOWecA = timestamp;

  if (eclipseR < 49) {
    //canChangeEclipse = 0;
    eclipseR += 1.82 * dt; //0.06
  } 
  // else {
  //   canChangeEclipse = 1;
  // }
  if (eclipseR > 49) {
    eclipseR = 49;
  }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

var NOWdecE, lastNOWdecE;
function decEclipseR(timestamp) {
  IDECR = requestAnimationFrame(decEclipseR);
  
  if(lastNOWdecE === undefined){
    lastNOWdecE = timestamp;
  }
  NOWdecE = timestamp;
  let dt = (NOWdecE - lastNOWdecE)/1000;
  lastNOWdecE = NOWdecE;
  lastNOWincE = timestamp;
  lastNOWincE2 = timestamp;

  if (eclipseR > 0) {
    //canChangeEclipse = 0;
    eclipseR -= 7.5 * dt; //0.25
    if (eclipseR < 0) {
      eclipseR = 0;
    }
  } 
  // else {
  //   canChangeEclipse = 1;
  // }
  document.documentElement.style.setProperty("--eclipseR", eclipseR + "vmax");
}

var NOWecA, lastNOWecA;
function eclipseFadeout(timestamp) {
  IDECA = requestAnimationFrame(eclipseFadeout);

  if(lastNOWecA === undefined){
    lastNOWecA = timestamp;
  }
  NOWecA = timestamp;
  let dt = (NOWecA - lastNOWecA)/1000;
  lastNOWecA = NOWecA;

  if (eclipseA1 > 0.1 || eclipseA2 > 0.06) {
    //canChangeAlpha = 0;
    if (eclipseA1 > 0.02) {
      eclipseA1 -= 0.85 * dt; //0.03125
    } else if (eclipseA1 < 0.02) {
      eclipseA1 = 0.02;
    }
    if (eclipseA2 > 0.01) {
      eclipseA2 -= 0.85 * dt;
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

/*******************************setting scroll***********************************/
var scrollinstance;

$(function() {
  scrollinstance = $("#scrollContainer").overlayScrollbars({
    className : "os-theme-round-light body-scroll-bar",
    paddingAbsolute : true,
    overflowBehavior : {
      x : "s",
      y : "s"
    },
    scrollbars : {
      visibility: "h",
      autoHide: "s",
      autoHideDelay: 800
    },
    callbacks : {
      onScroll: adjustBodyRotateOrigin
    }
  }).overlayScrollbars();
});

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

    if(window.innerHeight < 1000){settingFontSize = Math.round(window.innerWidth * 0.02);}
    else{settingFontSize = Math.round(window.innerWidth * 0.0215);}
    if(settingFontSize < 20){settingFontSize = 20;}
    settingDOM.style.setProperty("--settingFontSize", settingFontSize + "px");
    let smaller = Math.round(settingFontSize*0.8)
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

    if(window.innerWidth < 800 && window.innerWidth >= 700){
      buttonFontSize = 50; 
      modifiedButtonFontSize = buttonFontSize; 
      //scrollinstance.options("overflowBehavior.x", "h");
    }
    else if(window.innerWidth < 700 && window.innerWidth >= 540){
      buttonFontSize = 45; 
      modifiedButtonFontSize = buttonFontSize; 
      //scrollinstance.options("overflowBehavior.x", "s");
    }
    else if(window.innerWidth < 540 && window.innerWidth >= 470){
      buttonFontSize = 40; 
      modifiedButtonFontSize = buttonFontSize; 
      //scrollinstance.options("overflowBehavior.x", "s");
    }
    else if(window.innerWidth < 470 && window.innerWidth >= 400){
      buttonFontSize = 34; 
      modifiedButtonFontSize = buttonFontSize; 
      //scrollinstance.options("overflowBehavior.x", "s");
    }
    else if(window.innerWidth < 400){
      buttonFontSize = 28; 
      modifiedButtonFontSize = buttonFontSize; 
      //scrollinstance.options("overflowBehavior.x", "s");
    }
    else{
      //scrollinstance.options("overflowBehavior.x", "h");
    }

    if(window.innerHeight < 600){
      if(window.innerWidth < 700){buttonFontSize = Math.round(window.innerHeight * 0.1);}
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
var settingButtonCanClick = false;
$settingButton.one("mouseover", settingButtonUnfold);

function settingButtonUnfold(){
  requestAnimationFrame(function(){
    setTimeout(function(){
      if(setting == false){
        $filterOnText.html('lev<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('leve<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 150);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('leave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 300);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('l eave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 450);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('l eav e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 600);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('l e av e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 750);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('l e a v e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 900);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('l e a ve<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 1000);      
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('le a ve<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 1100);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('le ave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 1200);
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOnText.html('leave<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 1300);      
        });

        $filterOffText.html('tk<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('tak<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 150);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('take<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 300);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('t ake<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 450);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('ta ke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 600);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('ta k e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 750);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('t a k e<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 900);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('t a ke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 1000);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('ta ke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 1100);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('t a ke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 1200);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('t ake<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 1300);    
        });
        requestAnimationFrame(function(){
          setTimeout(function(){
            $filterOffText.html('take<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');
            settingButtonCanClick = true;
            $filterOn.css("cursor", "grab");
            $filterOff.css("cursor", "grab");
          }, 1400);    
        });
      } 
    }, 250);
  }); 
}

function settingButtonFold(){
  $filterOnText.html('leav<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');
  requestAnimationFrame(function(){
    setTimeout(function(){
      $filterOnText.html('lev<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 150);
  });
  requestAnimationFrame(function(){
    setTimeout(function(){
      $filterOnText.html('lv<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">n</span>');}, 300);
  });
  $filterOffText.html('tak<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');
  requestAnimationFrame(function(){
    setTimeout(function(){
      $filterOffText.html('tke<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span>f<span class="letterToR">f</span>');}, 150);    
  });
  requestAnimationFrame(function(){
    setTimeout(function(){
      $filterOffText.html('tk<br><span class="letterToL">i</span><span class="letterToR">t</span><br><span class="letterToL">o</span><span class="letterToR">f</span>');
    }, 300);    
  });
}

var cloudOn = false;
//click button
$filterOn.on("click", function(){
  if(setting == false && settingButtonCanClick){
    setting = true;
    cloudOn = true;
    $(".filtered").css("display", "initial");
    $(".filtered").addClass("svgFilter");
    // setTimeout(function(){$(document.body).addClass("canScroll");}, 10000);
    //$(document.documentElement).addClass("svgFilter");

    settingButtonFold();
    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $scrollContainer.css("background", "var(--reflectionBG)");
      $settingClass.css("opacity", "0");
      $bodyRotate.css("display", "initial");
    },1100);
    setTimeout(function(){
      $settingClass.css("display", "none");
      $settingClass.children().prop("disabled", true);
    }, 2500);
    
    $filterOn.off();
    $filterOff.off();
  }
});
$filterOn.mousedown(function(){
  if(settingButtonCanClick){$filterOn.css("cursor", "grabbing");}
});
$filterOn.mouseover(function(){
  if(settingButtonCanClick){$filterOn.css("cursor", "grab");}
});


$filterOff.on("click", function(){
  if(setting == false && settingButtonCanClick){
    setting = true;
    cloudOn = true;
    $(".filtered").css("display", "initial");
    $(".filtered").addClass("offFilter");
    // setTimeout(function(){$(document.body).addClass("canScroll");}, 10000);

    settingButtonFold();
    $settingText.css("opacity", "0");
    $settingButton.css("filter", "blur(6px)");
    $settingButton.css("opacity", "0");
    
    setTimeout(function(){
      document.documentElement.pseudoStyle('before', 'z-index','20');
      $scrollContainer.css("background", "var(--reflectionBG)");
      $settingClass.css("opacity", "0");
      $bodyRotate.css("display", "initial");
      $(".plaintext").css("font-weight", "600");
    },1100);
    setTimeout(function(){
      $settingClass.css("display", "none");
      $settingClass.children().prop("disabled", true);
    }, 2500);

    /*setting for no filter at all*/
    twinkleBrighterOpa = 1;
    twinkleOpa = 0.38;
    defaultTwinklwOpa1 = 0.35;
    defaultTwinklwOpa2 = 0.4;
    defaultTwinklwOpa3 = 0.5;
    // $redLine.css("background", "var(--redLineGradient2)");
    // $redLightArea.css("background", "var(--redAreaGradient2)");

    $filterOn.off();
    $filterOff.off();
  }
});
$filterOff.mousedown(function(){
  if(settingButtonCanClick){$filterOff.css("cursor", "grabbing");} 
});
$filterOff.mouseover(function(){
  if(settingButtonCanClick){$filterOff.css("cursor", "grab");}
});

/******************************* scrollBar *****************************/
$settingButton.on("click", function(){
  if(setting){
    scrollinstance.scroll({x:0, y:0}, 1000, "easeInOutSine");
    scrollinstance.options("className", "os-theme-round-dark body-scroll-bar");
    scrollinstance.options("overflowBehavior.x", "h");
    scrollinstance.options("overflowBehavior.y", "h");
    scrollinstance.options("scrollbars.visibility", "a");
  }
});

//adjust body rotate transform origin when scrolling
function adjustBodyRotateOrigin(){
  let originY = 100 * (0.5 * window.innerHeight + scrollinstance.scroll().position.y) / $bodyRotate.outerHeight();
  $bodyRotate.css("transform-origin", "50% " + originY + "% " + "0");
}
// var IDscrollRAF;
// $document.scroll(function(){
//   adjustBodyRotateOrigin();

// })

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
    }, 4500);
    setTimeout(function() {
      start = false;
      cursorLerpY = 0.9;
      //finishLerpCursorLerpY = false;
      addEvent(document, "mousemove", update);
      scrollinstance.options("overflowBehavior.x", "s");
      scrollinstance.options("overflowBehavior.y", "s");
      cancelAnimationFrame(IDstart);
    }, 9000);
  }
}
function darknessStartAnim(){
  let curDarkness = darkness;
  $({d: curDarkness}).stop().animate({d: 0.94},{
    duration: 30000,
    easing: "easeInOutQuad",
    step: function(now){
      darkness = now;
      document.documentElement.style.setProperty("--darkness", darkness);
    },
    complete: function(){
      cancelAnimationFrame(IDdarkness);
    }
  });
}

var start = true;
var IDstart;
var darkness = 1;
var IDdarkness;
$settingButton.on("click", function(){
  if(setting){
    setTimeout(function(){
      mouseX = 0.5 * window.innerWidth;
      mouseY = 1.15 * window.innerHeight;
      LdestX = mouseX;
      LdestY = mouseY;
      IDfollowCursor = requestAnimationFrame(followCursor);
      IDstart = requestAnimationFrame(startAnim);
      IDdarkness = requestAnimationFrame(darknessStartAnim);
      updateR();
    }, 500);
  }
});

/********************spotlight change******************* */
var IDslc;
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
var sunsetR1 = 112, //61
    sunsetG1 = 47, //34
    sunsetB1 = 35, //35
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
    step: function(now, fx) {
      if(backtoSpotLight){$(fx.elem).stop(true); return;}
      if(nightStart){$(fx.elem).stop(true); return;}
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
    step: function(now, fx) {
      if(backtoSpotLight){$(fx.elem).stop(true); return;}
      if(nightStart){$(fx.elem).stop(true); return;}
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
    step: function(now, fx) {
      if(backtoSpotLight){$(fx.elem).stop(true); return;}
      if(sunsetStart){$(fx.elem).stop(true); return;}
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
    step: function(now, fx) {
      if(backtoSpotLight){$(fx.elem).stop(true); return;}
      if(sunsetStart){$(fx.elem).stop(true); return;}
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
    step: function(now, fx) {
      if(sunsetStart){$(fx.elem).stop(true); return;}
      if(nightStart){$(fx.elem).stop(true); return;}
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
    step: function(now, fx) {
      if(sunsetStart){$(fx.elem).stop(true); return;}
      if(nightStart){$(fx.elem).stop(true); return;}
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

$settingButton.on("click", function(){
  if(setting){
    setTimeout(function(){
      IDhblur = requestAnimationFrame(hblurAnim);
    }, 500);
  }
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
$bodyRotate = $("#bodyRotate");
var screenMax = -1*window.innerWidth/2 + 0.85 * window.innerWidth;
var screenMin = -1*window.innerWidth/2 + 0.04 * window.innerWidth;
var leftDeg = -6;
var rightDeg = 8;
function bodyRotate(e){
  let sx = e.screenX - window.innerWidth/2;
  if(sx > screenMax){sx = screenMax;}
  else if (sx < screenMin){sx = screenMin;}

  if(setting){leftDeg = -10; rightDeg = 12;} 
  bodyRY = Math.round(scale(sx, screenMin, screenMax, leftDeg, rightDeg));
  document.body.style.setProperty("--bodyRotateY", bodyRY+"deg");
  //let sy = e.screenY;
}

addEvent(document, "mousemove", bodyRotate);

var $scrollContainer = $("#scrollContainer");
var brightRef = 48;
var brightRef2 = 52;
var darkRef = 33;
var darkRef2 = 67;
var lastNOWref;
var NOWref;
var IDreflection;

var destBrightRef,
    destBrightRef2, 
    destDarkRef,
    destDarkRef2;

function BGreflection(timestamp){
  IDreflection = requestAnimationFrame(BGreflection);

  let smx = mouseX;
  if(limitedCursor){
    if(smx < 0.45*window.innerWidth){smx = 0.45*window.innerWidth;}
    else if(smx > 0.55*window.innerWidth){smx = 0.55*window.innerWidth;}
  }

  if(limitedCursor){
    if(mouseState == 0){
      destBrightRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 40, 50));
      destBrightRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 50, 60));
      destDarkRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 20, 36));
      destDarkRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 70, 80));
    }
    else if(mouseState == 2){
      destBrightRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 45, 53));
      destBrightRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 47, 55));
      destDarkRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 33, 41));
      destDarkRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 59, 67));
    }
    else{
      destBrightRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 45, 51));
      destBrightRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 49, 55));
      destDarkRef = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 30, 46));
      destDarkRef2 = Math.round(scale(smx, 0.45*window.innerWidth, 0.55*window.innerWidth, 64, 70));
    }
  }
  else{
    if(mouseState == 0){
      destBrightRef = Math.round(scale(smx, 0, window.innerWidth, 17, 75));
      destBrightRef2 = Math.round(scale(smx, 0, window.innerWidth, 25, 83));
      destDarkRef = Math.round(scale(smx, 0, window.innerWidth, 0, 58));
      destDarkRef2 = Math.round(scale(smx, 0, window.innerWidth, 42, 100));
    }
    else if(mouseState == 1){
      destBrightRef = Math.round(scale(smx, 0, window.innerWidth, 12, 86));
      destBrightRef2 = Math.round(scale(smx, 0, window.innerWidth, 14, 88));
      destDarkRef = Math.round(scale(smx, 0, window.innerWidth, 0, 74));
      destDarkRef2 = Math.round(scale(smx, 0, window.innerWidth, 26, 100));
    }
    else{
      destBrightRef = Math.round(scale(smx, 0, window.innerWidth, 15, 81));
      destBrightRef2 = Math.round(scale(smx, 0, window.innerWidth, 19, 85));
      destDarkRef = Math.round(scale(smx, 0, window.innerWidth, 0, 66));
      destDarkRef2 = Math.round(scale(smx, 0, window.innerWidth, 34, 100));
    }
  }
  

  if(lastNOWref === undefined){
    lastNOWref = timestamp;
  }
  NOWref = timestamp;
  let dt = (NOWref - lastNOWref)/1000;
  lastNOWref = NOWref;

  brightRef = lerp(brightRef, destBrightRef, 1-Math.pow(0.4, dt));
  brightRef2 = lerp(brightRef2, destBrightRef2, 1-Math.pow(0.4, dt));
  darkRef = lerp(darkRef, destDarkRef, 1-Math.pow(0.5, dt));
  darkRef2 = lerp(darkRef2, destDarkRef2, 1-Math.pow(0.5, dt));

  $scrollContainer.css("--brightReflectionPos", brightRef+"%");
  $scrollContainer.css("--brightReflectionPos2", brightRef2+"%");
  $scrollContainer.css("--darkReflectionPos", darkRef+"%");
  $scrollContainer.css("--darkReflectionPos2", darkRef2+"%");
}


addEvent(document, "mousemove", function(){
  if(setting){
    cancelAnimationFrame(IDreflection);
    IDreflection = requestAnimationFrame(BGreflection);
  }
});
/*********************cloud displacement map*****************************/
var cloudFilter = document.getElementById("cloud-filter");
var cloudDisp = document.getElementById("cloud-disp");
//var $cloudFilter = $("#cloud-filter");
//var $cloudDisp = $("#cloud-disp");
var IDbf;
var IDoc;
var IDsc;

var baseFrequency = 0.045;
var octave = 1;
var cloudScale = 80;

var bfMax = 0.015;
var bfMin = 0.007;
var scaleMiddle = 90;
var scaleMin = 37;
var ocMax = 15;
var ocMiddle = 10;
var ocMin = 1;

var bfDir = -1;
var scDir = -1;
var ocDir = 1;

var cloudFlounderBf = false;
var cloudFlounderSc = false;
var cloudFlounderOc = false;

$settingButton.on("click", function(){
  setTimeout(function(){
    if(setting && cloudOn){
      if(start){
        IDbf = requestAnimationFrame(cloudBfStart);
        IDsc = requestAnimationFrame(cloudScStart);
        IDoc = requestAnimationFrame(cloudOcStart);
      }
    }
  }, 500);
});

var curBf,
    curSc,
    curOc;

//start
var bfStartEnd = false,
    scStartEnd = false,
    ocStartEnd = false;
function cloudBfStart(){
  curBf = baseFrequency;
  $({ bf: curBf }).animate({ bf: bfMin }, {
    duration: 11000,
    easing: "easeOutQuad", 
    step: function(now) {
      baseFrequency = now;
      cloudFilter.setAttribute("baseFrequency", baseFrequency);
    },
    complete: function(){
      if(!bfStartEnd){
        bfStartEnd = true;
        curBf = baseFrequency;
        bfDir = 1;
        cancelAnimationFrame(IDbf);
        IDbf = requestAnimationFrame(cloudBfDrift);
      }
    }
  });
}
function cloudScStart(){
  curSc = cloudScale;
  $({ sc: curSc }).animate({ sc: scaleMin }, {
    duration: 19500,
    easing: "easeOutQuad",
    step: function(now) {
      cloudScale = now;
      cloudDisp.setAttribute("scale", cloudScale);
    },
    complete: function(){
      if(!scStartEnd){
        scStartEnd = true;
        curSc = cloudScale;
        ScDir = 1;
        cancelAnimationFrame(IDsc);
        IDsc = requestAnimationFrame(cloudScDrift);
      }
    }
  });
}
function cloudOcStart(){
  curOc = octave;
  $({ oc: curOc }).animate({ oc: ocMax }, {
    duration: 14500,
    easing: "easeOutQuad",
    step: function(now) {
      octave = Math.round(now);
      cloudFilter.setAttribute("numOctaves", octave);
    },
    complete: function(){
      if(!ocStartEnd){
        curOc = octave;
        OcDir = -1;
        cancelAnimationFrame(IDoc);
        IDoc = requestAnimationFrame(cloudOcDrift);  
      }
    }
  });
}

//drift
var curBfSet1 = false,
    curBfSet2 = false;

var backToDriftBf;
function cloudBfDrift(){
  if(!cloudFlounderBf){
    if(bfDir == -1){
      if(!curBfSet1){curBf = baseFrequency; curBfSet1 = true;}
      $({ bf: curBf }).stop(true).animate({ bf: bfMin }, {
        duration: 35000,
        easing: "easeInOutSine",
        step: function(now, fx) {
          if(cloudFlounderBf){$(fx.elem).stop(true); return;}
          if(bfDir == 1){$(fx.elem).stop(true); return;}

          baseFrequency = now;
          cloudFilter.setAttribute("baseFrequency", baseFrequency);
        },
        complete: function(){
          curBfSet1 = false;
          curBf = baseFrequency;
          backToDriftBf = baseFrequency;
          bfDir = 1;
          cancelAnimationFrame(IDbf);
          if(!cloudFlounderBf){IDbf = requestAnimationFrame(cloudBfDrift);}
        }
      });
    }
    else{
      if(!curBfSet2){curBf = baseFrequency; curBfSet2 = true;}
      $({ bf: curBf }).stop(true).animate({ bf: bfMax }, {
        duration: 35000,
        easing: "easeOutSine",
        step: function(now, fx) {
          if(cloudFlounderBf){$(fx.elem).stop(true); return;}
          if(bfDir == -1){$(fx.elem).stop(true); return;}
          baseFrequency = now;
          cloudFilter.setAttribute("baseFrequency", baseFrequency);
        },
        complete: function(){
          curBfSet2 = false;
          curBf = baseFrequency;
          bfDir = -1;
          cancelAnimationFrame(IDbf);
          if(!cloudFlounderBf){IDbf = requestAnimationFrame(cloudBfDrift);}
        }
      });
    }
  }
}

var curScSet1 = false,
    curScSet2 = false;
function cloudScDrift(){
  if(!cloudFlounderSc){
    if(scDir == -1){
      if(!curScSet1){curSc = cloudScale; curScSet1 = true;}
      $({ sc: curSc }).stop().animate({ sc: scaleMin }, {
        duration: 25000,
        easing: "easeOutSine",
        step: function(now, fx) {
          if(cloudFlounderSc){$(fx.elem).stop(true); return;}
          if(scDir == 1){$(fx.elem).stop(true); return;}
          cloudScale = now;
          cloudDisp.setAttribute("scale", cloudScale);
        },
        complete: function(){
          curScSet1 = false;
          curSc = cloudScale;
          ScDir = 1;
          cancelAnimationFrame(IDsc);
          if(!cloudFlounderSc){IDsc = requestAnimationFrame(cloudScDrift);}
        }
      });
    }
    else{
      if(!curScSet2){curSc = cloudScale; curScSet2 = true;}
      $({ sc: curSc }).stop().animate({ sc: scaleMiddle }, {
        duration: 25000,
        easing: "easeOutSine",
        step: function(now, fx) {
          if(cloudFlounderSc){$(fx.elem).stop(true); return;}
          if(scDir == -1){$(fx.elem).stop(true); return;}
          cloudScale = now;
          cloudDisp.setAttribute("scale", cloudScale);
        },
        complete: function(){
          curScSet2 = false;
          curSc = cloudScale;
          ScDir = -1;
          cancelAnimationFrame(IDsc);
          if(!cloudFlounderSc){IDsc = requestAnimationFrame(cloudScDrift);}
        }
      });
    }
  }
}

var curOcSet1 = false,
    curOcSet2 = false;
function cloudOcDrift(){
  if(!cloudFlounderOc){
    if(ocDir == -1){
      if(!curOcSet1){curOc = octave; curOcSet1 = true;}
      $({ oc: curOc }).stop().animate({ oc: ocMiddle }, {
        duration: 20000,
        easing: "easeOutSine",
        step: function(now, fx) {
          if(cloudFlounderOc){$(fx.elem).stop(true); return;}
          if(ocDir == 1){$(fx.elem).stop(true); return;}
          octave = Math.round(now);
          cloudFilter.setAttribute("numOctaves", octave);
        },
        complete: function(){
          curOcSet1 = false;
          OcDir = 1;
          curOc = octave;
          cancelAnimationFrame(IDoc);
          if(!cloudFlounderOc){IDoc = requestAnimationFrame(cloudOcDrift);}
        }
      });
    }
    else{
      if(!curOcSet2){curOc = octave; curOcSet2 = true;}
      $({ oc: curOc }).stop().animate({ oc: ocMax }, {
        duration: 20000,
        easing: "easeOutSine",
        step: function(now, fx) {
          if(cloudFlounderOc){$(fx.elem).stop(true); return;}
          if(ocDir == -1){$(fx.elem).stop(true); return;}
          octave = Math.round(now);
          cloudFilter.setAttribute("numOctaves", octave);
        },
        complete: function(){
          curOcSet2 = false;
          OcDir = -1;
          curOc = octave;
          cancelAnimationFrame(IDoc);
          if(!cloudFlounderOc){IDoc = requestAnimationFrame(cloudOcDrift);}
        }
      });
    }
  }
}

//flounder
var bfFlounderEnd = false,
    scFlounderEnd = false,
    ocFlounderEnd = false;

function setCloudFlounder(){
  cloudFlounderBf = true;
  cloudFlounderSc = true;
  cloudFlounderOc = true;
  bfFlounderEnd = false,
  scFlounderEnd = false,
  ocFlounderEnd = false;
  cancelAnimationFrame(IDbf);
  cancelAnimationFrame(IDsc);
  cancelAnimationFrame(IDoc);
  IDbf = requestAnimationFrame(cloudBfFlounder);
  IDsc = requestAnimationFrame(cloudScFlounder);
  IDoc = requestAnimationFrame(cloudOcFlounder);
}

var bfFlounderSet = false,
    scFlounderSet = false,
    ocFlounderSet = false;
var destBfFlounder, destScFlounder, destOcFlounder;
function cloudBfFlounder(){
  if(cloudFlounderBf){
    if(!bfFlounderSet){
      curBf = baseFrequency; 
      destBfFlounder = Math.abs(baseFrequency - bfMax) >= Math.abs(baseFrequency - bfMin) ? bfMax + 0.007 - Math.abs(baseFrequency - bfMax) : bfMin - (0.007 - Math.abs(baseFrequency - bfMin));
      if(destBfFlounder < 0.001){destBfFlounder == 0.001;} 
      bfFlounderSet = true;
    }
    $({ bf: curBf }).stop().animate({ bf: destBfFlounder }, {
      duration: 3500,
      easing: "easeOutQuad", 
      step: function(now, fx) {
        if(!cloudFlounderBf){$(fx.elem).stop(true); return;}
        baseFrequency = now;
        cloudFilter.setAttribute("baseFrequency", baseFrequency);
      },
      complete: function(){
        if(!bfFlounderEnd){
          bfFlounderEnd = true;
          bfFlounderSet = false;
          bfDir = Math.abs(destBfFlounder - bfMax) <= Math.abs(destBfFlounder - bfMin) ? -1 : 1;
          cloudFlounderBf = false;
          curBf = baseFrequency;
          cancelAnimationFrame(IDbf);
          IDbf = requestAnimationFrame(cloudBfDrift);  
        }
      }
    });
  }
}
function cloudScFlounder(){
  if(cloudFlounderSc){
    if(!scFlounderSet){
      curSc = cloudScale; 
      destScFlounder = Math.abs(cloudScale - scaleMiddle) >= Math.abs(cloudScale - scaleMin) ? scaleMiddle + 40 - Math.abs(cloudScale - scaleMiddle) : scaleMin - (40 - Math.abs(cloudScale - scaleMin));
      if(destScFlounder < 10){destBfFlounder == 10;}
      scFlounderSet = true;
    }
    $({ sc: curSc }).stop().animate({ sc: destScFlounder }, {
      duration: 3500,
      easing: "easeOutQuad",
      step: function(now, fx) {
        if(!cloudFlounderSc){$(fx.elem).stop(true); return;}
        cloudScale = now;
        cloudDisp.setAttribute("scale", cloudScale);
      },
      complete: function(){
        if(!scFlounderEnd){
          scFlounderEnd = true;
          scFlounderSet = false;
          ScDir = Math.abs(destScFlounder - scaleMiddle) <= Math.abs(destScFlounder - scaleMin) ? -1 : 1;
          cloudFlounderSc = false;
          curSc = cloudScale;
          cancelAnimationFrame(IDsc);
          IDsc = requestAnimationFrame(cloudScDrift);
        }
      }
    });
  }
}
function cloudOcFlounder(){
  if(cloudFlounderOc){
    if(!ocFlounderSet){
      curOc = octave;
      destOcFlounder = Math.abs(octave - ocMax) >= Math.abs(octave - ocMiddle) ? ocMax + 4 - Math.abs(octave - ocMax) : scaleMin - (4 - Math.abs(octave - ocMiddle));
      if(destOcFlounder < 3){destBfFlounder == 3;}
      ocFlounderSet = true;
    }
    $({ oc: curOc }).stop().animate({ oc: destOcFlounder }, {
      duration: 3500,
      easing: "easeOutQuad",
      step: function(now, fx) {
        if(!cloudFlounderOc){$(fx.elem).stop(true); return;}
        octave = Math.round(now);
        cloudFilter.setAttribute("numOctaves", octave);
      },
      complete: function(){
        if(!ocFlounderEnd){
          ocFlounderEnd = true;
          ocFlounderSet = false;
          OcDir = Math.abs(destOcFlounder - ocMax) <= Math.abs(destOcFlounder - ocMiddle) ? -1 : 1;
          cloudFlounderOc = false;
          curOc = octave;
          cancelAnimationFrame(IDoc);
          IDoc = requestAnimationFrame(cloudOcDrift);  
        }
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
var hMarginL = 5;
var hFontSize = 72;
var bodyBlur = 0.85;
function adjustElementSize(){
  if(window.innerWidth < 2400 && window.innerWidth >= 1000){
    plaintextFontSize = 27; 
    moonScale = 1; 
    moonMarginL = 6; 
    hMarginL = 5; 
    hFontSize = 70;
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "9%");
    $timeInput.css("width", "55%");
    bodyBlur = 0.65;
    //scrollinstance.options("overflowBehavior.x", "h");
  }
  else if(window.innerWidth < 1000 && window.innerWidth >= 800){
    plaintextFontSize = 26; 
    moonMarginL = 5; 
    hFontSize = 66;
    hMarginL = 5; 
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "6%");
    $timeInput.css("width", "55%");
    bodyBlur = 0.6;
    //scrollinstance.options("overflowBehavior.x", "h");
  }
  else if(window.innerWidth < 800 && window.innerWidth >= 700){
    plaintextFontSize = 24; 
    moonMarginL = 5; 
    hFontSize = 60;
    hMarginL = 5; 
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "3%");
    $timeInput.css("width", "55%");
    bodyBlur = 0.55;
    //scrollinstance.options("overflowBehavior.x", "h");
  }
  else if(window.innerWidth < 700 && window.innerWidth >= 600){
    plaintextFontSize = 22;
    moonMarginL = 20;
    hMarginL = 4;
    hFontSize = 55; 
    $rotateTextOne.css("display", "none");
    $rotateTextTwo.css("display", "none");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "initial");
    timeButtonMouseOverFunc = 1;
    $plaintext.css("margin-right", "25px");
    $timeInput.css("width", "100%");
    bodyBlur = 0.5;
    //scrollinstance.options("overflowBehavior.x", "h");
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
    $plaintext.css("margin-right", "25px");
    $timeInput.css("width", "100%");
    bodyBlur = 0.4;
    //scrollinstance.options("overflowBehavior.x", "s");
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
    $plaintext.css("margin-right", "25px");
    $timeInput.css("width", "100%");
    bodyBlur = 0.35;
    //scrollinstance.options("overflowBehavior.x", "s");
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
    $plaintext.css("margin-right", "25px");
    $timeInput.css("width", "100%");
    bodyBlur = 0.25;
    //scrollinstance.options("overflowBehavior.x", "s");
  }
  else{
    plaintextFontSize = 30; 
    moonScale = 1; 
    moonMarginL = 6; 
    hMarginL = 5; 
    hFontSize = 75;
    $rotateTextOne.css("display", "inline-block");
    $rotateTextTwo.css("display", "inline-block");
    $h1.text("Self-Help Guide : Artrology");
    $yearMonthButton.css("display", "inline-block");
    timeButtonMouseOverFunc = 0;
    $plaintext.css("margin-right", "12%");
    $timeInput.css("width", "55%");
    bodyBlur = 0.85;
    //scrollinstance.options("overflowBehavior.x", "h");
  }
  document.documentElement.style.setProperty("--plaintextFontSize", plaintextFontSize + "px");
  document.documentElement.style.setProperty("--moonMarginL", moonMarginL + "vw");
  document.documentElement.style.setProperty("--hMoonMarginL", hMarginL + "vw");
  document.documentElement.style.setProperty("--hFontSize", hFontSize + "px");
  document.documentElement.style.setProperty("--bodyBlur", bodyBlur + "px");
}
$document.ready(adjustElementSize);
$window.resize(adjustElementSize);


/********************twinkle plain text***********************************/
var plaintexts = document.getElementsByClassName("plaintext");
//var twinkleIntervs = new Array(plaintexts.length);
var twinkleIDs = new Array(plaintexts.length);
var twinkleDirects = new Array(plaintexts.length);

var twinkleOpa = 0.25;
var defaultTwinklwOpa1 = 0.25;
var defaultTwinklwOpa2 = 0.3;
var defaultTwinklwOpa3 = 0.42;
function textTwinkle($this, index){
  twinkleIDs[index] = requestAnimationFrame(function(){textTwinkle($this, index);});
  $this.css("transition", "all 3s ease-in-out");
  if($this.css("opacity") < twinkleOpa && twinkleDirects[index] == 1){ 
    $this.css("opacity", twinkleOpa);
    $this.css("--glowPix1", "4px");
    $this.css("--glowPix2", "-4px");
    $this.css("--glowColor2", "#363246");
    if(Math.abs($this.css("opacity")-twinkleOpa) <= 0.005){twinkleDirects[index] = -1;}
  }
  else if ($this.css("opacity") > 0.05 && twinkleDirects[index] == -1){
    $this.css("opacity", 0.05);
    $this.css("--glowPix1", "1px");
    $this.css("--glowPix2", "-1px");
    $this.css("--glowColor2", "#363246");
    if(Math.abs($this.css("opacity")-0.05) <= 0.005){twinkleDirects[index] = 1;}
  }
  else if($this.css("opacity") >= twinkleOpa && twinkleDirects[index] == 1){twinkleDirects[index] = -1;}
  else if($this.css("opacity") <= 0.05 && twinkleDirects[index] == -1){twinkleDirects[index] = 1;}
}

var twinkleBrighterOpa = 0.65;
function textTwinkleBright($this, index){ 
  twinkleIDs[index] = requestAnimationFrame(function(){textTwinkleBright($this, index);});
  $this.css("transition", "all 12s ease-in-out");
  if($this.css("opacity") < twinkleBrighterOpa && twinkleDirects[index] == 1){ 
    $this.css("opacity", twinkleBrighterOpa);
    $this.css("--glowPix1", "-3px");
    $this.css("--glowPix2", "3px");
    $this.css("--glowColor2", "#77798f");
    if(Math.abs(parseFloat($this.css("opacity"))-twinkleBrighterOpa) <= 0.005){twinkleDirects[index] = -1;}
  }
  else if ($this.css("opacity") > 0.1 && twinkleDirects[index] == -1){
    $this.css("opacity", 0.1);
    $this.css("--glowPix1", "4px");
    $this.css("--glowPix2", "-4px");
    $this.css("--glowColor2", "#363246");
    if(Math.abs(parseFloat($this.css("opacity"))-0.1) <= 0.005){twinkleDirects[index] = 1;}
  }
  else if($this.css("opacity") >= twinkleBrighterOpa && twinkleDirects[index] == 1){twinkleDirects[index] = -1;}
  else if($this.css("opacity") <= 0.1 && twinkleDirects[index] == -1){twinkleDirects[index] = 1;}
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
var $selectionDiv = $(".SelectionDiv")
var $rotateBackCircle = $(".rotateBackCircle");
var $rotate = $(".rotate");

var $timesDiv = $("#timesDiv");
var $namesDiv = $("#namesDiv");

var moonCountTimeOut;
var moonCanSwitch0 = false;
var moonCanSwitch1 = true;
var moonCanSwitch2 = false;
var nameTextStart = 3;
var nameTextEnd = 4;
var timeTextStart = 5;
var timeTextEnd = 7;

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
      $selectionDiv.removeClass("bottom");
      $namesDiv.addClass("bottom");
      $namesDiv.css("display", "initial");
      selfTwinkle(nameTextStart, nameTextEnd);
      requestAnimationFrame(function(){
        setTimeout(function(){
          $rotate.toggleClass("one");
          $rotateTextTwo.removeClass("hide");
          $rotateTextOne.toggleClass("up");
          $timesDiv.removeClass("hideRotateLeft");
          $namesDiv.toggleClass("showRotateLeft");

          let height = window.innerHeight + $namesDiv.outerHeight(true);
          $bodyRotate.css("height", height + "px");

          requestAnimationFrame(function(){
            setTimeout(function(){
              //if(parseFloat($namesDiv.css("opacity")) > 0.95){
                moonCanSwitch2 = true;
              //}
              //console.log($namesDiv.css("opacity") + " : " + moonCanSwitch2);
            }, 1100);
          });
        }, 250);
      });
    } 
    else if (moonCount == 2) {
      $namesDiv.removeClass("bottom");
      $timesDiv.addClass("bottom");
      $timesDiv.css("display", "initial");
      selfTwinkle(timeTextStart, timeTextEnd);
      requestAnimationFrame(function(){
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

          let height = window.innerHeight + $timesDiv.outerHeight(true);
          $bodyRotate.css("height", height + "px");

          requestAnimationFrame(function(){
            setTimeout(function(){
              //if(parseFloat($namesDiv.css("opacity")) < 0.05){
                $namesDiv.css("display", "none"); 
                moonCanSwitch0 = true;
              //}
            }, 1100);
          });
        }, 250);
      });
      
    } 
    else if(moonCount == 0) {
      $timesDiv.removeClass("bottom");
      $selectionDiv.addClass("bottom");
      cancelTwinkle(timeTextStart, timeTextEnd);
      $rotate.removeClass("two");
      $rotateTextTwo.removeClass("down");
      $rotateTextOne.removeClass("hide");
      $rotateTextTwo.toggleClass("hide");

      $namesDiv.removeClass("hideRotateLeft");
      $timesDiv.removeClass("showRotateLeft");
      $timesDiv.toggleClass("hideRotateLeft");
      let scrollDest = $rotateBackCircle.offset().top - 0.8 * window.innerHeight;
      if (scrollDest < 0){scrollDest = 0;}
      //$htmlAndBody.animate({ scrollTop: scrollDest}, 1000);
      scrollinstance.scroll({x: 0, y:scrollDest}, 600, "easeInOutSine");

      let height = window.innerHeight;
      $bodyRotate.css("height", height + "px");

      requestAnimationFrame(function(){
        moonCountTimeOut = setTimeout(function(){
          //if(parseFloat($timesDiv.css("opacity")) < 0.05){
            $timesDiv.css("display", "none"); 
            moonCanSwitch1 = true;
          //}
        }, 1100);
      });
    }
    
    nameInputSubmitted = 0;
    timeInputSubmitted = false;

    sunsetStart = false;
    nightStart = false;
    backtoSpotLight = true;

    cancelAnimationFrame(IDslc);
    clearTimeout(SLCtimer);
    IDslc = requestAnimationFrame(function(){
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
    });
  }
   //}, 100);
});

$rotate.mousedown(function(){
  $rotate.css("cursor", "grabbing");
});
$rotate.mouseup(function(){
  $rotate.css("cursor", "grab");
})

var rotateGlowColor = "#c5c6cfab";
var rotateBG = "rgba(190, 190, 190, 0.5)";
var rotateMouseOver = false;
$document.mousemove(function(e){
  if(setting){
    let d = Math.pow(e.clientX + 0.15 * window.innerWidth - $rotate.offset().left, 2);
    let yCondition = window.innerWidth > window.innerHeight ? spotLightRadius/900*window.innerWidth : spotLightRadius/900*window.innerHeight;
    let myCondition = e.pageY > $rotate.offset().top ? e.pageY > $rotate.offset().top + yCondition : e.pageY < $rotate.offset().top - yCondition;
    let condition = e.clientX - 0.12 * window.innerWidth < $rotate.offset().left &&  myCondition;
    if(d < 0.04 * Math.pow(window.innerWidth,2) && !condition){
      rotateGlowColor = "#d5d9d9c0";
    }
    else{
      if(mouseState == 0){rotateGlowColor = "#c49f999d";}
      else if(mouseState == 2){rotateGlowColor = "#a9b3cf9d";}
      else{rotateGlowColor = "#c5c6cf9a"; }
    }
    if(mouseState == 0){rotateBG = "rgba(181, 117, 107, 0.6)";}
    else if(mouseState == 2){rotateBG = "rgba(135, 144, 201, 0.6)";}
    else{rotateBG = "rgba(190, 190, 190, 0.5)";}
  
    $rotate.css("--rotateGlow", rotateGlowColor);
    $rotate.css("--rotateBGcolor", rotateBG);
  }
})

$rotateBackCircle.mouseover(function(){
  $rotateBackCircle.css("box-shadow", "0px 0px 10px #232323, 0px 0px 10px #3f3d52, 0px 0px 10px #3f3d52, 0px 0px 10px #232323")
  $rotate.css("box-shadow", "8px 8px 10px var(--rotateGlow), -8px -8px 10px var(--rotateGlow), 8px -8px 10px var(--rotateGlow), -8px 8px 10px var(--rotateGlow)");
  $rotateTextOne.css("color", "#13131c");
  $rotateTextTwo.css("color", "#13131c");
  document.getElementsByClassName("SelectionDiv")[0].style.setProperty("--blurPx", "1px");
});
$rotateBackCircle.mouseleave(function(){
  $rotateBackCircle.css("box-shadow", "8px -8px 10px #232323, -8px 8px 10px #3f3d52, 8px 8px 10px #3f3d52, -8px -8px 10px #232323")
  $rotate.css("box-shadow", "8px 8px 10px var(--rotateGlow), -8px -8px 10px var(--rotateGlow), 8px -8px 10px var(--rotateGlow), -8px 8px 10px var(--rotateGlow)");
  $rotateTextOne.css("color", "#1b1b24");
  $rotateTextOne.css("color", "#1b1b24");
  document.getElementsByClassName("SelectionDiv")[0].style.setProperty("--blurPx", "3px");
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
    borderName.nextElementSibling.style.setProperty("transition-delay", "0s");
    validAnimationEnd = 0;
  } 
  else if (e.animationName == "inputBackToLine") {
    borderName.nextElementSibling.style.setProperty("transition-delay", "1s");
  }
});

addEvent(borderName, animationEndEvent, function (e) {
  canFlash = 0;
  if (e.animationName == "inputFormButton") {
    validAnimationEnd = 1;
    if (bufferRevealBarCode == 1) {
      let checkName = document.getElementsByClassName("check")[0];
      if (inputFocused == 1 && nameInputSubmitted == 0) {
        checkName.style.setProperty("opacity", "1");
        let border = checkName.previousElementSibling;
        border.style.setProperty("opacity", "0");
      } 
      else {
        checkName.style.setProperty("opacity", "0");
        let border = checkName.previousElementSibling;
        border.style.setProperty("opacity", "1");
      }
    }
  }
  else{
    nameInputCanFocus = true;
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

var $allNotNameInput = $("* :not(.switchDiv):not(#namesDiv):not(#nameInput):not(.inp):not(#inp):not(.border):not(.check):not(.filtered):not(#scrollContainer):not(body):not(#bodyRotate)");
// var JQbodyNswitch = $("body > *:not(.switchDiv)");
// var JQswitchNinp = $(".switchDiv > *:not(#nameInput)");
var $inp = $(".inp");
function inputFocusIn() {
  if(nameInputCanFocus){
    inputFocused = 1;
    nameInputSubmitted = 0;
    $allNotNameInput.addClass("inputFocused");
    twinkleOpa = defaultTwinklwOpa2;
  }
  else{
    JSinput.blur();
  }
}
function inputFocusOut() {
  inputFocused = 0;
  $allNotNameInput.removeClass("inputFocused");
  twinkleOpa = defaultTwinklwOpa1;
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
      this.style.setProperty("opacity", "1");
      let border = this.previousElementSibling;
      border.style.setProperty("opacity", "0");
    } else {
      this.style.setProperty("opacity", "0");
      let border = this.previousElementSibling;
      border.style.setProperty("opacity", "1");
    }
  } else {
    bufferRevealBarCode = 1;
  }
});

JQcheck.mouseleave(function () {
  this.style.setProperty("opacity", "0");
  let border = this.previousElementSibling;
  border.style.setProperty("opacity", "1");
  bufferRevealBarCode = 0;
});

addEvent(JSinput, "invalid", function () {
  JQcheck.css("opacity", "0");
  let border = this.nextElementSibling;
  border.style.setProperty("opacity", "1");
  //bufferRevealBarCode = 0;
});

var nameData = "";
var nameInputCanFocus = true;
JQcheck.mousedown(function () {
                                                    //&& canChange == 1) {
  if (inputFocused == 1 && JSinput.checkValidity()){ 
    let input = this.previousElementSibling.previousElementSibling;
    this.style.setProperty("opacity", "0");
    let border = this.previousElementSibling;
    border.style.setProperty("opacity", "1");

    validity = false;
    nameData = input.value; //get val
    input.value = "";
    nameInputSubmitted = 1;
    input.blur();
    nameInputCanFocus = false;

    //change spotlight state
    sunsetStart = true;
    nightStart = false;
    backtoSpotLight = false;

    cancelAnimationFrame(IDslc);
    clearTimeout(SLCtimer);
    IDslc = requestAnimationFrame(function(){
      SLCtimer = setTimeout(function(){
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
    });

    setCloudFlounder();
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
      step: function(now, fx){
        if(sliderMdown == false){$(fx.elem).stop(true); return;}
        sliderDeg = now % 360;
        TIsliderX = sliderRadius * Math.sin((sliderDeg * Math.PI) / 180);
        TIsliderY = sliderRadius * -Math.cos((sliderDeg * Math.PI) / 180);
        //console.log((TIsliderX + sliderRadius - sliderW2) + " ; " + (TIsliderY + sliderRadius - sliderH2));
        $TIslider.css("left", TIsliderX + sliderRadius - sliderW2); 
        $TIslider.css("top", TIsliderY + sliderRadius - sliderH2);
        $TIslider.css("transform", "rotate(" + sliderDeg + "deg");
      },
      complete: function(){
        destMonth = monthVal + Math.round(degIncrement/30);
        destMonth = destMonth > 12 ? destMonth - 12 : destMonth;
        calculateTime(sliderDeg);
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
      step: function(now, fx){
        if(circleMdown == false){$(fx.elem).stop(true); return;}
        circleDeg = (360 + now) % 360;
        TIcircleX = circleRdius * Math.sin((circleDeg * Math.PI) / 180);
        TIcircleY = circleRdius * -Math.cos((circleDeg * Math.PI) / 180);
        //console.log((TIcircleX + circleRdius - circleW2) + " ; " + (TIcircleY + circleRdius - circleH2));
        $TIcircle.css("left", TIcircleX + circleRdius - circleW2); 
        $TIcircle.css("top", TIcircleY + circleRdius - circleH2);
        $TIcircle.css("transform", "rotate(" + circleDeg + "deg");
      },
      complete: function(){
        destMonth = monthVal - Math.round(degIncrement/30);
        destMonth = destMonth < 0 ? destMonth + 12 : destMonth;
        calculateTime(circleDeg);
        cancelAnimationFrame(IDcircleRotate);
        IDcircleRotate = requestAnimationFrame(function(){rotateCircle(circleDeg);});
      }
    });
  }
}

var destMonth = curMonth;
$document.ready(function(){$yearMonthButton.text(yearVal + " . " + monthPadding + monthVal);})
function calculateTime(deg){
  let degMonth = Math.ceil(deg / 30) % 12;
  let monthDiff = destMonth - degMonth;
  monthVal = degMonth + monthDiff;

  if(sliderMdown && circleMdown == false){
    if(lastMonthVal > monthVal){
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
    if(lastMonthVal < monthVal){
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
    cancelAnimationFrame(IDsliderRAF);
    cancelAnimationFrame(IDcircleRAF);
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
    $TIslider.css("cursor", "grab");
    $TIcircle.css("cursor", "grab");
  }
});
//slider mouse down

let sliderMDPos = { x: sliderPos.x - elPos.x, y: sliderPos.y - elPos.y };
let sliderAtan = Math.atan2(sliderMDPos.x - sliderRadius, sliderMDPos.y - sliderRadius);
var sliderDeg = -sliderAtan / (Math.PI / 180) + 180;
var sliderTimeOut;
var IDsliderRAF;
$TIslider.mousedown(function () {
  cancelAnimationFrame(IDsliderRAF);
  clearTimeout(sliderTimeOut);
  IDsliderRAF = requestAnimationFrame(function(){
    sliderTimeOut = setTimeout(function(){
      TIMdown = true;
      sliderMdown = true;
      timeInputSubmitted = false;
      TIslider.style.setProperty("--sliderBlur", "1.25px");
      timeContainer.style.setProperty("--timeContainerBlur", "1px");
      IDsliderRotate = requestAnimationFrame(function(){rotateSlider(sliderDeg);});
  
      $(document.body).css("cursor", "grabbing");
      $TIslider.css("cursor", "grabbing");
    }, 400);
  });
});
//circle mouse down
let circleMDPos = { x: circlePos.x - elPos.x, y: circlePos.y - elPos.y };
let circleAtan = Math.atan2(circleMDPos.x - circleRdius, circleMDPos.y - circleRdius);
var circleDeg = -circleAtan / (Math.PI / 180) + 180;
var circleTimeOut;
var IDcircleRAF;
$TIcircle.mousedown(function () {
  cancelAnimationFrame(IDcircleRAF);
  clearTimeout(circleTimeOut);   
  IDcircleRAF = requestAnimationFrame(function(){
    circleTimeOut = setTimeout(function(){
      circleMdown = true;
      TIMdown = true;
      timeInputSubmitted = false;
      TIcircle.style.setProperty("--circleBlur", "1.25px");
      timeContainer.style.setProperty("--timeContainerBlur", "1px");
      IDcircleRotate = requestAnimationFrame(function(){rotateCircle(circleDeg);});
  
      $(document.body).css("cursor", "grabbing");
      $TIcircle.css("cursor", "grabbing");
    }, 400);
  });
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
var IDtimeContainerRAF;
addEvent(timeContainer, "mouseover", function(){
  if(!TIMdown){
    cancelAnimationFrame(IDtimeContainerRAF);
    clearTimeout(timeContainerTimeOut);
    IDtimeContainerRAF = requestAnimationFrame(function(){
      timeContainerTimeOut = setTimeout(function(){
        if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "1px");}
  
        //if(timeButtonMouseOverFunc == 0){
          let yearStr = yearVal.toString();
          $yearMonthButton.text(yearStr.charAt(2) + yearStr.charAt(3) + "." + monthVal);
        // }
        // else{
        //   $yearMonthButton.css("color", "#c4c2cc");
        // }
      }, 100);
    });
  }
});
addEvent(timeContainer, "mouseleave", function(){
  if(!TIMdown){
    cancelAnimationFrame(IDtimeContainerRAF);
    clearTimeout(timeContainerTimeOut);
    IDtimeContainerRAF = requestAnimationFrame(function(){
      timeContainerTimeOut = setTimeout(function(){
        if(TIMdown == false){timeContainer.style.setProperty("--timeContainerBlur", "3px");}
        $yearMonthButton.css("color", "#2a2835");
        $yearMonthButton.text(yearVal + " . " + monthPadding + monthVal);
      }, 100);
    });
  }
});

var timeInputSubmitted = false;

$yearMonthButton.click(function(){
  yearSubmitted = yearVal;
  monthSubmitted = monthVal;
  timeInputSubmitted = true;
  //console.log(yearSubmitted + " . " + monthSubmitted);

  //change spotlight state
  sunsetStart = false;
  backtoSpotLight = false;
  nightStart = true;
  cancelAnimationFrame(IDslc);
  clearTimeout(SLCtimer);
  IDslc = requestAnimationFrame(function(){
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
  
  //scan
  getSignTime();
  scanAnim();
  
});
$yearMonthButton.mousedown(function(){
  $yearMonthButton.css("cursor", "grabbing");
});
$yearMonthButton.mouseup(function(){
  $yearMonthButton.css("cursor", "grab");
});

var curSign;
function getSignTime(){
  let c = (yearSubmitted % 356) / monthSubmitted;
  let thetaL = Math.atan2(monthSubmitted, c);
  let epsilon = Math.atan2(yearSubmitted / monthSubmitted, c);
  let phi = Math.atan2(yearSubmitted, c);

  let asc = Math.atan(Math.cos(thetaL) / (Math.sin(thetaL)*Math.cos(epsilon)+Math.tan(phi)*Math.sin(epsilon)));
  asc *= (yearSubmitted*monthSubmitted)%(356*12*11);
  curSign = Math.round(asc) % 11;
  console.log(curSign);
}

/*******************scanArea*************************************/
var $scan = $("#scanArea");
var $allNotScan = $("* :not(#scanArea):not(#redLine):not(#redLightArea):not(#barCodeToScan):not(#barCodeToScan2)\
:not(.paperContainer):not(.paper):not(.segment):not(.segment2):not(.icon)\
:not(#scrollContainer):not(#bodyRotate):not(.filtered):not(body)");
var $redLine = $("#redLine");
var $redLightArea = $("#redLightArea");
// var $redLightBG = $("#redLightBG");
var $barCode = $("#barCodeToScan");
var $barCode2 = $("#barCodeToScan2");
var signs = {
  0: "c",
  1: "k",
  2: "^",
  3: "q",
  4: "m",
  5: "r",
  6: "x",
  7: "n",
  8: "s",
  9: "j",
  10: "{"
}
var curBarCodeNum = 0;
var $block = $(".block");

function redLineAppear(){
  requestAnimationFrame(function(){
    setTimeout(function(){
      $redLine.css("opacity", "1");
      $redLightArea.css("opacity", "1");
      $redLine.css("--redLineBlur", "2px");
      $redLightArea.css("--redAreaBlur", "2.7px");
      $redLine.css("--redLineScaleY", "1");
      $redLightArea.css("--redAreaScaleY", "1");
      $redLine.css("--redLineScaleX", "1");
      $redLightArea.css("--redAreaScaleX", "1");
      // $redLightBG.css("opacity", "1");
      // $redLightBG.css("--redLightBGblur", "15px");
      mouseFollowing = true;
      limitedCursor = true;
    }, 4000);
  });
}

function barCodeAppear($code,time){
  $code.text(signs[curBarCodeNum]);
  requestAnimationFrame(function(){
    setTimeout(function(){
      $code.addClass("goDown");
      $code.css("--barCodeOpacity", "0.2");
      $code.css("--barCodeBlur", "2px");
    }, time);
  });
}

function barCodeGoToScan($code, time){
  nextToScan = false;
  requestAnimationFrame(function(){
    setTimeout(function(){
      $code.removeClass("goDown");
      $code.addClass("toScan");
      $code.css("--barCodeOpacity", "0.9");
    }, time);
  });
}

function incorrectCode($code, order){
  requestAnimationFrame(function(){
    setTimeout(function(){
      $code.removeClass("toScan");
      $code.addClass("incorrect");

      requestAnimationFrame(function(){
        setTimeout(function(){
          $code.css("--barCodeOpacity", "0");
          $code.css("--barCodeBlur", "15px");

          requestAnimationFrame(function(){
            setTimeout(function(){
              //if(parseFloat($code.css("opacity")) <= 0.01){
                $code.removeClass("incorrect");
                if(order == 1){scanBarCode2();}
                else{scanBarCode();}
              //}
            }, 750);
          });
        }, 50);
      });
    }, 150);
  });
}

function scanBarCode(){
  if(curBarCodeNum < 11){
    console.log("1: " + curBarCodeNum + ": " + $barCode.text());
    barCodeGoToScan($barCode, 100);
    curBarCodeNum += 1;
    if(curBarCodeNum < 10){barCodeAppear($barCode2, 350);}
    requestAnimationFrame(function(){
      setTimeout(function(){
        if(barCodeCorrect == false){
          incorrectCode($barCode, 1);
        }
      }, 800);
    });
  }
}

function scanBarCode2(){
  if(curBarCodeNum < 11){
    console.log("2: " + curBarCodeNum + ": " + $barCode2.text());
    barCodeGoToScan($barCode2, 100);
    curBarCodeNum += 1;
    if(curBarCodeNum < 11){barCodeAppear($barCode, 350);}
    requestAnimationFrame(function(){
      setTimeout(function(){
        if(barCodeCorrect == false){
          incorrectCode($barCode2, 2);
        }
      }, 800);
    });
  }
}

//paper
var $segment = $(".segment");
var $segment2 = $(".segment2");
var $paper = $(".paper");
var $icon = $(".icon");
var $paperContainer = $(".paperContainer");

function paperAppear(){
  $paperContainer.css("display", "initial");
  $paper.addClass("appear");
  $segment.addClass("appear");
  $segment2.addClass("appear");
  $icon.addClass("appear");
}


//barcode scam whole process
var barCodeCorrect = false;
function scanAnim(){
  $allNotScan.addClass("scan");
  setCloudFlounder();

  twinkleOpa = defaultTwinklwOpa3;
  scrollinstance.options("overflowBehavior.y", "hidden");
  scrollinstance.options("overflowBehavior.x", "hidden");
  //$scan.css("top", $document.scrollTop()+"px");
  
  mouseFollowing = false;
  mouseY = 0.5 * window.innerHeight;
  mouseX = 0.5 * window.innerWidth;

  let t = 0.5*window.innerHeight - 210;
  t = t + scrollinstance.scroll().position.y;
  $block.css("top", t+"px");
  $block.css("display", "initial");

  paperAppear();

  requestAnimationFrame(function(){
    setTimeout(function(){
      // let t = 0.5*window.innerHeight - 210;
      // t = t + scrollinstance.scroll().position.y;
      $scan.css("top", t+"px");
      $scan.css("display", "initial");
    }, 900);
  })

  requestAnimationFrame(function(){
    setTimeout(function(){
      $scan.addClass("svgFilter2");
      redLineAppear();
      barCodeAppear($barCode, 7500);

      requestAnimationFrame(function(){
        setTimeout(function(){
          scanBarCode();
        },9000);
      });
    }, 1000);
  });
}

