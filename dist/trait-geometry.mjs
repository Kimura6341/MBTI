// Coordinate runs from the left pole (0) to the right pole (100).
export function traitGeometry(percent,dominantLeft){
 const pct=Math.min(100,Math.max(50,Number(percent)));
 if(!Number.isFinite(pct))throw new TypeError('Invalid trait percentage');
 const marker=dominantLeft?100-pct:pct;
 return {marker,fillStart:0,fillWidth:100};
}
