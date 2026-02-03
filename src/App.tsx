import { useState } from "react";
import { cn } from "./cn";
import { Button } from "./ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { Checkbox, CheckboxIndicator, CheckboxGroup } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem, RadioGroupItemIndicator } from "./ui/radio-group";
import { Switch, SwitchThumb } from "./ui/switch";
import { Toggle } from "./ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { NumericField, NumericFieldInput, NumericFieldIncrement, NumericFieldIncrementIndicator, NumericFieldDecrement, NumericFieldDecrementIndicator, NumericFieldScrub, NumericFieldScrubIndicator } from "./ui/numeric-field";
import { PasswordField, PasswordFieldInput, PasswordFieldToggle, PasswordFieldToggleIndicator } from "./ui/password-field";
import { SearchField, SearchFieldInput, SearchFieldIndicator, SearchFieldClear, SearchFieldClearIndicator } from "./ui/search-field";
import { OTPField, OTPFieldInput, OTPFieldGroup, OTPFieldSeparator } from "./ui/otp-field";
import { MaskedInput } from "./ui/masked-input";
import { Select, SelectTrigger, SelectValue, SelectTriggerIndicator, SelectPortal, SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator, SelectGroup, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./ui/select";
import { MultiSelect, MultiSelectTrigger, MultiSelectValue, MultiSelectChip, MultiSelectTriggerIndicator, MultiSelectClear, MultiSelectAll, MultiSelectPortal, MultiSelectContent, MultiSelectViewport, MultiSelectItem, MultiSelectItemText, MultiSelectItemIndicator, MultiSelectGroup, MultiSelectLabel, MultiSelectSeparator, MultiSelectScrollUpButton, MultiSelectScrollDownButton } from "./ui/multi-select";

function App() {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(99.99);
    const [selectedFruits, setSelectedFruits] = useState<string[]>(["apple"]);

    const themeToggle = () => {
        document.documentElement.setAttribute('data-mode', document.documentElement.getAttribute('data-mode') === 'light' ? 'dark' : 'light');
    }

    return (
        <main className="w-full py-24 min-h-screen space-y-16 relative">
            <Button className="fixed top-6 right-6 z-50" onClick={themeToggle}>
                Change Theme
            </Button>

            {/* Button Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Button</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="default">Default</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                            <Button variant="danger">Danger</Button>
                            <Button variant="success">Success</Button>
                            <Button variant="warn">Warn</Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Sizes</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </Button>
                            <Button size="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </Button>
                            <Button size="icon-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button disabled>Disabled</Button>
                            <Button aria-invalid="true">Invalid</Button>
                            <Button variant="secondary" disabled>Disabled Secondary</Button>
                            <Button variant="outline" disabled>Disabled Outline</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Button Group Demo Section */}
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

            {/* Input Demo Section */}
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

            {/* Textarea Demo Section */}
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

            {/* NumericField Demo Section */}
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

            {/* PasswordField Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Password Field</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Default</label>
                                <PasswordField>
                                    <PasswordFieldInput placeholder="Enter password" className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">With Value</label>
                                <PasswordField defaultValue="secretpassword123">
                                    <PasswordFieldInput className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Default Visible</label>
                                <PasswordField defaultValue="visiblepassword" defaultVisible>
                                    <PasswordFieldInput className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Disabled</label>
                                <PasswordField defaultValue="disabled123" disabled>
                                    <PasswordFieldInput className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Read Only</label>
                                <PasswordField defaultValue="readonly123" readOnly>
                                    <PasswordFieldInput className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Required</label>
                                <PasswordField required>
                                    <PasswordFieldInput placeholder="Required..." className="w-full" />
                                    <PasswordFieldToggle><PasswordFieldToggleIndicator /></PasswordFieldToggle>
                                </PasswordField>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SearchField Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Search Field</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Default</label>
                                <SearchField>
                                    <SearchFieldIndicator />
                                    <SearchFieldInput placeholder="Search..." className="w-full" />
                                    <SearchFieldClear><SearchFieldClearIndicator /></SearchFieldClear>
                                </SearchField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">With Value</label>
                                <SearchField defaultValue="react components">
                                    <SearchFieldIndicator />
                                    <SearchFieldInput className="w-full" />
                                    <SearchFieldClear><SearchFieldClearIndicator /></SearchFieldClear>
                                </SearchField>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Disabled</label>
                                <SearchField defaultValue="disabled search" disabled>
                                    <SearchFieldIndicator />
                                    <SearchFieldInput className="w-full" />
                                    <SearchFieldClear><SearchFieldClearIndicator /></SearchFieldClear>
                                </SearchField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Read Only</label>
                                <SearchField defaultValue="read only value" readOnly>
                                    <SearchFieldIndicator />
                                    <SearchFieldInput className="w-full" />
                                    <SearchFieldClear><SearchFieldClearIndicator /></SearchFieldClear>
                                </SearchField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Required</label>
                                <SearchField required>
                                    <SearchFieldIndicator />
                                    <SearchFieldInput placeholder="Required..." className="w-full" />
                                    <SearchFieldClear><SearchFieldClearIndicator /></SearchFieldClear>
                                </SearchField>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OTPField Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">OTP Field</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Validation Types</h3>
                        <div className="flex flex-wrap items-end gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Numeric (default)</label>
                                <OTPField length={6} onAutoSubmit={(val: string) => console.log('Auto-submit:', val)} autoSubmit>
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Alphanumeric</label>
                                <OTPField length={6} validationType="alphanumeric">
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Alphabetic</label>
                                <OTPField length={4} validationType="alphabetic">
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Display Types</h3>
                        <div className="flex flex-wrap items-end gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Text (visible)</label>
                                <OTPField length={4} type="text">
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Password (masked)</label>
                                <OTPField length={4} type="password">
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Groups & Separators</h3>
                        <div className="flex flex-wrap items-end gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Grouped (3-3)</label>
                                <OTPField length={6}>
                                    <OTPFieldGroup>
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                    </OTPFieldGroup>
                                    <OTPFieldSeparator />
                                    <OTPFieldGroup>
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                    </OTPFieldGroup>
                                </OTPField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Grouped (2-2-2)</label>
                                <OTPField length={6}>
                                    <OTPFieldGroup>
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                    </OTPFieldGroup>
                                    <OTPFieldSeparator />
                                    <OTPFieldGroup>
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                    </OTPFieldGroup>
                                    <OTPFieldSeparator />
                                    <OTPFieldGroup>
                                        <OTPFieldInput />
                                        <OTPFieldInput />
                                    </OTPFieldGroup>
                                </OTPField>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-end gap-8">
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Disabled</label>
                                <OTPField length={4} defaultValue="1234" disabled>
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-muted-write">Read Only</label>
                                <OTPField length={4} defaultValue="5678" readOnly>
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                    <OTPFieldInput />
                                </OTPField>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MaskedInput Demo Section */}
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

            {/* Checkbox Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Checkbox</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Tri-State</h3>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Unchecked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox defaultChecked>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Checked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox defaultChecked="indeterminate">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Indeterminate</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox disabled>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Disabled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox disabled defaultChecked>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Disabled Checked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox disabled defaultChecked="indeterminate">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Disabled Indeterminate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox required>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Required</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Form Integration</h3>
                        <div className="flex flex-wrap items-start gap-8">
                            <div className="flex items-center gap-2">
                                <Checkbox name="terms" value="accepted">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">I accept the terms and conditions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox name="newsletter" value="subscribed" defaultChecked>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Subscribe to newsletter</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Select All Pattern</h3>
                        <div className="space-y-2">
                            <div className="flex w-fit items-center gap-2 pb-1 border-b border-bound">
                                <Checkbox defaultChecked="indeterminate">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm font-medium text-write">Select All</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4">
                                <Checkbox name="items" value="item1" defaultChecked>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Item 1</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4">
                                <Checkbox name="items" value="item2" defaultChecked>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Item 2</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4">
                                <Checkbox name="items" value="item3">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Item 3</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4">
                                <Checkbox name="items" value="item4" disabled>
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Item 4 (disabled)</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Checkbox Group (Vertical)</h3>
                        <CheckboxGroup name="sports" defaultValue={["soccer", "basketball"]}>
                            <div className="flex items-center gap-2">
                                <Checkbox value="soccer">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Soccer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox value="baseball">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Baseball</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox value="basketball">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Basketball</span>
                            </div>
                        </CheckboxGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Checkbox Group (Horizontal)</h3>
                        <CheckboxGroup name="colors" orientation="horizontal" defaultValue={["red"]}>
                            <div className="flex items-center gap-2">
                                <Checkbox value="red">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Red</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox value="green">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Green</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox value="blue">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-write">Blue</span>
                            </div>
                        </CheckboxGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Checkbox Group (Disabled)</h3>
                        <CheckboxGroup name="disabled-group" disabled defaultValue={["option1"]}>
                            <div className="flex items-center gap-2">
                                <Checkbox value="option1">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Option 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox value="option2">
                                    <CheckboxIndicator />
                                </Checkbox>
                                <span className="text-sm text-muted-write">Option 2</span>
                            </div>
                        </CheckboxGroup>
                    </div>
                </div>
            </section>

            {/* Radio Group Demo Section */}
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

            {/* Switch Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Switch</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Unchecked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch defaultChecked>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Checked</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch disabled>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-muted-write">Disabled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch disabled defaultChecked>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-muted-write">Disabled Checked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch readOnly>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Read Only</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch readOnly defaultChecked>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Read Only Checked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch required>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Required</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Labels</h3>
                        <div className="space-y-4 w-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <label htmlFor="notifications-switch" className="text-sm font-medium text-write block mb-1">
                                        Enable notifications
                                    </label>
                                    <p className="text-xs text-muted-write">Receive notifications about your account activity</p>
                                </div>
                                <Switch id="notifications-switch" defaultChecked>
                                    <SwitchThumb />
                                </Switch>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <label htmlFor="marketing-switch" className="text-sm font-medium text-write block mb-1">
                                        Marketing emails
                                    </label>
                                    <p className="text-xs text-muted-write">Receive emails about new products and features</p>
                                </div>
                                <Switch id="marketing-switch">
                                    <SwitchThumb />
                                </Switch>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Form Integration</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Switch name="terms" defaultChecked>
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">I accept the terms and conditions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch name="newsletter">
                                    <SwitchThumb />
                                </Switch>
                                <span className="text-sm text-write">Subscribe to newsletter</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                        <div className="flex items-center gap-2">
                            <Switch checked={quantity > 1} onCheckedChange={(checked) => setQuantity(checked ? 2 : 1)}>
                                <SwitchThumb />
                            </Switch>
                            <span className="text-sm text-write">Enable multiple items (Quantity: {quantity})</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toggle Demo Section */}
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

            {/* Toggle Group Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Toggle Group</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Single Selection (Horizontal)</h3>
                        <ToggleGroup type="single" defaultValue="center">
                            <ToggleGroupItem variant="outline" value="left">Left</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="center">Center</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="right">Right</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Single Selection (Vertical)</h3>
                        <ToggleGroup className="[&>button]:w-24" type="single" defaultValue="top" orientation="vertical">
                            <ToggleGroupItem variant="outline" value="top">Top</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="middle">Middle</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="bottom">Bottom</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Multiple Selection</h3>
                        <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
                            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
                            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
                            <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Variants</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-write mb-2">Default</p>
                                <ToggleGroup type="single" defaultValue="option1">
                                    <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
                                    <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
                                    <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <p className="text-xs text-muted-write mb-2">Outline</p>
                                <ToggleGroup type="single" defaultValue="item1">
                                    <ToggleGroupItem value="item1" variant="outline">Item 1</ToggleGroupItem>
                                    <ToggleGroupItem value="item2" variant="outline">Item 2</ToggleGroupItem>
                                    <ToggleGroupItem value="item3" variant="outline">Item 3</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Sizes</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-write mb-2">Small</p>
                                <ToggleGroup type="single" defaultValue="sm1">
                                    <ToggleGroupItem value="sm1" size="sm">Small 1</ToggleGroupItem>
                                    <ToggleGroupItem value="sm2" size="sm">Small 2</ToggleGroupItem>
                                    <ToggleGroupItem value="sm3" size="sm">Small 3</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <p className="text-xs text-muted-write mb-2">Default</p>
                                <ToggleGroup type="single" defaultValue="def1">
                                    <ToggleGroupItem value="def1">Default 1</ToggleGroupItem>
                                    <ToggleGroupItem value="def2">Default 2</ToggleGroupItem>
                                    <ToggleGroupItem value="def3">Default 3</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <p className="text-xs text-muted-write mb-2">Large</p>
                                <ToggleGroup type="single" defaultValue="lg1">
                                    <ToggleGroupItem value="lg1" size="lg">Large 1</ToggleGroupItem>
                                    <ToggleGroupItem value="lg2" size="lg">Large 2</ToggleGroupItem>
                                    <ToggleGroupItem value="lg3" size="lg">Large 3</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-write mb-2">Disabled Group</p>
                                <ToggleGroup type="single" defaultValue="disabled1" disabled>
                                    <ToggleGroupItem value="disabled1">Disabled 1</ToggleGroupItem>
                                    <ToggleGroupItem value="disabled2">Disabled 2</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <p className="text-xs text-muted-write mb-2">Disabled Item</p>
                                <ToggleGroup type="single" defaultValue="enabled1">
                                    <ToggleGroupItem value="enabled1">Enabled 1</ToggleGroupItem>
                                    <ToggleGroupItem value="enabled2">Enabled 2</ToggleGroupItem>
                                    <ToggleGroupItem value="disabled-item" disabled>Disabled Item</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Spacing</h3>
                        <ToggleGroup className="gap-4" type="single" defaultValue="spaced1">
                            <ToggleGroupItem variant="outline" value="spaced1">Spaced 1</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="spaced2">Spaced 2</ToggleGroupItem>
                            <ToggleGroupItem variant="outline" value="spaced3">Spaced 3</ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                        <ToggleGroup type="single" value={quantity === 1 ? "single" : "multiple"} onValueChange={(val) => setQuantity(val === "single" ? 1 : 2)}>
                            <ToggleGroupItem value="single">Single (Quantity: {quantity})</ToggleGroupItem>
                            <ToggleGroupItem value="multiple">Multiple (Quantity: {quantity})</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </section>

            {/* Select Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Select</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                        <div className="flex flex-wrap items-start gap-6">
                            <Select defaultValue="apple">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a fruit..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectContent>
                                        <SelectScrollUpButton />
                                        <SelectViewport>
                                            <SelectItem value="apple">
                                                <SelectItemText>Apple</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="banana">
                                                <SelectItemText>Banana</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="orange">
                                                <SelectItemText>Orange</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="grape">
                                                <SelectItemText>Grape</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectViewport>
                                        <SelectScrollDownButton />
                                    </SelectContent>
                                </SelectPortal>
                            </Select>

                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="No default value..." />
                                    <SelectTriggerIndicator />
                                </SelectTrigger>
                                <SelectPortal>
                                    <SelectContent>
                                        <SelectViewport>
                                            <SelectItem value="option1">
                                                <SelectItemText>Option 1</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="option2">
                                                <SelectItemText>Option 2</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="option3">
                                                <SelectItemText>Option 3</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectViewport>
                                    </SelectContent>
                                </SelectPortal>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                        <Select defaultValue="react">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a framework..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectGroup>
                                            <SelectLabel>Frontend</SelectLabel>
                                            <SelectItem value="react">
                                                <SelectItemText>React</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="vue">
                                                <SelectItemText>Vue</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="svelte">
                                                <SelectItemText>Svelte</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectGroup>
                                        <SelectSeparator />
                                        <SelectGroup>
                                            <SelectLabel>Backend</SelectLabel>
                                            <SelectItem value="node">
                                                <SelectItemText>Node.js</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="deno">
                                                <SelectItemText>Deno</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                            <SelectItem value="bun">
                                                <SelectItemText>Bun</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                        <Select defaultValue="enabled1">
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectItem value="enabled1">
                                            <SelectItemText>Enabled 1</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="disabled1" disabled>
                                            <SelectItemText>Disabled Item</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="enabled2">
                                            <SelectItemText>Enabled 2</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="disabled2" disabled>
                                            <SelectItemText>Another Disabled</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Long List with Scroll</h3>
                        <Select defaultValue="item5">
                            <SelectTrigger>
                                <SelectValue placeholder="Select an item..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectContent>
                                    <SelectScrollUpButton />
                                    <SelectViewport className="max-h-64">
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <SelectItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                                <SelectItemText>{`Item ${i + 1}`}</SelectItemText>
                                                <SelectItemIndicator />
                                            </SelectItem>
                                        ))}
                                    </SelectViewport>
                                    <SelectScrollDownButton />
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-start gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs text-muted-write">Disabled</label>
                                <Select defaultValue="option1" disabled>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Disabled select..." />
                                        <SelectTriggerIndicator />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="option1">
                                                    <SelectItemText>Option 1</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="option2">
                                                    <SelectItemText>Option 2</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                                <Select defaultValue="invalid">
                                    <SelectTrigger aria-invalid="true" className="border-red-500 focus-visible:ring-red-500">
                                        <SelectValue placeholder="Invalid select..." />
                                        <SelectTriggerIndicator />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="invalid">
                                                    <SelectItemText>Invalid Option</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="valid">
                                                    <SelectItemText>Valid Option</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs text-muted-write">Required</label>
                                <Select defaultValue="option1" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Required select..." />
                                        <SelectTriggerIndicator />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectContent>
                                            <SelectViewport>
                                                <SelectItem value="option1">
                                                    <SelectItemText>Option 1</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                                <SelectItem value="option2">
                                                    <SelectItemText>Option 2</SelectItemText>
                                                    <SelectItemIndicator />
                                                </SelectItem>
                                            </SelectViewport>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                        <Select value={quantity === 1 ? "single" : "multiple"} onValueChange={(val) => setQuantity(val === "single" ? 1 : 2)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select quantity..." />
                                <SelectTriggerIndicator />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectContent>
                                    <SelectViewport>
                                        <SelectItem value="single">
                                            <SelectItemText>{`Single (Quantity: ${quantity})`}</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                        <SelectItem value="multiple">
                                            <SelectItemText>{`Multiple (Quantity: ${quantity})`}</SelectItemText>
                                            <SelectItemIndicator />
                                        </SelectItem>
                                    </SelectViewport>
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </div>
                </div>
            </section>

            {/* Multi-Select Demo Section */}
            <section className="w-full max-w-5xl mx-auto px-8">
                <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Multi-Select</h2>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Basic</h3>
                        <div className="flex flex-wrap items-start gap-6">
                            <MultiSelect defaultValue={["apple", "banana"]}>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="Select fruits..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent>
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="apple">
                                                <MultiSelectItemText>Apple</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="banana">
                                                <MultiSelectItemText>Banana</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="orange">
                                                <MultiSelectItemText>Orange</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="grape">
                                                <MultiSelectItemText>Grape</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="strawberry">
                                                <MultiSelectItemText>Strawberry</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>

                            <MultiSelect>
                                <MultiSelectTrigger>
                                    <MultiSelectValue placeholder="No default selection..." />
                                    <MultiSelectTriggerIndicator />
                                </MultiSelectTrigger>
                                <MultiSelectPortal>
                                    <MultiSelectContent>
                                        <MultiSelectViewport>
                                            <MultiSelectItem value="option1">
                                                <MultiSelectItemText>Option 1</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="option2">
                                                <MultiSelectItemText>Option 2</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="option3">
                                                <MultiSelectItemText>Option 3</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectViewport>
                                    </MultiSelectContent>
                                </MultiSelectPortal>
                            </MultiSelect>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Clear Button</h3>
                        <MultiSelect defaultValue={["react", "vue"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select frameworks..." />
                                <MultiSelectClear />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="react">
                                            <MultiSelectItemText>React</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="vue">
                                            <MultiSelectItemText>Vue</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="angular">
                                            <MultiSelectItemText>Angular</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="svelte">
                                            <MultiSelectItemText>Svelte</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Select All & Clear Buttons</h3>
                        <MultiSelect defaultValue={["node", "deno"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select runtimes..." />
                                <MultiSelectAll />
                                <MultiSelectClear />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="node">
                                            <MultiSelectItemText>Node.js</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="deno">
                                            <MultiSelectItemText>Deno</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="bun">
                                            <MultiSelectItemText>Bun</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="browser">
                                            <MultiSelectItemText>Browser</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="cloudflare" disabled>
                                            <MultiSelectItemText>Cloudflare Workers</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                        <MultiSelect defaultValue={["typescript", "python"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select languages..." />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectGroup>
                                            <MultiSelectLabel>Web</MultiSelectLabel>
                                            <MultiSelectItem value="javascript">
                                                <MultiSelectItemText>JavaScript</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="typescript">
                                                <MultiSelectItemText>TypeScript</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectGroup>
                                        <MultiSelectSeparator />
                                        <MultiSelectGroup>
                                            <MultiSelectLabel>Backend</MultiSelectLabel>
                                            <MultiSelectItem value="python">
                                                <MultiSelectItemText>Python</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="go">
                                                <MultiSelectItemText>Go</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                            <MultiSelectItem value="rust">
                                                <MultiSelectItemText>Rust</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        </MultiSelectGroup>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Truncated Chips (maxDisplayedItems=2)</h3>
                        <MultiSelect defaultValue={["item1", "item2", "item3", "item4", "item5"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select items..." maxDisplayedItems={2} />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <MultiSelectItem key={`item${i + 1}`} value={`item${i + 1}`}>
                                                <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Custom Chip Renderer</h3>
                        <MultiSelect defaultValue={["red", "blue", "green"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue
                                    placeholder="Select colors..."
                                    itemRender={(item, removeHandler, context) => (
                                        <MultiSelectChip
                                            key={item.value}
                                            value={item.value}
                                            onRemove={removeHandler}
                                            disabled={context.disabled}
                                            className={cn(
                                                item.value === 'red' && 'bg-red-500/20 text-red-400',
                                                item.value === 'blue' && 'bg-blue-500/20 text-blue-400',
                                                item.value === 'green' && 'bg-green-500/20 text-green-400',
                                                item.value === 'yellow' && 'bg-yellow-500/20 text-yellow-400'
                                            )}
                                        >
                                            {item.textValue}
                                        </MultiSelectChip>
                                    )}
                                />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="red">
                                            <MultiSelectItemText>Red</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="blue">
                                            <MultiSelectItemText>Blue</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="green">
                                            <MultiSelectItemText>Green</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="yellow">
                                            <MultiSelectItemText>Yellow</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">With Disabled Items</h3>
                        <MultiSelect defaultValue={["enabled1"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select options..." />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="enabled1">
                                            <MultiSelectItemText>Enabled 1</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="disabled1" disabled>
                                            <MultiSelectItemText>Disabled Item</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="enabled2">
                                            <MultiSelectItemText>Enabled 2</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="disabled2" disabled>
                                            <MultiSelectItemText>Another Disabled</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">States</h3>
                        <div className="flex flex-wrap items-start gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs text-muted-write">Disabled</label>
                                <MultiSelect defaultValue={["option1"]} disabled>
                                    <MultiSelectTrigger>
                                        <MultiSelectValue placeholder="Disabled..." />
                                        <MultiSelectTriggerIndicator />
                                    </MultiSelectTrigger>
                                    <MultiSelectPortal>
                                        <MultiSelectContent>
                                            <MultiSelectViewport>
                                                <MultiSelectItem value="option1">
                                                    <MultiSelectItemText>Option 1</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                                <MultiSelectItem value="option2">
                                                    <MultiSelectItemText>Option 2</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                            </MultiSelectViewport>
                                        </MultiSelectContent>
                                    </MultiSelectPortal>
                                </MultiSelect>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs text-muted-write">Invalid (aria-invalid)</label>
                                <MultiSelect defaultValue={["invalid"]}>
                                    <MultiSelectTrigger aria-invalid="true" className="border-red-500 focus-visible:ring-red-500">
                                        <MultiSelectValue placeholder="Invalid..." />
                                        <MultiSelectTriggerIndicator />
                                    </MultiSelectTrigger>
                                    <MultiSelectPortal>
                                        <MultiSelectContent>
                                            <MultiSelectViewport>
                                                <MultiSelectItem value="invalid">
                                                    <MultiSelectItemText>Invalid Option</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                                <MultiSelectItem value="valid">
                                                    <MultiSelectItemText>Valid Option</MultiSelectItemText>
                                                    <MultiSelectItemIndicator />
                                                </MultiSelectItem>
                                            </MultiSelectViewport>
                                        </MultiSelectContent>
                                    </MultiSelectPortal>
                                </MultiSelect>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Long List with Scroll</h3>
                        <MultiSelect defaultValue={["item5", "item10"]}>
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select items..." />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectScrollUpButton />
                                    <MultiSelectViewport className="max-h-64">
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <MultiSelectItem key={`scroll-item${i + 1}`} value={`item${i + 1}`}>
                                                <MultiSelectItemText>{`Item ${i + 1}`}</MultiSelectItemText>
                                                <MultiSelectItemIndicator />
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelectViewport>
                                    <MultiSelectScrollDownButton />
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-write">Controlled</h3>
                        <MultiSelect
                            value={selectedFruits}
                            onValueChange={setSelectedFruits}
                        >
                            <MultiSelectTrigger>
                                <MultiSelectValue placeholder="Select fruits..." />
                                <MultiSelectClear />
                                <MultiSelectTriggerIndicator />
                            </MultiSelectTrigger>
                            <MultiSelectPortal>
                                <MultiSelectContent>
                                    <MultiSelectViewport>
                                        <MultiSelectItem value="apple">
                                            <MultiSelectItemText>Apple</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="banana">
                                            <MultiSelectItemText>Banana</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                        <MultiSelectItem value="cherry">
                                            <MultiSelectItemText>Cherry</MultiSelectItemText>
                                            <MultiSelectItemIndicator />
                                        </MultiSelectItem>
                                    </MultiSelectViewport>
                                </MultiSelectContent>
                            </MultiSelectPortal>
                        </MultiSelect>
                        <p className="text-xs text-muted-write">Selected: {selectedFruits.length > 0 ? selectedFruits.join(", ") : "None"}</p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default App
