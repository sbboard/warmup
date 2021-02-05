var imgNum = 0;
var uploadedImages = [];
var minutes = 10;
var timeCalc = 0;
var fileTag = document.getElementById("filetag");
var minPerImg = document.getElementById("minPerImg");
var currentImg = -1;
/////////////
//////START UP
////////////
function changeMinPerImg(input) {
    if (input.value.length > 0) {
        minutes = parseInt(input.value);
        timeCalc = imgNum * parseInt(input.value);
        document.getElementById("totalTime").innerHTML = timeCalc.toString();
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
        timer.innerHTML = minutes.toString() + ":00";
        timer.id = "timer";
        document.getElementById("app").appendChild(timer);
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
function startTimer() {
    var timer = document.getElementById("timer");
    var seconds = minutes * 60;
    var secondsDummy = seconds;
    function downTick() {
        secondsDummy = secondsDummy - 1;
        timer.innerHTML = secondsDummy.toString();
    }
    var timeBomb = setInterval(downTick, 1000);
    setTimeout(function () {
        clearInterval(timeBomb);
        if (currentImg + 1 != uploadedImages.length) {
            timer.innerHTML = minutes.toString() + ":00";
            nextImg();
        }
        else {
            console.log("that's all of them");
        }
    }, minutes * 60 * 1000);
}
function nextImg() {
    currentImg++;
    var gallery = document.getElementById("galleryImg");
    gallery.src = uploadedImages[currentImg];
    startTimer();
}
