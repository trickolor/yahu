import { SearchField, SearchFieldInput, SearchFieldIndicator, SearchFieldClear, SearchFieldClearIndicator } from "../ui/search-field";

export function SearchFieldDemo() {
    return (
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
    );
}
