const WebSocket = require("ws");

const WebSocketServer = WebSocket.Server;

const wss = new WebSocketServer({
  host: "127.0.0.1",
  port: 7001,
});

let connectionMap = new Map();

wss.on("connection", function (ws, req) {
  // 拿到 token
  const token = req.url.split("/")[2];
  connectionMap.set(token, ws);
  // 通知房间的人上线了多少人
  Array.from(connectionMap.values()).forEach((user) => {
    user.send(
      JSON.stringify({
        type: "OnLine",
        msg: Array.from(connectionMap.keys()),
      })
    );
  });
  ws.on("close", function (req) {
    connectionMap.delete(token);
    Array.from(connectionMap.values()).forEach((user) => {
      user.send(
        JSON.stringify({
          type: "OnLine",
          msg: Array.from(connectionMap.keys()),
        })
      );
    });
  });
  // 发送消息
  ws.on("message", function (messages) {
    let message = JSON.parse(messages);
    let { msg, receviewId, formid } = message;
    let user = connectionMap.get(receviewId);
    if (!user) {
      ws.send(
        JSON.stringify({
          type: "OnUndeUser",
          msg: {
            formid: "-1",
            msg: "用户不存在",
          },
        })
      );
    } else {
      user.send(
        JSON.stringify({
          type: "OnMessage",
          msg: {
            formid: formid,
            receviewId: receviewId,
            msg,
          },
        })
      );
    }
  });
});
