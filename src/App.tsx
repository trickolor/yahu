import { useState } from "react";
import { Button } from "./ui/button";
import { ButtonDemo } from "./demos/button-demo";
import { ButtonGroupDemo } from "./demos/button-group-demo";
import { InputDemo } from "./demos/input-demo";
import { TextareaDemo } from "./demos/textarea-demo";
import { NumericFieldDemo } from "./demos/numeric-field-demo";
import { PasswordFieldDemo } from "./demos/password-field-demo";
import { SearchFieldDemo } from "./demos/search-field-demo";
import { OTPFieldDemo } from "./demos/otp-field-demo";
import { MaskedInputDemo } from "./demos/masked-input-demo";
import { CheckboxDemo } from "./demos/checkbox-demo";
import { RadioGroupDemo } from "./demos/radio-group-demo";
import { SwitchDemo } from "./demos/switch-demo";
import { ToggleDemo } from "./demos/toggle-demo";
import { ToggleGroupDemo } from "./demos/toggle-group-demo";
import { SelectDemo } from "./demos/select-demo";
import { MultiSelectDemo } from "./demos/multi-select-demo";
import { ComboboxDemo } from "./demos/combobox-demo";
import { AutocompleteDemo } from "./demos/autocomplete-demo";
import { ListboxDemo } from "./demos/listbox-demo";
import { Calendar, CalendarPreviousButton, CalendarHeading, CalendarNextButton, CalendarYear, CalendarMonth, CalendarGrid, CalendarGridHeader, CalendarGridHeaderCell, CalendarGridBodyCell, CalendarGridBody, CalendarYearSelect, CalendarMonthSelect } from "./ui/calendar";

function App() {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(99.99);
    const [selectedFruits, setSelectedFruits] = useState<string[]>(["apple"]);

    const themeToggle = () => {
        document.documentElement.setAttribute('data-mode', document.documentElement.getAttribute('data-mode') === 'light' ? 'dark' : 'light');
    }

    return (
        <main className="w-full pt-24 pb-64 min-h-screen space-y-16 relative">
            <Button className="fixed top-6 right-6 z-50" onClick={themeToggle}>
                Change Theme
            </Button>

            <ButtonDemo />
            <ButtonGroupDemo />
            <InputDemo />
            <TextareaDemo />
            <NumericFieldDemo quantity={quantity} setQuantity={setQuantity} price={price} setPrice={setPrice} />
            <PasswordFieldDemo />
            <SearchFieldDemo />
            <OTPFieldDemo />
            <MaskedInputDemo />
            <CheckboxDemo />
            <RadioGroupDemo quantity={quantity} setQuantity={setQuantity} />
            <SwitchDemo quantity={quantity} setQuantity={setQuantity} />
            <ToggleDemo quantity={quantity} setQuantity={setQuantity} />
            <ToggleGroupDemo quantity={quantity} setQuantity={setQuantity} />
            <SelectDemo quantity={quantity} setQuantity={setQuantity} />
            <MultiSelectDemo selectedFruits={selectedFruits} setSelectedFruits={setSelectedFruits} />
            <ComboboxDemo />
            <AutocompleteDemo />
            <ListboxDemo />

            <div className="w-full p-12">

                <Calendar>
                    <CalendarHeading>
                        <CalendarPreviousButton />
                       
                        <CalendarYearSelect />
                        <CalendarMonthSelect />
                       
                        <CalendarNextButton />
                    </CalendarHeading>

                    <CalendarGrid>
                        <CalendarGridHeader>
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <CalendarGridHeaderCell key={day}>
                                    {day}
                                </CalendarGridHeaderCell>
                            ))}
                        </CalendarGridHeader>

                        <CalendarGridBody>
                            {Array.from({ length: 31 }).map((_, index) => (
                                <CalendarGridBodyCell key={index}>
                                    {index + 1}
                                </CalendarGridBodyCell>
                            ))}
                        </CalendarGridBody>
                    </CalendarGrid>
                </Calendar>
            </div>
        </main>
    )
}

export default App;
