const electron = require("electron");
const url = require("url");
const path = require("path");
const {app, BrowserWindow, Menu, ipcMain} = electron;

process.env.NODE_ENV = "production";

const isMac = process.platform === "darwin";
const mainModifierKey = isMac ? "Command" : "Ctrl";

let mainWindow;
let addWindow;

// listen for app to be ready
app.on("ready", function() {
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "mainWindow.html"),
    protocol: "file:",
    slashes: true
  }));

  // quit app when closed
  mainWindow.on("closed", function() {
    app.quit();
  });

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // insert menu
  Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
  // create new window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shopping List Item",
    webPreferences: {
      nodeIntegration: true
    }
  });
  // load html into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, "addWindow.html"),
    protocol: "file:",
    slashes: true
  }));
  // garbage collection
  addWindow.on("close", function() {
    addWindow = null;
  })
}

// catch item add from frontend
ipcMain.on("item:add", function(e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// create menu template
const mainMenuTemplate = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ]
  }] : []),
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        accelerator: `${mainModifierKey}+A`,
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear All Items",
        accelerator: `${mainModifierKey}+W`,
        click() {
          mainWindow.webContents.send("item:clear");
        }
      },
      {
        label: "Quit",
        accelerator: `${mainModifierKey}+Q`,
        click() {
          app.quit();
        }
      }
    ]
  }
];
// add dev tools item if not in prod
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: isMac ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload",
        accelerator: `${mainModifierKey}+R`
      }
    ]
  })
}