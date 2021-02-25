var imgNum = 0;
var uploadedImages = [];
var minutes = 10;
var timeCalc = 0;
var fileTag = document.getElementById("filetag");
var minPerImg = document.getElementById("minPerImg");
var currentImg = -1;
var nextSFX = document.getElementById("nextSFX");
var musicVolume = 0.2;
nextSFX.volume = musicVolume;
/////////////
//////START UP
////////////
function changeMinPerImg(input) {
    if (input.value.length > 0) {
        if (parseInt(input.value) < 1) {
            input.value = "1";
        }
        else if (parseInt(input.value) > 25) {
            input.value = "25";
        }
        else {
            minutes = parseInt(input.value);
            timeCalc = imgNum * parseInt(input.value);
            document.getElementById("totalTime").innerHTML = timeCalc.toString();
        }
    }
    else {
        document.getElementById("totalTime").innerHTML = "0";
    }
}
function changeImage(input) {
    if (input.files) {
        //clear images
        document.getElementById("thumbnails").innerHTML = "";
        uploadedImages = [];
        imgNum = input.files.length;
        //go through images
        for (var i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function (e) {
                uploadedImages.push(e.target.result);
                var newImg = document.createElement("img");
                newImg.src = e.target.result;
                document.getElementById("thumbnails").appendChild(newImg);
            };
            reader.readAsDataURL(input.files[i]);
        }
        document.getElementById("queueNum").innerHTML = imgNum.toString();
        changeMinPerImg(minPerImg);
    }
}
function startApp() {
    if (timeCalc > 0) {
        //clear app
        document.getElementById("app").innerHTML = "";
        //create image element
        var bigImg = document.createElement("img");
        bigImg.id = "galleryImg";
        document.getElementById("app").appendChild(bigImg);
        //create timer element
        var timer = document.createElement("span");
        timer.innerHTML = new Date(minutes * 60 * 1000)
            .toISOString()
            .substr(14, 5)
            .toString();
        timer.id = "timer";
        document.getElementById("app").appendChild(timer);
        //create count element
        var count = document.createElement("span");
        count.innerHTML = currentImg + 1 + "/" + uploadedImages.length;
        count.id = "theCount";
        document.getElementById("app").appendChild(count);
        //create skip button
        var skipBtn = document.createElement("button");
        skipBtn.innerHTML = "skip";
        skipBtn.addEventListener("click", skipImg);
        skipBtn.id = "skipBtn";
        document.getElementById("app").appendChild(skipBtn);
        nextImg();
    }
    else {
        if (imgNum < 1) {
            alert("Upload Images First");
        }
        else {
            alert("Timer set to 0");
        }
    }
}
////////////////////
////RUNNING
///////////////////
var skipped = false;
function skipImg() {
    skipped = true;
}
function startTimer() {
    var timer = document.getElementById("timer");
    var seconds = minutes * 60;
    var secondsDummy = seconds;
    //runs every second
    function downTick() {
        if (skipped == false) {
            secondsDummy = secondsDummy - 1;
            timer.innerHTML = new Date(secondsDummy * 1000)
                .toISOString()
                .substr(14, 5)
                .toString();
            if (secondsDummy == 60) {
                var minuteWarning = document.getElementById("oneMin");
                minuteWarning.volume = musicVolume;
                minuteWarning.play();
            }
            else if (secondsDummy <= 3 && secondsDummy != 0) {
                var tok = document.getElementById("tok");
                tok.volume = musicVolume;
                tok.play();
            }
        }
        else {
            skipped = false;
            clearInterval(timeBomb);
            clearTimeout(explosion);
            timerOut();
        }
    }
    var timeBomb = setInterval(downTick, 1000);
    function timerOut() {
        if (currentImg + 1 != uploadedImages.length) {
            timer.innerHTML = new Date(minutes * 60 * 1000)
                .toISOString()
                .substr(14, 5)
                .toString();
            nextImg();
        }
        else {
            var endScreen = document.createElement("div");
            endScreen.id = "endScreen";
            endScreen.innerHTML = "GOOD WARM-UP!";
            document.getElementById("app").innerHTML = "";
            document.getElementById("app").appendChild(endScreen);
            var endMusic = document.getElementById("endMusic");
            endMusic.volume = musicVolume;
            endMusic.play();
        }
    }
    //runs after timer has run out
    var explosion = setTimeout(function () {
        clearInterval(timeBomb);
        timerOut();
    }, minutes * 60 * 1000);
}
function nextImg() {
    currentImg++;
    var count = document.getElementById("theCount");
    count.innerHTML = currentImg + 1 + "/" + uploadedImages.length;
    var gallery = document.getElementById("galleryImg");
    gallery.src = uploadedImages[currentImg];
    nextSFX.play();
    startTimer();
}
