# Comprehensive UI Components Reference

A complete catalog of UI components for React/Vue applications with implementation references and complexity ratings.

## Complexity Levels

| Level | Description |
|-------|-------------|
| ⬜ **Trivial** | Static display, no state, minimal props |
| 🟩 **Easy** | Simple state, basic event handlers |
| 🟨 **Medium** | Multiple states, controlled/uncontrolled modes, some accessibility |
| 🟧 **Complex** | Compound components, context, keyboard navigation, ARIA |
| 🟥 **Advanced** | Multi-context, virtualization, complex state machines, full a11y |

---

## 1. Form Controls

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Button | Triggers actions on click. Primary interaction element | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/button) | 🟩 Easy |
| Icon Button | Button with icon only, requires accessible label | [Chakra UI](https://chakra-ui.com/docs/components/icon-button) | 🟩 Easy |
| Toggle Button | Button with on/off pressed state | [React Aria](https://react-spectrum.adobe.com/react-aria/ToggleButton.html) | 🟨 Medium |
| Button Group | Groups related buttons with shared styling/state | [MUI](https://mui.com/material-ui/react-button-group/) | 🟨 Medium |
| Split Button | Button with primary action + dropdown for secondary actions | [PrimeReact](https://primereact.org/splitbutton/) | 🟧 Complex |
| Floating Action Button | Circular button for primary screen action (Material Design) | [MUI](https://mui.com/material-ui/react-floating-action-button/) | 🟩 Easy |
| Input / Text Field | Single-line text entry with label, validation, states | [React Aria](https://react-spectrum.adobe.com/react-aria/TextField.html) | 🟨 Medium |
| Textarea | Multi-line text entry, auto-resize optional | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/text-area) | 🟨 Medium |
| Number Input | Numeric entry with increment/decrement, min/max/step | [React Aria](https://react-spectrum.adobe.com/react-aria/NumberField.html) | 🟧 Complex |
| Password Input | Text field with visibility toggle, strength indicator | [Chakra UI](https://chakra-ui.com/docs/components/password-input) | 🟨 Medium |
| Search Input | Text field with search icon, clear button, suggestions | [React Aria](https://react-spectrum.adobe.com/react-aria/SearchField.html) | 🟨 Medium |
| OTP Input / PIN Input | Segmented input for verification codes | [Input OTP](https://input-otp.rodz.dev/) | 🟧 Complex |
| Masked Input | Input with format enforcement (phone, date, etc.) | [react-input-mask](https://github.com/sanniassin/react-input-mask) | 🟧 Complex |
| Checkbox | Boolean toggle with checked/unchecked/indeterminate states | [React Aria](https://react-spectrum.adobe.com/react-aria/Checkbox.html) | 🟨 Medium |
| Checkbox Group | Multiple related checkboxes with group management | [React Aria](https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html) | 🟧 Complex |
| Indeterminate Checkbox | Tri-state checkbox for partial selection (parent of group) | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/checkbox) | 🟨 Medium |
| Radio Button | Single selection from mutually exclusive options | [React Aria](https://react-spectrum.adobe.com/react-aria/Radio.html) | 🟨 Medium |
| Radio Group | Container managing radio button selection state | [React Aria](https://react-spectrum.adobe.com/react-aria/RadioGroup.html) | 🟧 Complex |
| Switch / Toggle | Binary on/off control, immediate effect | [React Aria](https://react-spectrum.adobe.com/react-aria/Switch.html) | 🟨 Medium |
| Select / Dropdown | Single selection from dropdown list | [React Aria](https://react-spectrum.adobe.com/react-aria/Select.html) | 🟧 Complex |
| Multi-Select | Multiple selection from dropdown with tags | [React Select](https://react-select.com/) | 🟥 Advanced |
| Combobox / Autocomplete | Text input with filtered suggestions dropdown | [React Aria](https://react-spectrum.adobe.com/react-aria/ComboBox.html) | 🟥 Advanced |
| Listbox | Keyboard-navigable selection list (single or multi) | [React Aria](https://react-spectrum.adobe.com/react-aria/ListBox.html) | 🟧 Complex |
| Date Picker | Calendar-based date selection with input field | [React Aria](https://react-spectrum.adobe.com/react-aria/DatePicker.html) | 🟥 Advanced |
| Date Range Picker | Select start and end dates | [React Aria](https://react-spectrum.adobe.com/react-aria/DateRangePicker.html) | 🟥 Advanced |
| Time Picker | Hour/minute/second selection with AM/PM | [React Aria](https://react-spectrum.adobe.com/react-aria/TimeField.html) | 🟧 Complex |
| DateTime Picker | Combined date and time selection | [MUI](https://mui.com/x/react-date-pickers/date-time-picker/) | 🟥 Advanced |
| Calendar | Full calendar grid for date display/selection | [React Aria](https://react-spectrum.adobe.com/react-aria/Calendar.html) | 🟥 Advanced |
| Range Calendar | Calendar supporting date range selection | [React Aria](https://react-spectrum.adobe.com/react-aria/RangeCalendar.html) | 🟥 Advanced |
| Color Picker | Visual color selection with various input modes | [React Aria](https://react-spectrum.adobe.com/react-aria/ColorPicker.html) | 🟥 Advanced |
| Color Swatch | Display color sample, clickable for selection | [React Aria](https://react-spectrum.adobe.com/react-aria/ColorSwatch.html) | 🟩 Easy |
| Color Area | 2D gradient area for saturation/lightness selection | [React Aria](https://react-spectrum.adobe.com/react-aria/ColorArea.html) | 🟧 Complex |
| Color Slider | Single-axis color channel adjustment | [React Aria](https://react-spectrum.adobe.com/react-aria/ColorSlider.html) | 🟧 Complex |
| Color Wheel | Circular hue selection control | [React Aria](https://react-spectrum.adobe.com/react-aria/ColorWheel.html) | 🟧 Complex |
| Slider | Single value selection along a range | [React Aria](https://react-spectrum.adobe.com/react-aria/Slider.html) | 🟧 Complex |
| Range Slider | Two-thumb slider for selecting value range | [React Aria](https://react-spectrum.adobe.com/react-aria/Slider.html) | 🟥 Advanced |
| Rating / Star Rating | Score input using icons (stars, hearts, etc.) | [Chakra UI](https://chakra-ui.com/docs/components/rating) | 🟨 Medium |
| File Input | Native file selection with styled wrapper | [Chakra UI](https://chakra-ui.com/docs/components/file-upload) | 🟨 Medium |
| Dropzone | Drag-and-drop file upload area | [react-dropzone](https://react-dropzone.js.org/) | 🟧 Complex |
| Signature Pad | Canvas-based signature capture | [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) | 🟧 Complex |
| Rich Text Editor | WYSIWYG content editing with formatting toolbar | [TipTap](https://tiptap.dev/) | 🟥 Advanced |
| Code Editor | Syntax-highlighted code editing | [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 🟥 Advanced |
| Markdown Editor | Markdown authoring with preview | [MDXEditor](https://mdxeditor.dev/) | 🟥 Advanced |
| Form | Form wrapper with validation and submission handling | [React Hook Form](https://react-hook-form.com/) | 🟧 Complex |
| Fieldset | Groups related form controls with legend | Native HTML | 🟩 Easy |
| Label | Accessible text label linked to form control | [React Aria](https://react-spectrum.adobe.com/react-aria/Label.html) | ⬜ Trivial |
| Field Description | Helper text explaining field purpose/format | [React Aria](https://react-spectrum.adobe.com/react-aria/TextField.html) | ⬜ Trivial |
| Field Error Message | Validation error display for form fields | [React Aria](https://react-spectrum.adobe.com/react-aria/TextField.html) | 🟩 Easy |
| Input Group / Addon | Input with prefix/suffix elements (icons, text, buttons) | [Chakra UI](https://chakra-ui.com/docs/components/input-group) | 🟨 Medium |
| Tag Input / Chips Input | Multi-value input displaying values as removable tags | [Mantine](https://mantine.dev/core/tags-input/) | 🟧 Complex |

---

## 2. Navigation

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Link | Navigation anchor with accessible properties | [React Aria](https://react-spectrum.adobe.com/react-aria/Link.html) | 🟩 Easy |
| Nav Link | Link with active state for current route | [React Router](https://reactrouter.com/en/main/components/nav-link) | 🟨 Medium |
| Navigation Menu | Site navigation with dropdowns and mega menus | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/navigation-menu) | 🟥 Advanced |
| Menubar | Horizontal menu bar with dropdown menus (app-style) | [React Aria](https://react-spectrum.adobe.com/react-aria/Menu.html) | 🟥 Advanced |
| Dropdown Menu | Overlay menu triggered by button | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) | 🟧 Complex |
| Context Menu | Right-click triggered menu | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/context-menu) | 🟧 Complex |
| Mega Menu | Large dropdown with multiple columns/sections | Custom (extend Navigation Menu) | 🟥 Advanced |
| Sidebar / Drawer Nav | Collapsible side navigation panel | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) | 🟧 Complex |
| Breadcrumb | Hierarchical navigation showing current location | [React Aria](https://react-spectrum.adobe.com/react-aria/Breadcrumbs.html) | 🟨 Medium |
| Breadcrumb Item | Individual segment in breadcrumb trail | [React Aria](https://react-spectrum.adobe.com/react-aria/Breadcrumbs.html) | 🟩 Easy |
| Pagination | Page navigation for paginated content | [React Aria](https://react-spectrum.adobe.com/react-aria/usePagination.html) | 🟧 Complex |
| Load More | Button/trigger for loading additional content | Custom | 🟩 Easy |
| Tabs | Tabbed interface for switching content panels | [React Aria](https://react-spectrum.adobe.com/react-aria/Tabs.html) | 🟧 Complex |
| Vertical Tabs | Tabs arranged vertically alongside content | [React Aria](https://react-spectrum.adobe.com/react-aria/Tabs.html) | 🟧 Complex |
| Scrollable Tabs | Horizontally scrolling tab list for many tabs | [MUI](https://mui.com/material-ui/react-tabs/) | 🟧 Complex |
| Tab Panel | Content container associated with a tab | [React Aria](https://react-spectrum.adobe.com/react-aria/Tabs.html) | 🟩 Easy |
| Stepper / Wizard | Multi-step process navigation | [Chakra UI](https://chakra-ui.com/docs/components/steps) | 🟧 Complex |
| Tree View | Hierarchical expandable/collapsible list | [React Aria](https://react-spectrum.adobe.com/react-aria/Tree.html) | 🟥 Advanced |
| Tree Item | Node within tree view hierarchy | [React Aria](https://react-spectrum.adobe.com/react-aria/Tree.html) | 🟨 Medium |
| Accordion | Expandable/collapsible content sections | [React Aria](https://react-spectrum.adobe.com/react-aria/Disclosure.html) | 🟧 Complex |
| Accordion Item | Single panel within accordion | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/accordion) | 🟨 Medium |
| Disclosure / Collapsible | Single show/hide content toggle | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/collapsible) | 🟨 Medium |
| Anchor Navigation | Jump links to page sections | Custom | 🟨 Medium |
| Skip Link | Keyboard navigation to skip to main content | Custom (accessibility pattern) | 🟩 Easy |
| Back to Top | Button to scroll to page top | Custom | 🟩 Easy |
| Command Palette | Keyboard-driven command search and execution | [cmdk](https://cmdk.paco.me/) | 🟥 Advanced |
| Dock / Taskbar | macOS-style icon dock with magnification | Custom | 🟧 Complex |

---

## 3. Layout & Containers

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Box | Generic container with style props | [Chakra UI](https://chakra-ui.com/docs/components/box) | ⬜ Trivial |
| Container | Centered max-width content wrapper | [Chakra UI](https://chakra-ui.com/docs/components/container) | ⬜ Trivial |
| Flex | Flexbox container with gap and alignment | [Chakra UI](https://chakra-ui.com/docs/components/flex) | ⬜ Trivial |
| Grid | CSS Grid container with template props | [Chakra UI](https://chakra-ui.com/docs/components/grid) | 🟩 Easy |
| Stack | Vertical arrangement with consistent spacing | [Chakra UI](https://chakra-ui.com/docs/components/stack) | ⬜ Trivial |
| HStack | Horizontal stack layout | [Chakra UI](https://chakra-ui.com/docs/components/stack) | ⬜ Trivial |
| VStack | Vertical stack layout | [Chakra UI](https://chakra-ui.com/docs/components/stack) | ⬜ Trivial |
| Wrap | Flex container with wrapping items | [Chakra UI](https://chakra-ui.com/docs/components/wrap) | ⬜ Trivial |
| Center | Centers child both horizontally and vertically | [Chakra UI](https://chakra-ui.com/docs/components/center) | ⬜ Trivial |
| Spacer | Flexible space that expands to fill gap | [Chakra UI](https://chakra-ui.com/docs/components/spacer) | ⬜ Trivial |
| Divider / Separator | Visual line separator between content | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/separator) | ⬜ Trivial |
| Aspect Ratio Box | Maintains fixed aspect ratio for content | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/aspect-ratio) | 🟩 Easy |
| Card | Contained surface for grouped content | [shadcn/ui](https://ui.shadcn.com/docs/components/card) | 🟩 Easy |
| Card Header | Title/subtitle section of card | [shadcn/ui](https://ui.shadcn.com/docs/components/card) | ⬜ Trivial |
| Card Body / Content | Main content area of card | [shadcn/ui](https://ui.shadcn.com/docs/components/card) | ⬜ Trivial |
| Card Footer | Actions/metadata section of card | [shadcn/ui](https://ui.shadcn.com/docs/components/card) | ⬜ Trivial |
| Card Media / Image | Image or media section of card | [MUI](https://mui.com/material-ui/react-card/) | ⬜ Trivial |
| Panel | Bordered/elevated content container | Custom | 🟩 Easy |
| Section | Semantic content grouping with heading | Native HTML | ⬜ Trivial |
| Article | Self-contained content block | Native HTML | ⬜ Trivial |
| Header | Page or section header landmark | Native HTML | ⬜ Trivial |
| Footer | Page or section footer landmark | Native HTML | ⬜ Trivial |
| Main | Primary content landmark | Native HTML | ⬜ Trivial |
| Aside | Sidebar/complementary content landmark | Native HTML | ⬜ Trivial |
| Figure | Self-contained content with caption | Native HTML | ⬜ Trivial |
| Resizable Panel | Panel with drag-to-resize handles | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | 🟧 Complex |
| Split Pane | Two panels with adjustable divider | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | 🟧 Complex |
| Scroll Area | Custom scrollbar styling container | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/scroll-area) | 🟨 Medium |
| Virtual Scroll | Virtualized list for large datasets | [TanStack Virtual](https://tanstack.com/virtual/latest) | 🟥 Advanced |
| Infinite Scroll | Auto-loading content on scroll | [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) | 🟨 Medium |
| Masonry Layout | Pinterest-style variable-height grid | [react-masonry-css](https://github.com/paulcollett/react-masonry-css) | 🟨 Medium |
| Bento Grid | Asymmetric card grid layout | Custom | 🟨 Medium |

---

## 4. Overlay & Modals

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Modal / Dialog | Overlay window requiring user interaction | [React Aria](https://react-spectrum.adobe.com/react-aria/Dialog.html) | 🟧 Complex |
| Alert Dialog | Confirmation dialog for destructive actions | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/alert-dialog) | 🟧 Complex |
| Drawer / Sheet | Slide-in panel from screen edge | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) | 🟧 Complex |
| Sheet | Bottom or side sheet overlay | [shadcn/ui](https://ui.shadcn.com/docs/components/sheet) | 🟧 Complex |
| Popover | Non-modal floating content triggered by element | [React Aria](https://react-spectrum.adobe.com/react-aria/Popover.html) | 🟧 Complex |
| Tooltip | Brief hint on hover/focus | [React Aria](https://react-spectrum.adobe.com/react-aria/Tooltip.html) | 🟨 Medium |
| Hover Card | Rich preview content on hover | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/hover-card) | 🟧 Complex |
| Dropdown | Generic positioned dropdown container | [React Aria](https://react-spectrum.adobe.com/react-aria/Popover.html) | 🟨 Medium |
| Context Menu | Right-click menu for contextual actions | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/context-menu) | 🟧 Complex |
| Lightbox | Full-screen image/media viewer | [yet-another-react-lightbox](https://yet-another-react-lightbox.com/) | 🟧 Complex |
| Image Viewer | Zoomable/pannable image display | [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch) | 🟧 Complex |
| Overlay / Backdrop | Semi-transparent background behind modals | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dialog) | 🟩 Easy |
| Focus Trap | Constrains focus within container | [React Aria](https://react-spectrum.adobe.com/react-aria/FocusScope.html) | 🟨 Medium |
| Portal | Renders children outside DOM hierarchy | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/portal) | 🟩 Easy |

---

## 5. Feedback & Status

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Alert | Static inline message for important info | [Chakra UI](https://chakra-ui.com/docs/components/alert) | 🟩 Easy |
| Toast / Snackbar | Temporary notification message | [Sonner](https://sonner.emilkowal.ski/) | 🟧 Complex |
| Toast Container | Manages toast positioning and queue | [Sonner](https://sonner.emilkowal.ski/) | 🟧 Complex |
| Progress Bar | Linear progress indicator | [React Aria](https://react-spectrum.adobe.com/react-aria/ProgressBar.html) | 🟨 Medium |
| Circular Progress | Radial progress indicator | [Chakra UI](https://chakra-ui.com/docs/components/progress-circle) | 🟨 Medium |
| Linear Progress | Horizontal progress bar | [React Aria](https://react-spectrum.adobe.com/react-aria/ProgressBar.html) | 🟨 Medium |
| Indeterminate Progress | Unknown duration loading indicator | [Chakra UI](https://chakra-ui.com/docs/components/progress) | 🟨 Medium |
| Spinner | Circular loading animation | [Chakra UI](https://chakra-ui.com/docs/components/spinner) | 🟩 Easy |
| Skeleton | Placeholder loading state for content | [Chakra UI](https://chakra-ui.com/docs/components/skeleton) | 🟩 Easy |
| Placeholder | Generic content placeholder | Custom | ⬜ Trivial |
| Shimmer Effect | Animated loading shine effect | Custom CSS | 🟩 Easy |
| Empty State | No-data illustration with call to action | Custom | 🟩 Easy |
| Error State | Error display with recovery options | Custom | 🟩 Easy |
| Success State | Success confirmation display | Custom | 🟩 Easy |
| Banner | Full-width announcement or alert | Custom | 🟩 Easy |
| Callout | Highlighted information block | [shadcn/ui](https://ui.shadcn.com/docs/components/alert) | 🟩 Easy |
| Inline Message | Contextual message within content | Custom | 🟩 Easy |
| Status Indicator | Color dot showing state (online/offline) | [Chakra UI](https://chakra-ui.com/docs/components/status) | ⬜ Trivial |
| Meter | Visual representation of value in known range | [React Aria](https://react-spectrum.adobe.com/react-aria/Meter.html) | 🟨 Medium |
| Countdown | Time remaining display with animation | Custom | 🟨 Medium |
| Confetti | Celebratory animation effect | [canvas-confetti](https://github.com/catdad/canvas-confetti) | 🟨 Medium |

---

## 6. Data Display

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Typography / Text | Styled text with variants | [Chakra UI](https://chakra-ui.com/docs/components/text) | ⬜ Trivial |
| Heading | h1-h6 semantic headings | [Chakra UI](https://chakra-ui.com/docs/components/heading) | ⬜ Trivial |
| Paragraph | Block text element | Native HTML | ⬜ Trivial |
| Blockquote | Quoted text with citation | Native HTML + styling | ⬜ Trivial |
| Code / Inline Code | Monospace code snippet | [Chakra UI](https://chakra-ui.com/docs/components/code) | ⬜ Trivial |
| Code Block | Multi-line syntax-highlighted code | [Prism React Renderer](https://github.com/FormidableLabs/prism-react-renderer) | 🟨 Medium |
| Pre | Preformatted text container | Native HTML | ⬜ Trivial |
| Kbd | Keyboard key display | [Chakra UI](https://chakra-ui.com/docs/components/kbd) | ⬜ Trivial |
| Mark / Highlight | Highlighted text span | Native HTML | ⬜ Trivial |
| Abbr | Abbreviation with tooltip | Native HTML + Tooltip | 🟩 Easy |
| List (Ordered) | Numbered list | [Chakra UI](https://chakra-ui.com/docs/components/list) | ⬜ Trivial |
| List (Unordered) | Bulleted list | [Chakra UI](https://chakra-ui.com/docs/components/list) | ⬜ Trivial |
| Description List | Term/definition pairs | Native HTML | ⬜ Trivial |
| Badge | Small status/count indicator | [Chakra UI](https://chakra-ui.com/docs/components/badge) | ⬜ Trivial |
| Tag / Chip | Labeled categorization element | [Chakra UI](https://chakra-ui.com/docs/components/tag) | 🟩 Easy |
| Stat | Single metric with label | [Chakra UI](https://chakra-ui.com/docs/components/stat) | 🟩 Easy |
| Stat Group | Multiple stats in row | [Chakra UI](https://chakra-ui.com/docs/components/stat) | 🟩 Easy |
| Metric Card | Card displaying KPI with trend | Custom | 🟨 Medium |
| KPI Card | Key performance indicator display | Custom | 🟨 Medium |
| Avatar | User profile image with fallback | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/avatar) | 🟨 Medium |
| Avatar Group | Stacked/overlapping avatar row | [Chakra UI](https://chakra-ui.com/docs/components/avatar) | 🟨 Medium |
| Avatar Fallback | Initials/icon when image unavailable | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/avatar) | 🟩 Easy |
| User Card | Profile summary card | Custom | 🟨 Medium |
| Icon | SVG icon wrapper with sizing | [Lucide React](https://lucide.dev/) | ⬜ Trivial |
| Image | Optimized image with loading states | [Next.js Image](https://nextjs.org/docs/pages/api-reference/components/image) | 🟨 Medium |
| Responsive Image | Srcset-based responsive image | Native HTML picture | 🟩 Easy |
| Picture | Art direction responsive images | Native HTML | 🟩 Easy |
| Figure with Caption | Image with figcaption | Native HTML | ⬜ Trivial |
| Gallery | Image grid with lightbox | Custom | 🟧 Complex |
| Carousel / Slider | Swipeable content slideshow | [Embla Carousel](https://www.embla-carousel.com/) | 🟧 Complex |
| Thumbnail | Small preview image | Custom | ⬜ Trivial |
| Video Player | Custom video controls | [React Player](https://github.com/cookpete/react-player) | 🟧 Complex |
| Audio Player | Custom audio playback controls | [react-h5-audio-player](https://github.com/lhz516/react-h5-audio-player) | 🟧 Complex |
| Media Object | Image + text side-by-side pattern | Custom | 🟩 Easy |
| Embed | Responsive iframe wrapper | Custom | 🟩 Easy |
| QR Code | QR code generator/display | [qrcode.react](https://github.com/zpao/qrcode.react) | 🟩 Easy |
| Barcode | Barcode generator | [JsBarcode](https://github.com/lindell/JsBarcode) | 🟩 Easy |
| Timeline | Vertical/horizontal event sequence | Custom | 🟨 Medium |
| Timeline Item | Single event in timeline | Custom | 🟩 Easy |
| Activity Feed | Chronological activity list | Custom | 🟨 Medium |
| Feed Item | Single activity entry | Custom | 🟩 Easy |
| Comment | User comment with avatar/timestamp | Custom | 🟨 Medium |
| Comment Thread | Nested comment replies | Custom | 🟧 Complex |
| Diff Viewer | Side-by-side or inline text diff | [react-diff-viewer](https://github.com/praneshr/react-diff-viewer) | 🟧 Complex |
| JSON Viewer | Collapsible JSON tree display | [react-json-view](https://github.com/mac-s-g/react-json-view) | 🟧 Complex |
| Log Viewer | Streaming log display | Custom | 🟧 Complex |
| Terminal | Terminal emulator display | [xterm.js](https://xtermjs.org/) | 🟥 Advanced |

---

## 7. Data Tables & Grids

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Table | Basic semantic HTML table | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟨 Medium |
| Table Header | Header section with column titles | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟩 Easy |
| Table Body | Main table content rows | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟩 Easy |
| Table Footer | Footer section with totals/pagination | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟩 Easy |
| Table Row | Single table row | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟩 Easy |
| Table Cell | Individual table cell | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | ⬜ Trivial |
| Table Head Cell | Header cell with sort affordance | [React Aria](https://react-spectrum.adobe.com/react-aria/Table.html) | 🟨 Medium |
| Table Caption | Accessible table description | Native HTML | ⬜ Trivial |
| Data Table | Full-featured sortable/filterable table | [TanStack Table](https://tanstack.com/table/latest) | 🟥 Advanced |
| Sortable Headers | Click-to-sort column headers | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Filterable Table | Column or global filtering | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Searchable Table | Global text search across rows | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Paginated Table | Table with page navigation | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Expandable Rows | Rows that expand to show details | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Selectable Rows | Row selection with checkboxes | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Row Actions | Action buttons/menu per row | [TanStack Table](https://tanstack.com/table/latest) | 🟨 Medium |
| Column Resizing | Drag-to-resize columns | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Column Reordering | Drag-to-reorder columns | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Column Visibility | Show/hide columns toggle | [TanStack Table](https://tanstack.com/table/latest) | 🟨 Medium |
| Grouped Rows | Hierarchical row grouping | [TanStack Table](https://tanstack.com/table/latest) | 🟥 Advanced |
| Pinned Columns | Sticky left/right columns | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Pinned Rows | Sticky header/footer rows | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |
| Virtual Table | Virtualized rows for large data | [TanStack Virtual](https://tanstack.com/virtual/latest) | 🟥 Advanced |
| Editable Table | Inline cell editing | [TanStack Table](https://tanstack.com/table/latest) | 🟥 Advanced |
| Spreadsheet Grid | Excel-like editing grid | [AG Grid](https://www.ag-grid.com/) | 🟥 Advanced |
| Pivot Table | Aggregated data with pivoting | [AG Grid](https://www.ag-grid.com/) | 🟥 Advanced |
| Tree Table | Hierarchical row expansion | [TanStack Table](https://tanstack.com/table/latest) | 🟥 Advanced |
| Master-Detail | Row click shows detail panel | [AG Grid](https://www.ag-grid.com/) | 🟥 Advanced |
| Aggregation Row | Summary/totals row | [TanStack Table](https://tanstack.com/table/latest) | 🟧 Complex |

---

## 8. Charts & Data Visualization

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Line Chart | Trend over time/sequence | [Recharts](https://recharts.org/) | 🟨 Medium |
| Area Chart | Filled line chart for volume | [Recharts](https://recharts.org/) | 🟨 Medium |
| Stacked Area | Multiple series area chart | [Recharts](https://recharts.org/) | 🟧 Complex |
| Bar Chart | Categorical comparison | [Recharts](https://recharts.org/) | 🟨 Medium |
| Horizontal Bar | Bars extending horizontally | [Recharts](https://recharts.org/) | 🟨 Medium |
| Stacked Bar | Multiple series stacked bars | [Recharts](https://recharts.org/) | 🟧 Complex |
| Grouped Bar | Side-by-side series bars | [Recharts](https://recharts.org/) | 🟧 Complex |
| Pie Chart | Part-to-whole proportions | [Recharts](https://recharts.org/) | 🟨 Medium |
| Donut Chart | Pie with center cutout | [Recharts](https://recharts.org/) | 🟨 Medium |
| Semi-circle Chart | Half-donut gauge style | Custom (Recharts) | 🟧 Complex |
| Radar Chart | Multi-axis comparison | [Recharts](https://recharts.org/) | 🟧 Complex |
| Polar Chart | Circular coordinate system | [Recharts](https://recharts.org/) | 🟧 Complex |
| Scatter Plot | X/Y coordinate points | [Recharts](https://recharts.org/) | 🟨 Medium |
| Bubble Chart | Scatter with sized points | [Recharts](https://recharts.org/) | 🟧 Complex |
| Candlestick | OHLC financial data | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) | 🟧 Complex |
| OHLC Chart | Open-high-low-close bars | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) | 🟧 Complex |
| Heatmap | Matrix with color intensity | [Nivo](https://nivo.rocks/heatmap/) | 🟧 Complex |
| Treemap | Hierarchical area proportions | [Recharts](https://recharts.org/) | 🟧 Complex |
| Sunburst | Radial hierarchical chart | [Nivo](https://nivo.rocks/sunburst/) | 🟥 Advanced |
| Sankey | Flow between nodes | [Nivo](https://nivo.rocks/sankey/) | 🟥 Advanced |
| Funnel | Stage progression visualization | [Recharts](https://recharts.org/) | 🟧 Complex |
| Gauge | Radial value indicator | Custom | 🟧 Complex |
| Bullet Chart | Bar with target markers | Custom | 🟧 Complex |
| Waterfall | Cumulative effect breakdown | Custom (Recharts) | 🟧 Complex |
| Box Plot | Statistical distribution | [Nivo](https://nivo.rocks/) | 🟧 Complex |
| Histogram | Frequency distribution | Custom (Recharts) | 🟧 Complex |
| Sparkline | Inline mini chart | [Recharts](https://recharts.org/) | 🟨 Medium |
| Mini Chart | Small inline visualization | Custom | 🟨 Medium |
| Gantt Chart | Project timeline/scheduling | [Frappe Gantt](https://frappe.io/gantt) | 🟥 Advanced |
| Network Graph | Node/edge relationship | [React Flow](https://reactflow.dev/) | 🟥 Advanced |
| Org Chart | Organization hierarchy | [React Flow](https://reactflow.dev/) | 🟥 Advanced |
| Flow Chart | Process flowchart | [React Flow](https://reactflow.dev/) | 🟥 Advanced |
| Mind Map | Radial idea mapping | [React Flow](https://reactflow.dev/) | 🟥 Advanced |
| Word Cloud | Tag frequency visualization | [react-wordcloud](https://github.com/chrisrzhou/react-wordcloud) | 🟧 Complex |
| Map | Geographic visualization | [React Leaflet](https://react-leaflet.js.org/) | 🟧 Complex |
| Choropleth | Region-shaded map | [React Simple Maps](https://www.react-simple-maps.io/) | 🟧 Complex |
| Chart Legend | Chart series legend | [Recharts](https://recharts.org/) | 🟩 Easy |
| Chart Tooltip | Hover data display | [Recharts](https://recharts.org/) | 🟨 Medium |
| Chart Axis | X/Y axis configuration | [Recharts](https://recharts.org/) | 🟨 Medium |
| Chart Grid | Background grid lines | [Recharts](https://recharts.org/) | 🟩 Easy |
| Reference Line | Annotation line on chart | [Recharts](https://recharts.org/) | 🟩 Easy |

---

## 9. Drag & Drop

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Draggable | Makes element draggable | [dnd-kit](https://dndkit.com/) | 🟨 Medium |
| Droppable | Drop target zone | [dnd-kit](https://dndkit.com/) | 🟨 Medium |
| Sortable List | Drag-to-reorder list | [dnd-kit](https://dndkit.com/) | 🟧 Complex |
| Sortable Grid | Drag-to-reorder grid | [dnd-kit](https://dndkit.com/) | 🟧 Complex |
| Kanban Board | Multi-column drag between lanes | [dnd-kit](https://dndkit.com/) | 🟥 Advanced |
| Drag Handle | Grip icon for drag initiation | [dnd-kit](https://dndkit.com/) | 🟩 Easy |
| Drag Overlay | Visual feedback during drag | [dnd-kit](https://dndkit.com/) | 🟨 Medium |
| Drag Preview | Ghost image while dragging | [dnd-kit](https://dndkit.com/) | 🟨 Medium |
| Nested DnD | Hierarchical drag and drop | [dnd-kit](https://dndkit.com/) | 🟥 Advanced |
| Multi-container Drag | Move items between containers | [dnd-kit](https://dndkit.com/) | 🟥 Advanced |

---

## 10. Selection & Highlighting

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Selection Area | Marquee/lasso selection | Custom | 🟧 Complex |
| Highlighter | Text highlighting tool | Custom | 🟨 Medium |
| Text Selection | Custom text selection UI | Custom | 🟧 Complex |
| Range Selection | Shift-click range select | Custom | 🟨 Medium |
| Row Selection | Table row selection | [TanStack Table](https://tanstack.com/table/latest) | 🟨 Medium |
| Cell Selection | Spreadsheet cell selection | [AG Grid](https://www.ag-grid.com/) | 🟧 Complex |
| Focus Ring | Visible focus indicator | Custom CSS | 🟩 Easy |

---

## 11. Date & Time

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Calendar Grid | Month view date grid | [React Aria](https://react-spectrum.adobe.com/react-aria/Calendar.html) | 🟧 Complex |
| Month Picker | Month selection dropdown | [React Aria](https://react-spectrum.adobe.com/react-aria/DatePicker.html) | 🟨 Medium |
| Year Picker | Year selection dropdown | [React Aria](https://react-spectrum.adobe.com/react-aria/DatePicker.html) | 🟨 Medium |
| Week Picker | Week selection | Custom | 🟧 Complex |
| Date Field | Segmented date input | [React Aria](https://react-spectrum.adobe.com/react-aria/DateField.html) | 🟧 Complex |
| Time Field | Segmented time input | [React Aria](https://react-spectrum.adobe.com/react-aria/TimeField.html) | 🟧 Complex |
| Date Segment | Individual date part input | [React Aria](https://react-spectrum.adobe.com/react-aria/DateField.html) | 🟨 Medium |
| Relative Time | "2 hours ago" display | [date-fns](https://date-fns.org/) | 🟩 Easy |
| Duration Picker | Hours/minutes duration input | Custom | 🟧 Complex |
| Timezone Picker | Timezone selection dropdown | Custom | 🟧 Complex |
| Event Calendar | Full calendar with events | [FullCalendar](https://fullcalendar.io/) | 🟥 Advanced |
| Agenda View | List view of events | [FullCalendar](https://fullcalendar.io/) | 🟧 Complex |
| Day View | Single day schedule | [FullCalendar](https://fullcalendar.io/) | 🟧 Complex |
| Week View | 7-day calendar view | [FullCalendar](https://fullcalendar.io/) | 🟧 Complex |
| Month View | Monthly calendar grid | [FullCalendar](https://fullcalendar.io/) | 🟧 Complex |

---

## 12. Media & Files

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Image Cropper | Crop/resize image tool | [react-image-crop](https://github.com/DominicTobias/react-image-crop) | 🟧 Complex |
| Image Editor | Full image editing suite | [Pintura](https://pqina.nl/pintura/) (commercial) | 🟥 Advanced |
| PDF Viewer | Embedded PDF display | [react-pdf](https://github.com/wojtekmaj/react-pdf) | 🟧 Complex |
| Document Viewer | Multi-format doc preview | [react-doc-viewer](https://github.com/cyntler/react-doc-viewer) | 🟧 Complex |
| File Browser | File system navigation | Custom | 🟥 Advanced |
| File List | List of files with actions | Custom | 🟨 Medium |
| File Card | Individual file display | Custom | 🟨 Medium |
| Media Recorder | Audio/video recording | [react-media-recorder](https://github.com/DeltaCircuit/react-media-recorder) | 🟧 Complex |
| Screen Capture | Screenshot/screen record | Custom (MediaDevices API) | 🟧 Complex |
| Camera Capture | Webcam photo capture | Custom (getUserMedia) | 🟧 Complex |
| Audio Recorder | Audio recording control | [react-media-recorder](https://github.com/DeltaCircuit/react-media-recorder) | 🟧 Complex |
| Waveform | Audio waveform visualization | [wavesurfer.js](https://wavesurfer-js.org/) | 🟧 Complex |
| Video Thumbnail | Video preview image | Custom | 🟨 Medium |
| Playlist | Audio/video playlist | Custom | 🟧 Complex |

---

## 13. Authentication & User

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Login Form | Email/password authentication | Custom | 🟨 Medium |
| Registration Form | New user signup | Custom | 🟨 Medium |
| Password Reset | Forgot password flow | Custom | 🟨 Medium |
| Social Login | OAuth provider buttons | [next-auth](https://next-auth.js.org/) | 🟧 Complex |
| OAuth Button | Single OAuth provider button | Custom | 🟩 Easy |
| 2FA Input | Two-factor code entry | [Input OTP](https://input-otp.rodz.dev/) | 🟧 Complex |
| Captcha | Bot prevention challenge | [react-google-recaptcha](https://github.com/dozoisch/react-google-recaptcha) | 🟨 Medium |
| Session Timeout | Inactivity warning dialog | Custom | 🟨 Medium |
| Account Switcher | Multi-account dropdown | Custom | 🟧 Complex |
| User Menu | Profile dropdown menu | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) | 🟧 Complex |
| Avatar Upload | Profile image upload/crop | Custom | 🟧 Complex |
| Profile Form | User profile editing | Custom | 🟨 Medium |

---

## 14. E-commerce & Pricing

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Product Card | Product listing tile | Custom | 🟨 Medium |
| Product Gallery | Multi-image product viewer | Custom + Lightbox | 🟧 Complex |
| Price Display | Formatted price with currency | Custom | 🟩 Easy |
| Price Range | Min-max price display | Custom | 🟩 Easy |
| Discount Badge | Sale/discount indicator | Custom | ⬜ Trivial |
| Shopping Cart | Cart item list and totals | Custom | 🟧 Complex |
| Cart Item | Single cart line item | Custom | 🟨 Medium |
| Quantity Selector | +/- number input | [React Aria](https://react-spectrum.adobe.com/react-aria/NumberField.html) | 🟨 Medium |
| Wishlist Button | Add to wishlist toggle | Custom | 🟩 Easy |
| Compare Widget | Product comparison | Custom | 🟧 Complex |
| Stock Indicator | In/out of stock display | Custom | ⬜ Trivial |
| Size Selector | Size option picker | Custom | 🟨 Medium |
| Variant Selector | Color/option selector | Custom | 🟨 Medium |
| Checkout Form | Multi-step checkout | Custom | 🟥 Advanced |
| Payment Form | Credit card entry | [Stripe Elements](https://stripe.com/docs/stripe-js/react) | 🟧 Complex |
| Credit Card Input | Card number/expiry/cvv | [Stripe Elements](https://stripe.com/docs/stripe-js/react) | 🟧 Complex |
| Order Summary | Purchase summary | Custom | 🟨 Medium |
| Invoice | Invoice document display | Custom | 🟨 Medium |
| Receipt | Purchase confirmation | Custom | 🟨 Medium |
| Subscription Card | Recurring plan display | Custom | 🟨 Medium |
| Pricing Table | Plan comparison table | Custom | 🟧 Complex |
| Pricing Card | Single pricing tier | Custom | 🟨 Medium |
| Feature Comparison | Feature matrix table | Custom | 🟧 Complex |
| Coupon Input | Promo code entry | Custom | 🟨 Medium |

---

## 15. Messaging & Communication

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Chat Bubble | Message bubble with avatar | Custom | 🟨 Medium |
| Chat Input | Message compose with attachments | Custom | 🟧 Complex |
| Chat List | Conversation list | Custom | 🟨 Medium |
| Chat Window | Full chat interface | Custom | 🟥 Advanced |
| Typing Indicator | "User is typing..." animation | Custom | 🟩 Easy |
| Read Receipt | Message read status | Custom | 🟩 Easy |
| Emoji Picker | Emoji selection popup | [emoji-mart](https://github.com/missive/emoji-mart) | 🟧 Complex |
| Emoji | Single emoji display | Custom | ⬜ Trivial |
| Mention Input | @-mention autocomplete | [react-mentions](https://github.com/signavio/react-mentions) | 🟧 Complex |
| Inbox | Message inbox list | Custom | 🟧 Complex |
| Notification List | Notification feed | Custom | 🟨 Medium |
| Notification Item | Single notification entry | Custom | 🟩 Easy |
| Notification Badge | Unread count indicator | Custom | 🟩 Easy |
| Notification Center | Dropdown notification panel | Custom | 🟧 Complex |
| Email Composer | Rich email editor | [TipTap](https://tiptap.dev/) | 🟥 Advanced |
| Contact Form | Name/email/message form | Custom | 🟨 Medium |
| Newsletter Signup | Email subscription form | Custom | 🟩 Easy |

---

## 16. Social & Engagement

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Like Button | Heart/like toggle | Custom | 🟩 Easy |
| Share Button | Open share menu | Custom | 🟩 Easy |
| Share Menu | Social sharing options | Custom | 🟨 Medium |
| Social Share Buttons | Platform-specific shares | [react-share](https://github.com/nygardk/react-share) | 🟨 Medium |
| Follow Button | Follow/unfollow toggle | Custom | 🟩 Easy |
| Subscribe Button | Subscribe/unsubscribe | Custom | 🟩 Easy |
| Bookmark Button | Save/bookmark toggle | Custom | 🟩 Easy |
| Vote Button | Upvote/downvote | Custom | 🟨 Medium |
| Poll | Single/multi-choice voting | Custom | 🟧 Complex |
| Survey | Multi-question form | Custom | 🟧 Complex |
| Feedback Widget | Thumbs/stars feedback | Custom | 🟨 Medium |
| NPS Score | Net Promoter Score input | Custom | 🟨 Medium |
| Reaction Buttons | Emoji reactions bar | Custom | 🟨 Medium |
| Clap Button | Medium-style clap | Custom | 🟨 Medium |
| Heart Animation | Animated like effect | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |

---

## 17. Content & Editorial

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Article Layout | Blog/article template | Custom | 🟨 Medium |
| Blog Post Card | Article preview card | Custom | 🟨 Medium |
| News Card | News article summary | Custom | 🟨 Medium |
| Reading Progress | Scroll progress bar | Custom | 🟩 Easy |
| Table of Contents | Auto-generated TOC | Custom | 🟨 Medium |
| Footnote | Inline reference marker | Custom | 🟨 Medium |
| Endnote | Document-end reference | Custom | 🟨 Medium |
| Citation | Formatted citation | Custom | 🟩 Easy |
| Bibliography | Reference list | Custom | 🟨 Medium |
| Quote Card | Styled quote block | Custom | 🟩 Easy |
| Pullquote | Emphasized inline quote | Custom | 🟩 Easy |
| Lead Paragraph | Large intro paragraph | Custom CSS | ⬜ Trivial |
| Drop Cap | Large first letter | Custom CSS | ⬜ Trivial |
| Author Bio | Author info block | Custom | 🟩 Easy |
| Published Date | Formatted date display | Custom | ⬜ Trivial |
| Reading Time | Estimated read time | Custom | ⬜ Trivial |
| Category Tag | Article category label | Custom | ⬜ Trivial |
| Related Posts | Related content grid | Custom | 🟨 Medium |
| Series Navigation | Multi-part navigation | Custom | 🟨 Medium |
| Chapter Navigation | Book-style nav | Custom | 🟨 Medium |

---

## 18. Utilities & Helpers

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Visually Hidden | Screen-reader only content | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/visually-hidden) | ⬜ Trivial |
| Screen Reader Only | Accessible hidden text | Custom CSS | ⬜ Trivial |
| Click Away Listener | Detect outside clicks | Custom hook | 🟨 Medium |
| Focus Lock | Trap focus in container | [React Aria](https://react-spectrum.adobe.com/react-aria/FocusScope.html) | 🟨 Medium |
| Scroll Lock | Prevent body scroll | Custom hook | 🟩 Easy |
| Body Scroll Lock | Modal scroll prevention | [body-scroll-lock](https://github.com/willmcpo/body-scroll-lock) | 🟩 Easy |
| Intersection Observer | Visibility detection | [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer) | 🟨 Medium |
| Resize Observer | Element size detection | [react-resize-detector](https://github.com/maslianok/react-resize-detector) | 🟨 Medium |
| Mutation Observer | DOM change detection | Custom hook | 🟨 Medium |
| Media Query | Responsive breakpoints | [react-responsive](https://github.com/yocontra/react-responsive) | 🟩 Easy |
| Idle Timer | User inactivity detection | [react-idle-timer](https://github.com/SupremeTechnopriest/react-idle-timer) | 🟨 Medium |
| Copy to Clipboard | Clipboard write utility | [usehooks-ts](https://usehooks-ts.com/) | 🟩 Easy |
| Copy Button | Click-to-copy button | Custom | 🟩 Easy |
| Download Button | File download trigger | Custom | 🟩 Easy |
| Print Button | Trigger print dialog | Custom | 🟩 Easy |
| Full Screen Toggle | Fullscreen API wrapper | Custom | 🟨 Medium |
| Theme Toggle | Dark/light mode switch | Custom | 🟨 Medium |
| Language Selector | i18n locale switcher | Custom | 🟨 Medium |
| Currency Selector | Currency preference | Custom | 🟨 Medium |
| Keyboard Shortcut | Hotkey handler | [react-hotkeys-hook](https://github.com/JohannesKlawornn/react-hotkeys-hook) | 🟨 Medium |
| Hotkey Display | Keyboard shortcut hint | [Chakra UI](https://chakra-ui.com/docs/components/kbd) | ⬜ Trivial |
| Shortcut Hint | Tooltip with shortcut | Custom | 🟩 Easy |

---

## 19. Animation & Transitions

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Fade Transition | Opacity animation | [Framer Motion](https://www.framer.com/motion/) | 🟩 Easy |
| Slide Transition | Directional slide | [Framer Motion](https://www.framer.com/motion/) | 🟩 Easy |
| Scale Transition | Grow/shrink animation | [Framer Motion](https://www.framer.com/motion/) | 🟩 Easy |
| Collapse Transition | Height collapse/expand | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Expand Transition | Content expansion | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Rotate Transition | Rotation animation | [Framer Motion](https://www.framer.com/motion/) | 🟩 Easy |
| Flip Transition | 3D flip effect | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Zoom Transition | Zoom in/out | [Framer Motion](https://www.framer.com/motion/) | 🟩 Easy |
| AnimatePresence | Exit animation support | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Stagger Animation | Sequential child animation | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Layout Animation | Auto-animate layout changes | [Framer Motion](https://www.framer.com/motion/) | 🟧 Complex |
| Spring Animation | Physics-based motion | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Parallax | Scroll-based parallax | [react-scroll-parallax](https://react-scroll-parallax.damnthat.tv/) | 🟨 Medium |
| Scroll Animation | Scroll-triggered effects | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Lottie Player | After Effects animations | [lottie-react](https://github.com/LottieFiles/lottie-react) | 🟨 Medium |
| Motion Path | Animate along SVG path | [Framer Motion](https://www.framer.com/motion/) | 🟧 Complex |
| Typewriter | Text typing effect | Custom | 🟨 Medium |
| Counter Animation | Animated number counting | [Framer Motion](https://www.framer.com/motion/) | 🟨 Medium |
| Ripple Effect | Material ripple on click | Custom | 🟨 Medium |
| Wave Effect | Animated wave | Custom SVG | 🟨 Medium |
| Pulse Animation | Pulsing attention effect | Custom CSS | 🟩 Easy |
| Bounce Animation | Bouncing motion | Custom CSS | 🟩 Easy |

---

## 20. Onboarding & Help

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Product Tour | Guided feature walkthrough | [React Joyride](https://react-joyride.com/) | 🟧 Complex |
| Tour Step | Individual tour step | [React Joyride](https://react-joyride.com/) | 🟨 Medium |
| Spotlight Tour | Highlight tour element | [React Joyride](https://react-joyride.com/) | 🟧 Complex |
| Coach Mark | Feature callout bubble | Custom | 🟨 Medium |
| Tooltip Tour | Tooltip-based guidance | [React Joyride](https://react-joyride.com/) | 🟧 Complex |
| Welcome Modal | First-time user dialog | Custom | 🟨 Medium |
| Feature Highlight | New feature callout | Custom | 🟨 Medium |
| Changelog Modal | What's new display | Custom | 🟨 Medium |
| Onboarding Checklist | Setup progress list | Custom | 🟨 Medium |
| Progress Checklist | Task completion list | Custom | 🟨 Medium |
| Help Bubble | Floating help trigger | Custom | 🟩 Easy |
| Contextual Help | Inline help tooltip | Custom | 🟨 Medium |
| FAQ Accordion | Expandable FAQ list | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/accordion) | 🟧 Complex |
| Knowledge Base Search | Help article search | Custom | 🟧 Complex |
| Support Widget | Floating support chat | Custom | 🟧 Complex |
| Live Chat Widget | Real-time support chat | [Intercom](https://www.intercom.com/) (external) | 🟥 Advanced |
| Chatbot Interface | AI assistant UI | Custom | 🟥 Advanced |

---

## 21. Settings & Preferences

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Settings Panel | Settings form container | Custom | 🟨 Medium |
| Settings Group | Related settings section | Custom | 🟩 Easy |
| Settings Row | Single setting with control | Custom | 🟩 Easy |
| Preference Toggle | On/off preference | Custom | 🟩 Easy |
| Feature Flag Toggle | Feature enable/disable | Custom | 🟩 Easy |
| Permission Toggle | Permission grant UI | Custom | 🟩 Easy |
| Notification Prefs | Notification settings | Custom | 🟨 Medium |
| Privacy Settings | Privacy control panel | Custom | 🟨 Medium |
| Account Settings | Account management | Custom | 🟨 Medium |
| Integration Card | Third-party integration | Custom | 🟨 Medium |
| Connected Account | Linked account display | Custom | 🟨 Medium |
| API Key Display | Masked API key | Custom | 🟨 Medium |
| API Key Input | API key entry | Custom | 🟨 Medium |
| Webhook Config | Webhook setup form | Custom | 🟧 Complex |

---

## 22. Developer & Technical

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| API Playground | Interactive API tester | Custom | 🟥 Advanced |
| Request Builder | HTTP request composer | Custom | 🟥 Advanced |
| Response Viewer | API response display | Custom | 🟧 Complex |
| Schema Viewer | JSON schema display | Custom | 🟧 Complex |
| Endpoint Docs | API endpoint reference | Custom | 🟧 Complex |
| Parameter Table | API param documentation | Custom | 🟨 Medium |
| Example Code Block | Syntax-highlighted example | [Prism](https://prismjs.com/) | 🟨 Medium |
| Try It Button | Execute example code | Custom | 🟨 Medium |
| Debug Panel | Development debug info | Custom | 🟧 Complex |
| Console | Developer console output | [xterm.js](https://xtermjs.org/) | 🟥 Advanced |
| Log Entry | Single log line | Custom | 🟩 Easy |
| Stack Trace | Error stack display | Custom | 🟨 Medium |
| Error Display | Technical error message | Custom | 🟨 Medium |
| Version Badge | Software version tag | Custom | ⬜ Trivial |
| Environment Badge | Dev/staging/prod indicator | Custom | ⬜ Trivial |
| Changelog Entry | Version release note | Custom | 🟩 Easy |

---

## 23. Specialized Inputs

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Address Input | Address with autocomplete | [Google Places](https://developers.google.com/maps/documentation/javascript/places) | 🟧 Complex |
| Phone Input | International phone number | [react-phone-number-input](https://catamphetamine.gitlab.io/react-phone-number-input/) | 🟧 Complex |
| Email Input | Email validation input | Custom | 🟩 Easy |
| URL Input | URL validation input | Custom | 🟩 Easy |
| IP Address Input | IP address entry | Custom | 🟨 Medium |
| Credit Card Input | Card number formatting | [Stripe Elements](https://stripe.com/docs/stripe-js/react) | 🟧 Complex |
| Expiry Date Input | MM/YY card expiry | [Stripe Elements](https://stripe.com/docs/stripe-js/react) | 🟨 Medium |
| CVV Input | Card security code | [Stripe Elements](https://stripe.com/docs/stripe-js/react) | 🟨 Medium |
| IBAN Input | International bank number | Custom | 🟨 Medium |
| SSN Input | Social security masked | Custom | 🟨 Medium |
| License Plate Input | Vehicle plate format | Custom | 🟨 Medium |
| VIN Input | Vehicle ID number | Custom | 🟨 Medium |
| Measurement Input | Value with unit select | Custom | 🟨 Medium |
| Currency Input | Money with formatting | [react-currency-input-field](https://github.com/cchanxzy/react-currency-input-field) | 🟨 Medium |
| Percentage Input | Percent with symbol | Custom | 🟨 Medium |
| Fraction Input | Fractional number entry | Custom | 🟧 Complex |
| Coordinate Input | Lat/long entry | Custom | 🟨 Medium |
| Hex Input | Hexadecimal input | Custom | 🟨 Medium |
| Binary Input | Binary number input | Custom | 🟨 Medium |
| Regex Input | Regular expression builder | Custom | 🟧 Complex |
| Cron Input | Cron expression builder | [react-cron-generator](https://github.com/AnonaBoss/react-cron-generator) | 🟧 Complex |
| Expression Builder | Query/filter builder | Custom | 🟥 Advanced |
| Formula Input | Spreadsheet formula | Custom | 🟥 Advanced |
| Equation Editor | LaTeX/math entry | [react-mathjax](https://github.com/SamyPesse/react-mathjax) | 🟧 Complex |

---

## 24. Specialized Displays

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Ruler | Measurement ruler overlay | Custom | 🟨 Medium |
| Grid Overlay | Design grid display | Custom | 🟩 Easy |
| Crosshair | Position indicator | Custom | 🟩 Easy |
| Magnifier | Zoom lens on hover | Custom | 🟧 Complex |
| Loupe | Detailed zoom viewer | Custom | 🟧 Complex |
| Contrast Checker | Color contrast rating | Custom | 🟨 Medium |
| Accessibility Score | a11y rating display | Custom | 🟨 Medium |
| SEO Score | SEO rating gauge | Custom | 🟨 Medium |
| Performance Score | Perf metrics display | Custom | 🟨 Medium |
| Health Check | System health status | Custom | 🟨 Medium |
| System Status | Service status page | Custom | 🟨 Medium |
| Uptime Indicator | Availability display | Custom | 🟩 Easy |
| Server Status | Server health display | Custom | 🟩 Easy |
| Connection Status | Network state indicator | Custom | 🟩 Easy |
| Sync Status | Data sync indicator | Custom | 🟩 Easy |
| Version Comparison | Side-by-side versions | Custom | 🟧 Complex |
| A/B Test Results | Experiment results | Custom | 🟧 Complex |

---

## 25. Geographic & Location

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Map Marker | Location pin on map | [React Leaflet](https://react-leaflet.js.org/) | 🟨 Medium |
| Map Cluster | Grouped markers | [React Leaflet Cluster](https://github.com/yuzhva/react-leaflet-cluster) | 🟧 Complex |
| Map Popup | Info popup on marker | [React Leaflet](https://react-leaflet.js.org/) | 🟨 Medium |
| Map Controls | Zoom/pan controls | [React Leaflet](https://react-leaflet.js.org/) | 🟨 Medium |
| Map Legend | Map symbol legend | Custom | 🟩 Easy |
| Map Scale | Distance scale bar | [React Leaflet](https://react-leaflet.js.org/) | 🟩 Easy |
| Location Search | Place search input | [Google Places](https://developers.google.com/maps/documentation/javascript/places) | 🟧 Complex |
| Location Picker | Click-to-select location | [React Leaflet](https://react-leaflet.js.org/) | 🟧 Complex |
| Address Card | Formatted address display | Custom | 🟩 Easy |
| Distance Display | Distance with units | Custom | ⬜ Trivial |
| Route Display | Path on map | [React Leaflet](https://react-leaflet.js.org/) | 🟧 Complex |
| Directions List | Turn-by-turn directions | Custom | 🟨 Medium |
| Store Locator | Find nearby locations | Custom | 🟧 Complex |
| Geofence | Boundary visualization | [React Leaflet](https://react-leaflet.js.org/) | 🟧 Complex |

---

## 26. Document & Print

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Document Header | Print document header | Custom CSS | 🟩 Easy |
| Document Footer | Print document footer | Custom CSS | 🟩 Easy |
| Page Break | Force page break | Custom CSS | ⬜ Trivial |
| Print Layout | Print-optimized layout | Custom CSS | 🟨 Medium |
| PDF Page | PDF page container | [react-pdf](https://github.com/wojtekmaj/react-pdf) | 🟨 Medium |
| Document Template | Reusable doc layout | Custom | 🟨 Medium |
| Letter Template | Formal letter format | Custom | 🟨 Medium |
| Invoice Template | Invoice layout | Custom | 🟧 Complex |
| Resume Template | CV/resume layout | Custom | 🟧 Complex |
| Certificate Template | Award/certificate | Custom | 🟨 Medium |
| Ticket Template | Event ticket layout | Custom | 🟨 Medium |
| Label Template | Shipping/product label | Custom | 🟨 Medium |
| Business Card | Business card layout | Custom | 🟨 Medium |
| Watermark | Document watermark | Custom CSS | 🟩 Easy |

---

## 27. Gaming & Interactive

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Game Board | Generic game grid | Custom | 🟧 Complex |
| Chess Board | 8x8 chess grid | [react-chessboard](https://github.com/Clariity/react-chessboard) | 🟧 Complex |
| Playing Card | Card display | Custom | 🟨 Medium |
| Deck | Card deck management | Custom | 🟧 Complex |
| Dice | Rollable dice | Custom | 🟨 Medium |
| Spinner Wheel | Prize wheel | Custom (Canvas) | 🟧 Complex |
| Slot Machine | Spinning slots | Custom | 🟧 Complex |
| Progress Quest | Gamified progress | Custom | 🟨 Medium |
| Achievement Badge | Earned achievement | Custom | 🟩 Easy |
| Level Indicator | Current level display | Custom | 🟩 Easy |
| XP Bar | Experience progress | Custom | 🟨 Medium |
| Leaderboard | Ranking list | Custom | 🟨 Medium |
| Score Display | Game score | Custom | 🟩 Easy |
| Timer | Countdown/stopwatch | Custom | 🟨 Medium |
| Stopwatch | Elapsed time counter | Custom | 🟨 Medium |
| Quiz Question | Question display | Custom | 🟨 Medium |
| Quiz Answer | Answer option | Custom | 🟩 Easy |
| Quiz Results | Score summary | Custom | 🟨 Medium |
| Flashcard | Flip-to-reveal card | Custom | 🟨 Medium |
| Memory Card | Matching game card | Custom | 🟨 Medium |

---

## 28. Accessibility Specific

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Live Region | Announce dynamic changes | [React Aria](https://react-spectrum.adobe.com/react-aria/useAnnounce.html) | 🟨 Medium |
| Announcer | Screen reader announcements | Custom | 🟨 Medium |
| Focus Indicator | Custom focus styling | Custom CSS | 🟩 Easy |
| High Contrast Toggle | High contrast mode | Custom | 🟩 Easy |
| Font Size Adjuster | Text size control | Custom | 🟨 Medium |
| Line Height Adjuster | Line spacing control | Custom | 🟨 Medium |
| Letter Spacing Adjuster | Character spacing | Custom | 🟨 Medium |
| Reduced Motion Toggle | Disable animations | Custom | 🟩 Easy |
| Dyslexia-friendly Toggle | Reading mode | Custom | 🟨 Medium |
| Screen Reader Instructions | SR-only guidance | Custom | ⬜ Trivial |
| Accessible Name | Label provider | [React Aria](https://react-spectrum.adobe.com/react-aria/useLabel.html) | 🟩 Easy |
| Accessible Description | Description provider | [React Aria](https://react-spectrum.adobe.com/react-aria/useDescription.html) | 🟩 Easy |

---

## 29. Layout Primitives (Low-level)

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Slot | Child replacement slot | [Radix Primitives](https://www.radix-ui.com/primitives/docs/utilities/slot) | 🟨 Medium |
| Primitive | Unstyled base element | [Radix Primitives](https://www.radix-ui.com/primitives/docs/components/primitive) | 🟩 Easy |
| Polymorphic (as prop) | Dynamic element type | Custom | 🟨 Medium |
| Render Props Container | Function-as-child pattern | Custom | 🟨 Medium |
| Compound Root | Compound component root | Custom (Context) | 🟧 Complex |
| Context Provider | React context wrapper | React | 🟨 Medium |
| Consumer | Context consumer | React | 🟩 Easy |
| Composed Ref | Multiple refs merger | Custom | 🟨 Medium |
| Forward Ref Wrapper | Ref forwarding HOC | React | 🟨 Medium |
| Slottable | Merge child props | [Radix Primitives](https://www.radix-ui.com/primitives/docs/utilities/slot) | 🟨 Medium |
| Presence | Mount/unmount detection | [Radix Primitives](https://www.radix-ui.com/primitives/docs/utilities/presence) | 🟨 Medium |

---

## 30. Miscellaneous

| Component | Description / Use Case | Best Implementation | Complexity |
|-----------|------------------------|---------------------|------------|
| Logo | Brand logo display | Custom | ⬜ Trivial |
| Favicon Display | Favicon in UI | Custom | ⬜ Trivial |
| App Icon | Application icon | Custom | ⬜ Trivial |
| Splash Screen | App loading screen | Custom | 🟨 Medium |
| Loading Screen | Full-page loader | Custom | 🟨 Medium |
| Maintenance Page | Site maintenance | Custom | 🟩 Easy |
| 404 Page | Not found page | Custom | 🟩 Easy |
| Error Page | 500 error page | Custom | 🟩 Easy |
| Coming Soon | Pre-launch page | Custom | 🟩 Easy |
| Under Construction | WIP placeholder | Custom | 🟩 Easy |
| Offline Indicator | No connection state | Custom | 🟩 Easy |
| Network Status | Connection state | Custom | 🟩 Easy |
| Battery Status | Device battery level | Custom (Battery API) | 🟨 Medium |
| Device Orientation | Orientation display | Custom | 🟨 Medium |
| Screen Size Indicator | Viewport display | Custom | 🟩 Easy |
| Clipboard History | Copied items list | Custom | 🟧 Complex |
| Undo/Redo Controls | History navigation | Custom | 🟧 Complex |
| Version Indicator | App version display | Custom | ⬜ Trivial |
| Autosave Indicator | Save status display | Custom | 🟩 Easy |
| Unsaved Warning | Unsaved changes alert | Custom | 🟨 Medium |
| Exit Confirmation | Leave page dialog | Custom | 🟨 Medium |
| Cookie Consent | GDPR cookie banner | [react-cookie-consent](https://github.com/Mastermindzh/react-cookie-consent) | 🟨 Medium |
| GDPR Banner | Privacy consent UI | Custom | 🟨 Medium |
| Age Verification | Age gate modal | Custom | 🟨 Medium |
| Paywall | Premium content gate | Custom | 🟧 Complex |
| Subscription Gate | Feature access gate | Custom | 🟧 Complex |
| Trial Countdown | Trial expiry display | Custom | 🟨 Medium |
| Referral Widget | Referral program UI | Custom | 🟨 Medium |
| Affiliate Banner | Partner promotion | Custom | 🟩 Easy |

---

## Summary Statistics

| Complexity | Count | Percentage |
|------------|-------|------------|
| ⬜ Trivial | 58 | 9.3% |
| 🟩 Easy | 143 | 22.8% |
| 🟨 Medium | 241 | 38.5% |
| 🟧 Complex | 138 | 22.0% |
| 🟥 Advanced | 46 | 7.3% |
| **Total** | **626** | **100%** |

---

## Notes

1. **Best implementations** prioritize accessibility, developer experience, and bundle size
2. **React Aria** excels at accessibility and behavior, requires styling
3. **Radix Primitives** provides unstyled, accessible components
4. **Chakra UI** balances simplicity with customization
5. **TanStack** libraries (Table, Virtual, Query) are headless and flexible
6. **shadcn/ui** offers copy-paste components built on Radix
7. Many "Custom" entries indicate patterns best implemented project-specifically
8. Commercial alternatives (AG Grid, Pintura) noted where significantly superior
