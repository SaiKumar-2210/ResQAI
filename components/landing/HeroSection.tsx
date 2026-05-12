"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radio, ShieldAlert, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-70" />
      <div className="absolute inset-0">
        <div className="absolute left-[8%] top-[18%] h-32 w-32 rounded-full border border-teal-300/35 animate-pulseRing" />
        <div className="absolute right-[12%] top-[24%] h-40 w-40 rounded-full border border-sky-300/30 animate-pulseRing" />
        <div className="absolute bottom-[18%] left-[26%] h-28 w-28 rounded-full border border-red-300/25 animate-pulseRing" />
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-sm text-teal-100">
            <ShieldAlert className="h-4 w-4" />
            Gemma-powered emergency decision support
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            ResQAI
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A multimodal disaster survival assistant that analyzes field images, prioritizes
            risk, streams guidance, and helps families prepare when connectivity is unreliable.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Launch Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard#image-analysis">
                Try Image Triage <UploadCloud className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative min-h-[460px]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Radio className="h-4 w-4 text-teal-300" />
                Resilience Grid
              </div>
              <span className="rounded-md bg-teal-400/10 px-2 py-1 text-xs text-teal-200">
                Live triage
              </span>
            </div>
            <div className="relative h-[406px] overflow-hidden rounded-b-lg bg-[linear-gradient(135deg,#0f172a,#0b2f33_45%,#301313)]">
              <div className="absolute left-8 top-10 h-20 w-52 rounded-md border border-white/10 bg-slate-900/75" />
              <div className="absolute right-10 top-16 h-24 w-44 rounded-md border border-white/10 bg-slate-900/75" />
              <div className="absolute bottom-12 left-12 h-28 w-64 rounded-md border border-white/10 bg-slate-900/75" />
              <div className="absolute bottom-20 right-12 h-20 w-56 rounded-md border border-red-400/30 bg-red-950/50" />
              <div className="absolute left-[46%] top-[42%] h-5 w-5 rounded-full bg-red-400 shadow-[0_0_28px_rgba(248,113,113,0.9)]" />
              <div className="absolute left-[27%] top-[60%] h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.8)]" />
              <div className="absolute right-[24%] top-[36%] h-4 w-4 rounded-full bg-teal-300 shadow-[0_0_24px_rgba(94,234,212,0.8)]" />
              <div className="absolute left-0 right-0 top-[56%] h-28 rotate-[-8deg] bg-sky-500/20" />
              <div className="absolute bottom-6 left-6 right-6 rounded-md border border-white/10 bg-slate-950/82 p-4">
                <p className="text-xs uppercase tracking-widest text-teal-200">Gemma 4 analysis</p>
                <p className="mt-2 text-sm text-slate-200">
                  Danger HIGH · Confidence 0.82 · Evacuation recommended
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
