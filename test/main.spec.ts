import Main from '../src/main';
const WebSocket = new Main('ws://localhost:7001/chat/zhengyongkai', {
  _autoConnect: true,
  _reconnect: false,
});

// 上線測試
test('websocket test - online',  (done) => {
  WebSocket.on('onmessage', (res: string) => {
    
    let data = JSON.parse(res);
    if (data.type === 'OnLine') {
      let arr = data.msg;
      expect(arr).toContain('zhengyongkai'); // success
      // expect(arr).toContain("666667"); // fail
      done();
    }
  });
}, 6000);

// 聊天測試
test('websocket test - getMessage',  (done) => {
  const message = {
    type: 'onPerson',
    receviewId: 'zhengyongkai',
    formid: 'caiziming',
    msg: 'caiziming => zhengyongkai 我发给你拉',
  };
  WebSocket.send(JSON.stringify(message));
  WebSocket.on('onmessage', (res: string) => {
    let data = JSON.parse(res);
    console.log(data);
    if (data.type === 'OnMessage') {
      let arr = data.msg;
      expect(arr.receviewId).toEqual('zhengyongkai'); // success
      // expect(arr).toContain("zhengyongkais"); // fail
      done();
    }
  });
}, 6000);
