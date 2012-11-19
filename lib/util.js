exports.touching = function(object1, object2, hitSize) {
    if (object1.y + hitSize < object2.y) return false;
    if (object1.y > object2.y + hitSize) return false;
    if (object1.x + hitSize < object2.x) return false;
    if (object1.x > object2.x + hitSize) return false;
    return true;
}