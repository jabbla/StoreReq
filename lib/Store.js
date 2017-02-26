'use strict';

let Promise = require('promise');

class Store {
	constructor(config){
		//参数类型检查
		this.config = {
			pageMode: false,
			sendRate: 2000,
			retry: 0,
		};
		this.config = Object.assign(this.config,config);
		this.reqQueue = [];
		this.complete = 0;

		setTimeout(()=>{
			this.startRequest();
		},0);
	}
	startRequest(){
		const config = this.config;

		let queue = this.reqQueue;
		let sendRate = config.sendRate;
		let pageMode = config.pageMode;
		let address = config.url;
		let pagePattern = config.pagePattern;


		setTimeout(()=>{
			queue.forEach((value,index)=>{
				setTimeout(()=>{
					let pageInfo = pageMode? {
						pageUrl: address,
						pagePattern: pagePattern,
					} : null; 
					value.request(pageInfo).then(()=>{
						this.completeReq(value);
					}).catch(()=>{
						this.completeReq(value);
					});
				},sendRate*index)
			})
		},0);
	}
	queue(reqInstance){
		//参数类型检查
		
		this.reqQueue.push(reqInstance);

		return reqInstance.promise;
	}
	on(type,cb){
		//参数类型检查
		switch(type){
			case 'request': this.onRequest(cb);break;
			case 'complete': this.onComplete(cb);break;
		}
	}
	onRequest(cb){
		this.reqQueue.forEach((value,index)=>{
			value.requestCb = cb;
		})
	}
	completeReq(req){
		if((++this.complete)===this.reqQueue.length){
			this.completed = true;
			this.completeCb(this);
		}
	}
	onComplete(cb){
		this.completeCb = cb;
	}
}

module.exports = Store;