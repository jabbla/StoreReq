'use strict';

let http = require('http');
let https = require('https');
let Url = require('url');
let iconv = require('iconv-lite');
let bufferHelper = require('bufferhelper');
let Promise = require('promise');

class Request {
	constructor(reqConfig){
		//参数类型检查
		this.config = {
			retry: 0,
			pageMode: false,
			charSet: 'UTF-8'
		};
		this.config = Object.assign(this.config,reqConfig);
		//pageMode判断
		let pageMode = this.config.pageMode;

		if(pageMode){
			this.pageIndex = this.config.pageIndex;
		}

		this.promise = new Promise((resolve,reject)=>{
			this._resolve = resolve;
			this._reject = reject;
		});
		this.counter = 0;
		this.requestCb = ()=>{};
	}
	request(pageInfo){
		const config = this.config;
		if(pageInfo){
			let pageUrl = pageInfo.pageUrl;
			let pagePattern = pageInfo.pagePattern;
			let pageIndex = config.pageIndex;	

			this.config.pageMode = true;
			this.config.url = pageUrl.replace(pagePattern,(m,p1)=>m.replace(/\d/g,pageIndex));
		}
		this.singleRequest()();
		return this.promise;
	}
	singleRequest(){
		const config = this.config;
		const resolve = this._resolve;
		const reject = this._reject;

		let url = config.url,
			retry = config.retry || 0,
			retryTimeout = config.retryTimeout || 0,
			charSet = config.charSet;


		let httpsRequest = ()=>{
			if(this.counter>retry){
				reject('重试次数已达上限')
				return;
			}
			let urlObj = Url.parse(url),
				protocol = urlObj.protocol,
				host = urlObj.host,
				path = urlObj.path;

			let netModule = {
				'http:': http,
				'https:': https,
			};

			let req = netModule[protocol].get({
				protocol: protocol,
				host: host,
				path: path,
				method: 'GET',
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
				}
			},(res)=>{
				const statusCode = res.statusCode;
				const contentType = res.headers['content-type'];

				let error;
				if(statusCode !== 200){
					error = new Error('请求失败\n 状态码：'+statusCode);
				}else if(!/^text\/html/.test(contentType)){
					error = new Error('无效的响应类型\n ',contentType);
				}

				if(error){
					console.log(error.message);
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
				})
			});
			req.on('error',(e)=>{
				console.log('出错：',e.message);
			});
			this.requestCb(this);
			if(retry<=0) return;
			req.setTimeout(retryTimeout,()=>{
				req.abort();
				if(this.counter<retry){
					console.log('第'+(++this.counter)+'次重试 共'+retry+'次');
					httpsRequest();
				}
			});
		};
		return httpsRequest; 
	}
}

module.exports = Request;