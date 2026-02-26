import Link from "next/link"
import { ArrowRight, FileText, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    Icon:  Zap,
    title: "60-Second Report",
    desc:  "Upload your electricity bill and diesel invoice. Our AI extracts the data and calculates your carbon footprint instantly.",
  },
  {
    Icon:  Shield,
    title: "CBAM Compliance Check",
    desc:  "Instantly compare your carbon intensity against EU benchmarks for steel, aluminium, cement, and more.",
  },
  {
    Icon:  FileText,
    title: "Download PDF Report",
    desc:  "Get a CBAM-ready compliance report with Scope 1 & 2 breakdown, carbon intensity, and EU benchmark comparison.",
  },
]

const PROBLEM_STATS = [
  { stat: "Full effect",   desc: "EU CBAM January 2026"        },
  { stat: "₹3–10 lakh",   desc: "Consultant fee per year"      },
  { stat: "90%",           desc: "MSMEs lack carbon tools"      },
  { stat: "60 seconds",   desc: "Time to your report"          },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">GL</span>
          </div>
          <span className="font-bold text-gray-900">GreenLedger Lite</span>
        </div>
        <Link href="/calculator">
          <Button size="sm">Start Calculating</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-green-900 text-white py-20 px-6 text-center">
        <p className="text-green-300 text-sm font-semibold uppercase tracking-widest mb-4">
          EU CBAM Compliance Tool for Indian Exporters
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl mx-auto">
          CBAM Carbon Report<br />in 60 Seconds
        </h1>
        <p className="mt-6 text-lg text-green-100 max-w-2xl mx-auto">
          Upload your electricity bill and diesel invoice. Get your Scope 1 &amp; 2 emissions,
          EU CBAM compliance status, and a downloadable PDF report — instantly.
        </p>
        <Link href="/calculator" className="mt-8 inline-block">
          <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 text-base px-8">
            Start Calculating
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="mt-4 text-sm text-green-300">
          No login. No consultant. Free for Indian MSMEs.
        </p>
      </section>

      {/* Problem stats */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {PROBLEM_STATS.map((item) => (
            <div key={item.stat}>
              <p className="text-2xl font-extrabold text-green-700">{item.stat}</p>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Everything an MSME needs for CBAM
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-green-700 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to check your CBAM compliance?</h2>
        <p className="text-green-200 mb-8 max-w-xl mx-auto">
          The consultant quoted ₹4 lakh. This takes 45 seconds and is free.
        </p>
        <Link href="/calculator">
          <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 px-10">
            Calculate My Emissions
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center text-xs text-gray-400">
        <p>
          GreenLedger Lite uses CEA 2022-23 grid factors, IPCC AR6 combustion factors, and GHG Protocol.
          Reports are AI-assisted drafts — verify with a qualified professional before official submission.
        </p>
        <p className="mt-2">Built in 48 hours · Solves a ₹10,000 crore compliance gap.</p>
      </footer>
    </div>
  )
}
