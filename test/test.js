'use strict';

let ent = require('../index.js');
let Store = ent.Store,
	Request = ent.Request;

let testReq = new Request({
	url: 'https://www.baidu.com/'
});

testReq.request().then(htmlText=>{
	console.log(htmlText);
}).catch((error)=>{
	console.log(error);
})
