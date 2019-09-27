let memoryCache = require('memory-cache');
let SaveCache = (name,data,time=15000)=>{
    memoryCache.put(name,data,time);
}
let getCache = (name)=>{
     return memoryCache.get(name);
}
module.exports = { SaveCache , getCache} ;