import { Button } from "./ui/button"

function App() {
    return (
        <>
            <div className="grid grid-cols-2 gap-8 p-8 w-fit">
                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-primary-surface" />
                        <span>primary surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-primary-bound" />
                        <span>primary bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-primary-write" />
                        <span>primary write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-secondary-surface" />
                        <span>secondary surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-secondary-bound" />
                        <span>secondary bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-secondary-write" />
                        <span>secondary write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-weak-surface" />
                        <span>weak surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-weak-bound" />
                        <span>weak bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-weak-write" />
                        <span>weak write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-surface" />
                        <span>surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-bound" />
                        <span>bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-write" />
                        <span>write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-strong-surface" />
                        <span>strong surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-strong-bound" />
                        <span>strong bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-strong-write" />
                        <span>strong write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-success-surface" />
                        <span>success surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-success-bound" />
                        <span>success bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-success-write" />
                        <span>success write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-warning-surface" />
                        <span>warning surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-warning-bound" />
                        <span>warning bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-warning-write" />
                        <span>warning write</span>
                    </div>
                </div>

                <div className="flex gap-1 flex-col">
                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-error-surface" />
                        <span>error surface</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-error-bound" />
                        <span>error bound</span>
                    </div>

                    <div className="w-fit flex items-center gap-1">
                        <div className="size-8 border border-black bg-error-write" />
                        <span>error write</span>
                    </div>
                </div>
            </div>

            <div className="bg-surface flex flex-col gap-4 items-start p-8">
                <h1 className="text-2xl font-bold mb-2 text-write">Button Variants</h1>
                <div className="flex gap-3 flex-wrap">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="error">Error</Button>
                </div>
                <h2 className="text-xl font-semibold mt-6 mb-2 text-write">Button Sizes</h2>
                <div className="flex gap-3 flex-wrap">
                    <Button size="small">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="large">Large</Button>
                    <Button size="icon" aria-label="Icon Button">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="10" r="8" />
                        </svg>
                    </Button>
                </div>
                <h2 className="text-xl font-semibold mt-6 mb-2 text-write">Disabled</h2>
                <div className="flex gap-3 flex-wrap">
                    <Button disabled>Default</Button>
                    <Button variant="secondary" disabled>Secondary</Button>
                    <Button variant="outline" disabled>Outline</Button>
                    <Button variant="ghost" disabled>Ghost</Button>
                </div>
            </div>
        </>
    )
}

export default App
