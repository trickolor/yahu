import SelectDemo from "./select-demo";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button"
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectContentView, SelectItem, SelectGroup, SelectLabel, SelectSeparator, SelectItemIndicator, SelectTriggerIndicator } from "./ui/select";
import { Textarea } from "./ui/textarea";

function App() {
    const themeToggle = () => {
        document.documentElement.setAttribute('data-mode', document.documentElement.getAttribute('data-mode') === 'light' ? 'dark' : 'light');
    }

    return (
        <main className="w-full min-h-screen bg-surface space-y-12 relative">
            <Button className="fixed top-6 right-6" onClick={themeToggle}>
                Change Theme
            </Button>

            <section className="w-fit p-8 grid grid-cols-5 gap-8">
                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-muted-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Muted Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-muted-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Muted Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-primary-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Primary Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-primary-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Primary Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-secondary-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Secondary Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-secondary-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Secondary Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-outer-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Outer Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-muted-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Muted Bound</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-success border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Success</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-warning border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Warning</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-failure border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Failure</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-red-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Red Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-red-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Red Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-red-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Red Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-orange-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Orange Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-orange-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Orange Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-orange-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Orange Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-amber-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Amber Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-amber-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Amber Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-amber-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Amber Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-yellow-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Yellow Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-yellow-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Yellow Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-yellow-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Yellow Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-lime-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Lime Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-lime-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Lime Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-lime-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Lime Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-green-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Green Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-green-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Green Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-green-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Green Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-emerald-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Emerald Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-emerald-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Emerald Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-emerald-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Emerald Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-teal-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Teal Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-teal-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Teal Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-teal-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Teal Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-cyan-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Cyan Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-cyan-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Cyan Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-cyan-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Cyan Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-sky-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Sky Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-sky-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Sky Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-sky-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Sky Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-blue-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Blue Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-blue-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Blue Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-blue-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Blue Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-indigo-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Indigo Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-indigo-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Indigo Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-indigo-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Indigo Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-violet-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Violet Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-violet-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Violet Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-violet-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Violet Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-purple-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Purple Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-purple-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Purple Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-purple-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Purple Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-fuchsia-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Fuchsia Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-fuchsia-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Fuchsia Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-fuchsia-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Fuchsia Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-pink-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Pink Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-pink-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Pink Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-pink-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Pink Write</span>
                    </li>
                </ul>

                <ul className="w-64 space-y-4 bg-muted-surface p-4 shadow">
                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-rose-surface border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Rose Surface</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-rose-bound border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Rose Bound</span>
                    </li>

                    <li className="flex items-center gap-4">
                        <span className="size-7 rounded-full bg-accent-rose-write border border-bound"></span>
                        <span className="text-write text-sm leading-none font-medium">Accent Rose Write</span>
                    </li>
                </ul>
            </section>

            <section className="w-full p-8 grid grid-cols-4 gap-8 ">
                <div className="w-full p-8 bg-muted-surface shadow flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-write mb-4">Solid Buttons</h3>

                    <Button className="w-full" variant="solid" color="primary">
                        Solid Primary
                    </Button>

                    <Button className="w-full" variant="solid" color="secondary">
                        Solid Secondary
                    </Button>

                    <Button className="w-full" variant="solid" color="success">
                        Solid Success
                    </Button>

                    <Button className="w-full" variant="solid" color="warning">
                        Solid Warning
                    </Button>

                    <Button className="w-full" variant="solid" color="failure">
                        Solid Failure
                    </Button>

                    <Button className="w-full" variant="solid" color="red">
                        Solid Red
                    </Button>

                    <Button className="w-full" variant="solid" color="orange">
                        Solid Orange
                    </Button>

                    <Button className="w-full" variant="solid" color="amber">
                        Solid Amber
                    </Button>

                    <Button className="w-full" variant="solid" color="yellow">
                        Solid Yellow
                    </Button>

                    <Button className="w-full" variant="solid" color="lime">
                        Solid Lime
                    </Button>

                    <Button className="w-full" variant="solid" color="green">
                        Solid Green
                    </Button>

                    <Button className="w-full" variant="solid" color="emerald">
                        Solid Emerald
                    </Button>

                    <Button className="w-full" variant="solid" color="teal">
                        Solid Teal
                    </Button>

                    <Button className="w-full" variant="solid" color="cyan">
                        Solid Cyan
                    </Button>

                    <Button className="w-full" variant="solid" color="sky">
                        Solid Sky
                    </Button>

                    <Button className="w-full" variant="solid" color="blue">
                        Solid Blue
                    </Button>

                    <Button className="w-full" variant="solid" color="indigo">
                        Solid Indigo
                    </Button>

                    <Button className="w-full" variant="solid" color="violet">
                        Solid Violet
                    </Button>

                    <Button className="w-full" variant="solid" color="purple">
                        Solid Purple
                    </Button>

                    <Button className="w-full" variant="solid" color="fuchsia">
                        Solid Fuchsia
                    </Button>

                    <Button className="w-full" variant="solid" color="pink">
                        Solid Pink
                    </Button>

                    <Button className="w-full" variant="solid" color="rose">
                        Solid Rose
                    </Button>
                </div>

                <div className="w-full p-8 bg-muted-surface shadow flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-write mb-4">Outline Buttons</h3>

                    <Button className="w-full" variant="outline" color="primary">
                        Outline Primary
                    </Button>

                    <Button className="w-full" variant="outline" color="secondary">
                        Outline Secondary
                    </Button>

                    <Button className="w-full" variant="outline" color="success">
                        Outline Success
                    </Button>

                    <Button className="w-full" variant="outline" color="warning">
                        Outline Warning
                    </Button>

                    <Button className="w-full" variant="outline" color="failure">
                        Outline Failure
                    </Button>

                    <Button className="w-full" variant="outline" color="red">
                        Outline Red
                    </Button>

                    <Button className="w-full" variant="outline" color="orange">
                        Outline Orange
                    </Button>

                    <Button className="w-full" variant="outline" color="amber">
                        Outline Amber
                    </Button>

                    <Button className="w-full" variant="outline" color="yellow">
                        Outline Yellow
                    </Button>

                    <Button className="w-full" variant="outline" color="lime">
                        Outline Lime
                    </Button>

                    <Button className="w-full" variant="outline" color="green">
                        Outline Green
                    </Button>

                    <Button className="w-full" variant="outline" color="emerald">
                        Outline Emerald
                    </Button>

                    <Button className="w-full" variant="outline" color="teal">
                        Outline Teal
                    </Button>

                    <Button className="w-full" variant="outline" color="cyan">
                        Outline Cyan
                    </Button>

                    <Button className="w-full" variant="outline" color="sky">
                        Outline Sky
                    </Button>

                    <Button className="w-full" variant="outline" color="blue">
                        Outline Blue
                    </Button>

                    <Button className="w-full" variant="outline" color="indigo">
                        Outline Indigo
                    </Button>

                    <Button className="w-full" variant="outline" color="violet">
                        Outline Violet
                    </Button>

                    <Button className="w-full" variant="outline" color="purple">
                        Outline Purple
                    </Button>

                    <Button className="w-full" variant="outline" color="fuchsia">
                        Outline Fuchsia
                    </Button>

                    <Button className="w-full" variant="outline" color="pink">
                        Outline Pink
                    </Button>

                    <Button className="w-full" variant="outline" color="rose">
                        Outline Rose
                    </Button>
                </div>

                <div className="w-full p-8 bg-muted-surface shadow flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-write mb-4">Ghost Buttons</h3>

                    <Button className="w-full" variant="ghost" color="primary">
                        Ghost Primary
                    </Button>

                    <Button className="w-full" variant="ghost" color="secondary">
                        Ghost Secondary
                    </Button>

                    <Button className="w-full" variant="ghost" color="success">
                        Ghost Success
                    </Button>

                    <Button className="w-full" variant="ghost" color="warning">
                        Ghost Warning
                    </Button>

                    <Button className="w-full" variant="ghost" color="failure">
                        Ghost Failure
                    </Button>

                    <Button className="w-full" variant="ghost" color="red">
                        Ghost Red
                    </Button>

                    <Button className="w-full" variant="ghost" color="orange">
                        Ghost Orange
                    </Button>

                    <Button className="w-full" variant="ghost" color="amber">
                        Ghost Amber
                    </Button>

                    <Button className="w-full" variant="ghost" color="yellow">
                        Ghost Yellow
                    </Button>

                    <Button className="w-full" variant="ghost" color="lime">
                        Ghost Lime
                    </Button>

                    <Button className="w-full" variant="ghost" color="green">
                        Ghost Green
                    </Button>

                    <Button className="w-full" variant="ghost" color="emerald">
                        Ghost Emerald
                    </Button>

                    <Button className="w-full" variant="ghost" color="teal">
                        Ghost Teal
                    </Button>

                    <Button className="w-full" variant="ghost" color="cyan">
                        Ghost Cyan
                    </Button>

                    <Button className="w-full" variant="ghost" color="sky">
                        Ghost Sky
                    </Button>

                    <Button className="w-full" variant="ghost" color="blue">
                        Ghost Blue
                    </Button>

                    <Button className="w-full" variant="ghost" color="indigo">
                        Ghost Indigo
                    </Button>

                    <Button className="w-full" variant="ghost" color="violet">
                        Ghost Violet
                    </Button>

                    <Button className="w-full" variant="ghost" color="purple">
                        Ghost Purple
                    </Button>

                    <Button className="w-full" variant="ghost" color="fuchsia">
                        Ghost Fuchsia
                    </Button>

                    <Button className="w-full" variant="ghost" color="pink">
                        Ghost Pink
                    </Button>

                    <Button className="w-full" variant="ghost" color="rose">
                        Ghost Rose
                    </Button>
                </div>

                <div className="w-full p-8 bg-muted-surface shadow flex flex-col gap-6">
                    <h3 className="text-lg font-semibold text-write mb-4">Link Buttons</h3>

                    <Button className="w-full" variant="link" color="primary">
                        Link Primary
                    </Button>

                    <Button className="w-full" variant="link" color="secondary">
                        Link Secondary
                    </Button>

                    <Button className="w-full" variant="link" color="success">
                        Link Success
                    </Button>

                    <Button className="w-full" variant="link" color="warning">
                        Link Warning
                    </Button>

                    <Button className="w-full" variant="link" color="failure">
                        Link Failure
                    </Button>

                    <Button className="w-full" variant="link" color="red">
                        Link Red
                    </Button>

                    <Button className="w-full" variant="link" color="orange">
                        Link Orange
                    </Button>

                    <Button className="w-full" variant="link" color="amber">
                        Link Amber
                    </Button>

                    <Button className="w-full" variant="link" color="yellow">
                        Link Yellow
                    </Button>

                    <Button className="w-full" variant="link" color="lime">
                        Link Lime
                    </Button>

                    <Button className="w-full" variant="link" color="green">
                        Link Green
                    </Button>

                    <Button className="w-full" variant="link" color="emerald">
                        Link Emerald
                    </Button>

                    <Button className="w-full" variant="link" color="teal">
                        Link Teal
                    </Button>

                    <Button className="w-full" variant="link" color="cyan">
                        Link Cyan
                    </Button>

                    <Button className="w-full" variant="link" color="sky">
                        Link Sky
                    </Button>

                    <Button className="w-full" variant="link" color="blue">
                        Link Blue
                    </Button>

                    <Button className="w-full" variant="link" color="indigo">
                        Link Indigo
                    </Button>

                    <Button className="w-full" variant="link" color="violet">
                        Link Violet
                    </Button>

                    <Button className="w-full" variant="link" color="purple">
                        Link Purple
                    </Button>

                    <Button className="w-full" variant="link" color="fuchsia">
                        Link Fuchsia
                    </Button>

                    <Button className="w-full" variant="link" color="pink">
                        Link Pink
                    </Button>

                    <Button className="w-full" variant="link" color="rose">
                        Link Rose
                    </Button>
                </div>
            </section>

            <section className="w-fit p-8 grid grid-cols-3 gap-8">
                <div className="w-80 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Primary Badges</h3>
                    <Badge variant="solid" color="primary">Primary</Badge>
                    <Badge variant="solid" color="secondary">Secondary</Badge>
                    <Badge variant="solid" color="success">Success</Badge>
                    <Badge variant="solid" color="warning">Warning</Badge>
                    <Badge variant="solid" color="failure">Failure</Badge>
                    <Badge variant="solid" color="red">Red</Badge>
                    <Badge variant="solid" color="orange">Orange</Badge>
                    <Badge variant="solid" color="amber">Amber</Badge>
                    <Badge variant="solid" color="yellow">Yellow</Badge>
                    <Badge variant="solid" color="lime">Lime</Badge>
                    <Badge variant="solid" color="green">Green</Badge>
                    <Badge variant="solid" color="emerald">Emerald</Badge>
                    <Badge variant="solid" color="teal">Teal</Badge>
                    <Badge variant="solid" color="cyan">Cyan</Badge>
                    <Badge variant="solid" color="sky">Sky</Badge>
                    <Badge variant="solid" color="blue">Blue</Badge>
                    <Badge variant="solid" color="indigo">Indigo</Badge>
                    <Badge variant="solid" color="violet">Violet</Badge>
                    <Badge variant="solid" color="purple">Purple</Badge>
                    <Badge variant="solid" color="fuchsia">Fuchsia</Badge>
                    <Badge variant="solid" color="pink">Pink</Badge>
                    <Badge variant="solid" color="rose">Rose</Badge>
                </div>

                <div className="w-80 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Outline Badges</h3>
                    <Badge variant="outline" color="primary">Primary</Badge>
                    <Badge variant="outline" color="secondary">Secondary</Badge>
                    <Badge variant="outline" color="success">Success</Badge>
                    <Badge variant="outline" color="warning">Warning</Badge>
                    <Badge variant="outline" color="failure">Failure</Badge>
                    <Badge variant="outline" color="red">Red</Badge>
                    <Badge variant="outline" color="orange">Orange</Badge>
                    <Badge variant="outline" color="amber">Amber</Badge>
                    <Badge variant="outline" color="yellow">Yellow</Badge>
                    <Badge variant="outline" color="lime">Lime</Badge>
                    <Badge variant="outline" color="green">Green</Badge>
                    <Badge variant="outline" color="emerald">Emerald</Badge>
                    <Badge variant="outline" color="teal">Teal</Badge>
                    <Badge variant="outline" color="cyan">Cyan</Badge>
                    <Badge variant="outline" color="sky">Sky</Badge>
                    <Badge variant="outline" color="blue">Blue</Badge>
                    <Badge variant="outline" color="indigo">Indigo</Badge>
                    <Badge variant="outline" color="violet">Violet</Badge>
                    <Badge variant="outline" color="purple">Purple</Badge>
                    <Badge variant="outline" color="fuchsia">Fuchsia</Badge>
                    <Badge variant="outline" color="pink">Pink</Badge>
                    <Badge variant="outline" color="rose">Rose</Badge>
                </div>

                <div className="w-80 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Ghost Badges</h3>
                    <Badge variant="ghost" color="primary">Primary</Badge>
                    <Badge variant="ghost" color="secondary">Secondary</Badge>
                    <Badge variant="ghost" color="success">Success</Badge>
                    <Badge variant="ghost" color="warning">Warning</Badge>
                    <Badge variant="ghost" color="failure">Failure</Badge>
                    <Badge variant="ghost" color="red">Red</Badge>
                    <Badge variant="ghost" color="orange">Orange</Badge>
                    <Badge variant="ghost" color="amber">Amber</Badge>
                    <Badge variant="ghost" color="yellow">Yellow</Badge>
                    <Badge variant="ghost" color="lime">Lime</Badge>
                    <Badge variant="ghost" color="green">Green</Badge>
                    <Badge variant="ghost" color="emerald">Emerald</Badge>
                    <Badge variant="ghost" color="teal">Teal</Badge>
                    <Badge variant="ghost" color="cyan">Cyan</Badge>
                    <Badge variant="ghost" color="sky">Sky</Badge>
                    <Badge variant="ghost" color="blue">Blue</Badge>
                    <Badge variant="ghost" color="indigo">Indigo</Badge>
                    <Badge variant="ghost" color="violet">Violet</Badge>
                    <Badge variant="ghost" color="purple">Purple</Badge>
                    <Badge variant="ghost" color="fuchsia">Fuchsia</Badge>
                    <Badge variant="ghost" color="pink">Pink</Badge>
                    <Badge variant="ghost" color="rose">Rose</Badge>
                </div>
            </section>

            <section className="w-fit p-8 flex items-start gap-8">
                <div className="w-100 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Basic Inputs</h3>
                    <Input placeholder="Default input" />
                    <Input placeholder="Disabled input" disabled />
                    <Input placeholder="Required input" required />
                    <Input placeholder="Invalid input" aria-invalid />
                    <Input type="password" placeholder="Password input" />
                    <Input type="email" placeholder="Email input" />
                    <Input type="number" placeholder="Number input" />
                    <Input type="search" placeholder="Search input" />
                </div>

                <div className="w-100 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Special Inputs</h3>
                    <Input type="date" />
                    <Input type="time" />
                    <Input type="datetime-local" />
                    <Input type="color" />
                    <Input type="range" min="0" max="100" defaultValue="50" />
                    <Input type="file" />
                    <Input type="file" multiple />
                </div>

                <div className="w-100 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Textarea Examples</h3>
                    <Textarea placeholder="Default textarea" />
                    <Textarea placeholder="Disabled textarea" disabled />
                    <Textarea placeholder="Required textarea" required />
                    <Textarea placeholder="Invalid textarea" aria-invalid />
                    <Textarea placeholder="Small textarea" rows={3} />
                    <Textarea placeholder="Large textarea" rows={8} />
                </div>
            </section>

            <section className="w-fit p-8 flex items-start gap-8">
                <div className="w-100 p-8 bg-muted-surface shadow flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-write mb-4">Select Examples</h3>

                    <Select placeholder="Choose a fruit">
                        <SelectTrigger>
                            <SelectValue />
                            <SelectTriggerIndicator />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectContentView>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="orange">Orange</SelectItem>
                                <SelectItem value="grape">Grape</SelectItem>
                                <SelectItem value="strawberry">Strawberry</SelectItem>
                            </SelectContentView>
                        </SelectContent>
                    </Select>

                    <Select placeholder="Choose a color" defaultValue="blue">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectContentView>
                                <SelectGroup>
                                    <SelectLabel>Warm Colors</SelectLabel>
                                    <SelectItem value="red">Red</SelectItem>
                                    <SelectItem value="orange">Orange</SelectItem>
                                    <SelectItem value="yellow">Yellow</SelectItem>
                                </SelectGroup>
                                <SelectSeparator />
                                <SelectGroup>
                                    <SelectLabel>Cool Colors</SelectLabel>
                                    <SelectItem value="blue">Blue</SelectItem>
                                    <SelectItem value="green">Green</SelectItem>
                                    <SelectItem value="purple">Purple</SelectItem>
                                </SelectGroup>
                            </SelectContentView>
                        </SelectContent>
                    </Select>

                    <Select placeholder="Choose a size" disabled>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectContentView>
                                <SelectItem value="xs">Extra Small</SelectItem>
                                <SelectItem value="sm">Small</SelectItem>
                                <SelectItem value="md">Medium</SelectItem>
                                <SelectItem value="lg">Large</SelectItem>
                                <SelectItem value="xl">Extra Large</SelectItem>
                            </SelectContentView>
                        </SelectContent>
                    </Select>

                    <Select placeholder="Choose multiple items" form="demo-form" name="items" required>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectContentView>
                                <SelectItem value="item1">
                                    Item One
                                    <SelectItemIndicator />
                                </SelectItem>
                                <SelectItem value="item2">
                                    Item Two
                                    <SelectItemIndicator />
                                </SelectItem>
                                <SelectItem value="item3">
                                    Item Three
                                    <SelectItemIndicator />
                                </SelectItem>
                                <SelectItem value="item4">
                                    Item Four
                                    <SelectItemIndicator />
                                </SelectItem>
                            </SelectContentView>
                        </SelectContent>
                    </Select>
                </div>
            </section>

        </main>
    )
}

export default App
