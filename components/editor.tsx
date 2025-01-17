"use client"

import { ModeToggle } from "@/components/theme/mode-toggle"
import Layers from "./layers/layers"
import UploadImage from "./upload/upload-image"

export default function Editor () {
    return(
        <div className="flex h-full">   
            <div className="py-6 px-4 basis-[360px] shrink-0">
                <div className="pb-12 text-center">
                    <ModeToggle />
                </div>
            </div>
            <h1>Photo Editor</h1>
            <UploadImage />
            <Layers />
        </div>
    )
}