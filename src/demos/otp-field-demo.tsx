import { OTPField, OTPFieldInput, OTPFieldGroup, OTPFieldSeparator } from "../ui/otp-field";

export function OTPFieldDemo() {
    return (
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
    );
}
