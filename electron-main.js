const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Music Player',
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
