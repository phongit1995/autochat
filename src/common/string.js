let parseCookie = (cookie) => {
    let rx = /([^;=\s]*)=([^;]*)/g;
    let obj = { };
    for ( let m ; m = rx.exec(cookie) ; ){
        obj[ m[1] ] = decodeURIComponent( m[2] );
    }
    
 
    delete obj.expires;
    delete obj.path;
    delete obj.domain ;
    obj  = objToString(obj);
    return obj;
    
}
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '=' + obj[p] + ';';
        }
    }
    return str;
}
 module.exports = {parseCookie}