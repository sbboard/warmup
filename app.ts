let imgNum: number = 0;
let uploadedImages: UploadImg[] = [];
let minutes: number = 10;
let minutesDupe: number = 10;
let timeCalc: number = 0;
let fileTag = <HTMLInputElement>document.getElementById("filetag");
let minPerImg = <HTMLInputElement>document.getElementById("minPerImg");
let currentImg: number = -1;
let nextSFX = document.getElementById("nextSFX") as HTMLAudioElement;
const musicVolume = 0.2;
nextSFX.volume = musicVolume;
let paused: boolean = false;
let timeLeft: number = 0;
let noTimerLast: boolean = false;
const btnOpacityOff: number = 0;

type UploadImg = {
  name: string;
  blob: string;
};

/////////////
//////START UP
////////////
function changeMinPerImg(input: HTMLInputElement) {
  if (input.value.length > 0) {
    if (parseInt(input.value) < 1) {
      input.value = "1";
    } else if (parseInt(input.value) > 25) {
      input.value = "25";
    } else {
      minutes = parseInt(input.value);
      minutesDupe = parseInt(input.value);
      timeCalc = imgNum * parseInt(input.value);
      document.getElementById("totalTime").innerHTML = timeCalc.toString();
    }
  } else {
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

function changePauseEnd(input: HTMLInputElement) {
  noTimerLast = input.checked;
}

let currentDown: HTMLElement = null;

window.addEventListener("mousemove", moving);
window.addEventListener("mouseup", mouseUp);

function moving(e: MouseEvent) {
  if (currentDown != null) {
    e.preventDefault();
    currentDown.classList.add("dragged");
    changeX(currentDown.dataset.made, btnOpacityOff);
    currentDown.style.left = `${e.clientX - 10}px`;
    currentDown.style.top = `${e.clientY - 10}px`;
  }
}

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function mouseUp(event: MouseEvent) {
  if (currentDown != null) {
    let currentDownNum = parseInt(currentDown.dataset.made);
    currentDown.classList.remove("dragged");
    currentDown = null;
    let clientX = event.clientX;
    //get list of elements
    for (let i = 0; uploadedImages.length > i; i++) {
      if (i != currentDownNum) {
        let currentElm = document.querySelectorAll(
          `[data-made="${i.toString()}"]`
        )[0];
        let elmBox = currentElm.getBoundingClientRect();
        if (elmBox.right > clientX) {
          arraymove(uploadedImages, currentDownNum, i);
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
  uploadedImages.map((value: UploadImg, index) => {
    var newImg = document.createElement("img") as HTMLImageElement;
    let newX = document.createElement("img") as HTMLImageElement;
    newImg.src = value.blob;
    newImg.dataset.made = index.toString();
    newImg.onmouseenter = () => {
      if (currentDown === null) {
        changeX(index, "1");
      }
    };
    newImg.onmouseout = () => {
      changeX(index, btnOpacityOff);
    };
    newImg.onmousedown = () => {
      currentDown = event.target as HTMLElement;
    };
    newImg.onmousemove = () => moving(event as MouseEvent);
    newX.src = "./x-btn.png";
    newX.dataset.btnno = index.toString();
    newX.classList.add("xBtn");
    newX.onclick = () => killThumb(index);
    newX.onmouseenter = () => {
      if (currentDown === null) {
        changeX(index, "1");
      }
    };
    newX.onmouseout = () => {
      changeX(index, btnOpacityOff);
    };
    document.getElementById("thumbnails").appendChild(newX);
    document.getElementById("thumbnails").appendChild(newImg);
  });
}

function changeX(number, value) {
  let matchingX = document.querySelectorAll(
    `[data-btnno="${number.toString()}"]`
  )[0] as HTMLImageElement;
  matchingX.style.opacity = value;
}

function killThumb(number) {
  uploadedImages.splice(number, 1);
  document.getElementById("queueNum").innerHTML =
    uploadedImages.length.toString();
  imgNum = uploadedImages.length;
  changeMinPerImg(minPerImg);
  renderThumbs();
}

function changeImage(input: HTMLInputElement) {
  if (input.files) {
    imgNum += input.files.length;
    //go through images
    for (let i = 0; i < input.files.length; i++) {
      let reader = new FileReader();
      let fileName = input.files[i].name;
      reader.onload = function (e) {
        uploadedImages.push({
          name: fileName,
          blob: e.target.result as string,
        });
        renderThumbs();
      };
      reader.readAsDataURL(input.files[i]);
    }
    document.getElementById("queueNum").innerHTML = imgNum.toString();
    changeMinPerImg(minPerImg);
    input.value = "";
  }
}

///////////////
//////PRESS START
//////////////

function startApp() {
  if (timeCalc > 0) {
    window.removeEventListener("mousemove", moving);
    window.removeEventListener("mouseup", mouseUp);

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

    //create name element
    let imgName = document.createElement("span") as HTMLDivElement;
    imgName.id = "imgName";
    document.getElementById("app").appendChild(imgName);

    //create count element
    let count = document.createElement("span") as HTMLDivElement;
    count.innerHTML = `${currentImg + 1}/${uploadedImages.length}`;
    count.id = "theCount";
    document.getElementById("app").appendChild(count);

    //create skip button
    let skipBtn = document.createElement("button") as HTMLButtonElement;
    skipBtn.innerHTML = "skip";
    skipBtn.addEventListener("click", skipImg);
    skipBtn.id = "skipBtn";
    document.getElementById("app").appendChild(skipBtn);

    //create add 5 minutes button
    let addFiveMin = document.createElement("button") as HTMLButtonElement;
    addFiveMin.innerHTML = "pause timer";
    addFiveMin.addEventListener("click", addFive);
    addFiveMin.id = "addFive";
    document.getElementById("app").appendChild(addFiveMin);

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

let skipped: boolean = false;

function skipImg() {
  skipped = true;
}

function addFive() {
  let fiveBtn = document.getElementById("addFive") as HTMLButtonElement;
  let skipBtn = document.getElementById("skipBtn") as HTMLButtonElement;
  if (paused == false) {
    paused = true;
    fiveBtn.innerHTML = "start timer";
    fiveBtn.disabled = true;
    skipBtn.disabled = true;
  } else {
    startTimer();
    paused = false;
    fiveBtn.innerHTML = "pause timer";
    fiveBtn.disabled = true;
    skipBtn.disabled = false;
  }
}

function startTimer() {
  let timer = document.getElementById("timer");
  let seconds = minutes * 60;
  let secondsDummy = seconds;

  //runs every second
  function downTick() {
    let fiveBtn = document.getElementById("addFive") as HTMLButtonElement;
    fiveBtn.disabled = false;
    //if it's not skipped
    if (skipped == false) {
      //check if any minutes have been added
      if (paused == true) {
        minutes = secondsDummy / 60;
        clearInterval(timeBomb);
      } else {
        secondsDummy = secondsDummy - 1;
        timer.innerHTML = new Date(secondsDummy * 1000)
          .toISOString()
          .substr(14, 5)
          .toString();

        if (secondsDummy == 60) {
          let minuteWarning = document.getElementById(
            "oneMin"
          ) as HTMLAudioElement;
          minuteWarning.volume = musicVolume;
          minuteWarning.play();
        } else if (secondsDummy <= 3 && secondsDummy != 0) {
          let tok = document.getElementById("tok") as HTMLAudioElement;
          tok.volume = musicVolume;
          tok.play();
        }
      }
    }
    //if skipped it triggered
    else {
      skipped = false;
      explosion();
    }
    if (secondsDummy == 0) {
      explosion();
    }
  }

  let timeBomb = setInterval(downTick, 1000);

  function timerOut() {
    if (currentImg + 1 != uploadedImages.length) {
      timer.innerHTML = new Date(minutes * 60 * 1000)
        .toISOString()
        .substr(14, 5)
        .toString();
      nextImg();
    } else {
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
  let endScreen = document.createElement("div");
  endScreen.id = "endScreen";
  endScreen.innerHTML = "GOOD WARM-UP!";
  document.getElementById("app").innerHTML = "";
  document.getElementById("app").appendChild(endScreen);
  let endMusic = document.getElementById("endMusic") as HTMLAudioElement;
  endMusic.volume = musicVolume;
  endMusic.play();
}

function nextImg() {
  currentImg++;

  let count = document.getElementById("theCount") as HTMLSpanElement;
  let skipBtn = document.getElementById("skipBtn") as HTMLButtonElement;
  let theNowImg: UploadImg = uploadedImages[currentImg];
  count.innerHTML = `${currentImg + 1}/${uploadedImages.length}`;

  let gallery = document.getElementById("galleryImg") as HTMLImageElement;
  let imgName = document.getElementById("imgName") as HTMLImageElement;
  gallery.src = theNowImg.blob;
  imgName.innerHTML = theNowImg.name;
  nextSFX.play();
  if (currentImg + 1 == uploadedImages.length) {
    skipBtn.innerHTML = "finish";
  }
  if (noTimerLast === true && currentImg + 1 == uploadedImages.length) {
    skipBtn.removeEventListener("click", skipImg);
    skipBtn.addEventListener("click", finish);
    let fiveBtn = document.getElementById("addFive") as HTMLButtonElement;
    fiveBtn.disabled = true;
  } else {
    startTimer();
  }
}
