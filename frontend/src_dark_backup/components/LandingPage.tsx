import { useEffect, useState } from "react";
import { ArrowRight, Users, Database, LayoutDashboard } from "lucide-react";

interface LandingPageProps {
  step: "intro" | "selection";
  setStep: (step: "intro" | "selection") => void;
  onLaunch: (module?: "cohort" | "doctors") => void;
}

export default function LandingPage({ step, setStep, onLaunch }: LandingPageProps) {

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.add('show'); 
        } 
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
    
    return () => io.disconnect();
  }, [step]);

  return (
    <div className="bg-[var(--ink)] text-[var(--bone)] font-sans overflow-x-hidden relative min-h-screen">
      <div className="grain"></div>
      <div className="scanline"></div>

      <nav className="nav">
        <div className="brand cursor-pointer" onClick={() => setStep("intro")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--signal)' }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            <path d="M3.5 12h4l1.5-3 2 6 1.5-4h8"/>
          </svg>
          <span>Mirror<span className="co">Med</span></span>
        </div>
        {step === "intro" && (
          <>
            <div className="navlinks">
              <a href="#about">About</a>
              <a href="#monitors">Patient groups</a>
              <a href="#directory">Specialists</a>
              <a href="#pipeline">Pipeline</a>
            </div>
            <button onClick={() => setStep("selection")} className="navcta border-none cursor-pointer">Launch platform</button>
          </>
        )}
      </nav>

      {step === "intro" ? (
        <>
          <section className="hero">
            <div className="eyebrow"><span className="dot"></span> SYNTHETIC CLINICAL INTELLIGENCE — LIVE ENGINE</div>
            <h1>
              <span className="line1">Welcome to</span>
              <span className="line2">MirrorMed</span>
            </h1>

            <div className="ecg-wrap">
              <svg viewBox="0 0 700 100" preserveAspectRatio="none">
                <path className="ecg-line" d="M0,50 L90,50 L110,50 L122,15 L136,85 L150,50 L175,50 L190,30 L200,68 L212,50 L260,50 L280,50 L292,15 L306,85 L320,50 L345,50 L360,30 L370,68 L382,50 L430,50 L450,50 L462,15 L476,85 L490,50 L515,50 L530,30 L540,68 L552,50 L600,50 L620,50 L632,15 L646,85 L660,50 L700,50"/>
                <circle className="ecg-dot" r="5" fill="#3EE8C4" style={{ filter: 'drop-shadow(0 0 6px #3EE8C4)', offsetPath: "path('M0,50 L90,50 L110,50 L122,15 L136,85 L150,50 L175,50 L190,30 L200,68 L212,50 L260,50 L280,50 L292,15 L306,85 L320,50 L345,50 L360,30 L370,68 L382,50 L430,50 L450,50 L462,15 L476,85 L490,50 L515,50 L530,30 L540,68 L552,50 L600,50 L620,50 L632,15 L646,85 L660,50 L700,50')" }}/>
              </svg>
            </div>

            <p className="sub">The next-generation enterprise platform for generating realistic clinical data — complete with synthetic patient groups, specialist directories, and intelligent AI-ready datasets, all built for teams who can't touch real PHI.</p>

            <div className="hero-ctas">
              <button onClick={() => setStep("selection")} className="btn-primary cursor-pointer border-none">Launch platform →</button>
            </div>

            <div className="stat-strip">
              <div className="stat"><div className="n">1,000</div><div className="l">Max patients per run</div></div>
              <div className="stat"><div className="n">150+</div><div className="l">Specialist archetypes</div></div>
              <div className="stat"><div className="n">100+</div><div className="l">Dataset schemas</div></div>
              <div className="stat"><div className="n">0</div><div className="l">Real PHI touched</div></div>
            </div>
          </section>

          <section id="about" className="lp-section">
            <div className="section-head fade-in">
              <div className="kicker">The mirror principle</div>
              <h2>One engine, two reflections of a hospital that never existed</h2>
              <p>MirrorMed doesn't generate rows in a spreadsheet — it generates a population and the people who treat it, and shows you the shape of both before you commit to either.</p>
            </div>

            <div className="mirrors fade-in">
              <div 
                className="mirror-card cursor-pointer hover:border-[var(--signal)] transition-colors"
                onClick={() => onLaunch("cohort")}
              >
                <div className="mirror-top">
                  <div className="mirror-ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg></div>
                  <div className="mirror-tag">Reflection 01</div>
                </div>
                <h3>Patient Explorer</h3>
                <p>Describe a cohort in plain language and get back a population with internally consistent vitals, histories, and trajectories — browsable, filterable, exportable.</p>

                <div className="mirror-graph">
                  <div className="mg-bars">
                    <i style={{height:'18%'}}></i><i style={{height:'34%'}}></i><i style={{height:'88%'}}></i><i style={{height:'88%'}}></i><i style={{height:'60%'}}></i><i style={{height:'22%'}}></i>
                  </div>
                  <div className="mg-stat"><b>34,900</b><span>Patients last run</span></div>
                </div>

                <button className="mirror-cta border-none bg-transparent flex items-center pointer-events-none">See a live cohort <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></button>
              </div>

              <div 
                className="mirror-card cursor-pointer hover:border-[var(--signal)] transition-colors"
                onClick={() => onLaunch("doctors")}
              >
                <div className="mirror-top">
                  <div className="mirror-ico"><svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/><path d="M17 3.5a4 4 0 0 1 0 7.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg></div>
                  <div className="mirror-tag">Reflection 02</div>
                </div>
                <h3>Doctors Directory</h3>
                <p>Populate the other side of the chart: a referral network of specialists with credentials, caseloads, and referral behavior that actually correlates with the cohort.</p>

                <div className="mirror-donut">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="27" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                    <circle cx="36" cy="36" r="27" fill="none" stroke="#3EE8C4" strokeWidth="10" strokeDasharray="110 170" transform="rotate(-90 36 36)" strokeLinecap="round" style={{filter:'drop-shadow(0 0 4px rgba(62,232,196,0.6))'}}/>
                    <circle cx="36" cy="36" r="27" fill="none" stroke="#1B8F76" strokeWidth="10" strokeDasharray="60 170" strokeDashoffset="-110" transform="rotate(-90 36 36)" strokeLinecap="round"/>
                  </svg>
                  <div className="legend">
                    <div className="legend-item"><span className="sw" style={{background:'#3EE8C4'}}></span>65% referral-active</div>
                    <div className="legend-item"><span className="sw" style={{background:'#1B8F76'}}></span>35% consult-only</div>
                  </div>
                </div>

                <button className="mirror-cta border-none bg-transparent flex items-center pointer-events-none">Meet the specialists <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg></button>
              </div>
            </div>
          </section>

          <section id="monitors" className="lp-section">
            <div className="section-head fade-in">
              <div className="kicker">Patient groups</div>
              <h2>Cohorts that behave like real populations, because the maths does</h2>
              <p>Every generated patient carries internally consistent vitals, histories, and trajectories — not random noise wearing a hospital gown.</p>
            </div>

            <div className="monitors fade-in">
              <div className="monitor">
                <div className="monitor-top">
                  <div className="monitor-id">COHORT / CARDIO-042</div>
                  <div className="monitor-badge badge-stable">Stable</div>
                </div>
                <div className="monitor-name">Post-MI recovery, 60–75</div>
                <div className="monitor-meta">n = 12,400 · generated in 4.2s</div>
                <div className="vitals-row">
                  <div className="vital"><span className="v-num">72</span><span className="v-unit">bpm</span><span className="v-label">Heart rate</span></div>
                  <div className="vital"><span className="v-num">128/82</span><span className="v-unit">mmHg</span><span className="v-label">Blood pressure</span></div>
                  <div className="vital"><span className="v-num">97</span><span className="v-unit">%</span><span className="v-label">SpO₂</span></div>
                </div>
                <svg className="mini-ecg" viewBox="0 0 300 34" preserveAspectRatio="none"><path d="M0,17 L40,17 L48,6 L54,28 L60,17 L100,17 L108,10 L116,24 L124,17 L160,17 L168,6 L174,28 L180,17 L220,17 L228,10 L236,24 L244,17 L300,17"/></svg>
              </div>

              <div className="monitor">
                <div className="monitor-top">
                  <div className="monitor-id">COHORT / ENDO-118</div>
                  <div className="monitor-badge badge-watch">Trending</div>
                </div>
                <div className="monitor-name">Type 2 diabetes, adult onset</div>
                <div className="monitor-meta">n = 34,900 · generated in 6.8s</div>
                <div className="vitals-row">
                  <div className="vital"><span className="v-num">142</span><span className="v-unit">mg/dL</span><span className="v-label">Glucose</span></div>
                  <div className="vital"><span className="v-num">7.1</span><span className="v-unit">%</span><span className="v-label">HbA1c</span></div>
                  <div className="vital"><span className="v-num">29.4</span><span className="v-unit">kg/m²</span><span className="v-label">BMI</span></div>
                </div>
                <svg className="mini-ecg" viewBox="0 0 300 34" preserveAspectRatio="none"><path d="M0,20 L40,20 L48,12 L54,26 L60,20 L100,20 L108,15 L116,25 L124,20 L160,20 L168,12 L174,26 L180,20 L220,20 L228,15 L236,25 L244,20 L300,20"/></svg>
              </div>

              <div className="monitor">
                <div className="monitor-top">
                  <div className="monitor-id">COHORT / NEO-007</div>
                  <div className="monitor-badge badge-critical">Acute</div>
                </div>
                <div className="monitor-name">NICU, preterm 28–32wk</div>
                <div className="monitor-meta">n = 3,120 · generated in 5.1s</div>
                <div className="vitals-row">
                  <div className="vital"><span className="v-num">148</span><span className="v-unit">bpm</span><span className="v-label">Heart rate</span></div>
                  <div className="vital"><span className="v-num">92</span><span className="v-unit">%</span><span className="v-label">SpO₂</span></div>
                  <div className="vital"><span className="v-num">36.4</span><span className="v-unit">°C</span><span className="v-label">Temp</span></div>
                </div>
                <svg className="mini-ecg" viewBox="0 0 300 34" preserveAspectRatio="none"><path d="M0,17 L30,17 L35,4 L39,30 L43,17 L73,17 L78,4 L82,30 L86,17 L116,17 L121,4 L125,30 L129,17 L159,17 L164,4 L168,30 L172,17 L202,17 L207,4 L211,30 L215,17 L245,17 L250,4 L254,30 L258,17 L300,17"/></svg>
              </div>
            </div>
          </section>

          <section id="directory" className="lp-section">
            <div className="section-head fade-in">
              <div className="kicker">Specialist directories</div>
              <h2>A whole referral network that never existed, until you asked for it</h2>
              <p>Populate any care pathway with realistic specialist profiles — credentials, availability, and referral patterns included.</p>
            </div>

            <div className="directory fade-in">
              <div className="spec-card">
                <div className="spec-avatar">AK</div>
                <h3>Dr. Anaya Kapoor</h3>
                <div className="spec-field">Interventional cardiology</div>
                <div className="spec-desc">14 yrs experience · fellowship-trained · high-volume PCI practice, synthetic referral graph included.</div>
                <div className="spec-stats"><div>Cases/mo<b>210</b></div><div>Referral rate<b>62%</b></div></div>
              </div>
              <div className="spec-card">
                <div className="spec-avatar">RM</div>
                <h3>Dr. Rohan Mehta</h3>
                <div className="spec-field">Pediatric endocrinology</div>
                <div className="spec-desc">Runs a synthetic panel skewed toward Type 1 onset in ages 6–12, with seasonal referral variance.</div>
                <div className="spec-stats"><div>Cases/mo<b>96</b></div><div>Referral rate<b>48%</b></div></div>
              </div>
              <div className="spec-card">
                <div className="spec-avatar">LS</div>
                <h3>Dr. Lena Suárez</h3>
                <div className="spec-field">Neonatal intensive care</div>
                <div className="spec-desc">Modeled on tertiary NICU staffing patterns, including night-shift acuity spikes.</div>
                <div className="spec-stats"><div>Cases/mo<b>58</b></div><div>Referral rate<b>91%</b></div></div>
              </div>
              <div className="spec-card">
                <div className="spec-avatar">TO</div>
                <h3>Dr. Tomás Okafor</h3>
                <div className="spec-field">Oncology, general</div>
                <div className="spec-desc">Longitudinal treatment-response curves generated across 40+ tumor subtypes.</div>
                <div className="spec-stats"><div>Cases/mo<b>134</b></div><div>Referral rate<b>55%</b></div></div>
              </div>
            </div>
          </section>

          <section id="pipeline" className="lp-section">
            <div className="section-head fade-in">
              <div className="kicker">How it flows</div>
              <h2>From a plain-English brief to a schema-validated dataset</h2>
              <p>Four stages, fully auditable, zero manual chart review.</p>
            </div>

            <div className="pipeline fade-in">
              <div className="pstep">
                <h4>Define the cohort</h4>
                <p>Describe the population in plain language — condition, age band, acuity, comorbidities.</p>
                <div className="pstep-arrow">→</div>
              </div>
              <div className="pstep">
                <h4>Generate vitals & history</h4>
                <p>The engine builds internally consistent labs, vitals, and longitudinal notes per patient.</p>
                <div className="pstep-arrow">→</div>
              </div>
              <div className="pstep">
                <h4>Validate against schema</h4>
                <p>Every record is checked against clinical plausibility rules and your target data model.</p>
                <div className="pstep-arrow">→</div>
              </div>
              <div className="pstep">
                <h4>Export & integrate</h4>
                <p>Ship as FHIR, CSV, or straight into your training pipeline via API.</p>
              </div>
            </div>
          </section>

          <footer>
            <div>© 2026 MirrorMed Labs · Synthetic data, real velocity</div>
            <div>NO PHI · SOC2 TYPE II · HIPAA-ALIGNED BY DESIGN</div>
          </footer>
        </>
      ) : (
        <section className="flex flex-col items-center justify-center text-center max-w-5xl w-full z-10 p-8 mx-auto mt-20 fade-in show" style={{ minHeight: "70vh" }}>
          <h2 className="text-4xl font-bold font-[Space_Grotesk] mb-4 text-white">Select your environment</h2>
          <p className="text-[var(--slate)] mb-12 text-lg font-light">Choose which synthetic module you want to access first.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <button 
              onClick={() => onLaunch("cohort")}
              className="group text-left p-8 bg-[var(--panel)] border border-[var(--line-strong)] hover:border-[var(--signal)] rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(62,232,196,0.1)] hover:-translate-y-2 relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(62,232,196,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-[var(--panel-2)] p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-6 text-[var(--signal)] border border-[var(--line-strong)]">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-[Space_Grotesk] font-bold mb-3 text-[var(--bone)]">Patient Explorer</h3>
              <p className="text-[var(--slate)] text-sm flex-1 leading-relaxed">
                Generate and explore synthetic patient cohorts with internally consistent vitals, labs, and clinical histories.
              </p>
              <div className="mt-6 flex items-center text-[var(--signal)] text-xs font-mono tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Enter module <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => onLaunch("doctors")}
              className="group text-left p-8 bg-[var(--panel)] border border-[var(--line-strong)] hover:border-[var(--signal)] rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(62,232,196,0.1)] hover:-translate-y-2 relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(62,232,196,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="bg-[var(--panel-2)] p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-6 text-[var(--signal)] border border-[var(--line-strong)]">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-[Space_Grotesk] font-bold mb-3 text-[var(--bone)]">Doctors Directory</h3>
              <p className="text-[var(--slate)] text-sm flex-1 leading-relaxed">
                Populate care pathways with realistic specialist profiles, including referral networks and clinical credentials.
              </p>
              <div className="mt-6 flex items-center text-[var(--signal)] text-xs font-mono tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Enter module <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
          
          <button 
            onClick={() => setStep("intro")}
            className="mt-12 text-[var(--slate)] hover:text-[var(--bone)] transition-colors text-sm font-mono cursor-pointer bg-transparent border-none"
          >
            ← Back
          </button>
        </section>
      )}
    </div>
  );
}
