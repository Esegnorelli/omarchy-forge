import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import qs.Commons
import qs.Ui
import "Model.js" as Model

Item {
  id: root
  property var bar: null
  property var result: null
  property string query: ""
  property var snippets: []
  property var history: []
  property bool compact: false
  property bool copiedFlash: false

  signal queryEdited(string text)
  signal submitted()
  signal toolPicked(string sample)
  signal fieldCopied(string value)

  readonly property color foreground: bar ? bar.foreground : Color.foreground
  readonly property color muted: Color.muted
  readonly property color accent: Color.accent
  readonly property color surface: Qt.alpha(foreground, 0.06)
  readonly property color line: Qt.alpha(foreground, 0.12)

  implicitWidth: 420
  implicitHeight: column.implicitHeight

  function focusInput() {
    input.forceActiveFocus()
    input.selectAll()
  }

  Column {
    id: column
    width: parent.width
    spacing: Style.space(10)

    Rectangle {
      width: parent.width
      height: 40
      radius: Style.cornerRadius
      color: Style.hoverFillFor(root.foreground, Color.accent)
      border.color: input.activeFocus ? root.accent : root.line
      border.width: 1

      TextInput {
        id: input
        anchors.fill: parent
        anchors.leftMargin: Style.space(12)
        anchors.rightMargin: Style.space(12)
        text: root.query
        color: root.foreground
        font.family: Style.font.family
        font.pixelSize: Style.font.body
        clip: true
        selectByMouse: true
        onTextChanged: root.queryEdited(text)
        Keys.onReturnPressed: root.submitted()
        Keys.onEnterPressed: root.submitted()
        Keys.onEscapePressed: root.submitted()

        Text {
          visible: !input.text.length
          text: "uuid · pw 24 · now · hash · 100 km to mi"
          color: root.muted
          font.family: Style.font.family
          font.pixelSize: Style.font.body
          anchors.verticalCenter: parent.verticalCenter
        }
      }
    }

    Rectangle {
      visible: root.result !== null
      width: parent.width
      implicitHeight: resultCol.implicitHeight + Style.space(24)
      radius: Style.cornerRadius
      color: root.surface
      border.color: root.line
      border.width: 1

      Column {
        id: resultCol
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Style.space(12)
        spacing: Style.space(8)

        Row {
          spacing: Style.space(8)
          Text {
            text: root.result ? root.result.title : ""
            color: root.muted
            font.pixelSize: Style.font.caption
            font.family: Style.font.family
          }
          Rectangle {
            visible: root.result && root.result.swatch && root.result.swatch.length
            width: 12
            height: 12
            radius: 6
            color: root.result && root.result.swatch ? root.result.swatch : "transparent"
            border.color: root.line
            anchors.verticalCenter: parent.verticalCenter
          }
          Text {
            visible: root.copiedFlash
            text: "copied"
            color: root.accent
            font.pixelSize: Style.font.caption
            font.family: Style.font.family
          }
        }

        Text {
          width: parent.width
          text: root.result ? root.result.primary : ""
          color: root.foreground
          wrapMode: Text.WrapAnywhere
          font.family: Style.font.mono || Style.font.family
          font.pixelSize: Style.font.body
          maximumLineCount: 8
          elide: Text.ElideRight
        }

        Text {
          visible: root.result && root.result.secondary && root.result.secondary.length
          width: parent.width
          text: root.result ? root.result.secondary : ""
          color: root.muted
          wrapMode: Text.Wrap
          font.pixelSize: Style.font.caption
          font.family: Style.font.family
        }

        Text {
          text: root.result ? root.result.hint : ""
          color: root.muted
          font.pixelSize: Style.font.caption
          font.family: Style.font.family
        }
      }

      MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: {
          if (root.result)
            root.fieldCopied(root.result.primary)
        }
      }
    }

    Flow {
      id: catalog
      visible: root.result === null
      width: parent.width
      spacing: Style.space(6)

      Repeater {
        model: Model.catalog()
        delegate: Rectangle {
          required property var modelData
          width: chipText.implicitWidth + Style.space(16)
          height: 28
          radius: 14
          color: root.surface
          border.color: root.line
          border.width: 1

          Text {
            id: chipText
            anchors.centerIn: parent
            text: modelData.label
            color: root.foreground
            font.pixelSize: Style.font.caption
            font.family: Style.font.family
          }

          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: root.toolPicked(modelData.sample)
          }
        }
      }
    }

    Column {
      visible: root.history && root.history.length && !root.compact
      width: parent.width
      spacing: Style.space(4)

      Text {
        text: "Recent"
        color: root.muted
        font.pixelSize: Style.font.caption
        font.family: Style.font.family
      }

      Repeater {
        model: root.history
        delegate: Text {
          required property var modelData
          width: parent.width
          text: modelData.title + "  " + String(modelData.primary).replace(/\n/g, " ").substring(0, 48)
          color: root.foreground
          elide: Text.ElideRight
          font.pixelSize: Style.font.caption
          font.family: Style.font.mono || Style.font.family
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: root.fieldCopied(modelData.primary)
          }
        }
      }
    }
  }
}
