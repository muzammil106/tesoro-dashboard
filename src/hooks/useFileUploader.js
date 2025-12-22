import { useState, useCallback } from 'react'

export function useFileUploader() {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState(null)

    const uploadFile = useCallback(async (file) => {
        if (!file) return null

        setIsUploading(true)
        setError(null)

        try {
            // Mock Upload logic
            // In production, this would:
            // 1. Request presigned URL from backend
            // 2. Upload file to S3 using presigned URL
            // 3. Return the public URL

            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

            // TODO: Replace with actual S3 upload
            /*
            const { presignedUrl, publicUrl } = await http.post('/upload/presign', { type: file.type })
            await fetch(presignedUrl, { method: 'PUT', body: file })
            return publicUrl
            */

            // For now, return a placeholder or a blob URL to show it works
            // const blobUrl = URL.createObjectURL(file)

            // Returning a static placeholder to simulate "uploaded" state as requested
            // or we can just return a fake S3 URL if we want to store strings
            return 'https://placehold.co/400?text=Uploaded+Image'

        } catch (err) {
            setError(err)
            throw err
        } finally {
            setIsUploading(false)
        }
    }, [])

    return {
        uploadFile,
        isUploading,
        error,
    }
}
