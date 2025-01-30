'use server';

import z from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { actionClient } from '@/lib/safe-action';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const bgReplaceSchema = z.object({
    activeImage: z.string(),
    prompt: z.string(),
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

export const bgReplace = actionClient
    .schema(bgReplaceSchema)
    .action(async ({ parsedInput: { prompt, activeImage } }) => {
        if (!activeImage.includes('/upload/')) {
            throw new Error('Invalid activeImage URL: Missing "/upload/" segment.');
        }

        const parts = activeImage.split('/upload/');
        if (parts.length < 2) {
            throw new Error('Invalid activeImage URL: Missing "/upload/" segment.');
        }

        const bgReplaceUrl = prompt 
            ? `${parts[0]}/upload/e_gen_background_replace:prompt_${prompt}/${parts[1]}` 
            : `${parts[0]}/upload/e_gen_background_replace/${parts[1]}`

        let isProcessed = false;
        const maxAttempts = 100;
        const delay = 1000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            isProcessed = await checkImageProcessing(bgReplaceUrl);
            console.log(`Attempt ${attempt + 1}: ${isProcessed ? 'Image processed' : 'Processing not complete yet'}`);

            if (isProcessed) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        if (!isProcessed) {
            throw new Error('Image processing timed out');
        }

        console.log('Background removed successfully:', bgReplaceUrl);
        return { success: bgReplaceUrl };
    });
