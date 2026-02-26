import Link from "next/link"
import { ArrowRight, Zap, Shield, FileText, BarChart3, MapPin, Factory } from "lucide-react"
import { Button } from "@/components/ui/button"

const PAIN_POINTS = [
  {
    number: "01",
    title: "Complex EU Regulations",
    desc: "The EU CBAM regulation is 200+ pages of technical requirements. Most MSMEs don't have the bandwidth to decode it.",
  },
  {
    number: "02",
    title: "Expensive Consultants",
    desc: "Carbon consultants charge ₹3–10 lakh per year. For small exporters, that's margin-destroying overhead.",
  },
  {
    number: "03",
    title: "No Simple Tools",
    desc: "90% of Indian MSMEs lack access to affordable, self-service carbon calculation tools built for their context.",
  },
]

const STEPS = [
  {
    number: "01",
    title: "Enter Your Data",
    desc: "Input your electricity consumption (kWh), diesel usage (liters), LPG (optional), and production output in tonnes.",
  },
  {
    number: "02",
    title: "Instant Calculation",
    desc: "Scope 1 & Scope 2 emissions computed using India-specific CEA grid factors and IPCC AR6 combustion factors.",
  },
  {
    number: "03",
    title: "Get Your Report",
    desc: "See your compliance status, benchmark comparison, Scope breakdown chart, and download a CBAM-ready PDF report.",
  },
]

const FEATURES = [
  {
    Icon: MapPin,
    title: "India-Specific Emission Factors",
    desc: "State-wise grid emission factors from CEA 2022-23 data for accurate Scope 2 calculations.",
  },
  {
    Icon: Factory,
    title: "5 Industries Covered",
    desc: "Steel, Aluminium, Cement, Textile, and Chemicals — the sectors most impacted by EU CBAM.",
  },
  {
    Icon: Shield,
    title: "EU Benchmark Comparison",
    desc: "Real-time comparison against official EU CBAM industry benchmarks for compliance verification.",
  },
  {
    Icon: BarChart3,
    title: "Visual Breakdown",
    desc: "Interactive donut chart showing Scope 1 vs Scope 2 emission breakdown at a glance.",
  },
  {
    Icon: FileText,
    title: "PDF Report Generation",
    desc: "Download a compliance-ready documentation package suitable for EU CBAM reporting requirements.",
  },
  {
    Icon: Zap,
    title: "100% Free & Private",
    desc: "No login required, no data stored, no tracking. Single-session usage designed for privacy.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ═══════════ STICKY NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lime font-serif text-xl font-semibold tracking-tight">
            GreenLedger
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-white/70 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors">
              About
            </a>
            <a href="#how-it-works" className="text-white/70 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-white/70 text-xs font-bold uppercase tracking-widest hover:text-lime transition-colors">
              Features
            </a>
            <Link href="/calculator">
              <Button variant="outline-dark" size="sm">
                Start Calculating
              </Button>
            </Link>
          </div>
          {/* Mobile CTA */}
          <Link href="/calculator" className="md:hidden">
            <Button variant="outline-dark" size="sm">
              Calculate
            </Button>
          </Link>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="bg-dark-bg bg-grid-pattern text-white py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-6">
            EU CBAM Compliance Tool for Indian Exporters
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tightest mb-8">
            Know Your Carbon.
            <br />
            <span className="text-lime">Own Your Compliance.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            The simplest way for Indian exporters to calculate CBAM emissions, check EU
            compliance, and generate audit-ready reports — in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/calculator">
              <Button variant="lime" size="xl">
                Launch Calculator
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline-dark" size="xl">
                Learn How It Works
              </Button>
            </a>
          </div>
          <p className="mt-6 text-white/30 text-sm">
            No login · No consultant · Free for Indian MSMEs
          </p>
        </div>
      </section>

      {/* ═══════════ PROBLEM STATEMENT ═══════════ */}
      <section id="about" className="bg-cream py-20 md:py-28 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-sage text-xs font-bold uppercase tracking-[0.2em] mb-4">
            The Challenge
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-architectural text-dark-bg mb-16">
            CBAM Is Here.<br />Are You Ready?
          </h2>
          <div className="grid md:grid-cols-3 gap-0">
            {PAIN_POINTS.map((point, i) => (
              <div
                key={point.number}
                className={`py-8 md:py-0 md:px-8 ${
                  i > 0 ? "border-t md:border-t-0 md:border-l border-foreground/10" : ""
                }`}
              >
                <span className="font-serif text-5xl font-light text-sage/60 block mb-4">
                  {point.number}
                </span>
                <h3 className="text-lg font-bold text-dark-bg mb-2 uppercase tracking-wide">
                  {point.title}
                </h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="bg-dark-bg text-white py-20 md:py-28 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-lime text-xs font-bold uppercase tracking-[0.2em] mb-4">
            How It Works
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-architectural text-white mb-16">
            Three Steps to Compliance
          </h2>
          <div className="grid md:grid-cols-3 gap-0">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`py-8 md:py-0 md:px-8 ${
                  i > 0 ? "border-t md:border-t-0 md:border-l border-white/10" : ""
                }`}
              >
                <span className="font-serif text-6xl md:text-7xl font-light text-lime/30 block mb-4">
                  {step.number}
                </span>
                <h3 className="text-lg font-bold uppercase tracking-wide mb-3">
                  {step.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ KEY FEATURES ═══════════ */}
      <section id="features" className="bg-cream py-20 md:py-28 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto">
          <p className="text-sage text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Features
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-architectural text-dark-bg mb-16">
            Built for Indian Exporters
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0">
            {FEATURES.map(({ Icon, title, desc }, i) => (
              <div
                key={title}
                className="p-8 border border-foreground/8 hover:bg-sage/10 transition-colors group"
              >
                <div className="h-10 w-10 border border-foreground/20 flex items-center justify-center mb-5 group-hover:border-lime group-hover:bg-lime/10 transition-colors">
                  <Icon className="h-5 w-5 text-foreground/60 group-hover:text-lime transition-colors" />
                </div>
                <h3 className="font-bold text-dark-bg mb-2 uppercase tracking-wide text-sm">
                  {title}
                </h3>
                <p className="text-foreground/50 text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      <section className="bg-sage py-20 md:py-28 px-6 border-t border-foreground/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-architectural text-dark-bg mb-8">
            Start Your CBAM
            <br />
            Compliance Check
          </h2>
          <p className="text-dark-bg/60 text-base max-w-xl mx-auto mb-10">
            The consultant quoted ₹4 lakh. This takes 60 seconds and is free.
          </p>
          <Link href="/calculator">
            <Button variant="default" size="xl" className="bg-dark-bg text-white border-dark-bg hover:bg-lime hover:text-dark-bg">
              Open Calculator
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-dark-bg text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
          <div>
            <span className="text-lime font-serif text-lg font-semibold">GreenLedger Lite</span>
            <p className="text-white/30 text-xs mt-2 leading-relaxed">
              CBAM Carbon Calculator for Indian MSMEs.
              <br />
              Uses CEA 2022-23, IPCC AR6, GHG Protocol.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="space-y-2">
              <a href="#about" className="block text-white/50 text-xs uppercase tracking-widest hover:text-lime transition-colors">About</a>
              <a href="#how-it-works" className="block text-white/50 text-xs uppercase tracking-widest hover:text-lime transition-colors">How It Works</a>
              <a href="#features" className="block text-white/50 text-xs uppercase tracking-widest hover:text-lime transition-colors">Features</a>
            </div>
            <div className="space-y-2">
              <Link href="/calculator" className="block text-white/50 text-xs uppercase tracking-widest hover:text-lime transition-colors">Calculator</Link>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs uppercase tracking-widest">
              Made for Indian MSMEs 🇮🇳
            </p>
          </div>
        </div>
        {/* Neon lime copyright bar */}
        <div className="bg-lime px-6 py-3">
          <p className="text-dark-bg text-xs font-semibold text-center tracking-wide">
            © 2025 GreenLedger Lite. All rights reserved. Reports are AI-assisted drafts — verify with a qualified professional.
          </p>
        </div>
      </footer>
    </div>
  )
}
