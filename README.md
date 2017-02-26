# Spider.js

---
# 基本使用
## 安装npm模块
```bash
npm install node-sr-crawler
```
## 引入模块
```js
var SrCrawler = require('node-sr-crawler');
var Store = SrCrawler.Store;        //仓库类
var Request = SrCrawler.Request;    //请求类
```
## 创建仓库实例
```js
var s1 = new Store(config);
```

## 在请求队列队尾生成请求
```js
var requset = new Request(requsetConfig);
var p = s1.queue(requset);  //返回请求的promise实例
```


## 监听事件
### 请求事件
> 发出请求

```js
s1.on('request',function(request){
//request 实例
})
```

### 请求完成事件
> 仓库中的请求全部处于完成状态

```js
s1.on('complete',function(store){
//store 实例
})
```

# 介绍
这里有两个概念需要你了解一下，1.请求实例 2.请求调度仓库
## 请求实例
生成一个请求实例
```js
var req = new Request(config);
```
发送这个请求
```js
var p = req.request();    //返回请求的Promise对象
```
配置对象(标准模式)
```js
{
    url: 'http://www.xxx.com/',
    retry: 0,           //默认0，重试次数(次)
    retryTimeout: 0,    //默认0，判定请求超时的依据(ms)
    pageMode: false,    //开启分页爬取模式，默认false
    charSet: 'UTF-8',    //请求压面的字符编码，默认utf-8
}
```

## 请求调度仓库
生成一个仓库
```js
var store = new Store(config);
```
请求入库
```js
var p = store.queue(req);   //返回入库请求的Promise对象
```
配置对象(标准模式)
```js
{
    sendRate: 2000, //请求的发送间隔(ms)，默认2000
    retry: 0,       //仓库中请求的重试次数，默认0
    retryTimeout: 0, //仓库中请求的超时判定依据(ms),默认0
    pageMode: false //是否开启分页模式，默认false
}
```
## 分页模式
> 一个分页模式的应用必须是双向的，也就是说，仓库和请求必须同时开启该请求才会开启分页模式，如想使用分页模式仓库必须开启pageMode，仓库中的请求可以选择性地开启

仓库 分页模式所需配置项
```js
{
    pageMode: true, 
    url: 'http://www.xxx.com/page=1',   //分页爬取第1页的地址，地址中的页码必须是单数
    pagePattern: /page=1/g, //能匹配上述(page=1)的正则表达式
}
```
请求 分页模式所需配置项
> 开启分页爬取模式后会忽略单独请求配置对象中的url字段，请求地址是结合调度仓库配置对象url字段和请求配置对象中pageIndex

```js
{
    pageMode: true,
    pageIndex: 1,  //请求页码，会替换上面pagePattern中数字部分
}
```






