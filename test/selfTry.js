'use strict';
//测试请求的自身重试功能
let ent = require('../index.js');
let Store = ent.Store,
	Request = ent.Request;

let testReq = new Request({
	url: 'http://www.baidu.com/',
	retry: 1,
});

testReq.request().then(htmlText=>{
	console.log(htmlText);
}).catch((error)=>{
	console.log(error);
})
