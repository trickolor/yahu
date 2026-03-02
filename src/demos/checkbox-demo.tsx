import { Checkbox, CheckboxIndicator, CheckboxGroup } from "../ui/checkbox";

export function CheckboxDemo() {
    return (
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
    );
}
