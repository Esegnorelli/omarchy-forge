import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model

Item {
  id: root
  anchors.fill: parent

  property var shell: null
  property var manifest: null
  property var settings: ({})
  property string query: ""
  property var result: null
  property var snippets: []
  property var history: []
  property bool copiedFlash: false

  readonly property var defaults: ({
    passwordLength: 20,
    passwordSymbols: true
  })

  readonly property string stateDir: (Quickshell.env("HOME") || "") + "/.local/share/esegnorelli.forge"
  readonly property string statePath: stateDir + "/snippets.json"

  function close() {
    if (shell && typeof shell.hide === "function" && manifest)
      shell.hide(manifest.id)
    else if (shell && typeof shell.hide === "function")
      shell.hide("esegnorelli.forge")
  }

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

  function commit() {
    if (!root.result)
      return
    if (root.result.tool === "snip" && String(root.result.secondary).indexOf("Save as ") === 0) {
      var name = String(root.result.secondary).slice(8)
      var next = [{ name: name, value: root.result.primary }]
      for (var i = 0; i < root.snippets.length; i++) {
        if (root.snippets[i].name !== name)
          next.push(root.snippets[i])
      }
      root.snippets = next
      mkdirProc.running = true
    }
    if (root.result.title === "No match")
      return
    Quickshell.execDetached(["wl-copy", "--", root.result.primary])
    root.copiedFlash = true
    flashTimer.restart()
    closeTimer.restart()
  }

  function persistSnippets() {
    stateFile.setText(Model.serializeSnippets(root.snippets))
  }

  Timer {
    id: flashTimer
    interval: 900
    onTriggered: root.copiedFlash = false
  }

  Timer {
    id: closeTimer
    interval: 500
    onTriggered: root.close()
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
  }

  Rectangle {
    anchors.fill: parent
    color: Qt.rgba(0, 0, 0, 0.55)
    MouseArea {
      anchors.fill: parent
      onClicked: root.close()
    }
  }

  Rectangle {
    id: card
    width: Math.min(480, parent.width - 32)
    implicitHeight: view.implicitHeight + Style.space(36)
    radius: Style.cornerRadius + 4
    color: Qt.alpha(Color.foreground, 0.08)
    border.color: Qt.alpha(Color.foreground, 0.14)
    border.width: 1
    anchors.horizontalCenter: parent.horizontalCenter
    anchors.top: parent.top
    anchors.topMargin: Math.max(72, parent.height * 0.16)

    ForgeView {
      id: view
      anchors.left: parent.left
      anchors.right: parent.right
      anchors.top: parent.top
      anchors.margins: Style.space(16)
      bar: null
      compact: true
      query: root.query
      result: root.result
      snippets: root.snippets
      history: []
      copiedFlash: root.copiedFlash
      onQueryEdited: function (text) { root.applyQuery(text) }
      onSubmitted: root.commit()
      onToolPicked: function (sample) { root.applyQuery(sample) }
      onFieldCopied: function (value) {
        Quickshell.execDetached(["wl-copy", "--", value])
        root.copiedFlash = true
        flashTimer.restart()
      }
    }
  }

  Keys.onEscapePressed: root.close()

  Component.onCompleted: Qt.callLater(function () { view.focusInput() })
}
