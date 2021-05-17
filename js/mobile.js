// $("#scene").mousedown(function(e) { handleMouseDown(e); });
// $("#scene").mousemove(function(e) { handleMouseMove(e); });
// $("#scene").mouseup(function(e) { handleMouseUp(e); });
// $("#scene").mouseout(function(e) { handleMouseOut(e); });
// $('#scene').hammer().bind("pan", function(e) {
//     console.log('pan');
//     e.preventDefault();
//     e.stopPropagation();
//     touchX = parseInt(e.clientX - offsetX);
//     touchY = parseInt(e.clientY - offsetY);

//     // mouseX = parseInt(e.clientX - offsetX);
//     // mouseY = parseInt(e.clientY - offsetY);

//     // dx & dy are the distance the mouse has moved since
//     // the last mousemove event
//     var dx = touchX - startX;
//     var dy = touchY - startY;

//     // reset the vars for next mousemove
//     startX = touchX;
//     startY = touchY;

//     // accumulate the net panning done
//     netPanningX += dx;
//     netPanningY += dy;
// });
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    document.write("mobile device");

    $(document).ready(function() {

        let el = document.getElementById('scene');
        let mc = new Hammer(el);


        mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        mc.get('pinch').set({ enable: true });

        mc.on("pinchin", function(e) {
            // console.log(e);
            console.log('pinchin');
            console.log(e);
            // if (e.scale > 0) {
            //     scale += Math.cbrt(scale);
            // } else if (scale > 2) {
            //     scale -= Math.cbrt(scale);
            // }
            // // console.log([mouseX - width / 2, mouseY - height / 2]);
            // netX = e.center.x - width / 2;
            // netY = e.center.y - height / 2;
            // netPanningX -= Math.sign(netX) * Math.sqrt(Math.abs(netX));
            // netPanningY -= Math.sign(netY) * Math.sqrt(Math.abs(netY));
        });

        mc.on("panstart", function(e) {
            // console.log(e);
            console.log('panstart');
            handlePanStart(e);
        });
        mc.on("panend", function(e) {
            // console.log(e);
            console.log('panend');
            handlePanEnd(e);
        });
        mc.on("panmove", function(e) {
            // console.log(e);
            console.log('panmove');
            handlePanMove(e);
        });

        mc.on("press", function(e) {
            // console.log(e);
            console.log('press');
            addWaypointTouch(e);
        });

    });

}

function handlePanStart(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    // calc the starting mouse X,Y for the drag
    startX = parseInt(e.deltaX - offsetX);
    startY = parseInt(e.deltaY - offsetY);

    // set the isDragging flag
    isDown = true;
}

function handlePanEnd(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    // clear the isDragging flag
    isDown = false;
}

function handlePanMove(e) {
    // get the current mouse position
    touchX = parseInt(e.deltaX - offsetX);
    touchY = parseInt(e.deltaY - offsetY);
    // only do this code if the mouse is being dragged
    if (!isDown) { return; }

    // tell the browser we're handling this event
    e.preventDefault();

    // mouseX = parseInt(e.clientX - offsetX);
    // mouseY = parseInt(e.clientY - offsetY);

    // dx & dy are the distance the mouse has moved since
    // the last mousemove event
    var dx = touchX - startX;
    var dy = touchY - startY;

    // reset the vars for next mousemove
    startX = touchX;
    startY = touchY;

    // accumulate the net panning done
    netPanningX += dx;
    netPanningY += dy;
    // $results.text('Net change in panning: x:' + netPanningX + 'px, y:' + netPanningY + 'px');

    // display the horizontal & vertical reference lines
    // The horizontal line is offset leftward or rightward by netPanningX
    // The vertical line is offset upward or downward by netPanningY
    // for (var x = -50; x < 50; x++) { ctx.fillText(x, x * 20 + netPanningX, ch / 2); }
    // for (var y = -50; y < 50; y++) { ctx.fillText(y, cw / 2, y * 20 + netPanningY); }
    // console.log([netPanningX, netPanningY]);
}

function addWaypointTouch(e) {
    let coordX = (e.center.x - width / 2 - netPanningX) / scale;
    let coordY = (e.center.y - height / 2 - netPanningY) / scale;
    waypoints.push([coordX, coordY])
}