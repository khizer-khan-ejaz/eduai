import React, { useState, useRef, useEffect } from 'react';

const CoordinateGeometrySim = () => {
  const canvasRef = useRef(null);
  const [point, setPoint] = useState({ x: 3, y: 4 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 20; // 20 pixels per unit

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#e0e0e0';
    for (let i = 0; i <= width; i += scale) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height); ctx.stroke(); // Y
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(width, centerY); ctx.stroke(); // X

    // Draw Point
    const px = centerX + point.x * scale;
    const py = centerY - point.y * scale; // Invert Y for standard math coordinates
    
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw guides
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#ff3b30';
    ctx.beginPath(); ctx.moveTo(px, centerY); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(centerX, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);

  }, [point]);

  return (
    <div className="simulation-container p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Coordinate Geometry: Plotting Points</h2>
      <p className="mb-4 text-gray-600">The Cartesian plane has an X-axis (horizontal) and Y-axis (vertical). Try changing the coordinates below to see the point move.</p>
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="border rounded-lg bg-gray-50 cursor-crosshair max-w-full"
          onClick={(e) => {
             const rect = canvasRef.current.getBoundingClientRect();
             const x = Math.round(((e.clientX - rect.left) - 200) / 20);
             const y = Math.round((200 - (e.clientY - rect.top)) / 20);
             setPoint({x, y});
          }}
        />
        
        <div className="controls flex flex-col gap-4 w-full md:w-auto">
          <div className="control-group">
            <label className="block text-sm font-medium">X Coordinate: {point.x}</label>
            <input 
              type="range" min="-10" max="10" value={point.x} 
              onChange={(e) => setPoint({...point, x: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
          <div className="control-group">
            <label className="block text-sm font-medium">Y Coordinate: {point.y}</label>
            <input 
              type="range" min="-10" max="10" value={point.y} 
              onChange={(e) => setPoint({...point, y: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>
          <div className="p-4 bg-blue-50 rounded-lg mt-4">
            <h3 className="font-semibold">Step-by-Step Breakdown:</h3>
            <ol className="list-decimal ml-4 text-sm mt-2 text-blue-900 space-y-2">
              <li>Start at the origin (0,0).</li>
              <li>Move {Math.abs(point.x)} units {point.x >= 0 ? 'right' : 'left'} along the X-axis.</li>
              <li>Move {Math.abs(point.y)} units {point.y >= 0 ? 'up' : 'down'} parallel to the Y-axis.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CoordinateGeometrySim;
