import { useState } from "react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectTriggerIndicator,
    SelectPortal,
    SelectPositioner,
    SelectContent,
    SelectViewport,
    SelectItem,
    SelectItemText,
    SelectItemIndicator,
    SelectGroup,
    SelectLabel,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} from "@/ui/select";

interface SelectDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
}

export function SelectDemo({ quantity, setQuantity }: SelectDemoProps) {
    const [collisionBoundary, setCollisionBoundary] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary2, setCollisionBoundary2] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary3, setCollisionBoundary3] = useState<HTMLDivElement | null>(null);

    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Select</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="apple">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a fruit..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner>
                                    <SelectContent>
                                        <SelectScrollUpButton />
                                        <SelectViewport>
                                            <SelectItem value="apple">
                                                <SelectItemText>Apple</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="banana">
                                                <SelectItemText>Banana</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="orange">
                                                <SelectItemText>Orange</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="grape">
                                                <SelectItemText>Grape</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectViewport>
                                        <SelectScrollDownButton />
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="No default value..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="option1">
                                                <SelectItemText>Option 1</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="option2">
                                                <SelectItemText>Option 2</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="option3">
                                                <SelectItemText>Option 3</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Sides</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="top">
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Side: Top" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} side="top">
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="top"><SelectItemText>Top Side</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="bottom">
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Side: Bottom" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} side="bottom">
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="bottom"><SelectItemText>Bottom Side</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="left">
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Side: Left" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} side="left">
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="left"><SelectItemText>Left Side</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="right">
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Side: Right" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} side="right">
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="right"><SelectItemText>Right Side</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="option3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Side Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="offset2">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="sideOffset: 2" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} sideOffset={2}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset2"><SelectItemText>Side Offset: 2px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="offset12">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="sideOffset: 12" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} sideOffset={12}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset12"><SelectItemText>Side Offset: 12px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="offset24">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="sideOffset: 24" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} sideOffset={24}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset24"><SelectItemText>Side Offset: 24px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Alignments</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="start">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Align: Start" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} align="start">
                                    <SelectContent className="min-w-32">
                                        <SelectViewport>
                                            <SelectItem value="start"><SelectItemText>Align: Start</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="center">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Align: Center" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} align="center">
                                    <SelectContent className="min-w-32">
                                        <SelectViewport>
                                            <SelectItem value="center"><SelectItemText>Align: Center</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="end">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Align: End" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} align="end">
                                    <SelectContent className="min-w-32">
                                        <SelectViewport>
                                            <SelectItem value="end"><SelectItemText>Align: End</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Align Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="offset-10">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="alignOffset: -10" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} alignOffset={-10}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset-10"><SelectItemText>Align Offset: -10px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="offset0">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="alignOffset: 0" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} alignOffset={0}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset0"><SelectItemText>Align Offset: 0px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="offset10">
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="alignOffset: 10" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} alignOffset={10}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="offset10"><SelectItemText>Align Offset: 10px</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Sticky Behavior</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Select defaultValue="no-sticky">
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="sticky: false" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} sticky={false}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="no-sticky"><SelectItemText>Sticky: Off</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="desc"><SelectItemText>Detaches when trigger is out of bounds</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>

                        <Select defaultValue="sticky">
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="sticky: true" />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectPositioner alignItemWithTrigger={false} sticky={true}>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="sticky"><SelectItemText>Sticky: On</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="desc"><SelectItemText>Always stays in viewport</SelectItemText><SelectItemIndicator /></SelectItem>
                                            <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPositioner>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Long Item List</h3>
                    <Select defaultValue="item5">
                        <SelectTrigger>
                            <SelectValue placeholder="Select an item..." />
                            <SelectTriggerIndicator />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectPositioner>
                                <SelectContent>
                                    <SelectScrollUpButton />
                                    <SelectViewport>
                                        {Array.from({ length: 50 }, (_, i) => (
                                            <SelectItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                                <SelectItemText>{`Item ${i + 1}`}</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        ))}
                                    </SelectViewport>
                                    <SelectScrollDownButton />
                                </SelectContent>
                            </SelectPositioner>
                        </SelectPortal>
                    </Select>
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
                            <Select defaultValue="padding4">
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="collisionPadding: 4" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary ?? undefined}
                                        collisionPadding={4}
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="padding4"><SelectItemText>Padding: 4px</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt4"><SelectItemText>Option 4</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="padding16">
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="collisionPadding: 16" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary ?? undefined}
                                        collisionPadding={16}
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="padding16"><SelectItemText>Padding: 16px</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt4"><SelectItemText>Option 4</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="padding32">
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="collisionPadding: 32" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary ?? undefined}
                                        collisionPadding={32}
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="padding32"><SelectItemText>Padding: 32px</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt4"><SelectItemText>Option 4</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="custom">
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="Custom padding per side" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary ?? undefined}
                                        collisionPadding={{ top: 8, right: 16, bottom: 24, left: 32 }}
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="custom"><SelectItemText>Custom Padding</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="desc"><SelectItemText>Top:8 Right:16 Bottom:24 Left:32</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
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
                            <Select defaultValue="item10">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select from 50 items..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner alignItemWithTrigger={false} collisionBoundary={collisionBoundary2 ?? undefined}>
                                        <SelectContent>
                                            <SelectScrollUpButton />
                                            <SelectViewport className="max-h-64">
                                                {Array.from({ length: 50 }, (_, i) => (
                                                    <SelectItem key={`boundary-item${i + 1}`} value={`item${i + 1}`}>
                                                        <SelectItemText>{`Item ${i + 1}`}</SelectItemText>
                                                        <SelectItemIndicator />
                                                    </SelectItem>
                                                ))}
                                            </SelectViewport>
                                            <SelectScrollDownButton />
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="item25">
                                <SelectTrigger>
                                    <SelectValue placeholder="Middle trigger..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner alignItemWithTrigger={false} collisionBoundary={collisionBoundary2 ?? undefined}>
                                        <SelectContent>
                                            <SelectScrollUpButton />
                                            <SelectViewport className="max-h-64">
                                                {Array.from({ length: 50 }, (_, i) => (
                                                    <SelectItem key={`boundary-mid-item${i + 1}`} value={`item${i + 1}`}>
                                                        <SelectItemText>{`Item ${i + 1}`}</SelectItemText>
                                                        <SelectItemIndicator />
                                                    </SelectItem>
                                                ))}
                                            </SelectViewport>
                                            <SelectScrollDownButton />
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="item40">
                                <SelectTrigger>
                                    <SelectValue placeholder="Bottom trigger..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner alignItemWithTrigger={false} collisionBoundary={collisionBoundary2 ?? undefined}>
                                        <SelectContent>
                                            <SelectScrollUpButton />
                                            <SelectViewport className="max-h-64">
                                                {Array.from({ length: 50 }, (_, i) => (
                                                    <SelectItem key={`boundary-bottom-item${i + 1}`} value={`item${i + 1}`}>
                                                        <SelectItemText>{`Item ${i + 1}`}</SelectItemText>
                                                        <SelectItemIndicator />
                                                    </SelectItem>
                                                ))}
                                            </SelectViewport>
                                            <SelectScrollDownButton />
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Anchor Hidden (data-anchor-hidden)</h3>
                    <div
                        ref={setCollisionBoundary3}
                        className="rounded-lg border border-bound p-4 h-64 overflow-auto"
                    >
                        <p className="text-xs text-muted-write mb-3">
                            Scroll this container so the trigger goes out of view — the content hides via <code>[data-anchor-hidden]</code>.
                        </p>

                        <div className="h-150 flex flex-col justify-between">
                            <Select defaultValue="hide1">
                                <SelectTrigger>
                                    <SelectValue placeholder="Anchor hidden demo" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary3 ?? undefined}
                                        className="[&[data-anchor-hidden]]:invisible"
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="hide1"><SelectItemText>Hide When Detached</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Scroll container to test</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="hide2">
                                <SelectTrigger>
                                    <SelectValue placeholder="Middle trigger" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary3 ?? undefined}
                                        className="[&[data-anchor-hidden]]:invisible"
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="hide2"><SelectItemText>Middle Trigger</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>

                            <Select defaultValue="hide3">
                                <SelectTrigger>
                                    <SelectValue placeholder="Bottom trigger" />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner
                                        alignItemWithTrigger={false}
                                        collisionBoundary={collisionBoundary3 ?? undefined}
                                        className="[&[data-anchor-hidden]]:invisible"
                                    >
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="hide3"><SelectItemText>Bottom Trigger</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt2"><SelectItemText>Option 2</SelectItemText><SelectItemIndicator /></SelectItem>
                                                <SelectItem value="opt3"><SelectItemText>Option 3</SelectItemText><SelectItemIndicator /></SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                    <Select defaultValue="react">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a framework..." />
                            <SelectTriggerIndicator />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectPositioner>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectGroup>
                                            <SelectLabel>Frontend</SelectLabel>
                                            <SelectItem value="react">
                                                <SelectItemText>React</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="vue">
                                                <SelectItemText>Vue</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="svelte">
                                                <SelectItemText>Svelte</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectGroup>
                                        <SelectSeparator />
                                        <SelectGroup>
                                            <SelectLabel>Backend</SelectLabel>
                                            <SelectItem value="node">
                                                <SelectItemText>Node.js</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="deno">
                                                <SelectItemText>Deno</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="bun">
                                                <SelectItemText>Bun</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPositioner>
                        </SelectPortal>
                    </Select>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                    <Select defaultValue="enabled1">
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option..." />
                            <SelectTriggerIndicator />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectPositioner>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectItem value="enabled1">
                                            <SelectItemText>Enabled 1</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="disabled1" disabled>
                                            <SelectItemText>Disabled Item</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="enabled2">
                                            <SelectItemText>Enabled 2</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="disabled2" disabled>
                                            <SelectItemText>Another Disabled</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPositioner>
                        </SelectPortal>
                    </Select>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Disabled</label>
                            <Select defaultValue="option1" disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Disabled select..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="option1">
                                                    <SelectItemText>Option 1</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="option2">
                                                    <SelectItemText>Option 2</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                            <Select defaultValue="invalid">
                                <SelectTrigger aria-invalid="true" className="border-red-500 focus-visible:ring-red-500">
                                    <SelectValue placeholder="Invalid select..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="invalid">
                                                    <SelectItemText>Invalid Option</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="valid">
                                                    <SelectItemText>Valid Option</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Required</label>
                            <Select defaultValue="option1" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Required select..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectPositioner>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="option1">
                                                    <SelectItemText>Option 1</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="option2">
                                                    <SelectItemText>Option 2</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPositioner>
                                </SelectPortal>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                    <Select value={quantity === 1 ? "single" : "multiple"} onValueChange={(val) => setQuantity(val === "single" ? 1 : 2)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select quantity..." />
                            <SelectTriggerIndicator />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectPositioner>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectItem value="single">
                                            <SelectItemText>{`Single (Quantity: ${quantity})`}</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="multiple">
                                            <SelectItemText>{`Multiple (Quantity: ${quantity})`}</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPositioner>
                        </SelectPortal>
                    </Select>
                </div>
            </div>
        </section>
    );
}
