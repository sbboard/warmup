let imgNum: number = 0;
let uploadedImages: string[] = [];
let minutes: number = 10;
let timeCalc: number = 0;
let fileTag = <HTMLInputElement>document.getElementById("filetag");
let minPerImg = <HTMLInputElement>document.getElementById("minPerImg");
let currentImg: number = -1;

/////////////
//////START UP
////////////
function changeMinPerImg(input: HTMLInputElement) {
  if (input.value.length > 0) {
    minutes = parseInt(input.value);
    timeCalc = imgNum * parseInt(input.value);
    document.getElementById("totalTime").innerHTML = timeCalc.toString();
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
    timer.innerHTML = `${minutes.toString()}:00`;
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
    timer.innerHTML = secondsDummy.toString();
  }

  let timeBomb = setInterval(downTick, 1000);
  setTimeout(function () {
    clearInterval(timeBomb);
    if (currentImg + 1 != uploadedImages.length) {
      timer.innerHTML = `${minutes.toString()}:00`;
      nextImg();
    } else {
      console.log("that's all of them");
    }
  }, minutes * 60 * 1000);
}

function nextImg() {
  currentImg++;
  let gallery = document.getElementById("galleryImg") as HTMLImageElement;
  gallery.src = uploadedImages[currentImg];
  startTimer();
}
