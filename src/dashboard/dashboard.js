import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

const onProfileClick = (event) => {
  event.stopPropagation();
  const profileMenu = document.querySelector("#profile-menu");
  profileMenu.classList.toggle("hidden");
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.querySelector("li#logout").addEventListener("click", logout);
  }
};

const onplayListItemClick = (event, id) => {
  const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
  history.pushState(section, "", `playlist/${id}`);
  loadSection(section);
};


const onContentScroll=(event)=>{ 
  
    const header = document.querySelector(".header");
    const { scrollTop } = event.target;
    if (scrollTop >= header.offsetHeight) {
      header.classList.add(
        "sticky",
        "top-0",
        "bg-black-secondary",
        "duration-300"
      );
      header.classList.remove("bg-transparent");
    } else {
      header.classList.remove(
        "sticky",
        "top-0",
        "bg-black-secondary",
        "duration-300"
      );
      header.classList.add("bg-transparent");
    }
    if (history.state.type === SECTIONTYPE.PLAYLIST) {
      const coverContent=document.querySelector("#cover-content");
      const playlistHeader = document.querySelector("#playlist-header");
      // if (scrollTop >= (coverContent.offsetHeight - header.offsetHeight)) {
      //   console.log(header.offsetHeight)

        playlistHeader.classList.add("sticky","bg-black-secondary","px-8");
        playlist.classlist.remove("mx-8")

      // }
    }
  }




const loadSection = (section) => {
  if (section.type === SECTIONTYPE.DASHBOARD) {
    fillContentForDashboard();
    loadPlayLists();
  } else if (section.type === SECTIONTYPE.PLAYLIST) {
    fillContentForPlaylist(section.playlist);
  }


  document.querySelector(".content").removeEventListener("scroll", onContentScroll);
  document.querySelector(".content").addEventListener("scroll",onContentScroll)
};

const formatTime = (duration) => {
  const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};


const loadPlaylistTrack = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  let trackNo = 1;
  for (let trackItem of tracks.items) {
    let { id, artists, name, album, duration_ms: duration } = trackItem.track;
    let track = document.createElement("section");
    track.className =
      " track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center gap-2 justify-items-start rounded-md hover:bg-light-black hover:cursor-pointer";
    track.id = id;
    let image = album.images.find((img) => img.height === 64);
    const artistNames=Array.from(artists,(artist) => {
      return artist.name}).join(", ");
    
    track.innerHTML = `<p class="justify-self-center">${trackNo++}</p>
   <section class="grid  gap-3 grid-cols-[auto_1fr]" >
  <img class="w-8 h-8" src="${image.url}" alt=""/>
   <article class="flex flex-col items-center justify-center">
   <h1 class="text-primary text-sm line-clamp-1">${name}</h1>
    <h3 class="text-xs">${artistNames}</h3>
     </article>
   </section>
    <p class=line-clamp-1>${album.name}</p>
   <p>${formatTime(duration)}</p>`;
    trackSection.appendChild(track);
  }
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML = `
  <header id="playlist-header" class="mx-8 py-2 border-secondary border-b-[0.5px] ">
  <nav class=py-2> 
      <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4">
          <li class="justify-self-center">#</li>
          <li>Title</li>
          <li>Album</li>
          <li>⌚</li>
      </ul>
  </nav>
</header>

<section id="tracks" class="px-8 text-secondary  ">
</section>
  `;
  loadPlaylistTrack(playlist);
  console.log(playlist);
};

const loadUserProfile = async () => {
  const defaultImage = document.querySelector("#default-image");
  const displayNameElement = document.querySelector("#display-name");
  const profileButton = document.querySelector("#user-profile-button");

  const { display_name: displayName, images } = await fetchRequest(
    ENDPOINT.userInfo
  );

  displayNameElement.textContent = displayName;

  if (images?.length) {
    defaultImage.classList.add("hidden");
  } else {
    defaultImage.classList.remove("hidden");
  }

  profileButton.addEventListener("click", onProfileClick);
};

const loadPlaylist = async (endpoint, elementId) => {
  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const playListItemsSection = document.querySelector(`#${elementId}`);

  for (let { description, name, images, id } of items) {
    const playListItem = document.createElement("section");

    playListItem.className =
      "  p-4 mt-2 rounded  hover:cursor-pointer  bg-black-secondary hover:bg-light-black";
    playListItem.id = id;
    playListItem.setAttribute("data-type", "playlist");
    playListItem.addEventListener("click", (event) => {
      onplayListItemClick(event, id);
    });
    const [{ url: imageUrl }] = images;
    playListItem.innerHTML = ` <img class="shadow rounded pb-2 object-contain"
       src="${imageUrl}" alt="${name}">
       <h2 class="text-base font-semi bold mb-2  truncate">${name}</h2> 
       <h3 class="text-sm text-secondary  line-clamp-2">${description}
       </h3>`;

    playListItemsSection.appendChild(playListItem);
  }
};

const loadPlayLists = () => {
  loadPlaylist(ENDPOINT.featurePlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
};

const fillContentForDashboard = () => {
  const pageContent = document.querySelector("#page-content");
  const playListMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlists", "top-playlist-items"],
  ]);
  let innerHTML = "";
  for (let [type, id] of playListMap) {
    innerHTML += `<article class="p-4">
        <h1 class="text-2xl mb-4">${type}</h1>
        <section id="${id}" class=" featured-songs grid grid-cols-auto-fill-cards gap-4"></section>

    </article>`;
  }
  pageContent.innerHTML = innerHTML;
};



window.addEventListener("popstate", (event) => {
  loadSection(event.state);
  console.log(event.state);
});

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  // const section = { type: SECTIONTYPE.DASHBOARD };
  // history.pushState(section, "", "");
const  section = { type: SECTIONTYPE.PLAYLIST,playlist:'37i9dQZF1DWX3SoTqhs2rq'};
history.pushState(section, "", `/dashboard/playlist/${section.playlist}`);


  
  loadSection(section);
  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  });
});
