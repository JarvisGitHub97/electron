const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./renderer/musicDataStore')

const myStore = new DataStore({
  'name': 'music Data'
})
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      } 
    }
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadFile(fileLocation)
    this.once('ready-to-show', ()=>{
      this.show()
    })
  }

}
app.on('ready', ()=>{
  const mainWindow = new AppWindow({}, './renderer/index.html')

  ipcMain.on('add-music-window', ()=>{
    const addWindow = new AppWindow({
      width: 600,
      height: 400,
      parent: mainWindow
    }, './renderer/add.html')
  })
  ipcMain.on('open-music-file', (event)=>{
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: 'Music', extensions: ['mp3'] }]
    }).then((files)=>{
      event.sender.send('selected-file', files.filePaths)
    })
  })
  ipcMain.on('update-tracks', (event, tracks)=>{
    const updatedTracks = myStore.addTracks(tracks).getTracks()
    console.log(updatedTracks)
  })
})