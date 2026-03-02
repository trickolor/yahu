import { PasswordField, PasswordFieldInput, PasswordFieldToggle, PasswordFieldToggleIndicator } from "../ui/password-field";

export function PasswordFieldDemo() {
    return (
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
    );
}
