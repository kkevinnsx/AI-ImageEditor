'use client'

import { useImageStore } from "@/lib/image-store"
import { useLayerStore } from "@/lib/layer-store"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { Button } from "../ui/button"
import { Crop, Square } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { cn } from "@/lib/utils"
import Youtube from "../icons/youtube"
import TikTok from "../icons/tiktok"
import { genCrop } from "@/server/gen-crop"

export default function SmartCrop(){
    const setGenerating = useImageStore((state) => state.setGenerating)
    const activeLayer = useLayerStore((state) => state.activeLayer)
    const addLayer = useLayerStore((state) => state.addLayer)
    const [aspectRatio, setAspectRatio] = useState("16:9") 
    const generating = useImageStore((state) => state.generating)
    const setActiveLayer = useLayerStore((state) => state.setActiveLayer)

    return (
        <Popover>
          <PopoverTrigger disabled={!activeLayer?.url} asChild>
            <Button variant="outline" className="py-8 relative z-50">
              <span className="flex flex-col items-center gap-1 text-xs font-medium">
                Smart Crop
                <Crop size={18} />
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-background border border-border shadow-lg rounded-lg z-50">
            <div className="flex flex-col h-full">
              <div className="space-y-2 pb-4 text-center">
                <h3 className="font-medium py-2 leading-none">
                  Smart Recrop
                </h3>
              </div>
              <h4 className="text-md font-medium pb-2">Format</h4>
              <div className="grid grid-cols-3 gap-2 items-center justify-center pb-2">
                <Card
                  className={cn(
                    aspectRatio === "16:9" ? "border border-primary" : "border border-transparent",
                    "p-4 cursor-pointer hover:border-primary transition w-full"
                  )}
                  onClick={() => setAspectRatio("16:9")}
                >
                  <CardHeader className="text-center p-0">
                    <CardTitle className="text-md">Youtube</CardTitle>
                    <CardDescription>
                      <p className="text-sm font-bold">16:9</p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-0 pt-2">
                    <Youtube />
                  </CardContent>
                </Card>
                <Card
                  className={cn(
                    aspectRatio === "9:16" ? "border border-primary" : "border border-transparent",
                    "p-4 cursor-pointer hover:border-primary transition w-full"
                  )}
                  onClick={() => setAspectRatio("9:16")}
                >
                  <CardHeader className="p-0 text-center">
                    <CardTitle className="text-md ">Tiktok</CardTitle>
                    <CardDescription>
                      <p className="text-sm font-bold ">9:16</p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-0 pt-2">
                    <TikTok />
                  </CardContent>
                </Card>
                <Card
                  className={cn(
                    aspectRatio === "1:1" ? "border border-primary" : "border border-transparent",
                    "p-4 cursor-pointer hover:border-primary transition w-full"
                  )}
                  onClick={() => setAspectRatio("1:1")}
                >
                  <CardHeader className="p-0 text-center">
                    <CardTitle className="text-md">Square</CardTitle>
                    <CardDescription>
                      <p className="text-sm font-bold">1:1</p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-0 pt-2">
                    <Square className="w-10 h-10" />
                  </CardContent>
                </Card>
              </div>
              <Button
                onClick={async () => {
                    setGenerating(true)
                    const res = await genCrop({
                        height: activeLayer.height!.toString(),
                        aspect: aspectRatio,
                        activeVideo: activeLayer.url!,
                    })
                    if(res?.data?.success) {
                        setGenerating(false)
                        const newLayerId = crypto.randomUUID();
                        const thumbnailUrl = res.data.success.replace(/\.[^/.]+$/, ".jpg")
                        addLayer({
                            id:newLayerId,
                            name: "Cropped " + activeLayer.name,
                            format: activeLayer.format,
                            height: activeLayer.height!,
                            width: activeLayer.width!,
                            url: res.data.success,
                            publicId: activeLayer.publicId,
                            resourceType: "video",
                            poster: thumbnailUrl,
                        })
                        setActiveLayer(newLayerId)
                    }
                    if(res?.data?.error){
                        setGenerating(false)
                    }
                }}
                className="w-full mt-4"
                variant="outline"
                disabled={!activeLayer.url || generating}
              >
                {generating ? "Cropping..." : "Smart Crop 🎨"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )
    }