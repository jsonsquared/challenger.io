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

packetSafe = function(what) {
    var ret = {}
    for(var n in what) {
        if(!isCircularObject(what[n])) {
            ret[n] = what[n]
        }
    }
    return ret;
}