import SelectDemo from "./select-demo";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button"
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

function App() {
    const themeToggle = () => {
        document.documentElement.classList.toggle('dark');
    }

    return (
        <section className="w-full bg-surface space-y-12 relatives pb-128">
            <Button className="fixed top-6 right-6" onClick={themeToggle}>
                Change Theme
            </Button>

            <div className="w-fit grid grid-cols-2 gap-8 p-8">
                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-primary-surface" />
                        <span className="text-write">primary surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-primary-bound" />
                        <span className="text-write">primary bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-primary-write" />
                        <span className="text-write">primary write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-secondary-surface" />
                        <span className="text-write">secondary surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-secondary-bound" />
                        <span className="text-write">secondary bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-secondary-write" />
                        <span className="text-write">secondary write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-weak-surface" />
                        <span className="text-write">weak surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-weak-bound" />
                        <span className="text-write">weak bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-weak-write" />
                        <span className="text-write">weak write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-surface" />
                        <span className="text-write">surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-bound" />
                        <span className="text-write">bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-write" />
                        <span className="text-write">write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-sharp-surface" />
                        <span className="text-write">sharp surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-sharp-bound" />
                        <span className="text-write">sharp bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-sharp-write" />
                        <span className="text-write">sharp write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-success-surface" />
                        <span className="text-write">success surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-success-bound" />
                        <span className="text-write">success bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-success-write" />
                        <span className="text-write">success write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-warning-surface" />
                        <span className="text-write">warning surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-warning-bound" />
                        <span className="text-write">warning bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-warning-write" />
                        <span className="text-write">warning write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-error-surface" />
                        <span className="text-write">error surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-error-bound" />
                        <span className="text-write">error bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-bound bg-error-write" />
                        <span className="text-write">error write</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start p-8">
                <h1 className="text-2xl font-bold mb-2 text-write">Button Variants</h1>
                <div className="flex gap-3 flex-wrap items-center">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="error">Error</Button>
                    <Button variant="link" asChild><a href="https://google.com">Link</a></Button>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-write">Button Sizes</h2>
                <div className="flex gap-3 flex-wrap items-center">
                    <Button size="small">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="large">Large</Button>

                    <Button size="icon" aria-label="Icon Button">
                        <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="8" /></svg>
                    </Button>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2 text-write">Disabled</h2>
                <div className="flex gap-3 flex-wrap items-center">
                    <Button disabled>Default</Button>
                    <Button variant="secondary" disabled>Secondary</Button>
                    <Button variant="outline" disabled>Outline</Button>
                    <Button variant="ghost" disabled>Ghost</Button>
                    <Button variant="link" disabled>Link</Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start p-8">
                <h1 className="text-2xl font-bold mb-2 text-write">Badge Variants</h1>
                <div className="flex gap-3 flex-wrap items-center">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="error">Error</Badge>
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start p-8">
                <h1 className="text-2xl font-bold mb-2 text-write">Input Variants</h1>
                <div className="flex gap-3 flex-wrap items-center w-full max-w-md">
                    <Input placeholder="Default" />
                    <Input disabled placeholder="Disabled" />
                    <Input aria-invalid placeholder="Invalid" />
                    <Input type="file" />
                </div>
            </div>

            <div className="flex flex-col gap-4 items-start p-8">
                <h1 className="text-2xl font-bold mb-2 text-write">Textarea Variants</h1>
                <div className="flex flex-col gap-3 w-full max-w-md">
                    <Textarea rows={3} placeholder="Default" />
                    <Textarea rows={3} disabled placeholder="Disabled" />
                    <Textarea rows={3} aria-invalid placeholder="Invalid" />
                </div>
            </div>

            <SelectDemo />
        </section>
    )
}

export default App
