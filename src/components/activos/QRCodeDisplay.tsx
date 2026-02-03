"use client"

import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRef } from "react";

interface QRCodeDisplayProps {
    value: string;
    assetCode: string;
}

export function QRCodeDisplay({ value, assetCode }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const downloadQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${assetCode}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm print:border-2 print:shadow-none">
                <QRCodeCanvas 
                    ref={canvasRef}
                    value={value} 
                    size={150} 
                    level={"H"}
                    includeMargin={true}
                />
            </div>
            
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full print:hidden" 
                onClick={downloadQR}
            >
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
            </Button>
        </div>
    );
}
