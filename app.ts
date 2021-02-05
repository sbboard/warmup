let imgNum: number = 0;
let uploadedImages: string[] = [];
let minutes: number = 10;
let timeCalc: number = 0;
let fileTag = <HTMLInputElement>document.getElementById("filetag");
let minPerImg = <HTMLInputElement>document.getElementById("minPerImg");
let currentImg: number = -1;
let nextSFX = document.getElementById("nextSFX") as HTMLAudioElement;
const musicVolume = 0.2;
nextSFX.volume = musicVolume;

/////////////
//////START UP
////////////
function changeMinPerImg(input: HTMLInputElement) {
  if (input.value.length > 0) {
    if (parseInt(input.value) < 1){
        input.value = "1"
    }
    else if(parseInt(input.value) > 25){
        input.value = "25"
    }
    else{
      minutes = parseInt(input.value);
      timeCalc = imgNum * parseInt(input.value);
      document.getElementById("totalTime").innerHTML = timeCalc.toString();
    }
  } else {
    document.getElementById("totalTime").innerHTML = "0";
  }
}

function changeImage(input: HTMLInputElement) {
  if (input.files) {
    //clear images
    document.getElementById("thumbnails").innerHTML = "";
    uploadedImages = [];

    imgNum = input.files.length;
    //go through images
    for (let i = 0; i < input.files.length; i++) {
      let reader = new FileReader();
      reader.onload = function (e) {
        uploadedImages.push(e.target.result as string);
        var newImg = document.createElement("img") as HTMLImageElement;
        newImg.src = e.target.result as string;
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
    let bigImg = document.createElement("img") as HTMLImageElement;
    bigImg.id = "galleryImg";
    document.getElementById("app").appendChild(bigImg);

    //create timer element
    let timer = document.createElement("span") as HTMLDivElement;
    timer.innerHTML = new Date(minutes * 60 * 1000)
      .toISOString()
      .substr(14, 5)
      .toString();
    timer.id = "timer";
    document.getElementById("app").appendChild(timer);

    nextImg();
  } else {
    if (imgNum < 1) {
      alert("Upload Images First");
    } else {
      alert("Timer set to 0");
    }
  }
}

////////////////////
////RUNNING
///////////////////

function startTimer() {
  let timer = document.getElementById("timer");
  let seconds = minutes * 60;
  let secondsDummy = seconds;

  function downTick() {
    secondsDummy = secondsDummy - 1;
    timer.innerHTML = new Date(secondsDummy * 1000)
      .toISOString()
      .substr(14, 5)
      .toString();
  }

  let timeBomb = setInterval(downTick, 1000);
  setTimeout(function () {
    clearInterval(timeBomb);
    if (currentImg + 1 != uploadedImages.length) {
      timer.innerHTML = new Date(minutes * 60 * 1000)
        .toISOString()
        .substr(14, 5)
        .toString();
      nextImg();
    } else {
      document.getElementById("app").innerHTML = "GOOD WARM-UP!";
      let endMusic = document.getElementById("endMusic") as HTMLAudioElement;
      endMusic.volume = musicVolume;
      endMusic.play();
    }
  }, minutes * 60 * 1000);
}

function nextImg() {
  currentImg++;
  let gallery = document.getElementById("galleryImg") as HTMLImageElement;
  gallery.src = uploadedImages[currentImg];
  nextSFX.play();
  startTimer();
}
