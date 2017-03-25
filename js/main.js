var canvas,
    context,
    dragging = false,
    dragStartLocation,
    snapshot,
    rad = 10;


function getCanvasCoordinates(event){
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;

    return{
    	x: x, 
    	y: y
    };
}

function takeSnapshot(){
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot(){
    context.putImageData(snapshot, 0, 0);
}

function drawLine(position){
    context.beginPath();
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
    context.stroke();
}

function drawCircle(position){
    var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
    context.beginPath();
    context.arc(dragStartLocation.x, dragStartLocation.y, radius, 0, 2 * Math.PI, false);
}

function drawPolygon(position, sides, angle){
    var coordinates = [],
        radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2)),
        index = 0;

    for(index = 0; index < sides; index++){
        coordinates.push({x: dragStartLocation.x + radius * Math.cos(angle), y: dragStartLocation.y - radius * Math.sin(angle)});
        angle += (2 * Math.PI) / sides;
    }

    context.beginPath();
    context.moveTo(coordinates[0].x, coordinates[0].y);
    for(index = 1; index < sides; index++){
        context.lineTo(coordinates[index].x, coordinates[index].y);
    }

    context.closePath();
}

function drawFreehand(position){
	if(dragging){
		context.strokeStyle = context.fillStyle;
		//context.lineWidth = rad * 2;
		context.lineTo(position.x, position.y);
		context.stroke();
		context.beginPath();
		context.arc(position.x, position.y, rad, 0, Math.PI * 2);
		//context.arc(dragStartLocation.x, dragStartLocation.y, rad, 0, Math.PI * 2, false)
		context.fill();
		context.beginPath();
		context.moveTo(position.x, position.y);
	}	
}

function draw(position){

    var fillBox = document.getElementById("fillBox"),
        shape = document.querySelector('input[type="radio"][name="shape"]:checked').value,
        polygonSides = document.getElementById("polygonSides").value,
        polygonAngle = document.getElementById("polygonAngle").value,
        lineCap = document.querySelector('input[type="radio"][name="lineCap"]:checked').value;

    context.lineCap = lineCap;

    if(shape === "circle"){
        drawCircle(position);
    }
    if(shape === "line"){
        drawLine(position);
    }

    if(shape === "polygon"){
        drawPolygon(position, polygonSides, polygonAngle * (Math.PI / 180));
    }
    if(shape === "freehand"){
    	drawFreehand(position);
    	//context.beginPath();
    }
    if(fillBox.checked){
        context.fill();
    }
    else{
        context.stroke();
    }
    changeLineWidth();
}

function dragStart(event){
    dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
    takeSnapshot();
    drawFreehand(dragStartLocation);
}

function drag(event){
    var position,
    	shape = document.querySelector('input[type="radio"][name="shape"]:checked').value;
    if (dragging === true) {
    	if(shape != "freehand"){
    		restoreSnapshot();
    	}
        position = getCanvasCoordinates(event);
        draw(position, "polygon");
        draw(position, "freehand");
    }
}

function dragStop(event){
	context.beginPath();
	context.closePath();
	var shape = document.querySelector('input[type="radio"][name="shape"]:checked').value;
    dragging = false;
    
    if(shape != "freehand"){
    	restoreSnapshot();
    }
    var position = getCanvasCoordinates(event);
    draw(position, "polygon");
    context.beginPath();
    context.closePath();
    //draw(position, "freehand"); 
}

/*function changeLineWidth(){
    context.lineWidth = this.value;
    event.stopPropagation();
}*/

function changeLineWidth(){
    var shape = document.querySelector('input[type="radio"][name="shape"]:checked').value;
    if(shape === "freehand")
    {
        context.lineWidth = rad * 2;
    }else{
        context.lineWidth = this.value;
    event.stopPropagation();
    } 
}

function changeFillStyle(){
    context.fillStyle = this.value;
    event.stopPropagation();
}

function changeStrokeStyle(){
    context.strokeStyle = this.value;
    event.stopPropagation();
}

function changeBackgroundColor(){
    context.save();
    context.fillStyle = document.getElementById("backgroundColor").value;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function eraseCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function init(){
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var lineWidth = document.getElementById("lineWidth"),
        fillColor = document.getElementById("fillColor"),
        strokeColor = document.getElementById("strokeColor"),
        canvasColor = document.getElementById("backgroundColor"),
        clearCanvas = document.getElementById("clearCanvas");

    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = lineWidth.value;

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    lineWidth.addEventListener("input", changeLineWidth, false);
    fillColor.addEventListener("input", changeFillStyle, false);
    strokeColor.addEventListener("input", changeStrokeStyle, false);
    canvasColor.addEventListener("input", changeBackgroundColor, false);
    clearCanvas.addEventListener("click", eraseCanvas, false);
}

window.addEventListener('load', init, false);