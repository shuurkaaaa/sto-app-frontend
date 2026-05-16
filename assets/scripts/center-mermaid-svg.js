/** Centers Mermaid flowchart: shift Client to horizontal midpoint; widen viewBox to PER bounds. */
const fs = require("fs");

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Usage: node center-mermaid-svg.js <in.svg> <out.svg>");
  process.exit(1);
}

let s = fs.readFileSync(inPath, "utf8");

const vb = s.match(/viewBox="0\s+0\s+([\d.]+)\s+([\d.]+)"/);
if (!vb) {
  console.error("No viewBox 0 0 W H found");
  process.exit(1);
}
const W = parseFloat(vb[1]);
const H = parseFloat(vb[2]);

const cl = s.match(
  /id="my-svg-flowchart-CL-[^"]*"[^>]*transform="translate\(([\d.]+),\s*([\d.]+)\)"/
);
if (!cl) {
  console.warn("Client node not found; skip centering");
  fs.writeFileSync(outPath, s);
  process.exit(0);
}
const cx = parseFloat(cl[1]);
const dx = Math.round((W / 2 - cx) * 1000) / 1000;

const perMatch = s.match(
  /id="my-svg-PER"[^>]*>[\s\S]*?<rect[^>]*?\sx="([\d.]+)"[^>]*?\swidth="([\d.]+)"/
);
let minGx = 0;
let maxGx = W;
if (perMatch) {
  minGx = parseFloat(perMatch[1]);
  maxGx = parseFloat(perMatch[1]) + parseFloat(perMatch[2]);
}

const margin = 56;
const minV = minGx + dx;
const maxV = maxGx + dx;
const vbX = minV - margin;
const vbW = maxV - minV + 2 * margin;
const vbY = -margin;
const vbH = H + 2 * margin;

s = s.replace(/<g class="root">/, `<g class="root" transform="translate(${dx},0)">`);
s = s.replace(
  /viewBox="0\s+0\s+[\d.]+\s+[\d.]+"/,
  `viewBox="${vbX} ${vbY} ${vbW} ${vbH}"`
);
s = s.replace(/\swidth="[^"]*"/, "");
s = s.replace(/style="([^"]*)"/, (m, st) => {
  const cleaned = st
    .replace(/max-width:\s*[^;]+;?\s*/gi, "")
    .replace(/background-color:\s*[^;]+;?/gi, "background-color: white")
    .replace(/;\s*;/g, ";")
    .trim();
  return `style="${cleaned}"`;
});

fs.writeFileSync(outPath, s);
console.error(`centered: dx=${dx}, viewBox=${vbX} ${vbY} ${vbW} ${vbH}`);
