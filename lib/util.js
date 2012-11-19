exports.touching = function(object1, object2, hitSize) {
    if (object1.y + hitSize < object2.y) return false;
    if (object1.y > object2.y + hitSize) return false;
    if (object1.x + hitSize < object2.x) return false;
    if (object1.x > object2.x + hitSize) return false;
    return true;
}

// this needs some more work before we can count on it
exports.packetSafe = function(what) {
    var ret = {}
    for(var n in what) {
        if(typeof what[n] == 'string' || typeof what[n] == 'number' || typeof what[n] == 'object') {
            if((typeof what[n] == 'object' && 'ontimeout' in what[n]) || (typeof what[n] == 'object' && '_onTimeout' in what[n])) {
                // interval or timeout
            } else {
                ret[n] = what[n]
            }
        }
    }
    return ret;
}

exports.range = function(from,to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
}
