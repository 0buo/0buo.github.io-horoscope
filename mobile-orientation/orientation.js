var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}


function askOrientationPermission(){
    if(!permissionAsked){
        permissionAsked = true;

        c_log('asking permission......<br>');
        if (typeof(DeviceOrientationEvent) !== "undefined" && 
            typeof(DeviceOrientationEvent.requestPermission) === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        c_log(`access granted<br>`);
                        window.addEventListener(`deviceorientation`, orientationHandle);                     
                    }
                })
                .catch((error) => {
                    c_log(`${error}<br>`);
                } );
        }
        else {
            c_log(`no ask permission function!<br>`)
        }

        
    }
    else{
        window.removeEventListener(`touchstart`, askOrientationPermission);
    }
}


const pBeta = document.getElementById('beta');
const pGamma = document.getElementById('gamma');
const cons = document.getElementById('console');
const button = document.getElementById('request');

const pTB = document.getElementById('tagetBeta');
const pTG = document.getElementById('tagetGamma');

const pX = document.getElementById('tagetX');
const pY = document.getElementById('tagetY');

function constrainOrientation(val, max, min, UP){
    var range = {
        upper: max,
        lower: min,
        subupper: undefined,
        sublower: undefined
    };


    if(max > UP){
        range.upper = UP;
        range.subupper = max - UP;
    }
    else if(min < 0){
        range.lower = 0;
        range.sublower = min + UP;
    }

    
    if(max < UP && min > 0){
        val = Math.max(Math.min(val, range.upper), range.lower);
    }
    else if(max > UP){
        if(val > range.subupper && val < range.lower){
            val = Math.abs(val - range.subupper) < Math.abs(range.lower - val) ? UP + range.subupper : range.lower;
        }
        else if(val >= 0 && val <= range.subupper){
            val = UP + Math.min(val, range.subupper);
        }
        else{
            val = Math.max( Math.min(val, range.upper), range.lower );
        }
    }
    else if(min < 0){
        if(val > range.upper && val < range.sublower){
            val = Math.abs(val - range.upper) < Math.abs(range.sublower - val) ? range.upper : range.sublower - UP;
        }
        else if(val >= range.sublower && val <= UP){
            val = Math.max(val, range.sublower) - UP;
        }
        else{
            val = Math.max( Math.min(val, range.upper), range.lower );
        }
        var bias = UP - (range.upper + (range.sublower - range.upper) / 2) + 0.001;
    }

    return [val, bias];
}

function c_log(str){
    cons.innerHTML += `${str}`;
}

let initialBeta = 0;
let initialGmma = 0;
let initialized = false;
function orientationHandle(e){
    //beta: 0-360; gamma: 0-180
    var beta     = e.beta + 180;
    var gamma    = e.gamma + 90;

    if(!initialized){
        initialized = true;
        initialBeta = beta;
        initialGmma = gamma;
    }

    pBeta.innerHTML = `intial beta: ${initialBeta}`;
    pGamma.innerHTML = `initial gamma: ${initialGmma}`;

    var maxBeta = initialBeta + 90;
    var minBeta = initialBeta - 90;
    var maxGamma = initialGmma + 45;
    var minGamma = initialGmma - 45;

    var constrainBeta = constrainOrientation(beta, maxBeta, minBeta, 360);
    var constrainGamma = constrainOrientation(gamma, maxGamma, minGamma, 180);    
    beta = constrainBeta[0];
    gamma = constrainGamma[0];

    var targetBeta = beta >= 0 ? (initialBeta - beta) / initialBeta : (initialBeta - beta) / (initialBeta + constrainBeta[1]);
    var targetGamma = gamma >= 0 ? (initialGmma - gamma) / initialGmma : (initialGmma - gamma) / (initialGmma + constrainGamma[1]);
    // targetBeta *= 2;
    // targetGamma *= 2;

    pTB.innerHTML = `target beta: ${targetBeta}`;
    pTG.innerHTML = `target gamme: ${targetGamma}`;
}

function printMouse(e){
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;

    var targetMX = (halfWidth - e.clientX) / halfWidth;
    var targetMY = (halfHeight - e.clientY) / halfHeight;

    pX.innerHTML = `target x: ${targetMX}`;
    pY.innerHTML = `target y: ${targetMY}`;
}

let permissionAsked = false;
if(isMobile){
    c_log('is mobile <br>');
    window.addEventListener(`click`, askOrientationPermission);
}
window.addEventListener(`mousemove`, printMouse);