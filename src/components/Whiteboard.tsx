import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Trash2 } from 'lucide-react';

interface WhiteboardProps {
    socket: Socket | null;
    roomId: string;
}

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    points: Point[];
    color: string;
    size: number;
}

const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
const SIZES = [2, 5, 10, 20];

const Whiteboard = ({ socket, roomId }: WhiteboardProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(5);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

    // Draw a stroke on the canvas
    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
        if (stroke.points.length < 2) return;

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
    };

    // Initialize canvas and listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !socket) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Request latest state
        socket.emit('get-whiteboard', roomId);

        // Set canvas size
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);

                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;

                // Restore content
                ctx.drawImage(tempCanvas, 0, 0);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Socket Listeners
        socket.on('whiteboard-state', (strokes: Stroke[]) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            strokes.forEach(stroke => drawStroke(ctx, stroke));
        });

        socket.on('draw-stroke', (stroke: Stroke) => {
            drawStroke(ctx, stroke);
        });

        socket.on('clear-board', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socket.off('whiteboard-state');
            socket.off('draw-stroke');
            socket.off('clear-board');
        };
    }, [socket, roomId]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = canvas.getBoundingClientRect();
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e, canvas);
        setCurrentStroke([{ x: offsetX, y: offsetY }]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const { offsetX, offsetY } = getCoordinates(e, canvas);
        const newPoint = { x: offsetX, y: offsetY };

        // Draw locally immediately
        const lastPoint = currentStroke[currentStroke.length - 1];
        if (lastPoint) {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(newPoint.x, newPoint.y);
            ctx.stroke();
        }

        setCurrentStroke([...currentStroke, newPoint]);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentStroke.length > 0 && socket) {
            const stroke: Stroke = {
                points: currentStroke,
                color,
                size
            };
            socket.emit('draw-stroke', { roomId, stroke });
        }
        setCurrentStroke([]);
    };

    const clearBoard = () => {
        if (socket) {
            socket.emit('clear-board', { roomId });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
            {/* Toolbar */}
            <div className="p-4 bg-gray-50 border-b flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-6 h-6 rounded-full border ${color === c ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <div className="w-px h-6 bg-gray-300" />

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                    {SIZES.map(s => (
                        <button
                            key={s}
                            onClick={() => setSize(s)}
                            className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 ${size === s ? 'bg-gray-200' : ''}`}
                        >
                            <div className="rounded-full bg-black" style={{ width: s, height: s }} />
                        </button>
                    ))}
                </div>

                <div className="flex-1" />

                <button
                    onClick={clearBoard}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                >
                    <Trash2 className="w-4 h-4" /> Clear
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative touch-none bg-white cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute inset-0 w-full h-full"
                />
            </div>
        </div>
    );
};

export default Whiteboard;