import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export interface ToggleGroupDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
}

export function ToggleGroupDemo({ quantity, setQuantity }: ToggleGroupDemoProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Toggle Group</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Single Selection (Horizontal)</h3>
                    <ToggleGroup type="single" defaultValue="center">
                        <ToggleGroupItem variant="outline" value="left">Left</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="center">Center</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="right">Right</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Single Selection (Vertical)</h3>
                    <ToggleGroup className="[&>button]:w-24" type="single" defaultValue="top" orientation="vertical">
                        <ToggleGroupItem variant="outline" value="top">Top</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="middle">Middle</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="bottom">Bottom</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Multiple Selection</h3>
                    <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
                        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
                        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
                        <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-write mb-2">Default</p>
                            <ToggleGroup type="single" defaultValue="option1">
                                <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
                                <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
                                <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Outline</p>
                            <ToggleGroup type="single" defaultValue="item1">
                                <ToggleGroupItem value="item1" variant="outline">Item 1</ToggleGroupItem>
                                <ToggleGroupItem value="item2" variant="outline">Item 2</ToggleGroupItem>
                                <ToggleGroupItem value="item3" variant="outline">Item 3</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Sizes</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-write mb-2">Small</p>
                            <ToggleGroup type="single" defaultValue="sm1">
                                <ToggleGroupItem value="sm1" size="sm">Small 1</ToggleGroupItem>
                                <ToggleGroupItem value="sm2" size="sm">Small 2</ToggleGroupItem>
                                <ToggleGroupItem value="sm3" size="sm">Small 3</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Default</p>
                            <ToggleGroup type="single" defaultValue="def1">
                                <ToggleGroupItem value="def1">Default 1</ToggleGroupItem>
                                <ToggleGroupItem value="def2">Default 2</ToggleGroupItem>
                                <ToggleGroupItem value="def3">Default 3</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Large</p>
                            <ToggleGroup type="single" defaultValue="lg1">
                                <ToggleGroupItem value="lg1" size="lg">Large 1</ToggleGroupItem>
                                <ToggleGroupItem value="lg2" size="lg">Large 2</ToggleGroupItem>
                                <ToggleGroupItem value="lg3" size="lg">Large 3</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-write mb-2">Disabled Group</p>
                            <ToggleGroup type="single" defaultValue="disabled1" disabled>
                                <ToggleGroupItem value="disabled1">Disabled 1</ToggleGroupItem>
                                <ToggleGroupItem value="disabled2">Disabled 2</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Disabled Item</p>
                            <ToggleGroup type="single" defaultValue="enabled1">
                                <ToggleGroupItem value="enabled1">Enabled 1</ToggleGroupItem>
                                <ToggleGroupItem value="enabled2">Enabled 2</ToggleGroupItem>
                                <ToggleGroupItem value="disabled-item" disabled>Disabled Item</ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Spacing</h3>
                    <ToggleGroup className="gap-4" type="single" defaultValue="spaced1">
                        <ToggleGroupItem variant="outline" value="spaced1">Spaced 1</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="spaced2">Spaced 2</ToggleGroupItem>
                        <ToggleGroupItem variant="outline" value="spaced3">Spaced 3</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                    <ToggleGroup type="single" value={quantity === 1 ? "single" : "multiple"} onValueChange={(val) => setQuantity(val === "single" ? 1 : 2)}>
                        <ToggleGroupItem value="single">Single (Quantity: {quantity})</ToggleGroupItem>
                        <ToggleGroupItem value="multiple">Multiple (Quantity: {quantity})</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
        </section>
    );
}
