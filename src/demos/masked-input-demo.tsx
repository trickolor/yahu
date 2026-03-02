import { MaskedInput } from "../ui/masked-input";

export function MaskedInputDemo() {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Masked Input</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Common Masks</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Phone Number</label>
                            <MaskedInput mask="(999) 999-9999" placeholder="Enter phone number..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Date (MM/DD/YYYY)</label>
                            <MaskedInput mask="99/99/9999" placeholder="Enter date..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Credit Card</label>
                            <MaskedInput mask="9999 9999 9999 9999" placeholder="Enter card number..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Time (HH:MM)</label>
                            <MaskedInput mask="99:99" placeholder="Enter time..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">SSN</label>
                            <MaskedInput mask="999-99-9999" placeholder="Enter SSN..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">License Plate (AAA-9999)</label>
                            <MaskedInput mask="aaa-9999" placeholder="Enter license plate..." />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Always Show Mask</label>
                            <MaskedInput mask="(999) 999-9999" alwaysShowMask />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Custom Placeholder (•)</label>
                            <MaskedInput mask="(999) 999-9999" maskPlaceholder="•" alwaysShowMask />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Custom Placeholder (#)</label>
                            <MaskedInput mask="99/99/9999" maskPlaceholder="#" alwaysShowMask />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Disabled</label>
                            <MaskedInput mask="(999) 999-9999" placeholder="Disabled..." disabled />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">With Value</label>
                            <MaskedInput mask="(999) 999-9999" defaultValue="1234567890" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Invalid</label>
                            <MaskedInput mask="(999) 999-9999" placeholder="Invalid..." aria-invalid="true" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
