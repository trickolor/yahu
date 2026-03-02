import { Toggle } from "../ui/toggle";

export interface ToggleDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
}

export function ToggleDemo({ quantity, setQuantity }: ToggleDemoProps) {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Toggle</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <Toggle>Toggle</Toggle>
                        <Toggle defaultPressed>Pressed</Toggle>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <Toggle variant="default">Default</Toggle>
                        <Toggle variant="outline">Outline</Toggle>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <Toggle size="sm">Small</Toggle>
                        <Toggle size="default">Default</Toggle>
                        <Toggle size="lg">Large</Toggle>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Icon Sizes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <Toggle size="icon-sm" aria-label="Small icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="8" />
                            </svg>
                        </Toggle>
                        <Toggle size="icon" aria-label="Icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="8" />
                            </svg>
                        </Toggle>
                        <Toggle size="icon-lg" aria-label="Large icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="8" />
                            </svg>
                        </Toggle>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="flex flex-wrap items-center gap-4">
                        <Toggle disabled>Disabled</Toggle>
                        <Toggle disabled defaultPressed>Disabled Pressed</Toggle>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                    <div className="flex items-center gap-2">
                        <Toggle pressed={quantity > 1} onPressedChange={(pressed) => setQuantity(pressed ? 2 : 1)}>
                            Multiple Items (Quantity: {quantity})
                        </Toggle>
                    </div>
                </div>
            </div>
        </section>
    );
}
