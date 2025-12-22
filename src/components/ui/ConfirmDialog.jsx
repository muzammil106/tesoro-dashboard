import { Fragment } from 'react'
import { Button } from './Button'
import { Card } from './Card'

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'danger',
    isLoading = false,
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm transition-all duration-200">
            <Card className="w-full max-w-sm animate-in fade-in zoom-in-95 p-6 shadow-2xl ring-1 ring-slate-950/5">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-slate-900">
                        {title}
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-slate-500">{description}</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
