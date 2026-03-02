import { RadioGroup, RadioGroupItem, RadioGroupItemIndicator } from "../ui/radio-group";

export interface RadioGroupDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
}

export function RadioGroupDemo({ quantity, setQuantity }: RadioGroupDemoProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Radio Group</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic (Vertical)</h3>
                    <RadioGroup defaultValue="option1">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option1">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Option 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option2">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Option 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option3">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Option 3</span>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Horizontal</h3>
                    <RadioGroup defaultValue="red" orientation="horizontal">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="red">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Red</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="green">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Green</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="blue">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Blue</span>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-muted-write mb-2">Disabled Group</p>
                            <RadioGroup defaultValue="item1" disabled>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="item1">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-muted-write">Item 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="item2">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-muted-write">Item 2</span>
                                </div>
                            </RadioGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Disabled Item</p>
                            <RadioGroup defaultValue="enabled1">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="enabled1">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-write">Enabled Item 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="enabled2">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-write">Enabled Item 2</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="disabled1" disabled>
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-muted-write">Disabled Item</span>
                                </div>
                            </RadioGroup>
                        </div>
                        <div>
                            <p className="text-xs text-muted-write mb-2">Required</p>
                            <RadioGroup defaultValue="choice1" required name="required-group">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="choice1">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-write">Choice 1</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="choice2">
                                        <RadioGroupItemIndicator />
                                    </RadioGroupItem>
                                    <span className="text-sm text-write">Choice 2</span>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Form Integration</h3>
                    <RadioGroup name="size" defaultValue="medium">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="small">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Small</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="medium">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="large">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Large</span>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                    <RadioGroup value={quantity === 1 ? "single" : "multiple"} onValueChange={(val) => setQuantity(val === "single" ? 1 : 2)}>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="single">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Single (Quantity: {quantity})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="multiple">
                                <RadioGroupItemIndicator />
                            </RadioGroupItem>
                            <span className="text-sm text-write">Multiple (Quantity: {quantity})</span>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </section>
    );
}
