const appElement = document.querySelector("#app");
const fileTag = document.querySelector("#filetag") as HTMLInputElement;
const minPerImg = document.querySelector("#minPerImg") as HTMLInputElement;
const nextSFX = document.querySelector("#nextSFX") as HTMLAudioElement;
const totalTimeElement = document.querySelector("#totalTime") as HTMLElement;
const clearInput = document.querySelector("#clrQueue") as HTMLButtonElement;
const startButton = document.querySelector("#startButton") as HTMLButtonElement;
const numEl = document.querySelector("#queueNum");
const thumbnailsContainer = document.querySelector("#thumbnails");

let uploadedImages: UploadImg[] = [];
let minutes: number = 10;
let minutesDupe: number = 10;
let timeCalc: number = 0;
let currentImg: number = -1;
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
function changeMinPerImg() {
  if (!totalTimeElement) return;
  const inputValue = minPerImg.value.trim();
  const inputValueAsNumber = parseInt(inputValue, 10);
  if (inputValue.length === 0 || isNaN(inputValueAsNumber)) {
    totalTimeElement.innerHTML = "0";
    return;
  }
  const clampedValue = Math.min(Math.max(inputValueAsNumber, 1), 25);
  minPerImg.value = clampedValue.toString();
  const minutes = clampedValue;
  timeCalc = uploadedImages.length * minutes;
  totalTimeElement.innerHTML = timeCalc.toString();
}

function updateTimeCalc() {}

function clearQueue() {
  uploadedImages = [];
  if (numEl) numEl.innerHTML = uploadedImages.length.toString();
  clearInput.disabled = true;
  startButton.disabled = true;
  if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
  changeMinPerImg();
}

function changePauseEnd(input: HTMLInputElement) {
  noTimerLast = input.checked;
}

let currentDown: HTMLElement | null = null;

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
  if (currentDown !== null) {
    const currentDownNum = parseInt(currentDown.dataset.made || "0", 10);
    currentDown.classList.remove("dragged");
    currentDown = null;
    const clientX = event.clientX;
    for (let i = 0; i < uploadedImages.length; i++) {
      if (i !== currentDownNum) {
        const currentElm = document.querySelector(`[data-made="${i}"]`);
        if (currentElm) {
          const elmBox = currentElm.getBoundingClientRect();
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
  if (!thumbnailsContainer) return;
  thumbnailsContainer.innerHTML = "";
  if (uploadedImages.length > 0) {
    uploadedImages.forEach((value: UploadImg, index) => {
      const thumbWrap = document.createElement("div");
      const newImg = document.createElement("img");
      const newX = document.createElement("img");
      const nameEl = document.createElement("span");
      newImg.src = value.blob;
      newImg.dataset.made = index.toString();
      newImg.addEventListener("mouseenter", () => {
        if (currentDown === null) changeX(index, "1");
      });
      newImg.addEventListener("mouseout", () => {
        changeX(index, btnOpacityOff);
      });
      newImg.addEventListener("mousedown", (event) => {
        currentDown = event.target as HTMLElement;
      });
      newImg.addEventListener("mousemove", (event) =>
        moving(event as MouseEvent)
      );

      newX.src = "./x-btn.png";
      newX.dataset.btnno = index.toString();
      newX.classList.add("xBtn");
      newX.addEventListener("click", () => killThumb(index));
      newX.addEventListener("mouseenter", () => {
        if (currentDown === null) changeX(index, "1");
      });
      newX.addEventListener("mouseout", () => {
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
    if (numEl) numEl.innerHTML = uploadedImages.length.toString();
    changeMinPerImg();
    return;
  }
  clearInput.disabled = true;
  startButton.disabled = true;
}

function changeX(number, value) {
  let matchingX = document.querySelectorAll(
    `[data-btnno="${number.toString()}"]`
  )[0] as HTMLImageElement;
  matchingX.style.opacity = value;
}

function killThumb(number: number) {
  if (number < 0 || number >= uploadedImages.length) return;
  uploadedImages.splice(number, 1);
  if (numEl) numEl.innerHTML = uploadedImages.length.toString();
  renderThumbs();
}

function changeImage(input: HTMLInputElement) {
  if (!input.files) return;
  const newImages = Array.from(input.files);
  if (newImages.length === 0) return;
  renderImages(newImages);
  input.value = "";
}

function getRandomEntriesFromArray<T>(arr: T[], targetLength: number): T[] {
  if (targetLength >= arr.length) return arr;
  const result: T[] = [...arr]; // Clone the original array to avoid modifying it.
  while (result.length > targetLength) {
    const randomIndex = Math.floor(Math.random() * result.length);
    result.splice(randomIndex, 1); // Remove the random element from the array.
  }
  return result;
}

function chooseImage(input: HTMLInputElement) {
  clearQueue();
  const chooseNumEl = document.querySelector("#chooseNum") as HTMLInputElement;
  if (!input.files) return;
  const newImages = Array.from(input.files);
  if (newImages.length === 0) return;
  if (input.files.length < Number.parseFloat(chooseNumEl.value)) {
    alert("Not enough files selected");
    return;
  }
  const randomImages = getRandomEntriesFromArray(
    newImages,
    Number.parseFloat(chooseNumEl.value)
  );
  renderImages(randomImages);
  input.value = "";
}

function renderImages(images: File[]) {
  images.forEach((file) => {
    const reader = new FileReader();
    const fileName = file.name;
    reader.onload = function (e) {
      if (e.target) {
        uploadedImages.push({
          name: fileName,
          blob: e.target.result as string,
        });
        renderThumbs();
      }
    };
    reader.readAsDataURL(file);
  });
  if (numEl) numEl.innerHTML = uploadedImages.length.toString();
  changeMinPerImg();
}

///////////////
//////PRESS START
//////////////

function startApp() {
  if (timeCalc > 0) {
    // Remove event listeners
    window.removeEventListener("mousemove", moving);
    window.removeEventListener("mouseup", mouseUp);
    if (!appElement) return;

    // Clear app content
    appElement.innerHTML = "";

    // Create and append the image element
    const bigImg = document.createElement("img");
    bigImg.id = "galleryImg";
    appElement.appendChild(bigImg);

    // Create and append the timer element
    const timer = document.createElement("span");
    timer.id = "timer";
    timer.textContent = new Date(minutes * 60 * 1000)
      .toISOString()
      .substr(14, 5);
    appElement.appendChild(timer);

    // Create and append the image name element
    const imgName = document.createElement("span");
    imgName.id = "imgName";
    appElement.appendChild(imgName);

    // Create and append the count element
    const count = document.createElement("span");
    count.id = "theCount";
    count.textContent = `${currentImg + 1}/${uploadedImages.length}`;
    appElement.appendChild(count);

    // Create and append the skip button
    const skipBtn = document.createElement("button");
    skipBtn.id = "skipBtn";
    skipBtn.textContent = "skip";
    skipBtn.addEventListener("click", skipImg);
    appElement.appendChild(skipBtn);

    // Create and append the pause timer button
    const addFiveMin = document.createElement("button");
    addFiveMin.id = "addFive";
    addFiveMin.textContent = "pause timer";
    addFiveMin.addEventListener("click", addFive);
    appElement.appendChild(addFiveMin);

    // Load the next image
    nextImg();
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

function playAudio(audioId: string, volume: number) {
  const audioElement = document.getElementById(audioId) as HTMLAudioElement;
  if (audioElement) {
    audioElement.volume = volume;
    audioElement.play();
  }
}

function startTimer() {
  const timerElement = document.getElementById("timer") as HTMLElement;
  const fiveBtn = document.getElementById("addFive") as HTMLButtonElement;

  if (!timerElement) return;

  let secondsDummy = minutes * 60;

  function downTick() {
    if (!skipped) {
      if (paused) {
        minutes = secondsDummy / 60;
        clearInterval(timeBomb);
      } else {
        secondsDummy--;
        timerElement.innerHTML = new Date(secondsDummy * 1000)
          .toISOString()
          .substr(14, 5);
        if (secondsDummy === 60) playAudio("oneMin", musicVolume);
        else if (secondsDummy <= 3 && secondsDummy !== 0)
          playAudio("tok", musicVolume);
      }
    } else {
      skipped = false;
      explosion();
    }

    if (secondsDummy === 0) explosion();
  }

  const timeBomb = setInterval(downTick, 1000);

  function timerOut() {
    if (currentImg + 1 !== uploadedImages.length) {
      timerElement.innerHTML = new Date(minutes * 60 * 1000)
        .toISOString()
        .substr(14, 5);
      nextImg();
    } else finish();
  }

  function explosion() {
    minutes = minutesDupe;
    clearInterval(timeBomb);
    timerOut();
  }
}

function finish() {
  if (!appElement) return;
  const endScreen = document.createElement("div");
  endScreen.id = "endScreen";
  endScreen.textContent = "GOOD WARM-UP!";
  appElement.innerHTML = "";
  appElement.appendChild(endScreen);
  const endMusic = document.getElementById("endMusic") as HTMLAudioElement;
  if (endMusic) {
    endMusic.volume = musicVolume;
    endMusic.play();
  }
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
