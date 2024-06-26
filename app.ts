const appElement = document.querySelector("#app");
const minPerImg = document.querySelector("#minPerImg") as HTMLInputElement;
const nextSFX = document.querySelector("#nextSFX") as HTMLAudioElement;
const totalTimeElement = document.querySelector("#totalTime") as HTMLElement;
const clearInput = document.querySelector("#clrQueue") as HTMLButtonElement;
const startButton = document.querySelector("#startButton") as HTMLButtonElement;
const numEl = document.querySelector("#queueNum");
const thumbnailsContainer = document.querySelector("#thumbnails");
let shuffle = false;

type UploadImg = {
  name: string;
  blob: string;
};

let uploadedImages: UploadImg[] = [];
let currentImg: number = -1;

type TimerSetting = "TimerAlwaysOff" | "TimerAlwaysOn" | "NoTimerOnLastImage";
const TSI: TimerSetting[] = [
  "TimerAlwaysOn",
  "TimerAlwaysOff",
  "NoTimerOnLastImage",
];

let timerLoop: ReturnType<typeof setInterval>;
const timer = {
  minutes: 10,
  minutesDupe: 10,
  timeCalc: 0,
  timeLeft: 0,
  timerSetting: TSI[0],
  paused: false,
};

const musicVolume = 0.2;
nextSFX.volume = musicVolume;

/////////////
//////START UP
////////////
function changeMinPerImg() {
  if (!totalTimeElement) return;
  if (minPerImg.disabled) {
    totalTimeElement.innerHTML = uploadedImages.length === 0 ? "0" : "&#8734";
    startButton.disabled = uploadedImages.length === 0;
    return;
  }
  const inputValue = minPerImg.value.trim();
  const clampedValue = Math.min(Math.max(parseInt(inputValue, 10) || 0, 1), 25);
  minPerImg.value = clampedValue.toString();
  timer.minutes = timer.minutesDupe = clampedValue;
  timer.timeCalc = uploadedImages.length * clampedValue;
  totalTimeElement.innerHTML = timer.timeCalc.toString();
  startButton.disabled = timer.timeCalc === 0;
}

function changeAudio(input: HTMLInputElement) {
  document.querySelectorAll("audio").forEach((audio) => {
    audio.muted = input.value === "off";
  });
}

function changeShuffle(input: HTMLInputElement) {
  shuffle = input.checked;
}

function clearQueue() {
  uploadedImages = [];
  if (numEl) numEl.innerHTML = uploadedImages.length.toString();
  clearInput.disabled = true;
  startButton.disabled = true;
  if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
  changeMinPerImg();
  checkQueueFull();
}

function changePauseEnd(input: HTMLInputElement) {
  minPerImg.disabled = input.value === "TimerAlwaysOff";
  timer.timerSetting = input.value as TimerSetting;
  changeMinPerImg();
}

function checkQueueFull() {
  const chooseNumEl = document.querySelector("#chooseNum") as HTMLInputElement;
  const uploadBtn = document.querySelector("#uploadBtn") as HTMLButtonElement;
  const imagesLength = uploadedImages.length;
  const isFull = imagesLength >= (Number.parseFloat(chooseNumEl.value) || 20);
  uploadBtn.disabled = isFull;
}

let currentDown: HTMLElement | null = null;

window.addEventListener("mousemove", moving);
window.addEventListener("mouseup", mouseUp);

let startingPosition: number | null = null;

function moving(e: MouseEvent) {
  if (!currentDown || !currentDown.parentElement) return;
  const { parentElement } = currentDown;
  e.preventDefault();
  if (!startingPosition) startingPosition = e.clientX;
  if (Math.abs(e.clientX - startingPosition) > 10) {
    parentElement.classList.add("dragged");
    parentElement.style.left = `${e.clientX - 10}px`;
    parentElement.style.top = `${e.clientY - 75}px`;
  }
}

function arraymove(arr, fromIndex, toIndex) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

function mouseUp(event: MouseEvent) {
  if (!currentDown || !currentDown.parentElement) return;
  const currentDownNum = parseInt(currentDown.dataset.made || "0", 10);
  currentDown.parentElement.classList.remove("dragged");
  currentDown.parentElement.style.left = `0px`;
  currentDown.parentElement.style.top = `0px`;
  currentDown = null;
  if (!startingPosition) return;
  const startingPosCopy = startingPosition || 0;
  startingPosition = null;
  const clientX = event.clientX;
  if (Math.abs(clientX - startingPosCopy) > 50) {
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
    checkQueueFull();
    return;
  }
  clearInput.disabled = true;
  startButton.disabled = true;
}

function killThumb(number: number) {
  if (number < 0 || number >= uploadedImages.length) return;
  uploadedImages.splice(number, 1);
  if (numEl) numEl.innerHTML = uploadedImages.length.toString();
  renderThumbs();
}

function getRandomEntriesFromArray(arr: File[], targetLength: number): File[] {
  const u = uploadedImages;
  const result = [...arr].filter((b) => !u.some((a) => a.name === b.name));
  if (targetLength >= arr.length) return result;
  while (result.length > targetLength) {
    const randomIndex = Math.floor(Math.random() * result.length);
    result.splice(randomIndex, 1); // Remove the random element from the array.
  }
  return result;
}

function chooseImage(input: HTMLInputElement) {
  const chooseNumEl = document.querySelector("#chooseNum") as HTMLInputElement;
  if (!input.files) return;
  const newImages = Array.from(input.files);
  if (newImages.length === 0) return;
  const getLimit = Number.parseFloat(chooseNumEl.value) || 20;
  const uploadLimit = getLimit - uploadedImages.length;
  const randomImages = getRandomEntriesFromArray(newImages, uploadLimit);
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
const copy = {
  pause: "Pause Timer",
  start: "Start Timer",
  skip: "Skip",
  finish: "Finish",
};

function startApp() {
  const { minutes, timeCalc } = timer;
  console.log("[debug] timeCalc", timeCalc);
  console.log("[debug] appElement", appElement);
  if (timeCalc <= 0) return;
  window.removeEventListener("mousemove", moving);
  window.removeEventListener("mouseup", mouseUp);
  if (!appElement) return;
  appElement.innerHTML = "";

  // Create and append the image element
  const bigImg = document.createElement("img");
  bigImg.id = "galleryImg";
  appElement.appendChild(bigImg);

  // Create and append the timer element
  const TE = document.createElement("span"); //Timer Element
  TE.id = "timer";
  TE.textContent = new Date(minutes * 60 * 1000).toISOString().substr(14, 5);
  appElement.appendChild(TE);

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
  skipBtn.textContent = copy.skip;
  skipBtn.addEventListener("click", resetTimer);
  appElement.appendChild(skipBtn);

  // Create and append the pause timer button
  const timerPause = document.createElement("button");
  timerPause.id = "pause";
  timerPause.textContent = copy.pause;
  timerPause.addEventListener("click", pause);
  appElement.appendChild(timerPause);

  // shuffle the images
  if (shuffle) uploadedImages.sort(() => Math.random() - 0.5);

  // Load the first image
  nextImg();
}

////////////////////
////RUNNING
///////////////////
function pause() {
  const pauseBtn = document.getElementById("pause") as HTMLButtonElement;
  timer.paused = !timer.paused;
  pauseBtn.innerHTML = !timer.paused ? copy.pause : copy.start;
}

function playAudio(audioId: string, volume: number) {
  const audioElement = document.getElementById(audioId) as HTMLAudioElement;
  if (!audioElement) return;
  audioElement.volume = volume;
  audioElement.play();
}

function startTimer() {
  const timerElement = document.getElementById("timer") as HTMLElement;
  if (!timerElement) return;
  let secondsDummy = timer.minutes * 60;
  function downTick() {
    if (timer.paused) return;

    //update timer
    secondsDummy--;
    const timerNum = new Date(secondsDummy * 1000).toISOString().substr(14, 5);
    timerElement.innerHTML = timerNum;

    //timer sfx
    if (secondsDummy === 60) {
      playAudio("oneMin", musicVolume); //minute warning sfx
      return;
    }
    if (secondsDummy <= 3 && secondsDummy > 0) {
      playAudio("tok", musicVolume); // final 3 seconds sfx
      return;
    }

    //end
    if (secondsDummy <= 0) {
      if (currentImg + 1 !== uploadedImages.length) {
        resetTimer();
        return;
      }
      clearInterval(timerLoop);
      finish();
    }
  }
  timerLoop = setInterval(downTick, 1000);
}

function resetTimer() {
  const timerElement = document.getElementById("timer") as HTMLElement;
  timer.minutes = timer.minutesDupe;
  clearInterval(timerLoop);
  timerElement.innerHTML = new Date(timer.minutes * 60 * 1000)
    .toISOString()
    .substr(14, 5);
  nextImg();
}

function finish() {
  if (!appElement) return;
  const endScreen = document.createElement("div");
  endScreen.id = "endScreen";

  const h1 = document.createElement("h1");
  h1.innerHTML = "GOOD WARM UP!";
  endScreen.appendChild(h1);

  const imgTable = document.createElement("div");
  imgTable.id = "imgTable";
  uploadedImages.forEach((img) => {
    const td = document.createElement("div");
    const imgEl = document.createElement("img");
    const nameEl = document.createElement("span");
    imgEl.src = img.blob;
    nameEl.innerHTML = img.name;
    td.appendChild(nameEl);
    td.appendChild(imgEl);
    imgTable.appendChild(td);
  });
  endScreen.appendChild(imgTable);

  appElement.innerHTML = "";
  appElement.appendChild(endScreen);

  const endMusic = document.getElementById("endMusic") as HTMLAudioElement;
  if (!endMusic) return;
  endMusic.volume = musicVolume;
  endMusic.play();
}

function nextImg() {
  currentImg++;
  const { length: imgLength } = uploadedImages;
  const theNowImg: UploadImg = uploadedImages[currentImg];
  const count = document.getElementById("theCount") as HTMLSpanElement;
  count.innerHTML = `${currentImg + 1}/${imgLength}`;
  const gallery = document.getElementById("galleryImg") as HTMLImageElement;
  const imgName = document.getElementById("imgName") as HTMLImageElement;
  gallery.src = theNowImg.blob;
  imgName.innerHTML = theNowImg.name;
  nextSFX.play();
  if (currentImg + 1 == imgLength) {
    const skipBtn = document.getElementById("skipBtn") as HTMLButtonElement;
    skipBtn.innerHTML = copy.finish;
    skipBtn.removeEventListener("click", resetTimer);
    skipBtn.addEventListener("click", finish);
  }
  const { timerSetting: ts } = timer;
  if ((ts === TSI[2] && currentImg + 1 == imgLength) || ts === TSI[1]) {
    const pauseBtn = document.getElementById("pause") as HTMLButtonElement;
    pauseBtn.disabled = true;
    return;
  }
  startTimer();
}
