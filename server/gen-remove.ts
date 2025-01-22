'use server'

import z from 'zod';
import {v2 as cloudinary } from "cloudinary";
import { actionClient } from '@/lib/safe-action';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET, 
})

const genRemoveSchema = z.object({
    prompt: z.string(),
    activeImage: z.string(),
})

async function checkImageProcessing(url: string){
    try {
        const response = await fetch(url)
        if(response.ok) {
            return true
        }
        return false
    } catch (error) {
        return false
    }
}

export const genRemove = actionClient
    .schema(genRemoveSchema)
    .action(async ({ parsedInput: {activeImage, prompt} }) => {
        const parts = activeImage.split("/upload/")
        const removeUrl = `${parts[0]}/upload/e_gen_remove:${prompt}/${parts[1]}`

        let isProcessed = false
        const maxAttempts = 20
        const delay = 500
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            isProcessed = await checkImageProcessing(removeUrl);
            if (isProcessed) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, delay));
        
            if (!isProcessed) {
                throw new Error("Image processing timed out");
            }
        }        
        return { success: removeUrl };
    })