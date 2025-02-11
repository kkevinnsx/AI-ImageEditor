'use client'

import { useImageStore } from "@/lib/image-store"
import { useLayerStore } from "@/lib/layer-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Image } from "lucide-react"
import { bgRemoval } from "@/server/bg-remove"

export default function BgRemove(){
    const setGenerating = useImageStore((state) => state.setGenerating)
    const generating = useImageStore((state) => state.generating)
    const activeLayer = useLayerStore((state) => state.activeLayer)
    const addLayer = useLayerStore((state) => state.addLayer)
    const setActiveLayer = useLayerStore((state) => state.setActiveLayer)

    return(
        <Popover>
            <PopoverTrigger disabled={!activeLayer?.url} asChild>
                <Button variant="outline" className="p-8">
                    <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
                        BG Removal <Image aria-label='description of image' size={20} />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
                <div>
                    <h3>Background Removal</h3>
                    <p className="text-sm text-muted-foreground">
                        Remote the background of and image with one simple click.
                    </p>
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
                    {generating ? 'Removing...' : 'Remove Background'}
                </Button>

            </PopoverContent>
        </Popover>
    )
}