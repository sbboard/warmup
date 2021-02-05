var imgNum = 1;
function changeMinPerImg(input) {
    if (input.value.length > 0) {
        var timeCalc = imgNum * parseInt(input.value);
        document.getElementById("totalTime").innerHTML = timeCalc.toString();
    }
    else {
        document.getElementById("totalTime").innerHTML = "0";
    }
}
