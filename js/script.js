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

  let res = await fetch("/Spotify-Clone/songs/songs.json");
  let data = await res.json();

  songs = data[folder] || [];

  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <div class="musicBox">
          <img class="invert" src="/Spotify-Clone/svg/music.svg" />
          <div class="Info">
            <div>${song}</div>
            <div>Tuhin</div>
          </div>
        </div>
        <div class="playNow">
          <span>Play now</span>
          <span><img class="invert" src="/Spotify-Clone/svg/play.svg" /></span>
        </div>
      </li>
    `;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".Info div").innerText);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/Spotify-Clone/songs/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "/Spotify-Clone/svg/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbum() {
  let res = await fetch("/Spotify-Clone/songs/songs.json");
  let data = await res.json();

  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let folder in data) {
    let info = await fetch(`/Spotify-Clone/songs/${folder}/info.json`);
    let meta = await info.json();

    cardContainer.innerHTML += `
      <div data-folder="${folder}" class="card">
        <div class="play-btn">
          <svg width="70" height="70" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="40" fill="#1ED760" />
            <polygon points="32,25 32,55 55,40" fill="black" />
          </svg>
        </div>
        <img src="/Spotify-Clone/songs/${folder}/cover.jpg" />
        <h2>${meta.title}</h2>
        <p>${meta.description}</p>
      </div>
    `;
  }

  Array.from(document.querySelectorAll(".card")).forEach((card) => {
    card.addEventListener("click", async () => {
      songs = await getSongs(card.dataset.folder);
      playMusic(songs[0]);
    });
  });
}

// --- Updated playMusic to ensure icons update correctly ---
const playMusic = (track, pause = false) => {
  currentSong.src = `/Spotify-Clone/songs/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    // Use querySelector here to ensure we find the play button icon
    document.querySelector("#play").src = "/Spotify-Clone/svg/pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function main() {
  // 1. DEFINE YOUR BUTTONS (Crucial: replace #ids with your actual HTML IDs/classes)
  let play = document.querySelector("#play");
  let previous = document.querySelector("#previous");
  let next = document.querySelector("#next");

  // Get the list of all the songs
  await getSongs("bright_mood");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbum();

  // Play/Pause Event Listener
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/Spotify-Clone/svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/Spotify-Clone/svg/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar Listener
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger & Close Listeners
  document.querySelector(".hamBurger").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left-container").style.left = "-120%";
  });

  // --- FIXED PREVIOUS BUTTON ---
  previous.addEventListener("click", () => {
    currentSong.pause();
    // Get filename, then decode %20 into spaces
    let currentFileName = decodeURI(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFileName);

    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // --- FIXED NEXT BUTTON ---
  next.addEventListener("click", () => {
    currentSong.pause();
    // Get filename, then decode %20 into spaces
    let currentFileName = decodeURI(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentFileName);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume & Mute Listeners
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("input", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

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
