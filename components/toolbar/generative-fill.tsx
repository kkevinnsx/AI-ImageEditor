'use client'

import { useImageStore } from "@/lib/image-store"
import { useLayerStore } from "@/lib/layer-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Crop, Eraser, Image } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useMemo, useState } from "react"
import { bgRemoval } from "@/server/bg-remove"

export default function GenerativeFill(){
    const setGenerating = useImageStore((state) => state.setGenerating)
    const generating = useImageStore((state) => state.generating)
    const activeLayer = useLayerStore((state) => state.activeLayer)
    const addLayer = useLayerStore((state) => state.addLayer)
    const setActiveLayer = useLayerStore((state) => state.setActiveLayer)
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const PREVIEW_SIZE = 250
    const EXPANSION_THRESHOLD = 250
    const previewStyle = useMemo(() => {
        if(!activeLayer.width || !activeLayer.height) return {}
        const newWidth  = activeLayer.width + width
        const newHeight = activeLayer.height + height
        const scale = Math.min(PREVIEW_SIZE / newWidth, PREVIEW_SIZE / newHeight)
        
        return{
            width: `${newWidth * scale}px`,
            height: `${newHeight * scale}px`,
            backgroundImage: `url(${activeLayer.url})`,
            backgroundSize: `${activeLayer.width * scale}px ${activeLayer.height * scale}px`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative' as const,
        }
    }, [activeLayer, width, height])

    return(
        <Popover>
            <PopoverTrigger disabled={!activeLayer?.url} asChild>
                <Button variant="outline" className="p-8">
                    <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
                        Generative Fill <Crop size={20} />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
                <div className="flex flex-col h-full">
                    <div className="pb-4">
                        <h3>Generative Fill</h3>
                        <p className="text-sm text-muted-foreground">
                            Remove the background of an image with one simple click.
                        </p>
                    </div>
                    {activeLayer.width && activeLayer.height ? (
                        <div className="flex justify-evenly">
                            <div className="flex flex-col items-center">
                                <span className="text-xs">Current Size:</span>
                                <p className="text-sm text-primary font-bold">
                                {activeLayer.width}x{activeLayer.height}</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs">New Size</span>
                                <p className="text-sm text-primary font-bold">
                                {activeLayer.width + width}x{activeLayer.height + height}</p>
                            </div>
                        </div>
                    ):null}
                </div>
                <div className="flex gap-2 items-center justify-center">
                    <div className="text-center">
                        <Label htmlFor="width">Modify Width</Label>
                        <Input
                            name="width"
                            type="range"
                            max={activeLayer.width}
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value))}
                            className="h-8"
                        />
                    </div>
                    <div className="text-center">
                        <Label htmlFor="width">Modify Height</Label>
                        <Input
                            name="height"
                            type="range"
                            max={activeLayer.height}
                            min={-activeLayer.height! + 100}
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value))}
                            className="h-8"
                        />
                    </div>
                </div>

                <div 
                    style={{
                        width: `${PREVIEW_SIZE}px`,
                        height: `${PREVIEW_SIZE}px`,
                    }}
                    className="preview-container flex-grow flex justify-center items-center overflow-hidden m-auto">

                    <div style={previewStyle}>
                        {/* <div className="animate-pulse" style={previewOverlayStyle}></div> */}
                    </div>
                </div>

                <Button 
                    disabled={!activeLayer?.url || generating}
                    onClick={async () => {
                        const newLayerId = crypto.randomUUID();
                        setGenerating(true);
                        
                        try {
                            const res = await bgRemoval({
                                format: activeLayer.format!,
                                activeImage: activeLayer.url!,
                            });
                        
                            if (res?.data?.success) {
                                console.log('Success:', res.data.success);
                                addLayer({
                                    id: newLayerId,
                                    url: res.data.success,
                                    format: 'png',
                                    height: activeLayer.height,
                                    width: activeLayer.width,
                                    name: 'pngConverted' + activeLayer.name,
                                    publicId: activeLayer.publicId,
                                    resourceType: 'image',
                                });
                                setActiveLayer(newLayerId);
                            } else {
                                alert('Failed to process the image. Please try again.');
                            }
                        } catch (error) {
                            console.error('Error during background removal:', error);
                            alert('An error occurred. Please try again.');
                        } finally {
                            setGenerating(false);
                        }
                    }}
                    className="w-full mt-4"
                >
                    {generating ? 'Generating...' : 'Generative Fill'}
                </Button>

            </PopoverContent>
        </Popover>
    )
}