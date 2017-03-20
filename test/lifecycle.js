'use strict';
//测试仓库的生命周期函数
let ent = require('../index.js');
let Store = ent.Store,
	Request = ent.Request;

let testReq = new Request({
	url: 'https://www.baidu.com/'
});

let testReq1 = new Request({
	url: 'http://www.zealer.com/'
});

let test = new Store();

test.queue(testReq);
test.queue(testReq1);

test.on('request',(obj)=>{
    console.log(obj.url,'已发出');
});

test.on('complete',(obj)=>{
    console.log('所有请求已接收到响应');
});

test.startRequest();