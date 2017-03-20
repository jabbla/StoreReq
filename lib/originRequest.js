'use strict';
let Promise = require('promise');
let http = require('http');
let https = require('https');
let Url = require('url');
let iconv = require('iconv-lite');
let bufferHelper = require('bufferhelper');


let netModule = {'http:': http,'https:': https};

let sendRequest = function(obj){
    let url = obj.url,
        urlObj = Url.parse(url),
        protocol = urlObj.protocol,
        host = urlObj.host,
        path = urlObj.path,
        UA = obj.UA,
        charSet = obj.charSet,
        timeOut = obj.timeOut,
        retries = obj.retries,
		requestCb = obj.requestCb;

    return new Promise(function(resolve,reject){
        let counter = 0;
        let send = function(){
			requestCb({url: url});
            let req = netModule[protocol].get({
				protocol: protocol,
				host: host,
				path: path,
				method: 'GET',
				headers: {
					'User-Agent': UA
				}
			},(res)=>{
				const statusCode = res.statusCode;
				const contentType = res.headers['content-type'];

				let error;
				if(statusCode !== 200){
					error = new Error('请求失败\n 状态码：',statusCode);
				}else if(!/^text\/html/.test(contentType)){
					error = new Error('无效的响应类型\n ',contentType);
				}

				if(error){
					res.resume();
					reject(error);
					return;
				}
				let bufferhelper = new bufferHelper();
				res.on('data',chunk =>{
					bufferhelper.concat(chunk);
				});
				res.on('end',() => {
					let data = iconv.decode(bufferhelper.toBuffer(),charSet);
					resolve(data);
                    return;
				});
			});
            req.on('error',(e)=>{
				let error = new Error(e.message);
				reject({
                    url: url,
                    error: error,
                });
			});
            if(timeOut && retries && retries>0){
                if(counter<retries){
                    req.setTimeout(timeOut,()=>{
                        req.abort();
                        counter++;
                        send();         
                    })
                }else{
                    let error = new Error('已超出重试次数');
                    reject(error);
                }
            }
        };
        send();
    });
}


module.exports = sendRequest;