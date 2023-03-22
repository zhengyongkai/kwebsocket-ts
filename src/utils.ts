export function log(type: "success" | "error" | "warning", msg: string) {
  const colorList = {
    success: "color:#67C23A",
    error: "color:#F56C6C",
    warning: "color:#409EFF",
  };
  console.log("%c " + msg, colorList[type]);
}
