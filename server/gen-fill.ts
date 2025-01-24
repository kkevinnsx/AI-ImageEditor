'use server';

import z from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { actionClient } from '@/lib/safe-action';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const genFillSchema = z.object({
    activeImage: z.string(),
    aspect: z.string(),
    width: z.number(),
    height: z.number(),
});

async function checkImageProcessing(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log('Response status:', response.status);

        if (response.status === 200) {
            return true;
        }

        if (response.status === 423) {
            console.log('Processing not complete yet (423)');
            return false;
        }

        if (response.status === 400) {
            throw new Error('Bad request: Verify the URL or Cloudinary configuration.');
        }

        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
        console.error('Error in checkImageProcessing:', error);
        return false;
    }
}

export const genFill = actionClient
    .schema(genFillSchema)
    .action(async ({ parsedInput: { activeImage, aspect,height, width } }) => {
        if (!activeImage.includes('/upload/')) {
            throw new Error('Invalid activeImage URL: Missing "/upload/" segment.');
        }

        const parts = activeImage.split('/upload/');
        if (parts.length < 2) {
            throw new Error('Invalid activeImage URL: Missing "/upload/" segment.');
        }

        const fillUrl = `${parts[0]}/upload/ar_${aspect},b_gen_fill,c_pad,w_${width},h_${height}/${parts[1]}`;
        console.log('Generated Background Removal URL:', fillUrl);

        let isProcessed = false;
        const maxAttempts = 60;
        const delay = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            isProcessed = await checkImageProcessing(fillUrl);
            console.log(`Attempt ${attempt + 1}: ${isProcessed ? 'Image processed' : 'Processing not complete yet'}`);

            if (isProcessed) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        if (!isProcessed) {
            throw new Error('Image processing timed out');
        }

        console.log('Background removed successfully:', fillUrl);
        return { success: fillUrl };
    });
