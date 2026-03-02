import { useState } from "react";
import { cn } from "../cn";
import { MultiSelect, MultiSelectTrigger, MultiSelectValue, MultiSelectChip, MultiSelectTriggerIndicator, MultiSelectClear, MultiSelectAll, MultiSelectPortal, MultiSelectContent, MultiSelectViewport, MultiSelectItem, MultiSelectItemText, MultiSelectItemIndicator, MultiSelectGroup, MultiSelectLabel, MultiSelectSeparator, MultiSelectScrollUpButton, MultiSelectScrollDownButton } from "../ui/multi-select";

interface MultiSelectDemoProps {
    selectedFruits: string[];
    setSelectedFruits: (value: string[]) => void;
}

export function MultiSelectDemo({ selectedFruits, setSelectedFruits }: MultiSelectDemoProps) {
    const [collisionBoundary, setCollisionBoundary] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary2, setCollisionBoundary2] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary3, setCollisionBoundary3] = useState<HTMLDivElement | null>(null);

    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Multi-Select</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["apple", "banana"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select fruits..." />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="apple">
                                            <MultiSelectItemText>Apple</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="banana">
                                            <MultiSelectItemText>Banana</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="orange">
                                            <MultiSelectItemText>Orange</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="grape">
                                            <MultiSelectItemText>Grape</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="strawberry">
                                            <MultiSelectItemText>Strawberry</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="No default selection..." />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="option1">
                                            <MultiSelectItemText>Option 1</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="option2">
                                            <MultiSelectItemText>Option 2</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="option3">
                                            <MultiSelectItemText>Option 3</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Sides</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["top"]}>
                            <MultiSelectTrigger className="w-56">
                                <MultiSelectValue placeholder="Side: Top" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent side="top">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="top"><MultiSelectItemText>Top Side</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["right"]}>
                            <MultiSelectTrigger className="w-56">
                                <MultiSelectValue placeholder="Side: Right" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent side="right">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="right"><MultiSelectItemText>Right Side</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["bottom"]}>
                            <MultiSelectTrigger className="w-56">
                                <MultiSelectValue placeholder="Side: Bottom" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent side="bottom">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="bottom"><MultiSelectItemText>Bottom Side</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["left"]}>
                            <MultiSelectTrigger className="w-56">
                                <MultiSelectValue placeholder="Side: Left" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent side="left">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="left"><MultiSelectItemText>Left Side</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Side Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["offset2"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="sideOffset: 2" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent sideOffset={2}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset2"><MultiSelectItemText>Side Offset: 2px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["offset12"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="sideOffset: 12" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent sideOffset={12}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset12"><MultiSelectItemText>Side Offset: 12px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["offset24"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="sideOffset: 24" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent sideOffset={24}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset24"><MultiSelectItemText>Side Offset: 24px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Alignments</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["start"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="Align: Start" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent align="start">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="start"><MultiSelectItemText>Align: Start</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["center"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="Align: Center" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent align="center">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="center"><MultiSelectItemText>Align: Center</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["end"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="Align: End" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent align="end">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="end"><MultiSelectItemText>Align: End</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Align Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["offset-10"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="alignOffset: -10" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent alignOffset={-10}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset-10"><MultiSelectItemText>Align Offset: -10px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["offset0"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="alignOffset: 0" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent alignOffset={0}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset0"><MultiSelectItemText>Align Offset: 0px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["offset10"]}>
                            <MultiSelectTrigger className="w-64">
                                <MultiSelectValue placeholder="alignOffset: 10" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent alignOffset={10}>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="offset10"><MultiSelectItemText>Align Offset: 10px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Sticky Behavior</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <MultiSelect defaultValue={["partial"]}>
                            <MultiSelectTrigger className="w-72">
                                <MultiSelectValue placeholder="sticky: partial" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent sticky="partial">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="partial"><MultiSelectItemText>Sticky: Partial</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="desc"><MultiSelectItemText>Detaches when trigger is out</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>

                        <MultiSelect defaultValue={["always"]}>
                            <MultiSelectTrigger className="w-72">
                                <MultiSelectValue placeholder="sticky: always" />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent sticky="always">
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="always"><MultiSelectItemText>Sticky: Always</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="desc"><MultiSelectItemText>Always stays in viewport</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Long Item List</h3>
                    <MultiSelect defaultValue={["item5", "item10"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select items..." />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectScrollUpButton />
                                <MultiSelectViewport className="max-h-64">
                                    {Array.from({ length: 50 }, (_, i) => (
                                        <MultiSelectItem key={`scroll-item${i + 1}`} value={`item${i + 1}`}>
                                            <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    ))}
                                </MultiSelectViewport>
                                <MultiSelectScrollDownButton />
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
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
                            <MultiSelect defaultValue={["padding4"]}>
                                <MultiSelectTrigger className="w-64">
                                    <MultiSelectValue placeholder="collisionPadding: 4" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={4}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="padding4"><MultiSelectItemText>Padding: 4px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt4"><MultiSelectItemText>Option 4</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["padding16"]}>
                                <MultiSelectTrigger className="w-64">
                                    <MultiSelectValue placeholder="collisionPadding: 16" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={16}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="padding16"><MultiSelectItemText>Padding: 16px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt4"><MultiSelectItemText>Option 4</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["padding32"]}>
                                <MultiSelectTrigger className="w-64">
                                    <MultiSelectValue placeholder="collisionPadding: 32" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={32}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="padding32"><MultiSelectItemText>Padding: 32px</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt4"><MultiSelectItemText>Option 4</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["custom"]}>
                                <MultiSelectTrigger className="w-64">
                                    <MultiSelectValue placeholder="Custom padding per side" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={{ top: 8, right: 16, bottom: 24, left: 32 }}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="custom"><MultiSelectItemText>Custom Padding</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="desc"><MultiSelectItemText>Top:8 Right:16 Bottom:24 Left:32</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
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
                            <MultiSelect defaultValue={["item10", "item15"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Select from 50 items..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent collisionBoundary={collisionBoundary2}>
                                        <MultiSelectScrollUpButton />
                                        <MultiSelectViewport className="max-h-64">
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <MultiSelectItem key={`boundary-item${i + 1}`} value={`item${i + 1}`}>
                                                    <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                            ))}
                                        </MultiSelectViewport>
                                        <MultiSelectScrollDownButton />
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["item25", "item30"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Middle trigger..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent collisionBoundary={collisionBoundary2}>
                                        <MultiSelectScrollUpButton />
                                        <MultiSelectViewport className="max-h-64">
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <MultiSelectItem key={`boundary-mid-item${i + 1}`} value={`item${i + 1}`}>
                                                    <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                            ))}
                                        </MultiSelectViewport>
                                        <MultiSelectScrollDownButton />
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["item40", "item45"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Bottom trigger..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent collisionBoundary={collisionBoundary2}>
                                        <MultiSelectScrollUpButton />
                                        <MultiSelectViewport className="max-h-64">
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <MultiSelectItem key={`boundary-bottom-item${i + 1}`} value={`item${i + 1}`}>
                                                    <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                            ))}
                                        </MultiSelectViewport>
                                        <MultiSelectScrollDownButton />
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
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
                            <MultiSelect defaultValue={["hide1"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="hideWhenDetached: true" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="hide1"><MultiSelectItemText>Hide When Detached</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Scroll container to test</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["hide2"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Middle trigger" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="hide2"><MultiSelectItemText>Middle Trigger</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect defaultValue={["hide3"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Bottom trigger" />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="hide3"><MultiSelectItemText>Bottom Trigger</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt2"><MultiSelectItemText>Option 2</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                            <MultiSelectItem value="opt3"><MultiSelectItemText>Option 3</MultiSelectItemText><MultiSelectItemIndicator /></MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Clear Button</h3>
                    <MultiSelect defaultValue={["react", "vue"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select frameworks..." />
                            <MultiSelectClear />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectItem value="react">
                                        <MultiSelectItemText>React</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="vue">
                                        <MultiSelectItemText>Vue</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="angular">
                                        <MultiSelectItemText>Angular</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="svelte">
                                        <MultiSelectItemText>Svelte</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Select All & Clear Buttons</h3>
                    <MultiSelect defaultValue={["node", "deno"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select runtimes..." />
                            <MultiSelectAll />
                            <MultiSelectClear />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectItem value="node">
                                        <MultiSelectItemText>Node.js</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="deno">
                                        <MultiSelectItemText>Deno</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="bun">
                                        <MultiSelectItemText>Bun</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="browser">
                                        <MultiSelectItemText>Browser</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="cloudflare" disabled>
                                        <MultiSelectItemText>Cloudflare Workers</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                    <MultiSelect defaultValue={["typescript", "python"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select languages..." />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectGroup>
                                        <MultiSelectLabel>Web</MultiSelectLabel>
                                        <MultiSelectItem value="javascript">
                                            <MultiSelectItemText>JavaScript</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="typescript">
                                            <MultiSelectItemText>TypeScript</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectGroup>
                                    <MultiSelectSeparator />
                                    <MultiSelectGroup>
                                        <MultiSelectLabel>Backend</MultiSelectLabel>
                                        <MultiSelectItem value="python">
                                            <MultiSelectItemText>Python</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="go">
                                            <MultiSelectItemText>Go</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="rust">
                                            <MultiSelectItemText>Rust</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectGroup>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Truncated Chips (maxDisplayedItems=2)</h3>
                    <MultiSelect defaultValue={["item1", "item2", "item3", "item4", "item5"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select items..." maxDisplayedItems={2} />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <MultiSelectItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                            <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    ))}
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Custom Chip Renderer</h3>
                    <MultiSelect defaultValue={["red", "blue", "green"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue
                                placeholder="Select colors..."
                                itemRender={(item, removeHandler, context) => (
                                    <MultiSelectChip
                                        key={item.value}
                                        value={item.value}
                                        onRemove={removeHandler}
                                        disabled={context.disabled}
                                        className={cn(
                                            item.value === 'red' && 'bg-red-500/20 text-red-400',
                                            item.value === 'blue' && 'bg-blue-500/20 text-blue-400',
                                            item.value === 'green' && 'bg-green-500/20 text-green-400',
                                            item.value === 'yellow' && 'bg-yellow-500/20 text-yellow-400'
                                        )}
                                    >
                                        {item.textValue}
                                    </MultiSelectChip>
                                )}
                            />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectItem value="red">
                                        <MultiSelectItemText>Red</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="blue">
                                        <MultiSelectItemText>Blue</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="green">
                                        <MultiSelectItemText>Green</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="yellow">
                                        <MultiSelectItemText>Yellow</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                    <MultiSelect defaultValue={["enabled1"]}>
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select options..." />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectItem value="enabled1">
                                        <MultiSelectItemText>Enabled 1</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="disabled1" disabled>
                                        <MultiSelectItemText>Disabled Item</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="enabled2">
                                        <MultiSelectItemText>Enabled 2</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="disabled2" disabled>
                                        <MultiSelectItemText>Another Disabled</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Disabled</label>
                            <MultiSelect defaultValue={["option1"]} disabled>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Disabled..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent>
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="option1">
                                                <MultiSelectItemText>Option 1</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="option2">
                                                <MultiSelectItemText>Option 2</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                            <MultiSelect defaultValue={["invalid"]}>
                                <MultiSelectTrigger aria-invalid="true" className="border-red-500 focus-visible:ring-red-500">
                                    <MultiSelectValue placeholder="Invalid..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent>
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="invalid">
                                                <MultiSelectItemText>Invalid Option</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="valid">
                                                <MultiSelectItemText>Valid Option</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                    <MultiSelect
                        value={selectedFruits}
                        onValueChange={setSelectedFruits}
                    >
                        <MultiSelectTrigger>
                            <MultiSelectValue placeholder="Select fruits..." />
                            <MultiSelectClear />
                            <MultiSelectTriggerIndicator />
                        </MultiSelectTrigger>
                        <MultiSelectPortal>
                            <MultiSelectContent>
                                <MultiSelectViewport>
                                    <MultiSelectItem value="apple">
                                        <MultiSelectItemText>Apple</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="banana">
                                        <MultiSelectItemText>Banana</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                    <MultiSelectItem value="cherry">
                                        <MultiSelectItemText>Cherry</MultiSelectItemText>
                                        <MultiSelectItemIndicator />
                                    </MultiSelectItem>
                                </MultiSelectViewport>
                            </MultiSelectContent>
                        </MultiSelectPortal>
                    </MultiSelect>
                    <p className="text-xs text-muted-write">Selected: {selectedFruits.length > 0 ? selectedFruits.join(", ") : "None"}</p>
                </div>
            </div>
        </section>
    );
}
