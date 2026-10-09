'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type PopupType = 'error' | 'warning' | 'success' | 'info';

interface PopupMessage {
  message: string;
  type: PopupType;
  onClose?: () => void;
}

interface PopupContextValue {
  showPopup: (message: string, type?: PopupType, onClose?: () => void) => void;
}

const PopupContext = createContext<PopupContextValue | null>(null);

const popupStyles: Record<PopupType, { title: string; color: string }> = {
  error: { title: 'Hata', color: 'text-red-600 bg-red-100' },
  warning: { title: 'Uyarı', color: 'text-amber-600 bg-amber-100' },
  success: { title: 'Başarılı', color: 'text-green-600 bg-green-100' },
  info: { title: 'Bilgi', color: 'text-blue-600 bg-blue-100' },
};

const popupIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupMessage | null>(null);

  const showPopup = useCallback(
    (message: string, type: PopupType = 'info', onClose?: () => void) => {
      setPopup({ message, type, onClose });
    },
    []
  );

  const closePopup = () => {
    const currentPopup = popup;
    setPopup(null);
    currentPopup?.onClose?.();
  };

  const Icon = popup ? popupIcons[popup.type] : null;
  const style = popup ? popupStyles[popup.type] : null;

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {popup && Icon && style && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            aria-describedby="popup-message"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.color}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <h2 id="popup-title" className="text-lg font-bold text-gray-900">
                  {style.title}
                </h2>
                <p id="popup-message" className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                  {popup.message}
                </p>
              </div>
              <button
                type="button"
                onClick={closePopup}
                aria-label="Kapat"
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                autoFocus
                onClick={closePopup}
                className="rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1A3354]"
              >
                Tamam
              </button>
            </div>
          </section>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
