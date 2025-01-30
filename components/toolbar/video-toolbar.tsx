'use client'

import { useLayerStore } from "@/lib/layer-store"
import Transcription from "./transcription";

export default function VideoTools(){
    const activeLayer = useLayerStore((state) => state.activeLayer)
    if(activeLayer.resourceType === "video")
        return(
            <>
                <Transcription />
            </>
        )
}