import { Button } from "./ui/button"

function App() {
  return (
    <div className="flex flex-col gap-4 items-start p-8">
      <h1 className="text-2xl font-bold mb-2">Button Variants</h1>
      <div className="flex gap-3 flex-wrap">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="success">Success</Button>
        <Button variant="error">Error</Button>
      </div>
      <h2 className="text-xl font-semibold mt-6 mb-2">Button Sizes</h2>
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
      <h2 className="text-xl font-semibold mt-6 mb-2">Disabled</h2>
      <div className="flex gap-3 flex-wrap">
        <Button disabled>Default</Button>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="outline" disabled>Outline</Button>
        <Button variant="ghost" disabled>Ghost</Button>
      </div>
    </div>

  )
}

export default App
