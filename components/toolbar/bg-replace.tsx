'use client'

import { useImageStore } from "@/lib/image-store"
import { useLayerStore } from "@/lib/layer-store"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { ImageOff } from "lucide-react"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useState } from "react"
import { bgReplace } from "@/server/bg-replace"

export default function BackgroundReplace(){
    const setGenerating = useImageStore((state) => state.setGenerating)
    const generating = useImageStore((state) => state.generating)
    const activeLayer = useLayerStore((state) => state.activeLayer)
    const addLayer = useLayerStore((state) => state.addLayer)
    const setActiveLayer = useLayerStore((state) => state.setActiveLayer)
    const [prompt, setPrompt] = useState('')

    return(
        <Popover>
            <PopoverTrigger disabled={!activeLayer?.url} asChild>
                <Button variant="outline" className="p-8">
                    <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
                        BG Replace <ImageOff size={20} />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
                <div>
                    <h3>Generative Background Replace</h3>
                    <p className="text-sm text-muted-foreground">
                        Replace the background of your image with AI-Generated content.
                    </p>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Input 
                        id='prompt' 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the new background"    
                    />
                </div>

                <Button 
                    disabled={!activeLayer?.url || generating}
                    onClick={async () => {
                        const newLayerId = crypto.randomUUID();
                        setGenerating(true);
                        
                        try {
                            const res = await bgReplace({
                                prompt: prompt,
                                activeImage: activeLayer.url!,
                            });
                        
                            if (res?.data?.success) {
                                console.log('Success:', res.data.success);
                                addLayer({
                                    id: newLayerId,
                                    url: res.data.success,
                                    format: activeLayer.format,
                                    height: activeLayer.height,
                                    width: activeLayer.width,
                                    name: 'genReplaced' + activeLayer.name,
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
                    {generating ? 'Generating...' : 'Replace Background'}
                </Button>

            </PopoverContent>
        </Popover>
    )
}