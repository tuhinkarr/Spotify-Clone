console.log("lets write JavaScript");
let currentSong = new Audio();
let currFolder;
let songs = [];

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let res = await fetch("songs/songs.json");
  let data = await res.json();
  songs = data[folder] || [];

  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
            <li>
                <div class="musicBox">
                    <img class="invert" src="svg/music.svg" />
                    <div class="Info">
                        <div>${song}</div>
                        <div>Tuhin</div>
                    </div>
                </div>
                <div class="playNow">
                    <span>Play now</span>
                    <span><img class="invert" src="svg/play.svg" /></span>
                </div>
            </li>`;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".Info div").innerText.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `songs/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "svg/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbum() {
  let res = await fetch("songs/songs.json");
  let data = await res.json();

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let folder in data) {
    try {
      let info = await fetch(`songs/${folder}/info.json`);
      let meta = await info.json();
      cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play-btn">
                        <svg width="70" height="70" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="40" fill="#1ED760" />
                            <polygon points="32,25 32,55 55,40" fill="black" />
                        </svg>
                    </div>
                    <img src="songs/${folder}/cover.jpg" />
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
    } catch (e) {
      console.log("Error loading album info", e);
    }
  }

  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getSongs(card.dataset.folder);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  const play = document.getElementById("play");
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");

  await getSongs("bright_mood");
  playMusic(songs[0], true);

  await displayAlbum();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(decodeURI(currentSong.src.split("/").pop()));
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
        document.querySelector(".volume > img").src = "svg/volume.svg";
    }
  });

  document.querySelector(".volume > img").addEventListener("click", (e) => { 
    if (e.target.src.includes("svg/volume.svg")) {
      e.target.src = "svg/mute.svg";
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = "svg/volume.svg";
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });

  document.querySelector(".hamBurger").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "-120%";
  });
}

main();