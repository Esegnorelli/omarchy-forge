.pragma library

var LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."

var UNITS = {
  m: { dim: "length", toBase: 1 },
  km: { dim: "length", toBase: 1000 },
  mi: { dim: "length", toBase: 1609.344 },
  ft: { dim: "length", toBase: 0.3048 },
  "in": { dim: "length", toBase: 0.0254 },
  cm: { dim: "length", toBase: 0.01 },
  mm: { dim: "length", toBase: 0.001 },
  yd: { dim: "length", toBase: 0.9144 },
  nmi: { dim: "length", toBase: 1852 },
  kg: { dim: "mass", toBase: 1 },
  g: { dim: "mass", toBase: 0.001 },
  lb: { dim: "mass", toBase: 0.45359237 },
  oz: { dim: "mass", toBase: 0.028349523125 },
  t: { dim: "mass", toBase: 1000 },
  s: { dim: "time", toBase: 1 },
  min: { dim: "time", toBase: 60 },
  h: { dim: "time", toBase: 3600 },
  d: { dim: "time", toBase: 86400 },
  week: { dim: "time", toBase: 604800 },
  b: { dim: "data", toBase: 1 },
  kb: { dim: "data", toBase: 1000 },
  mb: { dim: "data", toBase: 1e6 },
  gb: { dim: "data", toBase: 1e9 },
  tb: { dim: "data", toBase: 1e12 },
  kib: { dim: "data", toBase: 1024 },
  mib: { dim: "data", toBase: 1048576 },
  gib: { dim: "data", toBase: 1073741824 }
}

function catalog() {
  return [
    { id: "calc", label: "Calculate", sample: "12 * 1.1 + 4" },
    { id: "uuid", label: "UUID", sample: "uuid" },
    { id: "password", label: "Password", sample: "pw 24" },
    { id: "timestamp", label: "Timestamp", sample: "now" },
    { id: "encode", label: "Encode", sample: "b64 hello" },
    { id: "hash", label: "Hash", sample: "hash omarchy" },
    { id: "json", label: "JSON", sample: "json {a:1}" },
    { id: "color", label: "Color", sample: "#c5cad3" },
    { id: "units", label: "Units", sample: "100 km to mi" },
    { id: "case", label: "Case", sample: "snake Hello World" },
    { id: "lorem", label: "Lorem", sample: "lorem 2" },
    { id: "ids", label: "Test IDs", sample: "cpf" }
  ]
}

function result(tool, title, primary, secondary, hint, fields, swatch) {
  return {
    tool: tool,
    title: title,
    primary: primary,
    secondary: secondary || "",
    hint: hint || "Enter copies",
    fields: fields || [],
    swatch: swatch || ""
  }
}

function uuidv4() {
  var hex = "0123456789abcdef"
  var s = ""
  for (var i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += "-"
    else if (i === 14) s += "4"
    else if (i === 19) s += hex[(Math.random() * 4 | 0) + 8]
    else s += hex[Math.random() * 16 | 0]
  }
  return s
}

function generatePassword(length, symbols) {
  var len = Math.min(128, Math.max(8, length | 0))
  var lower = "abcdefghijkmnopqrstuvwxyz"
  var upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  var num = "23456789"
  var sym = "!@#$%^&*_-+=?"
  var alphabet = lower + upper + num + (symbols ? sym : "")
  var chars = [
    lower[Math.floor(Math.random() * lower.length)],
    upper[Math.floor(Math.random() * upper.length)],
    num[Math.floor(Math.random() * num.length)]
  ]
  if (symbols) chars.push(sym[Math.floor(Math.random() * sym.length)])
  while (chars.length < len)
    chars.push(alphabet[Math.floor(Math.random() * alphabet.length)])
  for (var j = chars.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1))
    var tmp = chars[j]
    chars[j] = chars[k]
    chars[k] = tmp
  }
  return chars.join("")
}

function formatNumber(n) {
  if (!isFinite(n)) return "\u221e"
  if (Math.floor(n) === n && Math.abs(n) < 1e15) return String(n)
  return String(n)
}

function evaluateMath(expr) {
  var src = expr.replace(/,/g, "").replace(/\u00d7/g, "*").replace(/\u00f7/g, "/").trim()
  if (!src || !/^[\d.+\-*/%^()\s]+$/.test(src)) return null
  var tokens = []
  var re = /\d+(?:\.\d+)?|[+\-*/%^()]/g
  var last = ""
  var m
  while ((m = re.exec(src)) !== null) {
    var t = m[0]
    if (t === "-" && (last === "" || last === "(" || "+-*/%^".indexOf(last) >= 0))
      tokens.push("u-")
    else tokens.push(t)
    last = t
  }
  var prec = { "u-": 4, "^": 3, "*": 2, "/": 2, "%": 2, "+": 1, "-": 1 }
  var right = { "^": true, "u-": true }
  var out = []
  var ops = []
  for (var i = 0; i < tokens.length; i++) {
    t = tokens[i]
    if (/^\d/.test(t)) out.push(t)
    else if (t === "(") ops.push(t)
    else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push(ops.pop())
      if (ops.pop() !== "(") return null
    } else {
      while (ops.length && ops[ops.length - 1] !== "(" &&
             (prec[ops[ops.length - 1]] > prec[t] ||
              (prec[ops[ops.length - 1]] === prec[t] && !right[t])))
        out.push(ops.pop())
      ops.push(t)
    }
  }
  while (ops.length) {
    var op = ops.pop()
    if (op === "(" || op === ")") return null
    out.push(op)
  }
  var st = []
  for (i = 0; i < out.length; i++) {
    t = out[i]
    if (/^\d/.test(t)) st.push(Number(t))
    else if (t === "u-") {
      if (!st.length) return null
      st.push(-st.pop())
    } else {
      if (st.length < 2) return null
      var b = st.pop()
      var a = st.pop()
      var r = 0
      if (t === "+") r = a + b
      else if (t === "-") r = a - b
      else if (t === "*") r = a * b
      else if (t === "/") r = b === 0 ? NaN : a / b
      else if (t === "%") r = a % b
      else if (t === "^") r = Math.pow(a, b)
      else return null
      st.push(r)
    }
  }
  if (st.length !== 1 || !isFinite(st[0])) return null
  return st[0]
}

function convertTemp(value, from, to) {
  var f = from.toLowerCase()
  var t = to.toLowerCase()
  var c = value
  if (f === "f") c = (value - 32) * (5 / 9)
  else if (f === "k") c = value - 273.15
  else if (f === "c") c = value
  else return null
  if (t === "f") return c * (9 / 5) + 32
  if (t === "k") return c + 273.15
  if (t === "c") return c
  return null
}

function parseUnitQuery(q) {
  var m = q.match(/^(-?\d+(?:\.\d+)?)\s*([a-z\u00b0]+)\s+(?:to|in|->)\s*([a-z\u00b0]+)$/i)
  if (!m) return null
  var value = Number(m[1])
  var from = m[2].toLowerCase().replace("\u00b0", "")
  var to = m[3].toLowerCase().replace("\u00b0", "")
  var temp = convertTemp(value, from, to)
  if (temp !== null)
    return result("units", "Units", formatNumber(temp) + " " + to.toUpperCase(),
                  value + " " + from.toUpperCase() + " \u2192 " + to.toUpperCase(),
                  "Enter copies the converted value")
  var a = UNITS[from]
  var b = UNITS[to]
  if (!a || !b || a.dim !== b.dim) return null
  var outv = (value * a.toBase) / b.toBase
  return result("units", "Units", formatNumber(outv) + " " + to,
                value + " " + from + " \u2192 " + to, "Enter copies the converted value")
}

function parseColor(input) {
  var hex = ""
  var hexMatch = input.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i)
  var rgbMatch = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (hexMatch) {
    hex = hexMatch[1]
    if (hex.length === 3)
      hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2)
  } else if (rgbMatch) {
    function toHex(n) {
      var h = Number(n).toString(16)
      return h.length === 1 ? "0" + h : h
    }
    hex = toHex(rgbMatch[1]) + toHex(rgbMatch[2]) + toHex(rgbMatch[3])
  } else return null
  hex = hex.toLowerCase()
  var r = parseInt(hex.substring(0, 2), 16)
  var g = parseInt(hex.substring(2, 4), 16)
  var b = parseInt(hex.substring(4, 6), 16)
  return result("color", "Color", "#" + hex, "rgb(" + r + ", " + g + ", " + b + ")",
                "Enter copies hex", [], "#" + hex)
}

function toSnake(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[\s\-]+/g, "_").replace(/__+/g, "_").toLowerCase()
}
function toKebab(s) { return toSnake(s).replace(/_/g, "-") }
function toCamel(s) {
  return toSnake(s).replace(/_([a-z0-9])/g, function (_, c) { return c.toUpperCase() })
}
function toTitle(s) {
  return s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, function (c) { return c.toUpperCase() })
}

function luhnLikeCpf(body) {
  var wStart = body.length + 1
  var sum = 0
  for (var i = 0; i < body.length; i++) sum += Number(body.charAt(i)) * (wStart - i)
  var r = (sum * 10) % 11
  return String(r === 10 ? 0 : r)
}

function generateCpf() {
  var n = ""
  for (var i = 0; i < 9; i++) n += String(Math.floor(Math.random() * 10))
  var d1 = luhnLikeCpf(n)
  var d2 = luhnLikeCpf(n + d1)
  var raw = n + d1 + d2
  return raw.substring(0, 3) + "." + raw.substring(3, 6) + "." + raw.substring(6, 9) + "-" + raw.substring(9)
}

function cnpjDigit(body) {
  var weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  var w = weights.slice(weights.length - body.length)
  var sum = 0
  for (var i = 0; i < body.length; i++) sum += Number(body.charAt(i)) * w[i]
  var r = sum % 11
  return String(r < 2 ? 0 : 11 - r)
}

function generateCnpj() {
  var n = ""
  for (var i = 0; i < 8; i++) n += String(Math.floor(Math.random() * 10))
  n += "0001"
  var d1 = cnpjDigit(n)
  var d2 = cnpjDigit(n + d1)
  var raw = n + d1 + d2
  return raw.substring(0, 2) + "." + raw.substring(2, 5) + "." + raw.substring(5, 8) + "/" + raw.substring(8, 12) + "-" + raw.substring(12)
}

function b64encode(s) {
  try { return Qt.btoa(s) } catch (e) { return "" }
}
function b64decode(s) {
  try { return Qt.atob(s.replace(/-/g, "+").replace(/_/g, "/")) } catch (e) { return null }
}

function padB64(p) {
  return p.replace(/-/g, "+").replace(/_/g, "/") + "===".substring((p.length + 3) % 4)
}

function decodeJwt(token) {
  var parts = token.split(".")
  if (parts.length < 2) return null
  try {
    var payload = JSON.parse(Qt.atob(padB64(parts[1])))
    var header = JSON.parse(Qt.atob(padB64(parts[0])))
    return result("jwt", "JWT", JSON.stringify(payload, null, 2),
                  "alg " + (header.alg || "\u2014"), "Unsigned decode \u2014 not verified")
  } catch (e) {
    return null
  }
}

function tryJson(text) {
  var trimmed = text.trim()
  var candidate = trimmed
  if (!(trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[")) {
    candidate = trimmed.replace(/([{,]\s*)([A-Za-z_][\w]*)\s*:/g, '$1"$2":')
    if (!(candidate.charAt(0) === "{" || candidate.charAt(0) === "[")) return null
  }
  try {
    var parsed = JSON.parse(candidate)
    var pretty = JSON.stringify(parsed, null, 2)
    return result("json", "JSON", pretty, pretty.split("\n").length + " lines", "Enter copies pretty JSON")
  } catch (e) {
    if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[")
      return result("json", "JSON", trimmed, "Invalid JSON", "Fix the payload and try again")
    return null
  }
}

function timestampResult(ms, raw) {
  var d = new Date(ms)
  var unix = Math.floor(ms / 1000)
  return result("timestamp", "Timestamp", String(unix), raw || d.toISOString(),
                "Enter copies Unix seconds",
                [
                  { label: "ISO", value: d.toISOString() },
                  { label: "Local", value: d.toString() }
                ])
}

function rest(q, prefix) {
  return q.replace(prefix, "").trim()
}

function parseSnippets(jsonText) {
  try {
    var data = JSON.parse(jsonText)
    if (data && data.length) return data
    if (data && data.snippets) return data.snippets
  } catch (e) {}
  return []
}

function serializeSnippets(list) {
  return JSON.stringify({ snippets: list }, null, 2)
}

function findSnippet(list, name) {
  var needle = String(name).toLowerCase()
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].name).toLowerCase() === needle) return list[i]
  }
  return null
}

function runQuery(q, snippets, defaults) {
  q = String(q || "").trim()
  snippets = snippets || []
  defaults = defaults || {}
  if (!q) return null

  var snipSet = q.match(/^snip\s+([\w.-]+)\s*=\s*(.+)$/i)
  if (snipSet)
    return result("snip", "Snippet", snipSet[2].trim(), "Save as " + snipSet[1], "Enter saves this snippet")

  var snipGet = q.match(/^(?:snip|\/)\s*([\w.-]+)$/i)
  if (snipGet) {
    var found = findSnippet(snippets, snipGet[1])
    if (found) return result("snip", found.name, found.value, "", "Enter copies the snippet")
  }

  var lower = q.toLowerCase()

  if (lower === "uuid" || lower === "guid")
    return result("uuid", "UUID v4", uuidv4(), "", "Enter copies the id")
  if (lower === "cpf")
    return result("ids", "CPF (test)", generateCpf(), "", "Synthetic \u2014 for fixtures only")
  if (lower === "cnpj")
    return result("ids", "CNPJ (test)", generateCnpj(), "", "Synthetic \u2014 for fixtures only")

  if (/^pw\b|^password\b|^pass\b/.test(lower)) {
    var bits = rest(q, /^(pw|password|pass)/i).split(/\s+/).filter(function (b) { return b.length })
    var len = Number(bits[0]) || defaults.passwordLength || 20
    var nosym = bits.some ? bits.some(function (b) { return /nosym|alnum/.test(b) }) : false
    var symbols = defaults.passwordSymbols !== false && !nosym
    var pw = generatePassword(len, symbols)
    return result("password", "Password", pw, pw.length + " chars", "Enter copies")
  }

  if (lower === "now" || lower === "ts" || lower === "timestamp" || lower === "unix")
    return timestampResult(Date.now())

  var tsNum = q.match(/^(?:ts|unix)\s+(\d{9,13})$/i)
  if (tsNum) {
    var n = Number(tsNum[1])
    return timestampResult(n > 1e12 ? n : n * 1000, tsNum[1])
  }

  if (/^(b64|base64)\s+/i.test(q)) {
    var text = rest(q, /^(b64|base64)/i)
    return result("encode", "Base64", b64encode(text), text, "Enter copies encoded")
  }
  if (/^(b64d|base64d|deb64)\s+/i.test(q)) {
    var decoded = b64decode(rest(q, /^(b64d|base64d|deb64)/i))
    if (decoded === null) return result("encode", "Base64 decode", "Invalid payload", "", "Check padding")
    return result("encode", "Base64 decode", decoded, "", "Enter copies decoded")
  }
  if (/^(url|enc)\s+/i.test(q)) {
    return result("encode", "URL encode", encodeURIComponent(rest(q, /^(url|enc)/i)), "", "Enter copies")
  }
  if (/^(urld|dec)\s+/i.test(q)) {
    try {
      return result("encode", "URL decode", decodeURIComponent(rest(q, /^(urld|dec)/i)), "", "Enter copies")
    } catch (e) {
      return result("encode", "URL decode", "Invalid sequence", "", "")
    }
  }
  if (/^(hash|sha256|sha)\s+/i.test(q)) {
    return result("hash", "SHA-256", rest(q, /^(hash|sha256|sha)/i), "pending", "Hashing\u2026")
  }
  if (/^(json|pretty)\s+/i.test(q)) {
    return tryJson(rest(q, /^(json|pretty)/i))
  }
  if (/^minify\s+/i.test(q)) {
    try {
      return result("json", "JSON minify", JSON.stringify(JSON.parse(rest(q, /^minify/i))), "", "Enter copies")
    } catch (e) {
      return result("json", "JSON", "Invalid JSON", "", "Could not minify")
    }
  }
  if (/^(lorem|ipsum)\b/i.test(q)) {
    var count = Math.min(8, Math.max(1, Number(rest(q, /^(lorem|ipsum)/i)) || 1))
    var block = []
    for (var i = 0; i < count; i++) block.push(LOREM)
    return result("lorem", "Lorem \u00d7 " + count, block.join("\n\n"), "", "Enter copies")
  }
  var caseM = q.match(/^(snake|camel|kebab|title|slug)\s+(.+)$/i)
  if (caseM) {
    var mode = caseM[1].toLowerCase()
    var src = caseM[2]
    var value = mode === "camel" ? toCamel(src)
              : mode === "kebab" || mode === "slug" ? toKebab(src)
              : mode === "title" ? toTitle(src)
              : toSnake(src)
    return result("case", mode, value, src, "Enter copies")
  }
  if (/^jwt\s+/i.test(q)) return decodeJwt(rest(q, /^jwt/i))
  if (q.split(".").length === 3 && q.length > 40) {
    var jwt = decodeJwt(q)
    if (jwt) return jwt
  }
  if (/^colou?r\s+/i.test(q)) return parseColor(rest(q, /^colou?r/i))
  var color = parseColor(q)
  if (color) return color
  var units = parseUnitQuery(q)
  if (units) return units
  var math = evaluateMath(q)
  if (math !== null)
    return result("calc", "Calculate", formatNumber(math), q, "Enter copies the result")
  var json = tryJson(q)
  if (json) return json
  return result("calc", "No match", q, "Try uuid, pw, now, hash, json, 100 km to mi", "Type a command or pick a tool")
}

function shellQuote(s) {
  return "'" + String(s).replace(/'/g, "'\\''") + "'"
}

function opensslHashCommand(text) {
  return ["sh", "-c", "printf %s " + shellQuote(text) + " | openssl dgst -sha256 | awk '{print $NF}'"]
}
