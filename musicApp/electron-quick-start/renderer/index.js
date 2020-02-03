const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')
let musicAudio = new Audio()
let allTracks
let currentTrack

$('add-music').addEventListener('click', ()=>{
  ipcRenderer.send('add-music-window')
})

const rendererHTML = (tracks)=>{
  const tracksList = $('tracksList')
  const tracksListHTML = tracks.reduce((html, track)=>{
    html += `<li class="music-track list-group-item d-flex justify-content-between align-items-center" >
      <div class="col-10">
        <i class="icon-music mr-3 text-secondary"></i>
        <b>${track.fileName}</b>
      </div>
      <div class="col-2">
        <i class="icon-play mr-2" data-id="${track.id}"></i>
        <i class="icon-trash" data-id="${track.id}"></i>
      </div>
    </li>`
    return html
  }, '')
  const emptyTracksHTML = `<div class="alert alert-primary">您还未添加任何音乐</div>`
  tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTracksHTML
}

const renderPlayerHTML = (name, duration)=>{
  const player = $('player-status')
  const html = `<div class="col font-weight-bold">
                正在播放: ${name}
              </div>
              <div class="col">
                <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
              </div>
              `
  player.innerHTML = html
}

const UpdateProgressHTML = (currentTime, duration)=>{
  const progress = Math.floor(currentTime / duration * 100)
  const bar = $('player-progress')
  bar.innerHTML = progress + "%"
  bar.style.width = progress + "%"
  const seeker = $('current-seeker')
  seeker.innerHTML = convertDuration(currentTime)
}
ipcRenderer.on('getTracks', (event, tracks)=>{
  allTracks = tracks
  rendererHTML(tracks)
})

$('tracksList').addEventListener('click', (event)=>{
  event.preventDefault()
  const { dataset, classList } = event.target
  const id = dataset && dataset.id
  //播放/暂停/删除音乐
  if(id && classList.contains('icon-play')) {
    if(currentTrack && currentTrack.id === id) {
      musicAudio.play()
    }else {
      currentTrack = allTracks.find(track => track.id === id)
      musicAudio.src = currentTrack.path
      musicAudio.play()
      const resetIconEle = document.querySelector('.icon-pause')
      if(resetIconEle) {
        resetIconEle.classList.replace('icon-pause', 'icon-play')        
      }
    }
    classList.replace('icon-play', 'icon-pause')
  }else if(id && classList.contains('icon-pause')) {
    musicAudio.pause()
    classList.replace('icon-pause', 'icon-play')
  }else if(id && classList.contains('icon-trash')) {
    ipcRenderer.send('delete-track', id)
  }
})

musicAudio.addEventListener('loadedmetadata', ()=>{
  //渲染播放器状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})
musicAudio.addEventListener('timeupdate', ()=>{
  //更新播放器状态
  UpdateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})