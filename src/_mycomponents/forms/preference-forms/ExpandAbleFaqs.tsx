"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock } from "lucide-react";
import CustomAudioPlayer from "@/_mycomponents/common/CustomAudioPlayer";

interface HymnItem {
    name: string;
    duration: string;
}

interface HymnSection {
    title: string;
    items: HymnItem[];
}

const hymnSections: HymnSection[] = [
    {
        title: "Processional",
        items: [
            { name: "Vocal Name 1", duration: "0:30" },
            { name: "Vocal Name 2", duration: "0:45" },
            { name: "Vocal Name 3", duration: "0:20" },
        ],
    },
    {
        title: "Recessional",
        items: [
            { name: "Vocal Name 4", duration: "0:35" },
            { name: "Vocal Name 5", duration: "0:25" },
            { name: "Vocal Name 6", duration: "0:40" },
        ],
    },
    {
        title: "Congregational Hymn 1",
        items: [
            { name: "Vocal Name 7", duration: "0:50" },
            { name: "Vocal Name 8", duration: "0:30" },
            { name: "Vocal Name 9", duration: "0:45" },
        ],
    },
];

export default function HymnSelector() {
    const [checkedSections, setCheckedSections] = useState<Record<string, boolean>>({});

    const handleCheckboxChange = (sectionIndex: number, isChecked: boolean) => {
        setCheckedSections((prev) => ({
            ...prev,
            [sectionIndex]: isChecked,
        }));
    };

    return (
        <div className="w-full">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {hymnSections.map((section, sectionIndex) => (
                    <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline flex items-center">
                            <div className="flex items-center">
                                <Checkbox
                                    checked={checkedSections[sectionIndex] || false}
                                    onCheckedChange={(isChecked: boolean) => handleCheckboxChange(sectionIndex, isChecked)}
                                    id={`checkbox-${sectionIndex}`}
                                    className="mr-2"
                                />
                                <span className="text-lg mr-5 font-medium">{section.title}</span>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-1" />
                                    3m 42 sec
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 py-2">
                                <CustomAudioPlayer audioUrl="/audio/audio.mp3"></CustomAudioPlayer>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
