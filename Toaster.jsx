import { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

export function Toaster({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-5 py-3 rounded-xl text-sm shadow-2xl backdrop-blur animate-fade-up
                ${t.type === 'error' ? 'bg-red-500/90' : t.type === 'success' ? 'bg-emerald-500/90' : 'bg-zinc-800/95'}
                text-white border border-white/10`}
            >
              {t.msg}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 Toaster 内')
  return ctx
}
