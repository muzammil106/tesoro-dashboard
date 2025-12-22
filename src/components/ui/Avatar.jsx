import React, { useState } from 'react'
import { User } from 'lucide-react'

export function Avatar({ src, alt, size = 'md', className = '' }) {
    const [error, setError] = useState(false)

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-24 w-24',
    }

    const classes = `relative inline-flex items-center justify-center rounded-full bg-slate-100 overflow-hidden ${sizeClasses[size]} ${className}`

    if (error || !src) {
        return (
            <div className={classes}>
                <User className="h-[60%] w-[60%] text-slate-400" />
            </div>
        )
    }

    return (
        <div className={classes}>
            <img
                src={src}
                alt={alt || 'Avatar'}
                className="h-full w-full object-cover"
                onError={() => setError(true)}
            />
        </div>
    )
}
