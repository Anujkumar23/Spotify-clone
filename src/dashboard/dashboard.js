import { fetchRequest } from "../api";
import { ENDPOINT, getItemsFromLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemsInLocalStorage } from "../common";


const audio=new Audio();

let displayName;



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
  
  const { scrollTop } = event.target;

  const header = document.querySelector(".header");
    if (scrollTop >= header.offsetHeight) {
      header.classList.add(
        "sticky",
        "top-0",
        "bg-black",
        "duration-300"
      );
      header.classList.remove("bg-transparent");
    } else {
      header.classList.remove(
        "sticky",
        "top-0",
        "bg-black",
        "duration-300"
      );
      header.classList.add("bg-transparent");
    }
     if (history.state.type === SECTIONTYPE.PLAYLIST) {
      const coverElement=document.getElementById("cover-content");
    
      const playlistHeader=document.querySelector("#playlist-header");
      if(scrollTop>=(coverElement.offsetHeight-header.offsetHeight)){
        playlistHeader.classList.add("sticky","bg-black-base","px-8")
        playlistHeader.classList.remove("mx-8")
        playlistHeader.style.top=`${header.offsetHeight}px`
      }
      else{
        playlistHeader.classList.remove("sticky","bg-black-base","px-8")
        playlistHeader.classList.add("mx-8")
        playlistHeader.style.top="revert"
      }
     
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

const formatTime = (duration_ms) => {
  let duration_sec = duration_ms/1000 ;
  let min = Math.floor(duration_sec / 60);
  let sec = Math.round(duration_sec % 60);
  let duration = ((min < 10 ? "0":"" ) + min + ":" + (sec < 10 ? "0":"") + sec);
  return duration
};

const onTrackSelection=(event,id)=>{
 
        document.querySelectorAll("#tracks .track").forEach((trackItem)=>{
          if(trackItem.id==id){
            trackItem.classList.add("selected", "bg-gray")
          }
          else{
            trackItem.classList.remove("selected", "bg-gray")
          }
        })

        

}
const updateIconsForPlayMode=(id)=>{
 const playButton=document.querySelector("#play")
  playButton.querySelector("span").textContent="pause_circle";
const  playButtonFromTrack=document.querySelector(`#play-track-${id}`);
if(playButtonFromTrack){
  playButtonFromTrack.textContent="pause";

}

}



const onAudioMetaDataLoaded=()=>{
  const totalSongDuration=document.querySelector("#total-song-duration");
  totalSongDuration.textContent=`0:${audio.duration.toFixed(0)}`
  

}
const updateIconsForPauseMode=(id)=>{
  const playButton=document.querySelector("#play")
  playButton.querySelector("span").textContent="play_circle";
const  playButtonFromTrack=document.querySelector(`#play-track-${id}`);
if(playButtonFromTrack){
  playButtonFromTrack.textContent=" play_arrow";

}
}





const togglePlay=()=>{
  if(audio.src){
    if(audio.paused){
      audio.play();

    }
    else{
      audio.pause();
   
  
    }
  }
  
}
const findCurrentTrack=()=>{
  const audioControl=document.querySelector("#audio-control");
  const trackId=audioControl.getAttribute("data-track-id");
  if(trackId){
    const loadedTracks=getItemsFromLocalStorage(LOADED_TRACKS);
    const currentTrackIndex =loadedTracks?.findIndex(trk=>trk.id===trackId)
    return{currentTrackIndex,tracks:loadedTracks};
  }
  return null
}

const playNextTrack=()=>{
  const {currentTrackIndex=-1,tracks=null}=findCurrentTrack()??{}
  if(currentTrackIndex>-1&&currentTrackIndex<tracks.length-1){
  onplayTrack(null,tracks[currentTrackIndex+1])

  }

}

const playPrevTrack=()=>{
  const {currentTrackIndex=-1,tracks=null}=findCurrentTrack()??{}
  if(currentTrackIndex>0){

    onplayTrack(null,tracks[currentTrackIndex-1])
  }

  }




const onplayTrack=(event,{id, artistNames,image, name,duration,previewUrl})=>{
  if(event?.stopPropagation){
    event.stopPropagation();
  }

if(audio.src===previewUrl){
  togglePlay();
  
}
else{

  const nowPlayingSongImage=document.querySelector("#now-playing-image")
  nowPlayingSongImage.src=image.url;

  const songTitle=document.querySelector("#now-playing-song");
 songTitle.textContent=name;

  const artists=document.querySelector("#now-playing-artists")
  artists.textContent=artistNames;
  
  audio.src=previewUrl;
  const audioControl=document.querySelector("#audio-control");
  audioControl.setAttribute("data-track-id",id)
  audio.play();




const songInfo=document.querySelector("#song-info");
songInfo.classList.remove("invisible")


}
}




const loadPlaylistTrack = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  let trackNo = 1;
  const loadedTracks=[];
  for (let trackItem of tracks.items.filter(item=>item.track.preview_url)) {
    let { id, artists, name, album, duration_ms: duration,preview_url:previewUrl} = trackItem.track;
    let track = document.createElement("section");
    track.className =
      " track p-1 grid grid-cols-[50px_1fr_1fr_50px] items-center gap-2 justify-items-start rounded-md hover:bg-light-black hover:cursor-pointer";
    track.id = id;
    let image = album.images.find((img) => img.height === 64);
    const artistNames=Array.from(artists,(artist) => {
      return artist.name}).join(", ");
    
    track.innerHTML = `<p class=" relative flex justify-center items-center w-full justify-self-center"><span class="track-no">${trackNo++}</span></p>
   <section class="grid  gap-2 grid-cols-[auto_1fr] place-items-center" >
  <img class="w-8 h-8" src="${image.url}" alt=""/>
   <article class="flex flex-col gap-0.5 justify-center">
   <h1 class="song-title text-primary text-sm line-clamp-1">${name}</h1>
    <h3 class="text-xs line-clamp-1">${artistNames}</h3>
     </article>
   </section>
    <p class="  text-sm line-clamp-1">${album.name}</p>
   <p>${formatTime(duration)}</p>`;

    const playButton=document.createElement("button")
    playButton.id=`play-track-${id}`
    playButton.className="play absolute w-full left-0 text-lg invisible material-symbols-rounded"
    playButton.textContent= "play_arrow";
    playButton.addEventListener("click",(event)=>onplayTrack(event,{id, artistNames,image, name,duration,previewUrl}));
   
    
    track.querySelector("p").appendChild(playButton);
    
    track.addEventListener("click",(event)=>onTrackSelection(event,id));
    
    trackSection.appendChild(track);
    loadedTracks.push({id, artistNames,image, name,duration,previewUrl});
  }
  setItemsInLocalStorage(LOADED_TRACKS,loadedTracks)
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  console.log(playlist);

  const {name,images,type,tracks}=playlist;
  for (let trackItem of tracks.items) {
    let { artists} = trackItem.track; 
    const artistNames=Array.from(artists,(artist) => {
      return artist.name}).join(", ");
      const coverElement=document.querySelector("#cover-content")
      coverElement.innerHTML=`<section class="playing-playlist grid grid-cols-[auto_1fr] gap-4">
      <img class="object-contain h-40 w-40"  src="${images[0].url}" alt="">
     <section class="flex flex-col">
     <h1 class="text-lg capitalize ml-2">${type}</h1>
      <h1 class="text-6xl">${name}</h1>
      <p class="ml-2 mt-4">${artistNames}</p>
      <p class="ml-2">${tracks.items.length} songs</p>
     </section> 
  
    </section>`
   }
 




  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML = `
   <header id="playlist-header" class="mx-8 py-2 border-secondary border-b-[0.5px]  z-[10]">
  <nav > 
      <ul class="grid grid-cols-[50px_1fr_1fr_50px] gap-4 ">
          <li class="justify-self-center">#</li>
          <li>Title</li>
          <li>Album</li>
          <li>⌚</li>
      </ul>
  </nav>
</header>

<section id="tracks" class="px-8 text-secondary mt-4  ">
</section>
  `;
  loadPlaylistTrack(playlist);
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
  const coverElement=document.querySelector("#cover-content");
  coverElement.innerHTML=`<h1 class="text-6xl">Hello</h1>`
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

const onUserPlaylistsClicked=(id)=>{
  const section={type:SECTIONTYPE.PLAYLIST,playlist:id}
 history.pushState(section,"",`/dashboard/playlist/${id}`)
 loadSection(section);
}



const loadUserPlaylists=async()=>{
  const playlists=await fetchRequest(ENDPOINT.userPlaylist);
  console.log(playlists);
  const userPlaylistSection=document.querySelector("#user-playlists>ul");
userPlaylistSection.innerHTML='';
  for(let {name,id} of playlists.items){
    const li=document.createElement("li");
    li.textContent=name;
    li.className="cursor-pointer hover:text-primary"
    li.addEventListener("click",()=>onUserPlaylistsClicked(id));
    userPlaylistSection.appendChild(li);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const volume=document.querySelector("#volume")
  const playButton=document.querySelector("#play");
  const SongDurationCompleted=document.querySelector("#song-duration-completed");
  const songProgress=document.querySelector("#progress");
  const timeline=document.querySelector("#timeline");
  const audioControl=document.querySelector("#audio-control");
  const next=document.querySelector("#next");
  const prev=document.querySelector("#prev");
  let progressInterval;



  loadUserProfile();
  const section = { type: SECTIONTYPE.DASHBOARD };
  history.pushState(section, "", "");
  loadSection(section);
  loadUserPlaylists();
  document.addEventListener("click", () => {
    const profileMenu = document.querySelector("#profile-menu");
    if (!profileMenu.classList.contains("hidden")) {
      profileMenu.classList.add("hidden");
    }
  }); 
  
  audio.addEventListener("play",()=>{
    const selectedTrackId=audioControl.getAttribute("data-track-id");
   const  tracks=document.querySelector("#tracks");
   const playingTrack=tracks?.querySelector("section.playing")
   const  selectedTrack=tracks?.querySelector(`[id="${selectedTrackId}"]`)
    if(selectedTrack?.id!=playingTrack?.id){
      playingTrack?.classList.remove("playing");
    }
   selectedTrack?.classList.add("playing");

    progressInterval=setInterval(()=>{
      if(audio.paused){
      return 
    }
    SongDurationCompleted.textContent= `${audio.currentTime.toFixed(0)<10?"0:0"+ audio.currentTime.toFixed(0):"0:"+audio.currentTime.toFixed(0)}`
    
    songProgress.style.width=` ${audio.currentTime/audio.duration *100 }%`
    
    
  },100);
  updateIconsForPlayMode(selectedTrackId)
   
})
audio.addEventListener("pause",()=>{
  
  if(progressInterval){
    clearInterval(progressInterval);
    
  }
  const selectedTrackId=audioControl.getAttribute("data-track-id");
  updateIconsForPauseMode(selectedTrackId);
})
audio.removeEventListener("loadedmetadata",onAudioMetaDataLoaded)
audio.addEventListener("loadedmetadata",onAudioMetaDataLoaded)
playButton.addEventListener("click",()=> togglePlay())

window.addEventListener("popstate", (event) => {
  loadSection(event.state);
 
});
  
  volume.addEventListener("change",()=>{
    audio.volume=volume.value/100;
  
  })
  next.addEventListener("click",playNextTrack)
  prev.addEventListener("click",playPrevTrack)


});
