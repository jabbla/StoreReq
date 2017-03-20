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
		this.QueueLength = 0;
	}
	startRequest(){
		const config = this.config;

		let queue = this.reqQueue;
		let sendRate = config.sendRate;
		let pageMode = config.pageMode;
		let address = config.url;
		let pagePattern = config.pagePattern;

		setTimeout(()=>{
			let index = 0;
			while(queue.length){
				let spider = queue.shift();
				setTimeout(()=>{
					let pageInfo = pageMode? {
						pageUrl: address,
			 			pagePattern: pagePattern,
			 		} : null; 
			 		spider.request(pageInfo).then(()=>{
			 			this.completeReq(spider);
			 		}).catch(()=>{
			 			this.completeReq(spider);
			 		});
				},sendRate*index);
				index++;
			}
		},0);
	}
	queue(reqInstance){
		//参数类型检查
		
		this.reqQueue.push(reqInstance);
		this.QueueLength++;
		reqInstance.store = this;
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
		if((++this.complete)===this.QueueLength){
			this.completed = true;
			this.completeCb(this);
		}
	}
	onComplete(cb){
		this.completeCb = cb;
	}
	static combine(Stores){
		return new Promise((resolve,reject)=>{
			Stores[0].startRequest();
			Stores.forEach((value,index,arr)=>{
				try{
					value.on('complete',(instance)=>{
						if(index===arr.length-1){
							resolve(instance);
						}
						arr[index+1].startRequest();
					});
				}catch(error){
					reject(error);
				}
				
			});	
		})
	}
}

module.exports = Store;