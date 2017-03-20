'use strict';
let Promise = require('promise');
let OriginReq = require('./originRequest');

class Request {
	constructor(reqConfig){
		//参数类型检查
		this.config = {
			retry: 0,
			retryMode: 0,//默认是自重试
			retryTimeout: 3000,
			pageMode: false,
			charSet: 'UTF-8',
			UA: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
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
		this.singleRequest();
		return this.promise;
	}
	reQueue(){
		if(this.store.reqQueue.indexOf(this)===-1) return;
		this.store.queue(this);
	}
	singleRequest(){
		const config = this.config;
		const resolve = this._resolve;
		const reject = this._reject;

		let url = config.url,
			retry = config.retry || 0,
			retryMode = retry && config.retryMode,
			retryTimeout = retry && !retryMode && config.retryTimeout || 0,
			charSet = config.charSet,
			UA = config.UA;

		OriginReq({
			url: url,
			UA: UA,
			charSet: charSet,
			timeOut: !retryMode ? retryTimeout : 0,
			retries: retry,
			requestCb: this.requestCb,
		}).then(data=>{
			resolve(data);
		}).catch(error=>{
			if(!retryMode){
				reject(error);
				return;
			}
			if(++counter>=retry){
				reject(error);
			}else{
				this.store.queue(this);
			}
		});
	}
}


module.exports = Request;