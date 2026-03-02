import { useState } from "react";
import {
    Combobox,
    ComboboxTrigger,
    ComboboxInput,
    ComboboxValue,
    ComboboxTriggerIndicator,
    ComboboxClear,
    ComboboxPortal,
    ComboboxContent,
    ComboboxViewport,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxItemText,
    ComboboxItemIndicator,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxSeparator,
    ComboboxScrollUpButton,
    ComboboxScrollDownButton,
} from "../ui/combobox";

const countries = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "cn", label: "China" },
    { value: "in", label: "India" },
    { value: "br", label: "Brazil" },
];

export function ComboboxDemo() {
    const [collisionBoundary, setCollisionBoundary] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary2, setCollisionBoundary2] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary3, setCollisionBoundary3] = useState<HTMLDivElement | null>(null);

    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Combobox</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Input in Content (Single Select)</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="apple">
                            <ComboboxTrigger>
                                <ComboboxValue placeholder="Select a fruit..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxInput placeholder="Search..." />
                                        <ComboboxEmpty />
                                        <ComboboxItem value="apple">
                                            <ComboboxItemText>Apple</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="banana">
                                            <ComboboxItemText>Banana</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="orange">
                                            <ComboboxItemText>Orange</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="grape">
                                            <ComboboxItemText>Grape</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox>
                            <ComboboxTrigger>
                                <ComboboxValue placeholder="No default value..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxInput placeholder="Search..." />
                                        <ComboboxEmpty />
                                        <ComboboxItem value="option1">
                                            <ComboboxItemText>Option 1</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option2">
                                            <ComboboxItemText>Option 2</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option3">
                                            <ComboboxItemText>Option 3</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic Single Select</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="apple">
                            <ComboboxTrigger>
                                <ComboboxInput placeholder="Search fruits..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="apple">
                                            <ComboboxItemText>Apple</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="banana">
                                            <ComboboxItemText>Banana</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="orange">
                                            <ComboboxItemText>Orange</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="grape">
                                            <ComboboxItemText>Grape</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox>
                            <ComboboxTrigger>
                                <ComboboxInput placeholder="No default value..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="option1">
                                            <ComboboxItemText>Option 1</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option2">
                                            <ComboboxItemText>Option 2</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option3">
                                            <ComboboxItemText>Option 3</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic Multiple Select</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox multiple defaultValue={["apple", "banana"]}>
                            <ComboboxTrigger>
                                <ComboboxValue placeholder="Select fruits..." />
                                <ComboboxInput placeholder="Search..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="apple">
                                            <ComboboxItemText>Apple</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="banana">
                                            <ComboboxItemText>Banana</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="orange">
                                            <ComboboxItemText>Orange</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="grape">
                                            <ComboboxItemText>Grape</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="strawberry">
                                            <ComboboxItemText>Strawberry</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox multiple>
                            <ComboboxTrigger>
                                <ComboboxValue placeholder="No default selection..." />
                                <ComboboxInput placeholder="Search..." />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="option1">
                                            <ComboboxItemText>Option 1</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option2">
                                            <ComboboxItemText>Option 2</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="option3">
                                            <ComboboxItemText>Option 3</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Sides</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="top">
                            <ComboboxTrigger className="w-48">
                                <ComboboxInput placeholder="Side: Top" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent side="top">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="top"><ComboboxItemText>Top Side</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="right">
                            <ComboboxTrigger className="w-48">
                                <ComboboxInput placeholder="Side: Right" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent side="right">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="right"><ComboboxItemText>Right Side</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="bottom">
                            <ComboboxTrigger className="w-48">
                                <ComboboxInput placeholder="Side: Bottom" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent side="bottom">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="bottom"><ComboboxItemText>Bottom Side</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="left">
                            <ComboboxTrigger className="w-48">
                                <ComboboxInput placeholder="Side: Left" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent side="left">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="left"><ComboboxItemText>Left Side</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="option3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Side Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="offset2">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="sideOffset: 2" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent sideOffset={2}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset2"><ComboboxItemText>Side Offset: 2px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="offset12">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="sideOffset: 12" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent sideOffset={12}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset12"><ComboboxItemText>Side Offset: 12px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="offset24">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="sideOffset: 24" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent sideOffset={24}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset24"><ComboboxItemText>Side Offset: 24px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Alignments</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="start">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="Align: Start" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent align="start">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="start"><ComboboxItemText>Align: Start</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="center">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="Align: Center" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent align="center">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="center"><ComboboxItemText>Align: Center</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="end">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="Align: End" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent align="end">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="end"><ComboboxItemText>Align: End</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Align Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="offset-10">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="alignOffset: -10" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent alignOffset={-10}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset-10"><ComboboxItemText>Align Offset: -10px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="offset0">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="alignOffset: 0" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent alignOffset={0}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset0"><ComboboxItemText>Align Offset: 0px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="offset10">
                            <ComboboxTrigger className="w-56">
                                <ComboboxInput placeholder="alignOffset: 10" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent alignOffset={10}>
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="offset10"><ComboboxItemText>Align Offset: 10px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Sticky Behavior</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Combobox defaultValue="partial">
                            <ComboboxTrigger className="w-64">
                                <ComboboxInput placeholder="sticky: partial" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent sticky="partial">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="partial"><ComboboxItemText>Sticky: Partial</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="desc"><ComboboxItemText>Detaches when trigger is out of bounds</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>

                        <Combobox defaultValue="always">
                            <ComboboxTrigger className="w-64">
                                <ComboboxInput placeholder="sticky: always" />
                                <ComboboxTriggerIndicator />
                            </ComboboxTrigger>
                            <ComboboxPortal>
                                <ComboboxContent sticky="always">
                                    <ComboboxViewport>
                                        <ComboboxEmpty />
                                        <ComboboxItem value="always"><ComboboxItemText>Sticky: Always</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="desc"><ComboboxItemText>Always stays in viewport</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                    </ComboboxViewport>
                                </ComboboxContent>
                            </ComboboxPortal>
                        </Combobox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Long Item List</h3>
                    <Combobox defaultValue="item5">
                        <ComboboxTrigger>
                            <ComboboxInput placeholder="Search items..." />
                            <ComboboxTriggerIndicator />
                        </ComboboxTrigger>
                        <ComboboxPortal>
                            <ComboboxContent>
                                <ComboboxScrollUpButton />
                                <ComboboxViewport className="max-h-64">
                                    <ComboboxEmpty />
                                    {Array.from({ length: 50 }, (_, i) => (
                                        <ComboboxItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                            <ComboboxItemText>{`Item ${i + 1}`}</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    ))}
                                </ComboboxViewport>
                                <ComboboxScrollDownButton />
                            </ComboboxContent>
                        </ComboboxPortal>
                    </Combobox>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Custom Collision Boundary with Different Paddings</h3>
                    <div
                        ref={setCollisionBoundary}
                        className="rounded-lg border border-bound p-4 h-80 overflow-auto"
                    >
                        <p className="text-xs text-muted-write mb-3">
                            Content is constrained to this scrollable box. Try different collision paddings.
                        </p>
                        <div className="flex flex-wrap items-start gap-4">
                            <Combobox defaultValue="padding4">
                                <ComboboxTrigger className="w-56">
                                    <ComboboxInput placeholder="collisionPadding: 4" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={4}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="padding4"><ComboboxItemText>Padding: 4px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt4"><ComboboxItemText>Option 4</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="padding16">
                                <ComboboxTrigger className="w-56">
                                    <ComboboxInput placeholder="collisionPadding: 16" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={16}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="padding16"><ComboboxItemText>Padding: 16px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt4"><ComboboxItemText>Option 4</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="padding32">
                                <ComboboxTrigger className="w-56">
                                    <ComboboxInput placeholder="collisionPadding: 32" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={32}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="padding32"><ComboboxItemText>Padding: 32px</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt4"><ComboboxItemText>Option 4</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="custom">
                                <ComboboxTrigger className="w-56">
                                    <ComboboxInput placeholder="Custom padding per side" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={{ top: 8, right: 16, bottom: 24, left: 32 }}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="custom"><ComboboxItemText>Custom Padding</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="desc"><ComboboxItemText>Top:8 Right:16 Bottom:24 Left:32</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Long List in Custom Boundary</h3>
                    <div
                        ref={setCollisionBoundary2}
                        className="rounded-lg border border-bound p-4 h-96 overflow-auto"
                    >
                        <p className="text-xs text-muted-write mb-3">
                            Long item list constrained to this boundary. Scroll to test positioning at different positions.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Combobox defaultValue="item10">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Search from 50 items..." />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent collisionBoundary={collisionBoundary2}>
                                        <ComboboxScrollUpButton />
                                        <ComboboxViewport className="max-h-64">
                                            <ComboboxEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <ComboboxItem key={`boundary-item${i + 1}`} value={`item${i + 1}`}>
                                                    <ComboboxItemText>{`Item ${i + 1}`}</ComboboxItemText>
                                                    <ComboboxItemIndicator />
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxViewport>
                                        <ComboboxScrollDownButton />
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="item25">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Middle trigger..." />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent collisionBoundary={collisionBoundary2}>
                                        <ComboboxScrollUpButton />
                                        <ComboboxViewport className="max-h-64">
                                            <ComboboxEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <ComboboxItem key={`boundary-mid-item${i + 1}`} value={`item${i + 1}`}>
                                                    <ComboboxItemText>{`Item ${i + 1}`}</ComboboxItemText>
                                                    <ComboboxItemIndicator />
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxViewport>
                                        <ComboboxScrollDownButton />
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="item40">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Bottom trigger..." />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent collisionBoundary={collisionBoundary2}>
                                        <ComboboxScrollUpButton />
                                        <ComboboxViewport className="max-h-64">
                                            <ComboboxEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <ComboboxItem key={`boundary-bottom-item${i + 1}`} value={`item${i + 1}`}>
                                                    <ComboboxItemText>{`Item ${i + 1}`}</ComboboxItemText>
                                                    <ComboboxItemIndicator />
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxViewport>
                                        <ComboboxScrollDownButton />
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Hide When Detached</h3>
                    <div
                        ref={setCollisionBoundary3}
                        className="rounded-lg border border-bound p-4 h-64 overflow-auto"
                    >
                        <p className="text-xs text-muted-write mb-3">
                            Scroll this container so the trigger goes out of view - the content will hide automatically.
                        </p>

                        <div className="h-150 flex flex-col justify-between">
                            <Combobox defaultValue="hide1">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="hideWhenDetached: true" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="hide1"><ComboboxItemText>Hide When Detached</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Scroll container to test</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="hide2">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Middle trigger" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="hide2"><ComboboxItemText>Middle Trigger</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>

                            <Combobox defaultValue="hide3">
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Bottom trigger" />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="hide3"><ComboboxItemText>Bottom Trigger</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt2"><ComboboxItemText>Option 2</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                            <ComboboxItem value="opt3"><ComboboxItemText>Option 3</ComboboxItemText><ComboboxItemIndicator /></ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                    <Combobox defaultValue="react">
                        <ComboboxTrigger>
                            <ComboboxInput placeholder="Search frameworks..." />
                            <ComboboxTriggerIndicator />
                        </ComboboxTrigger>
                        <ComboboxPortal>
                            <ComboboxContent>
                                <ComboboxViewport>
                                    <ComboboxEmpty />
                                    <ComboboxGroup>
                                        <ComboboxLabel>Frontend</ComboboxLabel>
                                        <ComboboxItem value="react">
                                            <ComboboxItemText>React</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="vue">
                                            <ComboboxItemText>Vue</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="svelte">
                                            <ComboboxItemText>Svelte</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxGroup>
                                    <ComboboxSeparator />
                                    <ComboboxGroup>
                                        <ComboboxLabel>Backend</ComboboxLabel>
                                        <ComboboxItem value="node">
                                            <ComboboxItemText>Node.js</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="deno">
                                            <ComboboxItemText>Deno</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                        <ComboboxItem value="bun">
                                            <ComboboxItemText>Bun</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    </ComboboxGroup>
                                </ComboboxViewport>
                            </ComboboxContent>
                        </ComboboxPortal>
                    </Combobox>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                    <Combobox defaultValue="enabled1">
                        <ComboboxTrigger>
                            <ComboboxInput placeholder="Search options..." />
                            <ComboboxTriggerIndicator />
                        </ComboboxTrigger>
                        <ComboboxPortal>
                            <ComboboxContent>
                                <ComboboxViewport>
                                    <ComboboxEmpty />
                                    <ComboboxItem value="enabled1">
                                        <ComboboxItemText>Enabled 1</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="disabled1" disabled>
                                        <ComboboxItemText>Disabled Item</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="enabled2">
                                        <ComboboxItemText>Enabled 2</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="disabled2" disabled>
                                        <ComboboxItemText>Another Disabled</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                </ComboboxViewport>
                            </ComboboxContent>
                        </ComboboxPortal>
                    </Combobox>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Auto Highlight First Item</h3>
                    <Combobox defaultValue="option2" autoHighlight>
                        <ComboboxTrigger>
                            <ComboboxInput placeholder="Auto highlights first item..." />
                            <ComboboxTriggerIndicator />
                        </ComboboxTrigger>
                        <ComboboxPortal>
                            <ComboboxContent>
                                <ComboboxViewport>
                                    <ComboboxEmpty />
                                    <ComboboxItem value="option1">
                                        <ComboboxItemText>Option 1</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="option2">
                                        <ComboboxItemText>Option 2</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="option3">
                                        <ComboboxItemText>Option 3</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                    <ComboboxItem value="option4">
                                        <ComboboxItemText>Option 4</ComboboxItemText>
                                        <ComboboxItemIndicator />
                                    </ComboboxItem>
                                </ComboboxViewport>
                            </ComboboxContent>
                        </ComboboxPortal>
                    </Combobox>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Disabled</label>
                            <Combobox defaultValue="option1" disabled>
                                <ComboboxTrigger>
                                    <ComboboxInput placeholder="Disabled combobox..." />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent>
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="option1">
                                                <ComboboxItemText>Option 1</ComboboxItemText>
                                                <ComboboxItemIndicator />
                                            </ComboboxItem>
                                            <ComboboxItem value="option2">
                                                <ComboboxItemText>Option 2</ComboboxItemText>
                                                <ComboboxItemIndicator />
                                            </ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                            <Combobox defaultValue="invalid" allowCustomValue>
                                <ComboboxTrigger aria-invalid="true" className="border-red-500 focus-within:ring-red-500">
                                    <ComboboxInput placeholder="Invalid combobox..." />
                                    <ComboboxTriggerIndicator />
                                </ComboboxTrigger>
                                <ComboboxPortal>
                                    <ComboboxContent>
                                        <ComboboxViewport>
                                            <ComboboxEmpty />
                                            <ComboboxItem value="invalid">
                                                <ComboboxItemText>Invalid Option</ComboboxItemText>
                                                <ComboboxItemIndicator />
                                            </ComboboxItem>
                                            <ComboboxItem value="valid">
                                                <ComboboxItemText>Valid Option</ComboboxItemText>
                                                <ComboboxItemIndicator />
                                            </ComboboxItem>
                                        </ComboboxViewport>
                                    </ComboboxContent>
                                </ComboboxPortal>
                            </Combobox>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Countries Search Example</h3>
                    <Combobox defaultValue="us" multiple>
                        <ComboboxTrigger>
                            <ComboboxValue placeholder="Selected Country goes here" />
                            <ComboboxTriggerIndicator />
                        </ComboboxTrigger>

                        <ComboboxPortal>
                            <ComboboxContent>
                                <ComboboxInput placeholder="Search countries..." />

                                <ComboboxScrollUpButton />

                                <ComboboxViewport>
                                    <ComboboxEmpty>No countries found.</ComboboxEmpty>

                                    {countries.map((country) => (
                                        <ComboboxItem key={country.value} value={country.value}>
                                            <ComboboxItemText>{country.label}</ComboboxItemText>
                                            <ComboboxItemIndicator />
                                        </ComboboxItem>
                                    ))}
                                </ComboboxViewport>

                                <ComboboxScrollDownButton />
                            </ComboboxContent>
                        </ComboboxPortal>
                    </Combobox>
                </div>
            </div>
        </section>
    );
}
