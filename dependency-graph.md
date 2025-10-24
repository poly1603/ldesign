# 依赖关系图

```mermaid
graph TD
  animation["animation"]
  api["api"]
  auth["auth"]
  cache["cache"]
  color["color"]
  crypto["crypto"]
  device["device"]
  engine["engine"]
  file["file"]
  http["http"]
  i18n["i18n"]
  icons["icons"]
  logger["logger"]
  menu["menu"]
  notification["notification"]
  permission["permission"]
  router["router"]
  shared["shared"]
  size["size"]
  storage["storage"]
  store["store"]
  tabs["tabs"]
  template["template"]
  validator["validator"]
  websocket["websocket"]
  3d-panorama-viewer-monorepo["3d-panorama-viewer-monorepo"]
  barcode["barcode"]
  calendar["calendar"]
  chart["chart"]
  code-editor["code-editor"]
  cropper["cropper"]
  datepicker-monorepo["datepicker-monorepo"]
  editor["editor"]
  excel-viewer["excel-viewer"]
  flowchart-approval["flowchart-approval"]
  form["form"]
  gantt["gantt"]
  grid["grid"]
  lottie["lottie"]
  lowcode["lowcode"]
  map-renderer["map-renderer"]
  markdown["markdown"]
  mindmap["mindmap"]
  office-viewer["office-viewer"]
  pdf["pdf"]
  player["player"]
  progress["progress"]
  qrcode["qrcode"]
  signature["signature"]
  table-monorepo["table-monorepo"]
  timeline["timeline"]
  tree["tree"]
  upload["upload"]
  video["video"]
  webcomponent["webcomponent"]
  word-viewer["word-viewer"]
  analyzer["analyzer"]
  builder["builder"]
  cli["cli"]
  deployer["deployer"]
  deps["deps"]
  docs-generator["docs-generator"]
  generator["generator"]
  git["git"]
  kit["kit"]
  launcher["launcher"]
  monitor["monitor"]
  publisher["publisher"]
  security["security"]
  tester["tester"]
  animation --> shared
  api --> http
  auth --> cache
  auth --> crypto
  auth --> http
  auth --> router
  auth --> shared
  file --> http
  file --> shared
  i18n --> shared
  icons --> shared
  logger --> cache
  logger --> http
  logger --> shared
  menu --> shared
  notification --> shared
  permission --> auth
  permission --> cache
  permission --> router
  permission --> shared
  router --> device
  storage --> cache
  storage --> http
  storage --> shared
  tabs --> shared
  template --> cache
  template --> device
  template --> engine
  template --> shared
  validator --> i18n
  validator --> shared
  websocket --> shared
  websocket --> logger
  websocket --> crypto
  barcode --> shared
  calendar --> shared
  lowcode --> shared
  markdown --> shared
  mindmap --> shared
  player --> shared
  signature --> shared
  timeline --> shared
  tree --> shared
  upload --> shared
  upload --> file
  upload --> http
  upload --> crypto
  analyzer --> kit
  builder --> kit
  cli --> analyzer
  cli --> builder
  cli --> deployer
  cli --> deps
  cli --> docs-generator
  cli --> git
  cli --> generator
  cli --> launcher
  cli --> monitor
  cli --> security
  cli --> tester
  deps --> kit
  docs-generator --> kit
  generator --> kit
  git --> kit
  monitor --> logger
  monitor --> http
  monitor --> shared
  publisher --> builder
  publisher --> kit
  security --> kit
  tester --> kit
```

生成时间: 2025-10-24T06:02:05.452Z
