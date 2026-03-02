import { useState } from "react";
import {
    Autocomplete,
    AutocompleteTrigger,
    AutocompleteInput,
    AutocompleteTriggerIndicator,
    AutocompletePortal,
    AutocompleteContent,
    AutocompleteViewport,
    AutocompleteEmpty,
    AutocompleteItem,
    AutocompleteItemText,
    AutocompleteItemIndicator,
    AutocompleteGroup,
    AutocompleteLabel,
    AutocompleteSeparator,
    AutocompleteScrollUpButton,
    AutocompleteScrollDownButton,
} from "../ui/autocomplete";

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

export function AutocompleteDemo() {
    const [collisionBoundary, setCollisionBoundary] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary2, setCollisionBoundary2] = useState<HTMLDivElement | null>(null);
    const [collisionBoundary3, setCollisionBoundary3] = useState<HTMLDivElement | null>(null);

    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Autocomplete</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic Autocomplete</h3>
                    <p className="text-xs text-muted-write">Type to see suggestions. You can enter custom text or select from suggestions.</p>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Apple">
                            <AutocompleteTrigger>
                                <AutocompleteInput placeholder="Type a fruit..." />

                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="apple">
                                            <AutocompleteItemText>Apple</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="banana">
                                            <AutocompleteItemText>Banana</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="orange">
                                            <AutocompleteItemText>Orange</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="grape">
                                            <AutocompleteItemText>Grape</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete>
                            <AutocompleteTrigger>
                                <AutocompleteInput placeholder="No default value..." />

                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="option1">
                                            <AutocompleteItemText>Option 1</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="option2">
                                            <AutocompleteItemText>Option 2</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="option3">
                                            <AutocompleteItemText>Option 3</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Free-Form Text Entry</h3>
                    <p className="text-xs text-muted-write">Enter any text, not just from suggestions. Try typing something not in the list.</p>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete>
                            <AutocompleteTrigger>
                                <AutocompleteInput placeholder="Enter any color..." />

                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty>No matching colors</AutocompleteEmpty>
                                        <AutocompleteItem value="red">
                                            <AutocompleteItemText>Red</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="blue">
                                            <AutocompleteItemText>Blue</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="green">
                                            <AutocompleteItemText>Green</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="yellow">
                                            <AutocompleteItemText>Yellow</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Sides</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Top Side">
                            <AutocompleteTrigger className="w-48">
                                <AutocompleteInput placeholder="Side: Top" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent side="top">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="top"><AutocompleteItemText>Top Side</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Right Side">
                            <AutocompleteTrigger className="w-48">
                                <AutocompleteInput placeholder="Side: Right" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent side="right">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="right"><AutocompleteItemText>Right Side</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Bottom Side">
                            <AutocompleteTrigger className="w-48">
                                <AutocompleteInput placeholder="Side: Bottom" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent side="bottom">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="bottom"><AutocompleteItemText>Bottom Side</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Left Side">
                            <AutocompleteTrigger className="w-48">
                                <AutocompleteInput placeholder="Side: Left" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent side="left">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="left"><AutocompleteItemText>Left Side</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="option3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Side Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Side Offset: 2px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="sideOffset: 2" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent sideOffset={2}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset2"><AutocompleteItemText>Side Offset: 2px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Side Offset: 12px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="sideOffset: 12" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent sideOffset={12}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset12"><AutocompleteItemText>Side Offset: 12px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Side Offset: 24px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="sideOffset: 24" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent sideOffset={24}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset24"><AutocompleteItemText>Side Offset: 24px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: All Alignments</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Align: Start">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="Align: Start" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent align="start">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="start"><AutocompleteItemText>Align: Start</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Align: Center">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="Align: Center" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent align="center">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="center"><AutocompleteItemText>Align: Center</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Align: End">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="Align: End" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent align="end">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="end"><AutocompleteItemText>Align: End</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Align Offsets</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Align Offset: -10px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="alignOffset: -10" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent alignOffset={-10}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset-10"><AutocompleteItemText>Align Offset: -10px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Align Offset: 0px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="alignOffset: 0" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent alignOffset={0}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset0"><AutocompleteItemText>Align Offset: 0px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Align Offset: 10px">
                            <AutocompleteTrigger className="w-56">
                                <AutocompleteInput placeholder="alignOffset: 10" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent alignOffset={10}>
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="offset10"><AutocompleteItemText>Align Offset: 10px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Positioning: Sticky Behavior</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Autocomplete defaultValue="Sticky: Partial">
                            <AutocompleteTrigger className="w-64">
                                <AutocompleteInput placeholder="sticky: partial" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent sticky="partial">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="partial"><AutocompleteItemText>Sticky: Partial</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="desc"><AutocompleteItemText>Detaches when trigger is out of bounds</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>

                        <Autocomplete defaultValue="Sticky: Always">
                            <AutocompleteTrigger className="w-64">
                                <AutocompleteInput placeholder="sticky: always" />
                                <AutocompleteTriggerIndicator />
                            </AutocompleteTrigger>
                            <AutocompletePortal>
                                <AutocompleteContent sticky="always">
                                    <AutocompleteViewport>
                                        <AutocompleteEmpty />
                                        <AutocompleteItem value="always"><AutocompleteItemText>Sticky: Always</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="desc"><AutocompleteItemText>Always stays in viewport</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                    </AutocompleteViewport>
                                </AutocompleteContent>
                            </AutocompletePortal>
                        </Autocomplete>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Long Item List</h3>
                    <Autocomplete defaultValue="Item 5">
                        <AutocompleteTrigger>
                            <AutocompleteInput placeholder="Search items..." />

                            <AutocompleteTriggerIndicator />
                        </AutocompleteTrigger>
                        <AutocompletePortal>
                            <AutocompleteContent>
                                <AutocompleteScrollUpButton />
                                <AutocompleteViewport className="max-h-64">
                                    <AutocompleteEmpty />
                                    {Array.from({ length: 50 }, (_, i) => (
                                        <AutocompleteItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                            <AutocompleteItemText>{`Item ${i + 1}`}</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    ))}
                                </AutocompleteViewport>
                                <AutocompleteScrollDownButton />
                            </AutocompleteContent>
                        </AutocompletePortal>
                    </Autocomplete>
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
                            <Autocomplete defaultValue="Padding: 4px">
                                <AutocompleteTrigger className="w-56">
                                    <AutocompleteInput placeholder="collisionPadding: 4" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={4}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="padding4"><AutocompleteItemText>Padding: 4px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt4"><AutocompleteItemText>Option 4</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Padding: 16px">
                                <AutocompleteTrigger className="w-56">
                                    <AutocompleteInput placeholder="collisionPadding: 16" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={16}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="padding16"><AutocompleteItemText>Padding: 16px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt4"><AutocompleteItemText>Option 4</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Padding: 32px">
                                <AutocompleteTrigger className="w-56">
                                    <AutocompleteInput placeholder="collisionPadding: 32" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={32}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="padding32"><AutocompleteItemText>Padding: 32px</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt4"><AutocompleteItemText>Option 4</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Custom Padding">
                                <AutocompleteTrigger className="w-56">
                                    <AutocompleteInput placeholder="Custom padding per side" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary}
                                        collisionPadding={{ top: 8, right: 16, bottom: 24, left: 32 }}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="custom"><AutocompleteItemText>Custom Padding</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="desc"><AutocompleteItemText>Top:8 Right:16 Bottom:24 Left:32</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>
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
                            <Autocomplete defaultValue="Item 10">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Search from 50 items..." />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent collisionBoundary={collisionBoundary2}>
                                        <AutocompleteScrollUpButton />
                                        <AutocompleteViewport className="max-h-64">
                                            <AutocompleteEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <AutocompleteItem key={`boundary-item${i + 1}`} value={`item${i + 1}`}>
                                                    <AutocompleteItemText>{`Item ${i + 1}`}</AutocompleteItemText>
                                                    <AutocompleteItemIndicator />
                                                </AutocompleteItem>
                                            ))}
                                        </AutocompleteViewport>
                                        <AutocompleteScrollDownButton />
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Item 25">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Middle trigger..." />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent collisionBoundary={collisionBoundary2}>
                                        <AutocompleteScrollUpButton />
                                        <AutocompleteViewport className="max-h-64">
                                            <AutocompleteEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <AutocompleteItem key={`boundary-mid-item${i + 1}`} value={`item${i + 1}`}>
                                                    <AutocompleteItemText>{`Item ${i + 1}`}</AutocompleteItemText>
                                                    <AutocompleteItemIndicator />
                                                </AutocompleteItem>
                                            ))}
                                        </AutocompleteViewport>
                                        <AutocompleteScrollDownButton />
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Item 40">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Bottom trigger..." />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent collisionBoundary={collisionBoundary2}>
                                        <AutocompleteScrollUpButton />
                                        <AutocompleteViewport className="max-h-64">
                                            <AutocompleteEmpty />
                                            {Array.from({ length: 50 }, (_, i) => (
                                                <AutocompleteItem key={`boundary-bottom-item${i + 1}`} value={`item${i + 1}`}>
                                                    <AutocompleteItemText>{`Item ${i + 1}`}</AutocompleteItemText>
                                                    <AutocompleteItemIndicator />
                                                </AutocompleteItem>
                                            ))}
                                        </AutocompleteViewport>
                                        <AutocompleteScrollDownButton />
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>
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
                            <Autocomplete defaultValue="Hide When Detached">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="hideWhenDetached: true" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="hide1"><AutocompleteItemText>Hide When Detached</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Scroll container to test</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Middle Trigger">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Middle trigger" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="hide2"><AutocompleteItemText>Middle Trigger</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>

                            <Autocomplete defaultValue="Bottom Trigger">
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Bottom trigger" />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent
                                        collisionBoundary={collisionBoundary3}
                                        hideWhenDetached={true}
                                    >
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="hide3"><AutocompleteItemText>Bottom Trigger</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt2"><AutocompleteItemText>Option 2</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                            <AutocompleteItem value="opt3"><AutocompleteItemText>Option 3</AutocompleteItemText><AutocompleteItemIndicator /></AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                    <Autocomplete defaultValue="React">
                        <AutocompleteTrigger>
                            <AutocompleteInput placeholder="Search frameworks..." />

                            <AutocompleteTriggerIndicator />
                        </AutocompleteTrigger>
                        <AutocompletePortal>
                            <AutocompleteContent>
                                <AutocompleteViewport>
                                    <AutocompleteEmpty />
                                    <AutocompleteGroup>
                                        <AutocompleteLabel>Frontend</AutocompleteLabel>
                                        <AutocompleteItem value="react">
                                            <AutocompleteItemText>React</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="vue">
                                            <AutocompleteItemText>Vue</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="svelte">
                                            <AutocompleteItemText>Svelte</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    </AutocompleteGroup>
                                    <AutocompleteSeparator />
                                    <AutocompleteGroup>
                                        <AutocompleteLabel>Backend</AutocompleteLabel>
                                        <AutocompleteItem value="node">
                                            <AutocompleteItemText>Node.js</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="deno">
                                            <AutocompleteItemText>Deno</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                        <AutocompleteItem value="bun">
                                            <AutocompleteItemText>Bun</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    </AutocompleteGroup>
                                </AutocompleteViewport>
                            </AutocompleteContent>
                        </AutocompletePortal>
                    </Autocomplete>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                    <Autocomplete defaultValue="Enabled 1">
                        <AutocompleteTrigger>
                            <AutocompleteInput placeholder="Search options..." />
                            <AutocompleteTriggerIndicator />
                        </AutocompleteTrigger>
                        <AutocompletePortal>
                            <AutocompleteContent>
                                <AutocompleteViewport>
                                    <AutocompleteEmpty />
                                    <AutocompleteItem value="enabled1">
                                        <AutocompleteItemText>Enabled 1</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="disabled1" disabled>
                                        <AutocompleteItemText>Disabled Item</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="enabled2">
                                        <AutocompleteItemText>Enabled 2</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="disabled2" disabled>
                                        <AutocompleteItemText>Another Disabled</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                </AutocompleteViewport>
                            </AutocompleteContent>
                        </AutocompletePortal>
                    </Autocomplete>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Auto Highlight First Item</h3>
                    <Autocomplete defaultValue="Option 2" autoHighlight>
                        <AutocompleteTrigger>
                            <AutocompleteInput placeholder="Auto highlights first item..." />
                            <AutocompleteTriggerIndicator />
                        </AutocompleteTrigger>
                        <AutocompletePortal>
                            <AutocompleteContent>
                                <AutocompleteViewport>
                                    <AutocompleteEmpty />
                                    <AutocompleteItem value="option1">
                                        <AutocompleteItemText>Option 1</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="option2">
                                        <AutocompleteItemText>Option 2</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="option3">
                                        <AutocompleteItemText>Option 3</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                    <AutocompleteItem value="option4">
                                        <AutocompleteItemText>Option 4</AutocompleteItemText>
                                        <AutocompleteItemIndicator />
                                    </AutocompleteItem>
                                </AutocompleteViewport>
                            </AutocompleteContent>
                        </AutocompletePortal>
                    </Autocomplete>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Disabled</label>
                            <Autocomplete defaultValue="Option 1" disabled>
                                <AutocompleteTrigger>
                                    <AutocompleteInput placeholder="Disabled autocomplete..." />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent>
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="option1">
                                                <AutocompleteItemText>Option 1</AutocompleteItemText>
                                                <AutocompleteItemIndicator />
                                            </AutocompleteItem>
                                            <AutocompleteItem value="option2">
                                                <AutocompleteItemText>Option 2</AutocompleteItemText>
                                                <AutocompleteItemIndicator />
                                            </AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                            <Autocomplete defaultValue="Invalid">
                                <AutocompleteTrigger aria-invalid="true" className="border-red-500 focus-within:ring-red-500">
                                    <AutocompleteInput placeholder="Invalid autocomplete..." />
                                    <AutocompleteTriggerIndicator />
                                </AutocompleteTrigger>
                                <AutocompletePortal>
                                    <AutocompleteContent>
                                        <AutocompleteViewport>
                                            <AutocompleteEmpty />
                                            <AutocompleteItem value="invalid">
                                                <AutocompleteItemText>Invalid Option</AutocompleteItemText>
                                                <AutocompleteItemIndicator />
                                            </AutocompleteItem>
                                            <AutocompleteItem value="valid">
                                                <AutocompleteItemText>Valid Option</AutocompleteItemText>
                                                <AutocompleteItemIndicator />
                                            </AutocompleteItem>
                                        </AutocompleteViewport>
                                    </AutocompleteContent>
                                </AutocompletePortal>
                            </Autocomplete>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Countries Search Example</h3>
                    <p className="text-xs text-muted-write">Type to filter countries, or enter a custom country name.</p>
                    <Autocomplete defaultValue="United States">
                        <AutocompleteTrigger>
                            <AutocompleteInput placeholder="Search countries..." />

                            <AutocompleteTriggerIndicator />
                        </AutocompleteTrigger>

                        <AutocompletePortal>
                            <AutocompleteContent>
                                <AutocompleteScrollUpButton />

                                <AutocompleteViewport>
                                    <AutocompleteEmpty>No countries found.</AutocompleteEmpty>

                                    {countries.map((country) => (
                                        <AutocompleteItem key={country.value} value={country.value}>
                                            <AutocompleteItemText>{country.label}</AutocompleteItemText>
                                            <AutocompleteItemIndicator />
                                        </AutocompleteItem>
                                    ))}
                                </AutocompleteViewport>

                                <AutocompleteScrollDownButton />
                            </AutocompleteContent>
                        </AutocompletePortal>
                    </Autocomplete>
                </div>
            </div>
        </section>
    );
}
