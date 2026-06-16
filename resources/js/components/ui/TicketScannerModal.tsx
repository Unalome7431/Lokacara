import { router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    QrCode,
    X,
    RefreshCw,
    Camera,
    CheckCircle2,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface TicketScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: number;
}

export default function TicketScannerModal({
    isOpen,
    onClose,
    eventId,
}: TicketScannerModalProps) {
    const [scannerRunning, setScannerRunning] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanOutcome, setScanOutcome] = useState<{
        type: 'success' | 'warning' | 'error' | 'idle';
        message: string;
    }>({ type: 'idle', message: '' });

    const qrCodeRegionId = 'html5qr-code-full-region';

    const startScanning = () => {
        setScanOutcome({ type: 'idle', message: '' });
        setIsVerifying(false);
        setScannerRunning(true);
    };

    const closeScanner = () => {
        setScannerRunning(false);
        setScanOutcome({ type: 'idle', message: '' });
        setIsVerifying(false);
        onClose();
    };

    // Auto-start scanning when modal opens
    useEffect(() => {
        if (isOpen) {
            startScanning();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !scannerRunning) {
            return;
        }

        const html5QrCode = new Html5Qrcode(qrCodeRegionId);

        html5QrCode
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    html5QrCode
                        .stop()
                        .then(() => {
                            setScannerRunning(false);
                            setIsVerifying(true);

                            router.post(
                                `/dashboard/events/${eventId}/attendance/scan`,
                                {
                                    qr_token: decodedText,
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: (page) => {
                                        setIsVerifying(false);
                                        const updatedFlash =
                                            (page.props as any).flash || {};

                                        if (updatedFlash.success) {
                                            setScanOutcome({
                                                type: 'success',
                                                message: updatedFlash.success,
                                            });
                                        } else if (updatedFlash.warning) {
                                            setScanOutcome({
                                                type: 'warning',
                                                message: updatedFlash.warning,
                                            });
                                        }
                                    },
                                    onError: (err) => {
                                        setIsVerifying(false);
                                        setScanOutcome({
                                            type: 'error',
                                            message:
                                                err.qr_token ||
                                                'Gagal memverifikasi tiket.',
                                        });
                                    },
                                },
                            );
                        })
                        .catch((err) =>
                            console.error('Gagal menghentikan scanner: ', err),
                        );
                },
                () => {
                    // Keep scanning silently on scan error/no QR detected
                },
            )
            .catch((err) => {
                console.error('Gagal memulai scanner: ', err);
                setScannerRunning(false);
                setScanOutcome({
                    type: 'error',
                    message:
                        'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.',
                });
            });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode
                    .stop()
                    .catch((err) =>
                        console.error('Gagal menghentikan scanner: ', err),
                    );
            }
        };
    }, [isOpen, scannerRunning, eventId]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="animate-in fade-in fixed inset-0 bg-neutral-900/40 backdrop-blur-xs duration-200"
                onClick={closeScanner}
            />

            {/* Modal Container */}
            <div className="border-neutral-150 animate-in fade-in zoom-in-95 relative z-101 flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-3xl border bg-white p-6 shadow-2xl duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h4 className="flex items-center gap-2 font-brand text-h6-mobile font-black text-neutral-900 lg:text-h6-web">
                        <QrCode size={20} className="text-primary-500" />
                        <span>Scan QR Tiket Kehadiran</span>
                    </h4>
                    <button
                        type="button"
                        onClick={closeScanner}
                        className="flex cursor-pointer items-center justify-center rounded-full border-0 bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Camera Viewport / Outcome States */}
                <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950">
                    {isVerifying ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center text-white">
                            <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary-500" />
                            <h5 className="text-base font-bold text-white">
                                Memverifikasi Tiket...
                            </h5>
                            <p className="mt-1 text-xs text-neutral-400">
                                Harap tunggu sebentar
                            </p>
                        </div>
                    ) : scanOutcome.type === 'idle' ? (
                        scannerRunning ? (
                            <div className="relative h-full w-full">
                                {/* html5-qrcode target region */}
                                <div
                                    id={qrCodeRegionId}
                                    className="h-full w-full object-cover [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
                                />

                                {/* Overlay scanning frame guide */}
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-8">
                                    <span className="rounded-full bg-neutral-900/60 px-3 py-1.5 text-[0.65rem] font-bold tracking-widest text-white/75 uppercase backdrop-blur-xs">
                                        Arahkan Kamera ke QR Code
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                                <Camera size={40} className="mb-3 text-neutral-600" />
                                <span className="text-sm font-medium">
                                    Kamera dinonaktifkan
                                </span>
                                <button
                                    type="button"
                                    onClick={startScanning}
                                    className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-primary-600"
                                >
                                    <RefreshCw size={12} />
                                    Mulai Scanner
                                </button>
                            </div>
                        )
                    ) : (
                        /* Premium scan outcomes in Bahasa Indonesia */
                        <div className="animate-in fade-in zoom-in-95 flex h-full w-full flex-col items-center justify-center p-8 text-center duration-200">
                            {scanOutcome.type === 'success' && (
                                <div className="flex animate-bounce flex-col items-center">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-8 ring-green-500/5">
                                        <CheckCircle2 size={44} />
                                    </div>
                                    <h5 className="mb-2 text-h6-mobile font-black text-white lg:text-h6-web">
                                        Check-in Berhasil!
                                    </h5>
                                    <p className="max-w-[280px] text-sm text-neutral-300">
                                        {scanOutcome.message}
                                    </p>
                                </div>
                            )}
                            {scanOutcome.type === 'warning' && (
                                <div className="flex animate-pulse flex-col items-center">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 ring-8 ring-yellow-500/5">
                                        <AlertTriangle size={44} />
                                    </div>
                                    <h5 className="mb-2 text-h6-mobile font-black text-white lg:text-h6-web">
                                        Peringatan
                                    </h5>
                                    <p className="max-w-[280px] text-sm text-neutral-300">
                                        {scanOutcome.message}
                                    </p>
                                </div>
                            )}
                            {scanOutcome.type === 'error' && (
                                <div className="flex animate-pulse flex-col items-center">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-8 ring-red-500/5">
                                        <XCircle size={44} />
                                    </div>
                                    <h5 className="mb-2 text-h6-mobile font-black text-white lg:text-h6-web">
                                        Check-in Gagal
                                    </h5>
                                    <p className="max-w-[280px] text-sm text-neutral-300">
                                        {scanOutcome.message}
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={startScanning}
                                className="mt-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-white/20 active:scale-[0.98]"
                            >
                                <RefreshCw size={12} />
                                <span>Scan Tiket Lain</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
