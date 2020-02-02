const { ipcRenderer } = require('electron')
const { $ } = require('./helper')
const path = require('path')
let musicPath = []

$('select-music').addEventListener('click', ()=>{
  ipcRenderer.send('open-music-file')
})

$('update-music').addEventListener('click', ()=>{
  ipcRenderer.send('update-tracks', musicPath)
})
const renderListHTML = (pathes)=>{
  const musicItemsHTML = pathes.reduce((html, music)=>{
    return html += `<li class="list-group-item">${path.basename(music)}</li>`
  }, '')
  const musicList = $('musicList')
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}
ipcRenderer.on('selected-file', (event, path)=>{
  if(Array.isArray(path)) {
    renderListHTML(path)
    musicPath = path
  }
})
