touching = function(object1, object2, hitSize) {
    if (object1.y + hitSize < object2.y) return false;
    if (object1.y > object2.y + hitSize) return false;
    if (object1.x + hitSize < object2.x) return false;
    if (object1.x > object2.x + hitSize) return false;
    return true;
}

range = function(from,to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
}


dataFor = function(which) {
    var ret = {}
    for(var a = 0; a<which.attributes.length;a++) {
        ret[which.attributes[a]] = which[which.attributes[a]]
    }
    return ret;
}

uid = function() {
    return (new Date()).getTime() + '-' + range(1000,9999)
}

packetSafe = function(what) {
    var ret = {}
    for(var n in what) {
        if(!isCircularObject(what[n])) {
            ret[n] = what[n]
        }
    }
    return ret;
}

isCircularObject = function(node, parents){
    parents = parents || [];

    if(!node || typeof node != "object"){
        return false;
    }

    var keys = Object.keys(node), i, value;

    parents.push(node); // add self to current path
    for(i = keys.length-1; i>=0; i--){
        value = node[keys[i]];
        if(value && typeof value == "object"){
            if(parents.indexOf(value)>=0){
                // circularity detected!
                return true;
            }
            // check child nodes
            if(arguments.callee(value, parents)){
                return true;
            }

        }
    }
    parents.pop(node);
    return false;
}



exports.touching = touching;
exports.range = range;
exports.dataFor = dataFor;
exports.uid = uid;
exports.packetSafe = packetSafe;