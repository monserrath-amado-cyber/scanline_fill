/**
 * IMPLEMENTACIÓN DEL ALGORITMO SCANLINE FILL
 */

class ScanlineFill {
    constructor(ctx) {
        this.ctx = ctx;
    }

    fill(polygon, color = "black") {
        // 1. CONSTRUIR EDGE TABLE (ET)
        const edgeTable = {};
        const n = polygon.length;

        for (let i = 0; i < n; i++) {
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % n];

            // Ignorar líneas horizontales (dy = 0)
            if (p1.y === p2.y) continue;

            let ymin, ymax, xAtYmin, invSlope;

            if (p1.y < p2.y) {
                ymin = p1.y;
                ymax = p2.y;
                xAtYmin = p1.x;
                invSlope = (p2.x - p1.x) / (p2.y - p1.y);
            } else {
                ymin = p2.y;
                ymax = p1.y;
                xAtYmin = p2.x;
                invSlope = (p1.x - p2.x) / (p1.y - p2.y);
            }

            if (!edgeTable[ymin]) edgeTable[ymin] = [];
            edgeTable[ymin].push({ ymax, x: xAtYmin, invSlope });
        }
         // 2. OBTENER RANGO VERTICAL
        const ys = polygon.map(p => p.y);
        const minY = Math.floor(Math.min(...ys));
        const maxY = Math.ceil(Math.max(...ys));

        // 3. PROCESAR SCANLINES
        let activeEdgeTable = [];
        this.ctx.fillStyle = color;

        for (let y = minY; y <= maxY; y++) {
            // Agregar nuevas aristas activas desde ET
            if (edgeTable[y]) {
                activeEdgeTable.push(...edgeTable[y]);
            }

            // Eliminar aristas que ya terminaron (ymax <= y)
            activeEdgeTable = activeEdgeTable.filter(edge => edge.ymax > y);

            // Ordenar por coordenada X actual
            activeEdgeTable.sort((a, b) => a.x - b.x);

            // Rellenar entre pares de intersecciones
            for (let i = 0; i < activeEdgeTable.length; i += 2) {
                if (i + 1 >= activeEdgeTable.length) break;

                const xStart = Math.ceil(activeEdgeTable[i].x);
                const xEnd = Math.floor(activeEdgeTable[i + 1].x);

                this.ctx.fillRect(xStart, y, xEnd - xStart + 1, 1);
            }

            // Actualizar X para la siguiente scanline
            for (const edge of activeEdgeTable) {
                edge.x += edge.invSlope;
            }
        }
    }
}
// --- CONFIGURACIÓN Y USO ---

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scanline = new ScanlineFill(ctx);

// Definimos un polígono interesante (forma de rayo/estrella cóncava)
const myPolygon = [
    { x: 300, y: 50 },
    { x: 350, y: 200 },
    { x: 500, y: 200 },
    { x: 380, y: 300 },
    { x: 420, y: 430 },
    { x: 300, y: 350 },
    { x: 180, y: 430 },
    { x: 220, y: 300 },
    { x: 100, y: 200 },
    { x: 250, y: 200 }
];

// Dibujar el contorno para referencia
ctx.beginPath();
ctx.moveTo(myPolygon[0].x, myPolygon[0].y);
for (let i = 1; i < myPolygon.length; i++) {
    ctx.lineTo(myPolygon[i].x, myPolygon[i].y);
}
ctx.closePath();
ctx.strokeStyle = "#e74c3c";
ctx.lineWidth = 3;
ctx.stroke();

// Aplicar el algoritmo de relleno
scanline.fill(myPolygon, "#3498db");
