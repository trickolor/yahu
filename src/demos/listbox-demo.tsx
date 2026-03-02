import {
    Listbox,
    ListboxViewport,
    ListboxItem,
    ListboxItemText,
    ListboxItemIndicator,
    ListboxGroup,
    ListboxLabel,
    ListboxSeparator,
    ListboxScrollUpButton,
    ListboxScrollDownButton,
} from "../ui/listbox";

export function ListboxDemo() {
    return (
        <section className="w-full max-w-5xl mx-auto px-8">
            <h2 className="text-xl font-semibold text-write mb-8 pb-2 border-b border-bound">Listbox</h2>

            <div className="space-y-8">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic Single Select</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox defaultValue="banana" className="w-64">
                            <ListboxItem value="apple">
                                <ListboxItemText>Apple</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="banana">
                                <ListboxItemText>Banana</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="cherry">
                                <ListboxItemText>Cherry</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="dragonfruit">
                                <ListboxItemText>Dragonfruit</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>

                        <Listbox className="w-64">
                            <ListboxItem value="red">
                                <ListboxItemText>Red</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="green">
                                <ListboxItemText>Green</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="blue">
                                <ListboxItemText>Blue</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="yellow">
                                <ListboxItemText>Yellow</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Basic Multiple Select</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox multiple className="w-64">
                            <ListboxItem value="react">
                                <ListboxItemText>React</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="vue">
                                <ListboxItemText>Vue</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="svelte">
                                <ListboxItemText>Svelte</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="angular">
                                <ListboxItemText>Angular</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="solid">
                                <ListboxItemText>Solid</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>

                        <Listbox multiple defaultValue={["canada", "japan"]} className="w-64">
                            <ListboxItem value="canada">
                                <ListboxItemText>Canada</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="japan">
                                <ListboxItemText>Japan</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="brazil">
                                <ListboxItemText>Brazil</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="germany">
                                <ListboxItemText>Germany</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="australia">
                                <ListboxItemText>Australia</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Groups</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox defaultValue="apple" className="w-64">
                            <ListboxGroup>
                                <ListboxLabel>Fruits</ListboxLabel>
                                <ListboxItem value="apple">
                                    <ListboxItemText>Apple</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="banana">
                                    <ListboxItemText>Banana</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="orange">
                                    <ListboxItemText>Orange</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                            </ListboxGroup>
                            <ListboxSeparator />
                            <ListboxGroup>
                                <ListboxLabel>Vegetables</ListboxLabel>
                                <ListboxItem value="carrot">
                                    <ListboxItemText>Carrot</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="broccoli">
                                    <ListboxItemText>Broccoli</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="spinach">
                                    <ListboxItemText>Spinach</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                            </ListboxGroup>
                            <ListboxSeparator />
                            <ListboxGroup>
                                <ListboxLabel>Grains</ListboxLabel>
                                <ListboxItem value="rice">
                                    <ListboxItemText>Rice</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="quinoa">
                                    <ListboxItemText>Quinoa</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="oats">
                                    <ListboxItemText>Oats</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                            </ListboxGroup>
                        </Listbox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Disabled Items</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox defaultValue="available1" className="w-64">
                            <ListboxItem value="available1">
                                <ListboxItemText>Available Option</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="unavailable1" disabled>
                                <ListboxItemText>Unavailable (Disabled)</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="available2">
                                <ListboxItemText>Another Available</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="unavailable2" disabled>
                                <ListboxItemText>Also Unavailable</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="available3">
                                <ListboxItemText>Third Available</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">Disabled Listbox</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox disabled defaultValue="option1" className="w-64">
                            <ListboxItem value="option1">
                                <ListboxItemText>Option 1</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="option2">
                                <ListboxItemText>Option 2</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                            <ListboxItem value="option3">
                                <ListboxItemText>Option 3</ListboxItemText>
                                <ListboxItemIndicator />
                            </ListboxItem>
                        </Listbox>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-write">With Scroll Buttons</h3>
                    <div className="flex flex-wrap items-start gap-6">
                        <Listbox defaultValue="item5" className="w-64 max-h-48">
                            <ListboxScrollUpButton />
                            <ListboxViewport>
                                <ListboxItem value="item1">
                                    <ListboxItemText>Item 1</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item2">
                                    <ListboxItemText>Item 2</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item3">
                                    <ListboxItemText>Item 3</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item4">
                                    <ListboxItemText>Item 4</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item5">
                                    <ListboxItemText>Item 5</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item6">
                                    <ListboxItemText>Item 6</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item7">
                                    <ListboxItemText>Item 7</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item8">
                                    <ListboxItemText>Item 8</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item9">
                                    <ListboxItemText>Item 9</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item10">
                                    <ListboxItemText>Item 10</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item11">
                                    <ListboxItemText>Item 11</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item12">
                                    <ListboxItemText>Item 12</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item13">
                                    <ListboxItemText>Item 13</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item14">
                                    <ListboxItemText>Item 14</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                                <ListboxItem value="item15">
                                    <ListboxItemText>Item 15</ListboxItemText>
                                    <ListboxItemIndicator />
                                </ListboxItem>
                            </ListboxViewport>
                            <ListboxScrollDownButton />
                        </Listbox>
                    </div>
                </div>
            </div>
        </section>
    );
}
