var imgNum = 0;
var uploadedImages = [];
var minutes = 10;
var minutesDupe = 10;
var timeCalc = 0;
var fileTag = document.getElementById("filetag");
var minPerImg = document.getElementById("minPerImg");
var currentImg = -1;
var nextSFX = document.getElementById("nextSFX");
var musicVolume = 0.2;
nextSFX.volume = musicVolume;
var paused = false;
var timeLeft = 0;
var noTimerLast = false;
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
            minutesDupe = parseInt(input.value);
            timeCalc = imgNum * parseInt(input.value);
            document.getElementById("totalTime").innerHTML = timeCalc.toString();
        }
    }
    else {
        document.getElementById("totalTime").innerHTML = "0";
    }
}
function clearQueue() {
    document.getElementById("queueNum").innerHTML = "0";
    uploadedImages = [];
    imgNum = 0;
    document.getElementById("thumbnails").innerHTML = "";
    changeMinPerImg(minPerImg);
}
function changePauseEnd(input) {
    noTimerLast = input.checked;
}
var currentDown;
window.addEventListener("mousemove", moving);
window.addEventListener("mouseup", mouseUp);
function moving(e) {
    if (currentDown != null) {
        e.preventDefault();
        currentDown.classList.add("dragged");
        currentDown.style.left = e.clientX - 10 + "px";
        currentDown.style.top = e.clientY - 10 + "px";
    }
}
function arraymove(arr, fromIndex, toIndex) {
    console.log("WO");
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}
function mouseUp(event) {
    if (currentDown != null) {
        var currentDownNum = parseInt(currentDown.dataset.made);
        currentDown.classList.remove("dragged");
        currentDown = null;
        var clientX = event.clientX;
        for (var i = 0; uploadedImages.length > i; i++) {
            if (i != currentDownNum) {
                var currentElm = document.querySelectorAll("[data-made=\"" + i.toString() + "\"]")[0];
                var elmBox = currentElm.getBoundingClientRect();
                if (elmBox.right > clientX) {
                    if (currentDownNum > i) {
                        arraymove(uploadedImages, currentDownNum, i);
                    }
                    else {
                        arraymove(uploadedImages, currentDownNum, i);
                    }
                    renderThumbs();
                    break;
                }
            }
            if (i == uploadedImages.length - 1) {
                arraymove(uploadedImages, currentDownNum, uploadedImages.length - 1);
                renderThumbs();
            }
        }
    }
}
function renderThumbs() {
    document.getElementById("thumbnails").innerHTML = "";
    uploadedImages.map(function (value, index) {
        var newImg = document.createElement("img");
        newImg.src = value;
        newImg.dataset.made = index.toString();
        newImg.onmousedown = function () {
            currentDown = event.target;
        };
        newImg.onmousemove = function () { return moving(event); };
        document.getElementById("thumbnails").appendChild(newImg);
    });
}
function changeImage(input) {
    if (input.files) {
        imgNum += input.files.length;
        for (var i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function (e) {
                uploadedImages.push(e.target.result);
                renderThumbs();
            };
            reader.readAsDataURL(input.files[i]);
        }
        document.getElementById("queueNum").innerHTML = imgNum.toString();
        changeMinPerImg(minPerImg);
        input.value = "";
    }
}
function startApp() {
    if (timeCalc > 0) {
        window.removeEventListener("mousemove", moving);
        window.removeEventListener("mouseup", mouseUp);
        document.getElementById("app").innerHTML = "";
        var bigImg = document.createElement("img");
        bigImg.id = "galleryImg";
        document.getElementById("app").appendChild(bigImg);
        var timer = document.createElement("span");
        timer.innerHTML = new Date(minutes * 60 * 1000)
            .toISOString()
            .substr(14, 5)
            .toString();
        timer.id = "timer";
        document.getElementById("app").appendChild(timer);
        var count = document.createElement("span");
        count.innerHTML = currentImg + 1 + "/" + uploadedImages.length;
        count.id = "theCount";
        document.getElementById("app").appendChild(count);
        var skipBtn = document.createElement("button");
        skipBtn.innerHTML = "skip";
        skipBtn.addEventListener("click", skipImg);
        skipBtn.id = "skipBtn";
        document.getElementById("app").appendChild(skipBtn);
        var addFiveMin = document.createElement("button");
        addFiveMin.innerHTML = "pause timer";
        addFiveMin.addEventListener("click", addFive);
        addFiveMin.id = "addFive";
        document.getElementById("app").appendChild(addFiveMin);
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
var skipped = false;
function skipImg() {
    skipped = true;
}
function addFive() {
    var fiveBtn = document.getElementById("addFive");
    var skipBtn = document.getElementById("skipBtn");
    if (paused == false) {
        paused = true;
        fiveBtn.innerHTML = "start timer";
        fiveBtn.disabled = true;
        skipBtn.disabled = true;
    }
    else {
        startTimer();
        paused = false;
        fiveBtn.innerHTML = "pause timer";
        fiveBtn.disabled = true;
        skipBtn.disabled = false;
    }
}
function startTimer() {
    var timer = document.getElementById("timer");
    var seconds = minutes * 60;
    var secondsDummy = seconds;
    function downTick() {
        var fiveBtn = document.getElementById("addFive");
        fiveBtn.disabled = false;
        if (skipped == false) {
            if (paused == true) {
                minutes = secondsDummy / 60;
                clearInterval(timeBomb);
            }
            else {
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
        }
        else {
            skipped = false;
            explosion();
        }
        if (secondsDummy == 0) {
            explosion();
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
            finish();
        }
    }
    function explosion() {
        minutes = minutesDupe;
        clearInterval(timeBomb);
        timerOut();
    }
}
function finish() {
    var endScreen = document.createElement("div");
    endScreen.id = "endScreen";
    endScreen.innerHTML = "GOOD WARM-UP!";
    document.getElementById("app").innerHTML = "";
    document.getElementById("app").appendChild(endScreen);
    var endMusic = document.getElementById("endMusic");
    endMusic.volume = musicVolume;
    endMusic.play();
}
function nextImg() {
    currentImg++;
    var count = document.getElementById("theCount");
    var skipBtn = document.getElementById("skipBtn");
    count.innerHTML = currentImg + 1 + "/" + uploadedImages.length;
    var gallery = document.getElementById("galleryImg");
    gallery.src = uploadedImages[currentImg];
    nextSFX.play();
    if (currentImg + 1 == uploadedImages.length) {
        skipBtn.innerHTML = "finish";
    }
    if (noTimerLast === true && currentImg + 1 == uploadedImages.length) {
        skipBtn.removeEventListener("click", skipImg);
        skipBtn.addEventListener("click", finish);
        var fiveBtn = document.getElementById("addFive");
        fiveBtn.disabled = true;
    }
    else {
        startTimer();
    }
}
