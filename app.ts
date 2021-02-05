let imgNum: number = 0;
let uploadedImages: string[] = [];
let timeCalc: number = 0;
let fileTag = <HTMLInputElement>document.getElementById("filetag");
let minPerImg = <HTMLInputElement>document.getElementById("minPerImg");

/////////////
//////START UP
////////////
function changeMinPerImg(input: HTMLInputElement) {
  if (input.value.length > 0) {
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
    console.log(uploadedImages);
    document.getElementById("queueNum").innerHTML = imgNum.toString();
    changeMinPerImg(minPerImg);
  }
}

function startApp() {
  if (timeCalc > 0) {
    console.log("YES");
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