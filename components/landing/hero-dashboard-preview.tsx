"use client"

import {
    User, Briefcase, GraduationCap, Code,
    FileText, Layout, Settings, Download,
    ChevronRight, Plus, X, Search, Bell,
    Sparkles, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function HeroDashboardPreview() {
    return (
        <div className="relative rounded-xl border border-border/40 bg-background/95 backdrop-blur-sm shadow-2xl overflow-hidden text-left">
            {/* ---------------------------------------------------------------------- */}
            {/* Header Bar */}
            {/* ---------------------------------------------------------------------- */}
            <div className="h-14 border-b border-border/40 bg-muted/20 flex items-center justify-between px-4">
                {/* Left: Window Controls & Title */}
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground ml-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-foreground">Software Engineer Resume</span>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5">Draft</Badge>
                    </div>
                </div>

                {/* Center: Search (Mock) */}
                <div className="hidden md:flex items-center relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground" />
                    <div className="w-full h-8 bg-muted/50 rounded-md border border-border/20 pl-9 text-xs flex items-center text-muted-foreground">
                        Search actions...
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Score: 92</span>
                    </div>
                    <Button size="sm" className="h-8 text-xs gap-1.5 hidden sm:flex">
                        <Download className="w-3.5 h-3.5" />
                        Export PDF
                    </Button>
                    <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="text-xs">JD</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* ---------------------------------------------------------------------- */}
            {/* Main Content Area */}
            {/* ---------------------------------------------------------------------- */}
            <div className="flex h-[500px] md:h-[600px] overflow-hidden">

                {/* Sidebar Navigation */}
                <div className="w-16 md:w-64 border-r border-border/40 bg-muted/10 flex flex-col justify-between py-4">
                    <div className="space-y-1 px-2 md:px-3">
                        <p className="hidden md:block text-xs font-semibold text-muted-foreground mb-3 px-2 uppercase tracking-wider">Builder</p>

                        <NavDirectionItem icon={User} label="Personal Info" active />
                        <NavDirectionItem icon={Briefcase} label="Experience" />
                        <NavDirectionItem icon={GraduationCap} label="Education" />
                        <NavDirectionItem icon={Code} label="Skills" />
                        <NavDirectionItem icon={Layout} label="Projects" />
                    </div>

                    <div className="px-3 md:px-4">
                        <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl hidden md:block">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-primary mb-1">AI Suggestions</h4>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Your summary looks great! Consider adding 2 more metrics to your experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Area (Center) */}
                <div className="flex-1 bg-background p-6 md:p-8 overflow-y-auto scrollbar-hide">
                    <div className="max-w-2xl mx-auto space-y-8">

                        {/* Form Section heading */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Personal Information</h2>
                                <p className="text-sm text-muted-foreground mt-1">Get started with the basics of your resume.</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-muted-foreground">
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup label="First Name" value="John" />
                            <FormGroup label="Last Name" value="Doe" />

                            <FormGroup label="Job Title" value="Senior Frontend Engineer" className="md:col-span-2" />

                            <FormGroup label="Email" value="john.doe@example.com" icon={<span className="text-xs text-muted-foreground">@</span>} />
                            <FormGroup label="Phone" value="+1 (555) 000-0000" />

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Professional Summary</label>
                                <div className="min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm">
                                    Experienced Frontend Engineer with 5+ years of expertise in building scalable web applications using React, Next.js, and TypeScript. Proven track record of optimizing performance and leading cross-functional teams...
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-muted">
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        Fix Grammar
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-muted">
                                        <Plus className="w-3 h-3" />
                                        Expand
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Next Section Teaser */}
                        <div className="pt-8 border-t border-border/50">
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                        <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm">Review Experience</h3>
                                        <p className="text-xs text-muted-foreground">3 positions listed</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Live Preview (Right - Hidden on small, visible on lg) */}
                <div className="hidden lg:block w-[380px] bg-muted/30 border-l border-border/40 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h3>
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <div className="h-2 w-2 rounded-full bg-yellow-400" />
                            <div className="h-2 w-2 rounded-full bg-green-400" />
                        </div>
                    </div>

                    {/* The Paper Resume Mockup */}
                    <div className="w-full aspect-[210/297] bg-white rounded-md shadow-lg border border-border/10 p-5 transform scale-[0.85] origin-top text-[8px] text-gray-800 leading-relaxed overflow-hidden select-none">

                        {/* Resume Header */}
                        <div className="border-b border-gray-100 pb-3 mb-3">
                            <h1 className="text-lg font-bold text-gray-900">John Doe</h1>
                            <p className="text-primary font-medium tracking-wide mb-1">Senior Frontend Engineer</p>
                            <div className="flex gap-2 text-gray-500">
                                <span>john.doe@example.com</span>
                                <span>•</span>
                                <span>San Francisco, CA</span>
                            </div>
                        </div>

                        {/* Resume Body */}
                        <div className="space-y-3">
                            <div>
                                <h2 className="font-bold text-gray-900 uppercase border-b border-gray-100 mb-1.5 pb-0.5">Summary</h2>
                                <p className="text-gray-600">Experienced Frontend Engineer with 5+ years of expertise in building scalable web applications...</p>
                            </div>

                            <div>
                                <h2 className="font-bold text-gray-900 uppercase border-b border-gray-100 mb-1.5 pb-0.5">Experience</h2>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Tech Corp Inc.</span>
                                            <span className="text-gray-500">2021 - Present</span>
                                        </div>
                                        <p className="italic mb-0.5">Senior Developer</p>
                                        <ul className="list-disc list-inside text-gray-600 pl-1 space-y-0.5">
                                            <li>Led migration to Next.js reducing load times by 40%</li>
                                            <li>Mentored junior developers and established code standards</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="flex justify-between font-semibold">
                                            <span>StartupLy</span>
                                            <span className="text-gray-500">2019 - 2021</span>
                                        </div>
                                        <p className="italic mb-0.5">Frontend Developer</p>
                                        <ul className="list-disc list-inside text-gray-600 pl-1 space-y-0.5">
                                            <li>Built MVP from scratch using React</li>
                                            <li>Implemented real-time features using WebSockets</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="font-bold text-gray-900 uppercase border-b border-gray-100 mb-1.5 pb-0.5">Skills</h2>
                                <div className="flex flex-wrap gap-1">
                                    <span className="bg-gray-100 px-1 rounded">React</span>
                                    <span className="bg-gray-100 px-1 rounded">TypeScript</span>
                                    <span className="bg-gray-100 px-1 rounded">Next.js</span>
                                    <span className="bg-gray-100 px-1 rounded">Node.js</span>
                                    <span className="bg-gray-100 px-1 rounded">Tailwind CSS</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

function NavDirectionItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className={`
      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200
      ${active ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}
    `}>
            <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
            <span className="text-sm font-medium hidden md:inline">{label}</span>
            {active && <div className="ml-auto w-1 h-1 rounded-full bg-primary hidden md:block" />}
        </div>
    )
}

function FormGroup({ label, value, icon, className }: { label: string, value: string, icon?: React.ReactNode, className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="relative">
                <div className="h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm ring-offset-background flex items-center text-foreground">
                    {value}
                </div>
                {icon && <div className="absolute right-3 top-2.5">{icon}</div>}
            </div>
        </div>
    )
}
