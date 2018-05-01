function sleep(n) {
    var promise = new Promise((resolve, reject) => {
        setTimeout(_ => {
            resolve(56);
        }, n);
    });

    return promise;
}

async function looper() {
    var sum = 0;
    for (var i = 0; i <5; i++) {
        console.log(i);
        sum+=i;
        await sleep(300);
    }
    return sum;
}

async function shiviMain() {
    console.log('hello world');
    // var sum = await looper();
    // console.log(`The sum is ${sum}`);
    var arr2 = [4, 5, 6, ...(false ? [7] : [])];
    var arr3 = [4, 5, 6];
    console.log(arr2);
    console.log(arr3);
}

window.onload = function() {
    // shiviMain();
    // return;

    var canvas;
    var ctx;

    var canvasLeft;
    var canvasRight;

    var prevX = 0, currX = 0;
    var prevY = 0; currY = 0;

    var thickness = 5;

    var drawingColor = "black";

    var mouseClicked = false;

    var pointsArr = [];
    var coordinatesArr = [];

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    var lower = 300, upper = 1000;
    var increment;

    var coordinatesMap = [];

    var soundLength = 50;

    init();

    function init() {
        canvas = document.getElementById("myCanvas");
        ctx = canvas.getContext("2d");

        increment = (upper - lower) / canvas.height;

        canvasLeft = canvas.offsetLeft;
        canvasTop = canvas.offsetTop;

        canvas.addEventListener("mousedown", function(event) {
            findxy("mousedown", event);
        });

        canvas.addEventListener("mousemove", function(event) {
            findxy("mousemove", event);
        });

        canvas.addEventListener("mouseup", function(event) {
            findxy("mouseup", event);
        });

        canvas.addEventListener("mouseleave", function(event) {
            findxy("mouseleave", event);
        });

        canvas.addEventListener("mouseenter", function(event) {
            findxy("mouseenter", event);
        });
    }

    function findxy(s, event) {
        if (s == "mousedown") {
            prevX = currX;
            prevY = currY;
            currX = event.clientX - canvasLeft;
            currY = event.clientY - canvasTop;
            mouseClicked = true;
            drawSquare();
            pointsArr.push(currX, currY);
            coordinatesArr.push({x:currX, y:currY});
        }
        if (s == "mousemove") {
            if (mouseClicked) {
                prevX = currX;
                prevY = currY;
                currX = event.clientX - canvasLeft;
                currY = event.clientY - canvasTop;
                draw();
                pointsArr.push(currX, currY);
                coordinatesArr.push({x:currX, y:currY});
            }
        }
        if ((s == "mouseup") || (s == "mouseleave")) {
            mouseClicked = false;
        }
    }

    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = drawingColor;
        ctx.lineWidth = thickness;
        ctx.stroke();
    }

    function drawSquare() {
        ctx.beginPath();
        ctx.fillStyle = drawingColor;
        ctx.fillRect(currX-thickness/2, currY-thickness/2, thickness, thickness);
    }

    function organizeCoordinates(coordinatesArr) {
        if (coordinatesArr.length == 0) {
            return coordinatesArr;
        }

        coordinatesMap = [];

        var currX = coordinatesArr[0].x;
        var currYArr = [];
        for (i = 0; i < coordinatesArr.length; i++) {

            if (coordinatesArr[i].x == currX) {
                currYArr.push(coordinatesArr[i].y);
            } else {
                coordinatesMap.push({x: currX, y: currYArr});
                currX = coordinatesArr[i].x;
                currYArr = [];
                i--;
            }

        }
        coordinatesMap.push({x: currX, y: currYArr});
        return coordinatesMap;
    }

    function includesX(coordinates, x) {
        for (i = 0; i < coordinates.length; i++) {
            if (coordinates[i].x == x) {
                return true;
            }
        }
        return false;
    }

    function playMusicFromIndex(i) {
        if (i > console.width) {
            return;
        } else if (includesX(coordinatesMap, i)) {
            setTimeout(function() {
                playAllNotes(getYWithX(coordinatesMap, i));
                playMusicFromIndex(i + 1);
            }, soundLength);
        } else {
            setTimeout(function() {
                playMusicFromIndex(i + 1);
            }, soundLength);
        }
    }

    function getYWithX(coordinates, x) {
        var c = coordinates.find(function(arr) {
            return arr.x == x;
        });
        return c.y;
    }

    function playAllNotes(notes) {
        for (i = 0; i < notes.length; i++) {
            var frequency = lower + increment*(canvas.height - 1 - notes[i]);
            playNote(frequency, soundLength);
        }
    }

    function sortCoordinates(coordinatesArr) {
        coordinatesArr.sort(function(a, b) {
            return a.x - b.x;
        });
        return coordinatesArr;
    }

    function playNote(frequency, duration) {
        // create Oscillator node
        var oscillator = audioCtx.createOscillator();

        oscillator.type = 'square';
        oscillator.frequency.value = frequency; // value in hertz
        oscillator.connect(audioCtx.destination);
        oscillator.start();

        setTimeout(function(){
            oscillator.stop();
        }, duration);
    }

    function playMusic() {
        playMusicFromIndex(0);
    }

    var playButton = document.getElementById("playButton");
    playButton.onclick = function() {
        coordinatesArr = sortCoordinates(coordinatesArr);
        coordinatesMap = organizeCoordinates(coordinatesArr);
        console.log(JSON.stringify(coordinatesMap));
        playMusic();
    }

    var clearButton = document.getElementById("clearButton");
    clearButton.onclick = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pointsArr.length = 0;
        coordinatesArr.length = 0;
    }

    var printButton = document.getElementById("printButton");
    printButton.onclick = function() {
        coordinatesArr = sortCoordinates(coordinatesArr);
        coordinatesMap = organizeCoordinates(coordinatesArr);
        console.log(JSON.stringify(coordinatesMap));
    }
}