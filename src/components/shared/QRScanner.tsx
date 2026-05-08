"use client";

import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Loader2, Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrCodeId = "reader";
    const html5QrCode = new Html5Qrcode(qrCodeId);
    html5QrCodeRef.current = html5QrCode;

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            onScan(decodedText);
          },
          () => {
            // Scan error (usually just means no QR found in frame)
          }
        );
        setIsReady(true);
      } catch (err: any) {
        console.error("Scanner start error:", err);
        setError("No se pudo acceder a la cámara");
      }
    };

    startScanner();

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Scanner stop error", err));
      }
    };
  }, [onScan]);

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-black/40">
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Iniciando Cámara...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 p-6 text-center">
          <Camera className="w-8 h-8 text-destructive opacity-50" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-destructive">{error}</p>
        </div>
      )}

      <div id="reader" className="w-full h-full object-cover" />
      
      {isReady && (
        <>
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            
            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-scan-loop" />
          </div>
        </>
      )}
    </div>
  );
}
