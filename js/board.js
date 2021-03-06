

var mouse = { 
    click: false,
    move: false,
    pos: {x:0, y:0},
    pos_prev: false
};
// get canvas element and create context
var canvas  = document.getElementById('canvas');
var context = canvas.getContext("2d");
context.lineWidth = 10;
context.strokeStyle="#FFFFFF";
var width   = window.innerWidth;									
var height  = window.innerHeight;
var socket  = io.connect();

// set canvas to 80% browser width/height because of the css
canvas.width = 0.8 * width;
//canvas.height = height;

function changeColor(color){context.strokeStyle=color;}

function clearBoard(){   
    socket.emit("clear");
}

socket.on("clear",()=>{
    context.clearRect(0 ,0 ,canvas.width ,canvas.height);
});

// register mouse event handlers
canvas.onmousedown = function(e){ mouse.click = true; };
document.body.onmouseup = function(e){ mouse.click = false; };

canvas.onmousemove = function(e) {
    // normalize mouse position to range 0.0 - 1.0
    mouse.pos.x = (e.clientX - canvas.offsetLeft) / canvas.width;	//offsetLeft to mark the cursor position respective to canvas not the viewport			
    mouse.pos.y = (e.clientY - canvas.offsetTop) / canvas.height;
    mouse.move = true;
};
// draw line received from server
socket.on('draw_line', function (data) {
    var line = data.line;
    context.strokeStyle = data.color;
    context.beginPath();
    context.moveTo(line[0].x * canvas.width, line[0].y * canvas.height);
    context.lineTo(line[1].x * canvas.width, line[1].y * canvas.height);
    context.stroke();
});

// main loop, running every 25ms
function mainLoop() {
    // check if the user is drawing
    if (teacher && mouse.click && mouse.move && mouse.pos_prev) {
        // send line to to the server
        socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ], color: context.strokeStyle });
        mouse.move = false;
    }
    mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
	setTimeout(mainLoop, 25);
}
mainLoop();