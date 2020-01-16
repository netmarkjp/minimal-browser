const { app, BrowserWindow, globalShortcut } = require('electron')

let win

function createWindow () {
    let width = 800;
    let height = 600;

    win = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            devTools: true,
            preload: true,
        }
    })

    let url = process.argv[process.argv.length-1];
    if ( !url.startsWith("http://") && !url.startsWith("https://") ){
        console.log("ERROR: URL must be specified with command-line argument");
        app.quit()
        return;
    }

    win.webContents.addListener("did-fail-load", () => {
        console.log("ERROR: Failed to load. URL: " + url);
        app.quit();
        return;
    });

    win.webContents.on("dom-ready", () => {
        win.webContents.executeJavaScript(`
        // Restore vertical scroll position
        let pos = sessionStorage.getItem(document.URL);
        console.log(pos);
        if ( !(pos === undefined) ){
            scrollTo(0, pos);
        }

        // Save vertical scroll position
        document.addEventListener("scroll", () => {
            sessionStorage.setItem(document.URL, document.documentElement.scrollTop);
        });
        `);
    });

    globalShortcut.register("Alt+Left", () => {win.webContents.goBack();});
    globalShortcut.register("Alt+Right", () => {win.webContents.goForward();});
    globalShortcut.register("Ctrl+Shift+b", () => {win.webContents.goBack();});
    globalShortcut.register("Ctrl+Shift+f", () => {win.webContents.goForward();});

    win.loadURL(url);

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
