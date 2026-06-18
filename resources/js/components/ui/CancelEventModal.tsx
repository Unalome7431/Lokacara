import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CancelEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing: boolean;
    eventName: string;
}

export default function CancelEventModal({
    isOpen,
    onClose,
    onConfirm,
    isProcessing,
    eventName,
}: CancelEventModalProps) {
    useEffect(() => {
        const lenis = (window as any).lenis;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            if (lenis) {
                lenis.stop();
            }
        } else {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            if (lenis) {
                lenis.start();
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            if (lenis) {
                lenis.start();
            }
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200" data-lenis-prevent>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors disabled:cursor-not-allowed"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50">
                        <AlertTriangle size={28} />
                    </div>

                    <h3 className="font-brand text-lg font-black text-neutral-900 mb-2">
                        Batalkan Acara?
                    </h3>
                    
                    <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                        Apakah Anda yakin ingin membatalkan event <span className="font-bold">"{eventName}"</span>? 
                        Tindakan ini tidak dapat dibatalkan. Peserta akan dikirimi email dan notifikasi pembatalan. Untuk event berbayar, email refund akan dikirimkan secara otomatis.
                    </p>

                    <div className="flex w-full flex-col gap-3">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isProcessing}
                            className="flex w-full cursor-pointer items-center justify-center rounded-full bg-red-600 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
                        >
                            {isProcessing ? 'Memproses...' : 'Ya, Batalkan Acara'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex w-full cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white py-3 text-sm font-bold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 active:scale-[0.99] disabled:cursor-not-allowed"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
