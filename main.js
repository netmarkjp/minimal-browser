const { app, BrowserWindow, globalShortcut } = require('electron');
const { Menu, MenuItem } = require('electron');
const prompt = require('electron-prompt');

let win

function urlPrompt(isError) {
    let title = "Where to go?"
    if (isError) {
        title = "[URL OPEN ERROR] " + title;
    }
    prompt({
        title: title,
        label: "URL",
        value: "https://google.com/",
        inputAttrs: {
            type: "url"
        },
        type: "input"
    }).then((url) => {
        if (!(url === null)) {
            win.loadURL(url);
        }
    }).catch(console.error);
}

function createWindow() {
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

    const menu = Menu.getApplicationMenu();
    const mi = new MenuItem({
        label: "Go to",
        enabled: true,
        visible: true,
        type: "submenu",
        submenu: [new MenuItem({
            label: "Go to URL",
            accelarator: "CommanddOrControl+Shift+o",
            click() {
                urlPrompt(false);
            },
            registerAccelerator: true
        })]
    });
    menu.insert(0, mi);
    Menu.setApplicationMenu(menu);

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

    globalShortcut.register("Alt+Left", () => { win.webContents.goBack(); });
    globalShortcut.register("Alt+Right", () => { win.webContents.goForward(); });
    globalShortcut.register("Ctrl+Shift+b", () => { win.webContents.goBack(); });
    globalShortcut.register("Ctrl+Shift+f", () => { win.webContents.goForward(); });
    globalShortcut.register("Ctrl+Shift+o", () => { urlPrompt(false); });

    win.webContents.addListener("did-fail-load", () => {
        console.log("did-fail-load");
        urlPrompt(true);
    });

    win.loadURL("about:blank");
    urlPrompt(false);

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
