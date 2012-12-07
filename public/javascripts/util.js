function range(from,to) {
   return Math.floor(Math.random() * (to - from + 1) + from);
}

function distance(a,b) {
    return Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2));
}