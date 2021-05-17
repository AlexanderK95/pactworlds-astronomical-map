class Orbit {
    constructor(name, r, year = 1, e = 0, i = 0, an = 0, offset = 0, info = {}) { //time for orbit(days), major semi axis (au), excentricity, incline, ascending node
        this.name = name;
        this.r = r;
        this.year = year * 3600 * 24; //time for orbit (orbital period) here in seconds
        this.a = Math.cbrt(G * M * this.year ** 2 / (4 * Math.PI ** 2)) / AE; //major semi axis
        this.e = e; //excentricity (numeric)
        this.ae = this.a * this.e; //distance center-focal point
        this.b = this.a * Math.sqrt(1 - this.e * this.e); //minor semi axis
        this.i = i; //inclination
        this.an = an; //ascending node
        this.rmin = this.a * (1 - this.e); //periapsis
        this.rmax = this.a * (1 + this.e); //apoapsis
        this.focus_x = this.ae * Math.cos(this.an / 180 * Math.PI);
        this.focus_y = -this.ae * Math.sin(this.an / 180 * Math.PI);
        this.offset = offset;
        this.info = info;
    };

    orbitBody() {
        // hide last position drawn
        // context.clearRect(last_x - 10, last_y - 10, 20, 20);


        // 1) find the relative time in the orbit and convert to Radians
        var M = 2.0 * Math.PI * time / this.year + this.offset / 180 * Math.PI;

        // 2) Seed with mean anomaly and solve Kepler's eqn for E
        var u = M; // seed with mean anomoly
        var u_next = 0;
        var loopCount = 0;
        // iterate until within 10-6
        while (loopCount++ < LOOP_LIMIT) {
            // this should always converge in a small number of iterations - but be paranoid
            u_next = u + (M - (u - this.e * Math.sin(u))) / (1 - this.e * Math.cos(u));
            if (Math.abs(u_next - u) < 1E-6)
                break;
            u = u_next;
        }

        // 2) eccentric anomaly is angle from center of ellipse, not focus (where centerObject is). Convert
        // to true anomoly, f - the angle measured from the focus. (see Fig 3.2 in Gravity) 
        var cos_f = (Math.cos(u) - this.e) / (1 - this.e * Math.cos(u));
        var sin_f = (Math.sqrt(1 - this.e * this.e) * Math.sin(u)) / (1 - this.e * Math.cos(u));
        var r = this.a * (1 - this.e * this.e) / (1 + this.e * cos_f);


        // animate
        // var last_x = this.focus_x + r * cos_f;
        // var last_y = this.focus_y + r * sin_f;
        // console.log(r * cos_f, r * sin_f);
        this.planetX = r * cos_f;
        this.planetY = r * sin_f;

        if (this.year == 0) {
            this.planetX = 0;
            this.planetY = 0;
        }
        drawBody(this, "blue");
    }

}

//constants
const G = 6.67430e-11,
    M = 1.988e+30,
    AE = 1.496e+11,
    // EY = 365.256,
    EY = 31 * 12,
    LOOP_LIMIT = 1000,
    COLOR = "#ffffff";

let canvas, ctx, width, height, time, timestep, waypoints, distance, bodyList,
    offsetX, offsetY;

$(document).ready(function() {
    canvas = document.getElementById("scene");
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    time = 0;

    timestep = parseInt($('#timestep').val());

    waypoints = [];
    distance = 0;

    bodyList = [];

    drawScene();

    reOffset();
    window.onscroll = function(e) { reOffset(); }
    window.onresize = function(e) { reOffset(); }

    // listen for mouse events
    $("#scene").mousedown(function(e) { handleMouseDown(e); });
    $("#scene").mousemove(function(e) { handleMouseMove(e); });
    $("#scene").mouseup(function(e) { handleMouseUp(e); });
    $("#scene").mouseout(function(e) { handleMouseOut(e); });
    $('#scene').bind('mousewheel', function(e) {
        if (e.originalEvent.wheelDelta / 120 > 0) {
            scale += Math.cbrt(scale);
        } else if (scale > 2) {
            scale -= Math.cbrt(scale);
        }
        // console.log([mouseX - width / 2, mouseY - height / 2]);
        netX = mouseX - width / 2;
        netY = mouseY - height / 2;
        netPanningX -= Math.sign(netX) * Math.sqrt(Math.abs(netX));
        netPanningY -= Math.sign(netY) * Math.sqrt(Math.abs(netY));
        // console.log(scale);
    });
    $('#scene').on('click', function(e) { handleMouseClick(e); });
    $('.dateSetter').change(function(e) {
        setDate();
    })

    canvas3d = document.getElementById("scene3d");
    ctx3d = canvas.getContext('3d');
    width3d = canvas.width;
    height3d = canvas.height;
})

// account for scrolling
function reOffset() {
    var BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}

// the accumulated horizontal(X) & vertical(Y) panning the user has done in total
var netPanningX = 0;
var netPanningY = 0;
let scale = 30;
// 36   105    85   191    32   145    37    40   282   104   217   347   155   250


function drawScene() {

    ctx.clearRect(0, 0, width, height);

    canvas.width = $(window).width();
    canvas.height = $(window).height();
    width = canvas.width;
    height = canvas.height;
    //Set background color of canvas
    // ctx.fillStyle = 'none';
    // ctx.fillRect(0, 0, width, height); //"ClearRect" by painting background color	

    //     //render Sun at center
    // let sunImg = document.getElementById('sun');
    // console.log([sunImg.width, sunImg.height]);
    // ctx.beginPath();
    // ctx.arc(width / 2 + netPanningX, height / 2 + netPanningY, scale / 7, 0, 2 * Math.PI, true);
    // ctx.fillStyle = 'yellow';
    // ctx.fill();
    // ctx.closePath();
    // ctx.drawImage(sunImg, width / 2 + netPanningX - scale / 4, height / 2 + netPanningY - scale / 4, scale / 2, (sunImg.height / sunImg.width) * scale / 2);

    // console.log('start plotting');
    bodyList = [];
    orbits.forEach(orbit => {
        // console.log(orbit);

        let shift = [orbit.ae * Math.cos(orbit.an / 180 * Math.PI), -orbit.ae * Math.sin(orbit.an / 180 * Math.PI)];

        ctx.beginPath();
        ctx.ellipse(width / 2 + netPanningX + shift[0] * scale, height / 2 + netPanningY + shift[1] * scale, orbit.a * scale, orbit.b * scale, -orbit.an / 180 * Math.PI, 0, 2 * Math.PI);
        ctx.strokeStyle = "#00334d";
        ctx.stroke();

        orbit.orbitBody();
        time = time + parseInt($('#timestep').val()) ** 3 / 10000;
    })

    drawWaypoints();
    dispDate();
    setTimeout(drawScene, 10);
    // console.log('done');

}




// mouse drag related variables
var isDown = false;
var startX, startY;



// just for demo: display the accumulated panning
// var $results=$('#results');

// draw the numbered horizontal & vertical reference lines
// for(var x=0;x<100;x++){ ctx.fillText(x,x*20,ch/2); }
// for(var y=-50;y<50;y++){ ctx.fillText(y,cw/2,y*20); }




function drawBody(planet, color) {
    let [finalX, finalY] = rotate(width / 2, height / 2, width / 2 + planet.planetX * scale, height / 2 + planet.planetY * scale, planet.an - 180)
        // console.log([x / AE, y / AE]);
        // ctx.beginPath();
        // ctx.arc(finalX + netPanningX, finalY + netPanningY, 2 + scale / 15, 0, 2 * Math.PI, true);
        // ctx.fillStyle = color;
        // ctx.fill();
        // ctx.closePath();
    let size = scale ** 0.8 * planet.r + 5;
    let imageObj = document.getElementById(planet.name.toLowerCase());
    ctx.drawImage(imageObj, finalX + netPanningX - size / 2, finalY + netPanningY - size / 2, size, size * imageObj.height / imageObj.width);
    bodyList.push([planet, [finalX + netPanningX, finalY + netPanningY], size]);
}


function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * (angle),
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function pause() {
    $('#timestep').val(0);
    let currTime = Math.abs(time),
        y = currTime / (12 * 31 * 24 * 3600),
        m = (currTime % (12 * 31 * 24 * 3600)) / (31 * 24 * 3600),
        d = ((currTime % (12 * 31 * 24 * 3600)) % (31 * 24 * 3600)) / (24 * 3600),
        prefix = ['BG', '', 'AG'];
    $('#date').text(sprintf('%s %i.%i.%i', prefix[Math.sign(time) + 1], y, m + 1, d + 1));
    $('#year').val(Math.floor(y));
    $('#month').val(Math.floor(m) + 1);
    $('#day').val(Math.floor(d) + 1);
}

function setDate() {
    let y = $('#year').val() ? $('#year').val() : 0,
        m = $('#month').val() ? $('#month').val() : 0,
        d = $('#day').val() ? $('#day').val() : 0,
        seconds = y * 12 * 31 * 24 * 3600 + (m - 1) * 31 * 24 * 3600 + (d - 1) * 24 * 3600;
    time = seconds;
    $('#timestep').val(0);
}

function dispDate() {
    let currTime = Math.abs(time),
        y = currTime / (12 * 31 * 24 * 3600),
        m = (currTime % (12 * 31 * 24 * 3600)) / (31 * 24 * 3600),
        d = ((currTime % (12 * 31 * 24 * 3600)) % (31 * 24 * 3600)) / (24 * 3600),
        prefix = ['BG', '', 'AG'];
    $('#date').text(sprintf('%s %i.%02i.%02i', prefix[Math.sign(time) + 1], y, m + 1, d + 1));
    // $('#year').val(Math.floor(y));
    // $('#month').val(Math.floor(m));
    // $('#day').val(Math.floor(d));
}


function addWaypoint() {
    let coordX = (mouseX - width / 2 - netPanningX) / scale;
    let coordY = (mouseY - height / 2 - netPanningY) / scale;
    waypoints.push([coordX, coordY])
}

function drawWaypoints() {
    distance = 0;
    $('#waypoints').text("");
    if (waypoints.length == 0) { return; }
    for (i = 0; i < waypoints.length; i++) {
        x = width / 2 + netPanningX + waypoints[i][0] * scale;
        y = height / 2 + netPanningY + waypoints[i][1] * scale;
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 15);
        ctx.lineTo(x + 15, y + 15);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.moveTo(x + 15, y - 15);
        ctx.lineTo(x - 15, y + 15);
        ctx.stroke();
        ctx.closePath();
        $('#waypoints').append(sprintf('%.3fAE | %.3fAE <br>', waypoints[i][0], waypoints[i][1]));

        if (i > 0) {
            lastX = width / 2 + netPanningX + waypoints[i - 1][0] * scale;
            lastY = height / 2 + netPanningY + waypoints[i - 1][1] * scale;
            distance += Math.sqrt((waypoints[i][0] - waypoints[i - 1][0]) ** 2 + (waypoints[i][1] - waypoints[i - 1][1]) ** 2);
            $('#distance').text(sprintf('%.3f AE', distance));
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "grey";
            ctx.stroke();
            ctx.closePath();
        }
    }

}


function calcTravelTime() {
    let check = $('#skillcheck').val() ? $('#skillcheck').val() : 0,
        t = Math.sqrt(distance) + (2.3 + Math.log(3 / check)) * Math.sqrt(distance);
    t += Math.random() * distance * check ** -0.8 * 0.7;
    let d = Math.floor(t),
        h = (t - d) * 24;

    $('#duration').text(sprintf('%i Tage %i Stunden', d, h));


    // y ^ 0.5 + (2.3 + log(center. / x)) * sqrt(y)
}

function dispBodyInfo(body) {
    // console.log(body);
    $('#bodyInfo').show();
    $('#planetName').text(body.name.toUpperCase());
    $('#planetImg').attr('src', 'assets/details/' + body.name.toLowerCase() + '.png').width(200);
    $('#planetAlias').text(body.info.alias);
    $('#planetDiameter').text(body.info.diameter);
    $('#planetMass').text(body.info.mass);
    $('#planetGravity').text(body.info.gravity);
    $('#planetAtmosphere').text(body.info.atmosphere);
    $('#planetDay').text(body.info.day);
    $('#planetYear').text(body.info.year);
}