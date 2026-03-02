import { NumericField, NumericFieldInput, NumericFieldIncrement, NumericFieldIncrementIndicator, NumericFieldDecrement, NumericFieldDecrementIndicator, NumericFieldScrub, NumericFieldScrubIndicator } from "../ui/numeric-field";

export interface NumericFieldDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
    price: number;
    setPrice: (value: number) => void;
}

export function NumericFieldDemo({ quantity, setQuantity, price, setPrice }: NumericFieldDemoProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Numeric Field</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Default</label>
                            <NumericField defaultValue={0}>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">With Min/Max (1-100)</label>
                            <NumericField value={quantity} onValueChange={(val) => setQuantity(val ?? 1)} min={1} max={100}>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Step by 5</label>
                            <NumericField defaultValue={50} min={0} max={100} step={5}>
                                <NumericFieldDecrement className="size-8 text-xs">−</NumericFieldDecrement>
                                <NumericFieldInput className="w-14 h-8 text-center text-sm" />
                                <NumericFieldIncrement className="size-8 text-xs">+</NumericFieldIncrement>
                            </NumericField>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Scrub Controls</h3>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Horizontal Scrub</label>
                            <NumericField value={price} onValueChange={(val) => setPrice(val ?? 0)} min={0} max={9999.99} step={1} smallStep={0.01} largeStep={10}>
                                <NumericFieldScrub direction="horizontal"><NumericFieldScrubIndicator direction="horizontal" /></NumericFieldScrub>
                                <span className="flex items-center px-2 h-9 text-write border border-bound bg-surface border-l-0">$</span>
                                <NumericFieldInput className="w-24" />
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Vertical Scrub</label>
                            <NumericField defaultValue={0} min={-50} max={50}>
                                <NumericFieldScrub direction="vertical"><NumericFieldScrubIndicator direction="vertical" /></NumericFieldScrub>
                                <NumericFieldInput className="w-20 text-center" />
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Wheel Scrub (hover & scroll)</label>
                            <NumericField defaultValue={0} min={-100} max={100} allowWheelScrub>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Disabled</label>
                            <NumericField defaultValue={42} disabled>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Read Only</label>
                            <NumericField defaultValue={100} readOnly>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Required</label>
                            <NumericField defaultValue={0} required>
                                <NumericFieldDecrement><NumericFieldDecrementIndicator /></NumericFieldDecrement>
                                <NumericFieldInput className="w-20 text-center" />
                                <NumericFieldIncrement><NumericFieldIncrementIndicator /></NumericFieldIncrement>
                            </NumericField>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
