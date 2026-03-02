import { Switch, SwitchThumb } from "../ui/switch";

export interface SwitchDemoProps {
    quantity: number;
    setQuantity: (value: number) => void;
}

export function SwitchDemo({ quantity, setQuantity }: SwitchDemoProps) {
    return (
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
    );
}
