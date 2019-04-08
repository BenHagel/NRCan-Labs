var a = 0;
var b = 0;

function setup(){
    var canvasDiv = document.getElementById('sketchParent');
    var widthParentDiv = canvasDiv.offsetWidth;
    var heightParentDiv = canvasDiv.offsetHeight;
    var sketchCanvas = 
        createCanvas(widthParentDiv, heightParentDiv, WEBGL);
    sketchCanvas.parent("sketchParent");
    frameRate(5);
    smooth();
}

function draw(){
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads) {
        return;
    }

    var gp = gamepads[0];
    if(gp){
        if (buttonPressed(gp.buttons[0])) {
            b--;
        }
        else if (buttonPressed(gp.buttons[2])) {
            b++;
        }
        if (buttonPressed(gp.buttons[1])) {
            a++;
        }
        else if (buttonPressed(gp.buttons[3])) {
            a--;
        }
    }
    //console.log(a + '  ' + b);
    background(40);
    //drawNodes();
}

function windowResized(){
    var canvasDiv = document.getElementById('sketchParent');
    var widthParentDiv = canvasDiv.offsetWidth;
    var heightParentDiv = canvasDiv.offsetHeight;
    resizeCanvas(widthParentDiv, heightParentDiv);
}






function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

var gamepads = {};

function gamepadHandler(event, connecting) {
    var gamepad = event.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connecting) {
        gamepads[gamepad.index] = gamepad;
    } else {
        delete gamepads[gamepad.index];
    }
}

window.addEventListener("gamepadconnected", function(e) {
    gamepadHandler(e, true); 
}, false);
window.addEventListener("gamepaddisconnected", function(e) {
     gamepadHandler(e, false); 
}, false);

window.addEventListener("gamepadconnected", function(e) {
    var gp = navigator.getGamepads()[e.gamepad.index];
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        gp.index, gp.id,
        gp.buttons.length, gp.axes.length);
});

var interval;
if (!('ongamepadconnected' in window)) {
    // No gamepad events available, poll instead.
    interval = setInterval(pollGamepads, 500);
}
function pollGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
        if (gp) {
            //gamepadInfo.innerHTML = 
            console.log("Gamepad connected at index " + gp.index + ": " + gp.id +
                ". It has " + gp.buttons.length + " buttons and " + gp.axes.length + " axes.");
            //gameLoop();
            clearInterval(interval);
        }
    }
}

function drawNodes(){
    var expandSize = 56.0;
    var currentDepth = 0;
    var currentHorizonal = 0;
    for(var k = 0;k < localNodes.length;k++){
        ellipse(
            width/2 + 10*currentHorizonal,
            height - 40 - 20*currentDepth, 
            40, 40);

        if(localNodes[k].depth !== currentDepth){
            currentHorizonal = 0;
            currentDepth = localNodes[k].depth;
        }
    }
}

function drawNode(n, ind){
    fill(250, 250, 250);
    noStroke();

}