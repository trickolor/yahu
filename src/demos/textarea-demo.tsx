import { Textarea } from "../ui/textarea";

export function TextareaDemo() {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Textarea</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">States</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Default</label>
                            <Textarea placeholder="Enter text..." rows={3} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">With Value</label>
                            <Textarea defaultValue="This is some pre-filled text content." rows={3} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Disabled</label>
                            <Textarea placeholder="Disabled..." disabled rows={3} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Read Only</label>
                            <Textarea defaultValue="This content is read only." readOnly rows={3} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Invalid</label>
                            <Textarea placeholder="Invalid textarea..." aria-invalid="true" rows={3} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-muted-write">Required</label>
                            <Textarea placeholder="Required field..." required rows={3} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
