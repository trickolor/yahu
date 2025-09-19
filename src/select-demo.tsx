import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectContentView,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectGroup,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './ui/select';

const SelectDemo = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    alert('Form submitted with data: ' + JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Accessible Select Component Demo</h1>
      
      <div className="space-y-2">
        <label id="fruit-label" className="block text-sm font-medium">
          Choose your favorite fruit:
        </label>
        
        <Select placeholder="Select a fruit..." defaultValue="mango">
          <SelectTrigger aria-labelledby="fruit-label" className="w-48">
            <SelectValue />
          </SelectTrigger>
          
          <SelectContent>
            <SelectScrollUpButton />
            <SelectContentView className="max-h-48">
              <SelectGroup>
                <SelectLabel>Citrus</SelectLabel>
                <SelectItem value="orange">
                  <SelectItemText>Orange</SelectItemText>
                </SelectItem>
                <SelectItem value="lemon">
                  <SelectItemText>Lemon</SelectItemText>
                </SelectItem>
                <SelectItem value="lime">
                  <SelectItemText>Lime</SelectItemText>
                </SelectItem>
                <SelectItem value="grapefruit">
                  <SelectItemText>Grapefruit</SelectItemText>
                </SelectItem>
              </SelectGroup>
              
              <SelectGroup>
                <SelectLabel>Tropical</SelectLabel>
                <SelectItem value="mango">
                  <SelectItemText>Mango</SelectItemText>
                </SelectItem>
                <SelectItem value="pineapple">
                  <SelectItemText>Pineapple</SelectItemText>
                </SelectItem>
                <SelectItem value="coconut">
                  <SelectItemText>Coconut</SelectItemText>
                </SelectItem>
                <SelectItem value="papaya">
                  <SelectItemText>Papaya</SelectItemText>
                </SelectItem>
                <SelectItem value="dragonfruit">
                  <SelectItemText>Dragon Fruit</SelectItemText>
                </SelectItem>
                <SelectItem value="passionfruit">
                  <SelectItemText>Passion Fruit</SelectItemText>
                </SelectItem>
              </SelectGroup>
              
              <SelectGroup>
                <SelectLabel>Berries</SelectLabel>
                <SelectItem value="strawberry">
                  <SelectItemText>Strawberry</SelectItemText>
                </SelectItem>
                <SelectItem value="blueberry">
                  <SelectItemText>Blueberry</SelectItemText>
                </SelectItem>
                <SelectItem value="raspberry">
                  <SelectItemText>Raspberry</SelectItemText>
                </SelectItem>
                <SelectItem value="blackberry">
                  <SelectItemText>Blackberry</SelectItemText>
                </SelectItem>
                <SelectItem value="cranberry">
                  <SelectItemText>Cranberry</SelectItemText>
                </SelectItem>
              </SelectGroup>
              
              <SelectGroup>
                <SelectLabel>Stone Fruits</SelectLabel>
                <SelectItem value="peach">
                  <SelectItemText>Peach</SelectItemText>
                </SelectItem>
                <SelectItem value="plum">
                  <SelectItemText>Plum</SelectItemText>
                </SelectItem>
                <SelectItem value="apricot">
                  <SelectItemText>Apricot</SelectItemText>
                </SelectItem>
                <SelectItem value="cherry">
                  <SelectItemText>Cherry</SelectItemText>
                </SelectItem>
              </SelectGroup>
            </SelectContentView>
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label id="color-label" className="block text-sm font-medium">
          Test centering (last item selected):
        </label>
        
        <Select placeholder="Select a color..." defaultValue="purple">
          <SelectTrigger aria-labelledby="color-label" className="w-48">
            <SelectValue />
          </SelectTrigger>
          
          <SelectContent>
            <SelectScrollUpButton />
            <SelectContentView className="max-h-48">
              <SelectItem value="red">
                <SelectItemText>Red</SelectItemText>
              </SelectItem>
              <SelectItem value="orange">
                <SelectItemText>Orange</SelectItemText>
              </SelectItem>
              <SelectItem value="yellow">
                <SelectItemText>Yellow</SelectItemText>
              </SelectItem>
              <SelectItem value="green">
                <SelectItemText>Green</SelectItemText>
              </SelectItem>
              <SelectItem value="blue">
                <SelectItemText>Blue</SelectItemText>
              </SelectItem>
              <SelectItem value="indigo">
                <SelectItemText>Indigo</SelectItemText>
              </SelectItem>
              <SelectItem value="purple">
                <SelectItemText>Purple (Selected - should center when opened)</SelectItemText>
              </SelectItem>
            </SelectContentView>
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-8 p-4 border border-gray-300 rounded">
        <h2 className="text-lg font-semibold mb-4">Form Integration Demo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fruit-form" className="block text-sm font-medium">
              Favorite Fruit (Required):
            </label>
            <Select name="fruit" required defaultValue="apple">
              <SelectTrigger id="fruit-form" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectContentView>
                  <SelectItem value="apple">
                    <SelectItemText>Apple</SelectItemText>
                  </SelectItem>
                  <SelectItem value="banana">
                    <SelectItemText>Banana</SelectItemText>
                  </SelectItem>
                  <SelectItem value="orange">
                    <SelectItemText>Orange</SelectItemText>
                  </SelectItem>
                </SelectContentView>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="color-form" className="block text-sm font-medium">
              Favorite Color (Optional):
            </label>
            <Select name="color" placeholder="Choose a color...">
              <SelectTrigger id="color-form" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectContentView>
                  <SelectItem value="red">
                    <SelectItemText>Red</SelectItemText>
                  </SelectItem>
                  <SelectItem value="blue">
                    <SelectItemText>Blue</SelectItemText>
                  </SelectItem>
                  <SelectItem value="green">
                    <SelectItemText>Green</SelectItemText>
                  </SelectItem>
                </SelectContentView>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="disabled-select" className="block text-sm font-medium">
              Disabled Select:
            </label>
            <Select name="disabled" disabled defaultValue="disabled-value">
              <SelectTrigger id="disabled-select" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectContentView>
                  <SelectItem value="disabled-value">
                    <SelectItemText>This is disabled</SelectItemText>
                  </SelectItem>
                </SelectContentView>
              </SelectContent>
            </Select>
          </div>
          
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit Form
          </button>
        </form>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Accessibility Features:</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Proper ARIA roles (combobox, listbox, option)</li>
          <li>✅ aria-expanded state management</li>
          <li>✅ aria-activedescendant for virtual focus</li>
          <li>✅ aria-selected for highlighted items</li>
          <li>✅ aria-labelledby for semantic relationships</li>
          <li>✅ Keyboard navigation (Arrow keys, Enter, Escape, Home, End)</li>
          <li>✅ Typeahead search support</li>
          <li>✅ Focus restoration after closing</li>
          <li>✅ Screen reader announcements</li>
          <li>✅ Scroll buttons with proper ARIA labels</li>
          <li>✅ Smooth scrolling to container edges</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Keyboard Instructions:</h2>
        <ul className="text-sm space-y-1">
          <li><strong>Space/Enter/↓:</strong> Open listbox (focuses selected item if any)</li>
          <li><strong>↑/↓:</strong> Navigate options (when open)</li>
          <li><strong>Home/End:</strong> First/last option</li>
          <li><strong>Enter/Space:</strong> Select option and close</li>
          <li><strong>Escape:</strong> Close without selecting</li>
          <li><strong>Type letters:</strong> Jump to matching options</li>
        </ul>
        
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
          <strong>Try it:</strong> The demo has "Mango" pre-selected. When you open the select, 
          it will automatically focus on the Mango option, following WAI-ARIA guidelines.
        </div>
      </div>
    </div>
  );
};

export default SelectDemo;