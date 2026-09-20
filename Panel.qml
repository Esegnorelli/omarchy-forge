import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model

Panel {
  id: root
  moduleName: "esegnorelli.forge"
  ipcTarget: "esegnorelli.forge"
  manageIpc: false

  property var anchorItem: null
  property var hostWidget: null
  property string label: "󰣪"
  property string query: ""
  property var result: null
  property var snippets: []
  property var history: []
  property bool copiedFlash: false
  property bool openedFromHotkey: false

  readonly property var defaults: ({
    passwordLength: Number(setting("passwordLength", 20)),
    passwordSymbols: setting("passwordSymbols", true) !== false
  })

  readonly property string stateDir: (Quickshell.env("HOME") || "") + "/.local/share/esegnorelli.forge"
  readonly property string statePath: stateDir + "/snippets.json"

  function applyQuery(text) {
    root.query = text
    var parsed = Model.runQuery(text, root.snippets, root.defaults)
    root.result = parsed
    if (parsed && parsed.tool === "hash" && parsed.secondary === "pending") {
      hashProc.command = Model.opensslHashCommand(parsed.primary)
      hashProc.running = false
      hashProc.running = true
    }
  }

  function runImmediate(text) {
    applyQuery(text)
    commit()
  }

  function commit() {
    if (!root.result)
      return
    if (root.result.tool === "snip" && String(root.result.secondary).indexOf("Save as ") === 0) {
      var name = String(root.result.secondary).slice(8)
      upsertSnippet(name, root.result.primary)
    }
    if (root.result.title === "No match")
      return
    copyText(root.result.primary)
    if (root.hostWidget)
      root.hostWidget.lastPrimary = root.result.primary
    var entry = {
      title: root.result.title,
      primary: root.result.primary
    }
    var next = [entry]
    for (var i = 0; i < root.history.length && next.length < Number(setting("historySize", 16)); i++)
      next.push(root.history[i])
    root.history = next
    root.copiedFlash = true
    flashTimer.restart()
  }

  function copyText(text) {
    Quickshell.execDetached(["wl-copy", "--", text])
  }

  function upsertSnippet(name, value) {
    var next = [{ name: name, value: value }]
    for (var i = 0; i < root.snippets.length; i++) {
      if (root.snippets[i].name !== name)
        next.push(root.snippets[i])
    }
    root.snippets = next
    mkdirProc.running = true
  }

  function persistSnippets() {
    stateFile.setText(Model.serializeSnippets(root.snippets))
  }

  Timer {
    id: flashTimer
    interval: 1400
    onTriggered: root.copiedFlash = false
  }

  Process {
    id: mkdirProc
    command: ["mkdir", "-p", root.stateDir]
    onExited: root.persistSnippets()
  }

  Process {
    id: hashProc
    stdout: StdioCollector {
      waitForEnd: true
      onStreamFinished: {
        if (!root.result || root.result.tool !== "hash")
          return
        root.result = Model.result("hash", "SHA-256", text.trim(), root.result.primary, "Enter copies hex digest")
      }
    }
  }

  FileView {
    id: stateFile
    path: root.statePath
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onLoaded: root.snippets = Model.parseSnippets(text())
    onLoadFailed: root.snippets = []
  }

  KeyboardPanel {
    id: panel
    anchorItem: root.anchorItem
    owner: root.hostWidget || root
    bar: root.bar
    open: root.opened
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth ? panel.fittedContentWidth(Style.space(420)) : 420
    contentHeight: panel.fittedContentHeight ? panel.fittedContentHeight(view.implicitHeight + Style.space(24)) : view.implicitHeight + 24

    PanelKeyCatcher {
      id: keyCatcher
      anchors.fill: parent
      onCloseRequested: root.close()
    }

    ForgeView {
      id: view
      anchors.left: parent.left
      anchors.right: parent.right
      anchors.top: parent.top
      anchors.margins: Style.space(12)
      bar: root.bar
      query: root.query
      result: root.result
      snippets: root.snippets
      history: root.history
      copiedFlash: root.copiedFlash
      onQueryEdited: function (text) { root.applyQuery(text) }
      onSubmitted: root.commit()
      onToolPicked: function (sample) { root.applyQuery(sample) }
      onFieldCopied: function (value) {
        root.copyText(value)
        if (root.hostWidget)
          root.hostWidget.lastPrimary = value
        root.copiedFlash = true
        flashTimer.restart()
      }
    }
  }

  onOpenedChanged: {
    if (root.opened)
      Qt.callLater(function () { view.focusInput() })
  }
}
