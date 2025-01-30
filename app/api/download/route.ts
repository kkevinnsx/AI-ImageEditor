import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary"
import { checkImageProcessing } from "@/lib/check-processing";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export async function GET(request: NextRequest){
    const searchParams = request.nextUrl.searchParams
    const publicId = searchParams.get("publicId")
    const quality = searchParams.get("quality")
    const resource = searchParams.get("resource_type")
    const format = searchParams.get("format")
    const activeUrl = searchParams.get("url")

    if (!publicId) {
        return new NextResponse("Missing publicId parameter", {status: 400})
    }
    let selected = ""
    if(format === "png"){
        selected = ""
    }
    if(format !== "png"){
        switch(quality){
            case "original":
                break
            case "large":
                selected = "q_80"
                break
            case "medium":
                selected = "q_50"
                break
            case "small":
                selected = "q_30"
                break
            default:
                return new NextResponse("Invalid Quality Parameter", { status: 400})
        }   
    }
    try{
        const parts = activeUrl!.split("/upload/")
        const url = selected
        ? `${parts[0]}/upload/${selected}/${parts[1]}`
        : activeUrl!
        let isProcessed = false
        const maxAttempts = 25
        const delay = 1000
        for(let attempt = 0; attempt < maxAttempts; attempt++){
            isProcessed = await checkImageProcessing(url)
            
            if(isProcessed){
                break
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        if(!isProcessed){
            throw new Error("Image Processing Timed Out")
        }
        return NextResponse.json({
            url,
            filename: `${publicId}.${quality}.${format}`,
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Error generating image URL"},
            { status: 500  }
        )
    }
}