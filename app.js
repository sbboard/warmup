var imgNum = 0;
var uploadedImages;
var timeCalc = 0;
var fileTag = document.getElementById("filetag");
var minPerImg = document.getElementById("minPerImg");
function changeMinPerImg(input) {
    if (input.value.length > 0) {
        timeCalc = imgNum * parseInt(input.value);
        document.getElementById("totalTime").innerHTML = timeCalc.toString();
    }
    else {
        document.getElementById("totalTime").innerHTML = "0";
    }
}
function changeImage(input) {
    if (input.files) {
        document.getElementById("thumbnails").innerHTML = "";
        imgNum = input.files.length;
        //go through images
        for (var i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function (e) {
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
        console.log("YES");
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
