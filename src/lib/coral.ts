export interface Point {
  lat: number;
  lng: number;
  dist: number;
  radius: number;
}

export function generateCoralPoints(rootLat: number, rootLng: number): Point[] {
  const points: Point[] = [];
  const scale = 0.003;

  const paths = [
    // Main Trunk (thick)
    { pts: [[0, 0], [0, 0.4], [0.1, 0.8], [0.2, 1.2]], depth: 0 },
    
    // Bottom Left Branch
    { pts: [[0, 0.2], [-0.5, 0.2], [-0.8, 0.25], [-1.0, 0.3]], depth: 1 },
    { pts: [[ -0.5, 0.2 ], [ -0.7, 0.0 ]], depth: 2 }, 
    { pts: [[ -0.8, 0.25 ], [ -1.1, 0.1 ]], depth: 3 },
    { pts: [[ -0.5, 0.2 ], [ -0.6, 0.4 ]], depth: 3 },

    // Mid Left Branch
    { pts: [[0.05, 0.4], [-0.3, 0.45], [-0.7, 0.5], [-1.2, 0.6]], depth: 1 },
    { pts: [[-0.3, 0.45], [-0.4, 0.7]], depth: 2 },
    { pts: [[-0.7, 0.5], [-0.9, 0.8]], depth: 3 },
    { pts: [[-0.4, 0.7], [-0.5, 0.9]], depth: 3 },
    
    // High Left Branch
    { pts: [[0.1, 0.6], [-0.1, 0.8], [-0.6, 0.9], [-0.9, 1.1]], depth: 1 },
    { pts: [[-0.6, 0.9], [-0.8, 1.3]], depth: 2 },
    { pts: [[-0.1, 0.8], [-0.3, 1.1]], depth: 2 },

    // Right Bottom
    { pts: [[0, 0.2], [0.35, 0.1], [0.55, -0.05]], depth: 1 },
    { pts: [[0.35, 0.1], [0.5, 0.2]], depth: 2 },
    { pts: [[0.55, -0.05], [0.9, -0.1], [1.3, -0.15], [1.7, -0.2]], depth: 2 },
    { pts: [[1.3, -0.15], [1.5, 0.0]], depth: 3 },
    { pts: [[1.3, -0.15], [1.4, -0.4]], depth: 3 },
    { pts: [[1.7, -0.2], [1.9, -0.25], [2.2, -0.3]], depth: 2 },
    { pts: [[1.9, -0.25], [2.0, -0.1]], depth: 3 },

    // Right Big Branch
    { pts: [[0.05, 0.35], [0.5, 0.5], [0.9, 0.6], [1.3, 0.6], [1.5, 0.5]], depth: 1 },
    { pts: [[0.5, 0.5], [0.7, 0.8], [0.8, 1.0]], depth: 2 },
    { pts: [[0.9, 0.6], [1.0, 0.3]], depth: 2 },
    { pts: [[1.3, 0.6], [1.4, 0.8]], depth: 2 },
    { pts: [[0.7, 0.8], [0.6, 1.1]], depth: 3 },
    { pts: [[0.9, 0.6], [1.1, 0.9]], depth: 3 },
    { pts: [[1.3, 0.6], [1.6, 0.7]], depth: 3 },
    { pts: [[1.5, 0.5], [1.8, 0.4], [2.1, 0.3]], depth: 2 },
    { pts: [[1.8, 0.4], [1.9, 0.6]], depth: 3 },

    // Top Right
    { pts: [[0.15, 0.8], [0.6, 1.0], [1.0, 1.1], [1.3, 1.1]], depth: 1 },
    { pts: [[0.6, 1.0], [0.7, 1.3], [0.7, 1.5], [0.6, 1.7]], depth: 2 },
    { pts: [[1.0, 1.1], [1.2, 1.4]], depth: 2 },
    { pts: [[0.7, 1.3], [0.9, 1.6]], depth: 3 },

    // Top left-ish from main
    { pts: [[0.2, 1.2], [0.1, 1.5], [-0.1, 1.8]], depth: 1 },
    { pts: [[0.2, 1.2], [0.3, 1.6], [0.4, 2.0]], depth: 1 },
    { pts: [[0.1, 1.5], [-0.2, 1.6]], depth: 2 },
    { pts: [[0.3, 1.6], [0.6, 1.8]], depth: 2 },
    { pts: [[0.2, 1.2], [-0.2, 1.3]], depth: 2 },

    // Stubs
    { pts: [[ -0.8, 0.25 ], [ -0.9, 0.15 ]], depth: 3 },
    { pts: [[ -0.7, 0.5 ], [ -0.8, 0.4 ]], depth: 3 }
  ];

  // Rotate to align with the shore line / face out to sea
  const rotationAngle = -Math.PI / 1.5; 
  const cosA = Math.cos(rotationAngle);
  const sinA = Math.sin(rotationAngle);

  // Base thickness depending on branching depth (tapering strategy)
  const baseThicknessForDepth = [4.5, 3.0, 2.0, 1.5];

  paths.forEach(path => {
    const coordList = path.pts;
    const depth = path.depth;
    
    // Compute total length to calculate global progression 't' for tapering
    let totalLength = 0;
    const segments = [];
    for (let i = 0; i < coordList.length - 1; i++) {
        const p1 = coordList[i];
        const p2 = coordList[i + 1];
        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.sqrt(dx*dx + dy*dy);
        segments.push({ p1, p2, dx, dy, len });
        totalLength += len;
    }

    let accumulatedLength = 0;
    
    segments.forEach((seg, segIndex) => {
        // Adjust density: not too high to avoid lag
        const steps = Math.max(Math.floor(seg.len * 18), 3);
        
        for (let i = 0; i <= steps; i++) {
            const stepT = i / steps;
            const globalT = (accumulatedLength + seg.len * stepT) / totalLength;

            const bx = seg.p1[0] + seg.dx * stepT;
            const by = seg.p1[1] + seg.dy * stepT;

            // Tapering: thicker at base, thinner at tips
            const initialScaleFactor = baseThicknessForDepth[depth] || 1.5;
            const currentRadius = initialScaleFactor * (1 - globalT) + 0.8 * globalT;

            // Nodularity / Jitter (asimmetrico/nodoso)
            const bump = Math.sin(globalT * Math.PI * 12) * currentRadius * 0.15;
            const jx = bx + (Math.random() - 0.5) * (currentRadius + bump) * 0.06;
            const jy = by + (Math.random() - 0.5) * (currentRadius + bump) * 0.06;

            // Apply rotation
            const rotX = jx * cosA - jy * sinA;
            const rotY = jx * sinA + jy * cosA;

            points.push({
               lat: rootLat + rotY * scale,
               lng: rootLng + rotX * scale,
               dist: Math.sqrt(jx*jx + jy*jy),
               // Scale radius to coordinate impact for mapping (passed as meters)
               radius: (currentRadius * 6) + Math.random() * 2 
            });
            
            // Add rounded tips (punte smussate) at the very end of the path
            if (i === steps && segIndex === segments.length - 1) {
               for (let k = 0; k < 4; k++) {
                   points.push({
                       lat: rootLat + (rotY + (Math.random() - 0.5) * 0.0003) * scale,
                       lng: rootLng + (rotX + (Math.random() - 0.5) * 0.0003) * scale,
                       dist: Math.sqrt(jx*jx + jy*jy) + 0.05,
                       radius: (0.8 * 8) + Math.random() * 3
                   });
               }
            }
        }
        accumulatedLength += seg.len;
    });
  });

  return points.sort((a, b) => {
     // Organic growth sorting
     return (a.dist + Math.random() * 0.1) - (b.dist + Math.random() * 0.1);
  });
}

