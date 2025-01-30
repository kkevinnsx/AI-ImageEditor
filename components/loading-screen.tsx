"use client"

import { useImageStore } from "@/lib/image-store"
import { useLayerStore } from "@/lib/layer-store"
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "./ui/dialog"
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import loadingAnimation from "@/public/animations/loading.json"

export default function Loading(){
    const generating = useImageStore((state) => state.generating)
    const setGenerating = useImageStore((state) => state.setGenerating)
    const activeLayer = useLayerStore((state) => state.activeLayer)

    return(
        <Dialog open={generating} onOpenChange={setGenerating}>
            <DialogContent className="sm:max-w-[420px] flex flex-col items-center">
                <DialogHeader> 
                    <DialogTitle>Editing {activeLayer.name}</DialogTitle>
                    <DialogDescription>
                        Please note that this operation might take up to a couple of seconds.
                    </DialogDescription>
                </DialogHeader>
                <Lottie className="w-36" animationData={loadingAnimation} />
            </DialogContent>
        </Dialog>
    )

}