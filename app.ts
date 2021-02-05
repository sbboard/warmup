let imgNum: number = 1;

function changeMinPerImg(input: HTMLInputElement) {
  if (input.value.length > 0) {
    let timeCalc = imgNum * parseInt(input.value);
    document.getElementById("totalTime").innerHTML = timeCalc.toString();
  } else {
    document.getElementById("totalTime").innerHTML = "0";
  }
}
