let mouseX = 0,
    mouseY = 0;

function handleMouseDown(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    switch (e.which) {
        case 1:
            // calc the starting mouse X,Y for the drag
            startX = parseInt(e.clientX - offsetX);
            startY = parseInt(e.clientY - offsetY);

            // set the isDragging flag
            isDown = true;
            break;
        case 2:
            addWaypoint();
            break;
        case 3:
            console.log('Right mouse button is pressed');
            break;
        default:
            console.log('Nothing');
    }
}

function handleMouseUp(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    if (e.wich == 1) {

    }
    // clear the isDragging flag
    isDown = false;
}

function handleMouseOut(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // clear the isDragging flag
    isDown = false;
}

function handleMouseMove(e) {
    // get the current mouse position
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);
    // only do this code if the mouse is being dragged
    if (!isDown) { return; }

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // mouseX = parseInt(e.clientX - offsetX);
    // mouseY = parseInt(e.clientY - offsetY);

    // dx & dy are the distance the mouse has moved since
    // the last mousemove event
    var dx = mouseX - startX;
    var dy = mouseY - startY;

    // reset the vars for next mousemove
    startX = mouseX;
    startY = mouseY;

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

function handleMouseClick(e) {
    // console.log([mouseX, mouseY]);
    // console.log(bodyList);
    let body,
        coord,
        size,
        dist;
    for (i = 0; i < bodyList.length; i++) {
        body = bodyList[i][0];
        coord = bodyList[i][1];
        size = bodyList[i][2];
        dist = Math.sqrt((coord[0] - mouseX) ** 2 + (coord[1] - mouseY) ** 2);
        if (dist < size / 2) {
            // console.log(body.name);
            // console.log({
            //     'name': body.name,
            //     'size': size,
            //     'dist': dist,
            //     'body coords': coord,
            //     'mouse coords': [mouseX, mouseY]
            // });
            dispBodyInfo(body)
        }
    }
}