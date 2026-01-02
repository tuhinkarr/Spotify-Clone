console.log("lets write JavaScript");
let currentSong = new Audio();
let currFolder;
let songs;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("5C")[element.href.split("5C").length - 1]);
    }
  }
  //  console.log(songs)

  // show all the songs in the playlist
  let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
     
                   <div class="musicBox">
                     <img class="invert" src="/svg/music.svg" alt="" />
                     <div class="Info">
                       <div>${song.replaceAll("%20", " ")}</div>
                       <div>Tuhin</div>
                     </div>
                   </div>
                   <div class="playNow">
                     <span>Play now</span>
                     <span><img class="invert" src="/svg/play.svg" alt="" /></span>
                   </div>
                 </li>`;
  }
  // Attach an event listner to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".Info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".Info").firstElementChild.innerHTML);
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/svg/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbum() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  for (let i = 0; i < anchors.length; i++) {
    let href = decodeURIComponent(anchors[i].getAttribute("href"));
    anchors[i].setAttribute("href", href);
  }

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let cardContainer = document.querySelector(".cardContainer");
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="40" fill="#1ED760" />
                  <polygon points="32,25 32,55 55,40" fill="black" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="" />
              <h2 class="spfs-3">${response.title}</h2>
              <p class="spfs-4">${response.description}</p>
            </div>`;
    }
  }

  // Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // get the list of all the songs
  await getSongs("songs/bright_mood");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbum();

  // Attach event listner to play-btn, previous-btn and next-btn
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/svg/play.svg";
    }
  });

  // listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime);
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an eventlistner to the seekbar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector("circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an enentlistner to the hamburger
  document.querySelector(".hamBurger").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "0";
  });

  // Add an enentlistner to the close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an eventlistener to the volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      console.log("setting the volume to", e.target.value, "/100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
      }
    });

  // Add an event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
