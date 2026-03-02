import { Button } from "../ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";
import { Input } from "../ui/input";

export function ButtonGroupDemo() {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Button Group</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Horizontal</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <ButtonGroup>
                            <Button variant="outline">Left</Button>
                            <Button variant="outline">Center</Button>
                            <Button variant="outline">Right</Button>
                        </ButtonGroup>

                        <ButtonGroup>
                            <Button variant="outline">Cut</Button>
                            <Button variant="outline">Copy</Button>
                            <Button variant="outline">Paste</Button>
                        </ButtonGroup>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Separator</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <ButtonGroup>
                            <Button variant="secondary">Undo</Button>
                            <ButtonGroupSeparator />
                            <Button variant="secondary">Redo</Button>
                            <ButtonGroupSeparator />
                            <Button variant="secondary">Save</Button>
                        </ButtonGroup>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Vertical</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <ButtonGroup orientation="vertical" className="[&>button]:w-24">
                            <Button variant="secondary">Top</Button>
                            <ButtonGroupSeparator orientation="horizontal" />
                            <Button variant="secondary">Middle</Button>
                            <ButtonGroupSeparator orientation="horizontal" />
                            <Button variant="secondary">Bottom</Button>
                        </ButtonGroup>

                        <ButtonGroup orientation="vertical" className="[&>button]:w-24">
                            <Button variant="outline">Option 1</Button>
                            <Button variant="outline">Option 2</Button>
                            <Button variant="outline">Option 3</Button>
                        </ButtonGroup>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Nested Groups</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <ButtonGroup>
                            <ButtonGroup>
                                <Button variant="outline">File</Button>
                                <Button variant="outline">Edit</Button>
                            </ButtonGroup>

                            <ButtonGroup>
                                <Button variant="outline" size="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </Button>

                                <Button variant="outline" size="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                    </svg>
                                </Button>
                            </ButtonGroup>
                        </ButtonGroup>

                        <ButtonGroup>
                            <ButtonGroup>
                                <Button variant="secondary">Bold</Button>
                                <ButtonGroupSeparator />
                                <Button variant="secondary">Italic</Button>
                                <ButtonGroupSeparator />
                                <Button variant="secondary">Underline</Button>
                            </ButtonGroup>

                            <ButtonGroup>
                                <Button variant="outline">Left</Button>
                                <Button variant="outline">Center</Button>
                                <Button variant="outline">Right</Button>
                            </ButtonGroup>
                        </ButtonGroup>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Input Fields</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-write">Search with Actions</label>
                            <ButtonGroup>
                                <Input type="text" placeholder="Search..." className="rounded-r-none" />
                                <Button>Search</Button>
                            </ButtonGroup>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-write">URL with Protocol</label>

                            <ButtonGroup>
                                <Button variant="outline">https://</Button>
                                <Input type="text" placeholder="example.com" className="rounded-l-none" />
                            </ButtonGroup>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-muted-write">Price Input</label>
                            <ButtonGroup>
                                <Button variant="outline">Change Currency</Button>
                                <Input type="number" placeholder="0.00" className="rounded-none" />
                                <Button variant="outline">Apply</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
