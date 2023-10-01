var appElement = document.querySelector("#app");
var fileTag = document.querySelector("#filetag");
var minPerImg = document.querySelector("#minPerImg");
var nextSFX = document.querySelector("#nextSFX");
var totalTimeElement = document.querySelector("#totalTime");
var clearInput = document.querySelector("#clrQueue");
var startButton = document.querySelector("#startButton");
var numEl = document.querySelector("#queueNum");
var thumbnailsContainer = document.querySelector("#thumbnails");
var uploadedImages = [];
var minutes = 10;
var minutesDupe = 10;
var timeCalc = 0;
var currentImg = -1;
var musicVolume = 0.2;
nextSFX.volume = musicVolume;
var paused = false;
var timeLeft = 0;
var noTimerLast = false;
var btnOpacityOff = 0;
function changeMinPerImg() {
    console.log("changeMinPerImg");
    if (!totalTimeElement)
        return;
    var inputValue = minPerImg.value.trim();
    var inputValueAsNumber = parseInt(inputValue, 10);
    if (inputValue.length === 0 || isNaN(inputValueAsNumber)) {
        totalTimeElement.innerHTML = "0";
        return;
    }
    var clampedValue = Math.min(Math.max(inputValueAsNumber, 1), 25);
    minPerImg.value = clampedValue.toString();
    var minutes = clampedValue;
    timeCalc = uploadedImages.length * minutes;
    totalTimeElement.innerHTML = timeCalc.toString();
}
function updateTimeCalc() { }
function clearQueue() {
    uploadedImages = [];
    if (numEl)
        numEl.innerHTML = uploadedImages.length.toString();
    clearInput.disabled = true;
    startButton.disabled = true;
    if (thumbnailsContainer)
        thumbnailsContainer.innerHTML = "";
    changeMinPerImg();
}
function changePauseEnd(input) {
    noTimerLast = input.checked;
}
var currentDown = null;
window.addEventListener("mousemove", moving);
window.addEventListener("mouseup", mouseUp);
function moving(e) {
    if (currentDown != null) {
        e.preventDefault();
        currentDown.classList.add("dragged");
        changeX(currentDown.dataset.made, btnOpacityOff);
        currentDown.style.left = "".concat(e.clientX - 10, "px");
        currentDown.style.top = "".concat(e.clientY - 10, "px");
    }
}
function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}
function mouseUp(event) {
    if (currentDown !== null) {
        var currentDownNum = parseInt(currentDown.dataset.made || "0", 10);
        currentDown.classList.remove("dragged");
        currentDown = null;
        var clientX = event.clientX;
        for (var i = 0; i < uploadedImages.length; i++) {
            if (i !== currentDownNum) {
                var currentElm = document.querySelector("[data-made=\"".concat(i, "\"]"));
                if (currentElm) {
                    var elmBox = currentElm.getBoundingClientRect();
                    if (elmBox.right > clientX) {
                        arraymove(uploadedImages, currentDownNum, i);
                        renderThumbs();
                        break;
                    }
                }
            }
            if (i === uploadedImages.length - 1) {
                arraymove(uploadedImages, currentDownNum, uploadedImages.length - 1);
                renderThumbs();
            }
        }
    }
}
function renderThumbs() {
    if (!thumbnailsContainer)
        return;
    thumbnailsContainer.innerHTML = "";
    if (uploadedImages.length > 0) {
        uploadedImages.forEach(function (value, index) {
            var newImg = document.createElement("img");
            var newX = document.createElement("img");
            newImg.src = value.blob;
            newImg.dataset.made = index.toString();
            newImg.addEventListener("mouseenter", function () {
                if (currentDown === null)
                    changeX(index, "1");
            });
            newImg.addEventListener("mouseout", function () {
                changeX(index, btnOpacityOff);
            });
            newImg.addEventListener("mousedown", function (event) {
                currentDown = event.target;
            });
            newImg.addEventListener("mousemove", function (event) {
                return moving(event);
            });
            newX.src = "./x-btn.png";
            newX.dataset.btnno = index.toString();
            newX.classList.add("xBtn");
            newX.addEventListener("click", function () { return killThumb(index); });
            newX.addEventListener("mouseenter", function () {
                if (currentDown === null)
                    changeX(index, "1");
            });
            newX.addEventListener("mouseout", function () {
                changeX(index, btnOpacityOff);
            });
            thumbnailsContainer.appendChild(newX);
            thumbnailsContainer.appendChild(newImg);
        });
        clearInput.disabled = false;
        startButton.disabled = false;
        if (numEl)
            numEl.innerHTML = uploadedImages.length.toString();
        changeMinPerImg();
        return;
    }
    clearInput.disabled = true;
    startButton.disabled = true;
}
function changeX(number, value) {
    var matchingX = document.querySelectorAll("[data-btnno=\"".concat(number.toString(), "\"]"))[0];
    matchingX.style.opacity = value;
}
function killThumb(number) {
    if (number < 0 || number >= uploadedImages.length)
        return;
    uploadedImages.splice(number, 1);
    if (numEl)
        numEl.innerHTML = uploadedImages.length.toString();
    renderThumbs();
}
function changeImage(input) {
    if (!input.files)
        return;
    var newImages = Array.from(input.files);
    if (newImages.length === 0)
        return;
    newImages.forEach(function (file) {
        var reader = new FileReader();
        var fileName = file.name;
        reader.onload = function (e) {
            if (e.target) {
                uploadedImages.push({
                    name: fileName,
                    blob: e.target.result
                });
                renderThumbs();
            }
        };
        reader.readAsDataURL(file);
    });
    if (numEl)
        numEl.innerHTML = uploadedImages.length.toString();
    changeMinPerImg();
    input.value = "";
}
function startApp() {
    if (timeCalc > 0) {
        window.removeEventListener("mousemove", moving);
        window.removeEventListener("mouseup", mouseUp);
        if (!appElement)
            return;
        appElement.innerHTML = "";
        var bigImg = document.createElement("img");
        bigImg.id = "galleryImg";
        appElement.appendChild(bigImg);
        var timer = document.createElement("span");
        timer.id = "timer";
        timer.textContent = new Date(minutes * 60 * 1000)
            .toISOString()
            .substr(14, 5);
        appElement.appendChild(timer);
        var imgName = document.createElement("span");
        imgName.id = "imgName";
        appElement.appendChild(imgName);
        var count = document.createElement("span");
        count.id = "theCount";
        count.textContent = "".concat(currentImg + 1, "/").concat(uploadedImages.length);
        appElement.appendChild(count);
        var skipBtn = document.createElement("button");
        skipBtn.id = "skipBtn";
        skipBtn.textContent = "skip";
        skipBtn.addEventListener("click", skipImg);
        appElement.appendChild(skipBtn);
        var addFiveMin = document.createElement("button");
        addFiveMin.id = "addFive";
        addFiveMin.textContent = "pause timer";
        addFiveMin.addEventListener("click", addFive);
        appElement.appendChild(addFiveMin);
        nextImg();
    }
    else {
        if (uploadedImages.length < 1) {
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
function playAudio(audioId, volume) {
    var audioElement = document.getElementById(audioId);
    if (audioElement) {
        audioElement.volume = volume;
        audioElement.play();
    }
}
function startTimer() {
    var timerElement = document.getElementById("timer");
    var fiveBtn = document.getElementById("addFive");
    if (!timerElement)
        return;
    var secondsDummy = minutes * 60;
    function downTick() {
        if (!skipped) {
            if (paused) {
                minutes = secondsDummy / 60;
                clearInterval(timeBomb);
            }
            else {
                secondsDummy--;
                timerElement.innerHTML = new Date(secondsDummy * 1000)
                    .toISOString()
                    .substr(14, 5);
                if (secondsDummy === 60)
                    playAudio("oneMin", musicVolume);
                else if (secondsDummy <= 3 && secondsDummy !== 0)
                    playAudio("tok", musicVolume);
            }
        }
        else {
            skipped = false;
            explosion();
        }
        if (secondsDummy === 0)
            explosion();
    }
    var timeBomb = setInterval(downTick, 1000);
    function timerOut() {
        if (currentImg + 1 !== uploadedImages.length) {
            timerElement.innerHTML = new Date(minutes * 60 * 1000)
                .toISOString()
                .substr(14, 5);
            nextImg();
        }
        else
            finish();
    }
    function explosion() {
        minutes = minutesDupe;
        clearInterval(timeBomb);
        timerOut();
    }
}
function finish() {
    if (!appElement)
        return;
    var endScreen = document.createElement("div");
    endScreen.id = "endScreen";
    endScreen.textContent = "GOOD WARM-UP!";
    appElement.innerHTML = "";
    appElement.appendChild(endScreen);
    var endMusic = document.getElementById("endMusic");
    if (endMusic) {
        endMusic.volume = musicVolume;
        endMusic.play();
    }
}
function nextImg() {
    currentImg++;
    var count = document.getElementById("theCount");
    var skipBtn = document.getElementById("skipBtn");
    var theNowImg = uploadedImages[currentImg];
    count.innerHTML = "".concat(currentImg + 1, "/").concat(uploadedImages.length);
    var gallery = document.getElementById("galleryImg");
    var imgName = document.getElementById("imgName");
    gallery.src = theNowImg.blob;
    imgName.innerHTML = theNowImg.name;
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
