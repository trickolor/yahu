import { Input } from "../ui/input";

export function InputDemo() {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Input</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Types</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Text</label>
                            <Input type="text" placeholder="Enter text..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Email</label>
                            <Input type="email" placeholder="Enter email..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Number</label>
                            <Input type="number" placeholder="Enter number..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">File</label>
                            <Input type="file" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Color</label>
                            <Input type="color" defaultValue="#3b82f6" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Range</label>
                            <Input type="range" min={0} max={100} defaultValue={50} />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Default</label>
                            <Input type="text" placeholder="Default input..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">With Value</label>
                            <Input type="text" defaultValue="Pre-filled value" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Disabled</label>
                            <Input type="text" placeholder="Disabled..." disabled />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Read Only</label>
                            <Input type="text" defaultValue="Read only value" readOnly />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Invalid</label>
                            <Input type="text" placeholder="Invalid input..." aria-invalid="true" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Required</label>
                            <Input type="text" placeholder="Required field..." required />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
