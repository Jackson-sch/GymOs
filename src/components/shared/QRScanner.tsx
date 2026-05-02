"use client";

import React from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

  React.useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    function onScanSuccess(decodedText: string) {
      scanner.clear();
      onScan(decodedText);
    }

    function onScanFailure(error: any) {
      // Ignore
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear error", err));
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="relative">
      <div id="reader" className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50" />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl animate-pulse" />
      </div>
    </div>
  );
}
