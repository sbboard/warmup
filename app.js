var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
    if (currentDown === null)
        return;
    e.preventDefault();
    currentDown.classList.add("dragged");
    changeX(currentDown.dataset.made, btnOpacityOff);
    currentDown.style.left = "".concat(e.clientX - 10, "px");
    currentDown.style.top = "".concat(e.clientY - 10, "px");
}
function arraymove(arr, fromIndex, toIndex) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}
function mouseUp(event) {
    if (currentDown === null)
        return;
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
function renderThumbs() {
    if (!thumbnailsContainer)
        return;
    thumbnailsContainer.innerHTML = "";
    if (uploadedImages.length > 0) {
        uploadedImages.forEach(function (value, index) {
            var thumbWrap = document.createElement("div");
            var newImg = document.createElement("img");
            var newX = document.createElement("img");
            var nameEl = document.createElement("span");
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
            nameEl.innerHTML = value.name;
            nameEl.classList.add("thumbName");
            thumbWrap.appendChild(newX);
            thumbWrap.appendChild(nameEl);
            thumbWrap.appendChild(newImg);
            thumbnailsContainer.appendChild(thumbWrap);
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
    renderImages(newImages);
    input.value = "";
}
function getRandomEntriesFromArray(arr, targetLength) {
    if (targetLength >= arr.length)
        return arr;
    var result = __spreadArray([], arr, true);
    while (result.length > targetLength) {
        var randomIndex = Math.floor(Math.random() * result.length);
        result.splice(randomIndex, 1);
    }
    return result;
}
function chooseImage(input) {
    clearQueue();
    var chooseNumEl = document.querySelector("#chooseNum");
    if (!input.files)
        return;
    var newImages = Array.from(input.files);
    if (newImages.length === 0)
        return;
    if (input.files.length < Number.parseFloat(chooseNumEl.value)) {
        alert("Not enough files selected");
        return;
    }
    var randomImages = getRandomEntriesFromArray(newImages, Number.parseFloat(chooseNumEl.value));
    renderImages(randomImages);
    input.value = "";
}
function renderImages(images) {
    images.forEach(function (file) {
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
}
var copy = {
    pause: "Pause Timer",
    start: "Start Timer",
    skip: "Skip",
    finish: "Finish"
};
function startApp() {
    if (timeCalc <= 0)
        return;
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
    timer.textContent = new Date(minutes * 60 * 1000).toISOString().substr(14, 5);
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
    skipBtn.textContent = copy.skip;
    skipBtn.addEventListener("click", function () { return (skipped = true); });
    appElement.appendChild(skipBtn);
    var timerPause = document.createElement("button");
    timerPause.id = "pause";
    timerPause.textContent = copy.pause;
    timerPause.addEventListener("click", pause);
    appElement.appendChild(timerPause);
    nextImg();
}
var skipped = false;
function pause() {
    var pauseBtn = document.getElementById("pause");
    var skipBtn = document.getElementById("skipBtn");
    paused = !paused;
    pauseBtn.innerHTML = !paused ? copy.pause : copy.start;
    skipBtn.disabled = paused;
    if (!paused)
        startTimer();
}
function playAudio(audioId, volume) {
    var audioElement = document.getElementById(audioId);
    if (!audioElement)
        return;
    audioElement.volume = volume;
    audioElement.play();
}
function startTimer() {
    var timerElement = document.getElementById("timer");
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
    if (!endMusic)
        return;
    endMusic.volume = musicVolume;
    endMusic.play();
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
    if (currentImg + 1 == uploadedImages.length)
        skipBtn.innerHTML = copy.finish;
    if (noTimerLast === true && currentImg + 1 == uploadedImages.length) {
        skipBtn.removeEventListener("click", function () { return (skipped = true); });
        skipBtn.addEventListener("click", finish);
        var pauseBtn = document.getElementById("pause");
        pauseBtn.disabled = true;
    }
    else {
        startTimer();
    }
}
