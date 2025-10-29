// App.jsx
import React, { useEffect, useRef, useState } from 'react'
import image from './assets/picture.png'
import verifiedIcon from './assets/verified.png'
import fakeIcon from './assets/fake.png'

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

const SAMPLE_FACTS = [
  {
    keywords: ['covid vaccines cause microchips', 'vaccine microchip'],
    verdict: 'fake',
    headline: 'Claim: COVID-19 vaccines implant microchips',
    summary:
      'Scientific consensus confirms COVID-19 vaccines do not contain microchips; this claim is false.',
  },
  {
    keywords: ['moon landing', 'apollo 11 mission'],
    verdict: 'verified',
    headline: 'Claim: Apollo 11 moon landing happened',
    summary:
      'Independent telemetry, footage, and eyewitness reports verify the Apollo 11 moon landing as true.',
  },
  {
    keywords: ['climate change hoax', 'climate change is a hoax'],
    verdict: 'fake',
    headline: 'Claim: Climate change is a hoax',
    summary:
      'Over 97% of climate scientists agree that climate change is real and driven by human activity.',
  },
]

function FinalResultCard({ headline, summary, verdict }) {
  const isVerified = verdict === 'verified'
  return (
    <div className="w-full">
      {/* Badge */}
      <div className="flex justify-center mb-4">
        <div
          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}
        >
          {isVerified ? 'Real Claim' : 'Fake Claim'}
        </div>
      </div>

      {/* Media card */}
      <div className="mx-auto w-full max-w-xl rounded-lg bg-white dark:bg-slate-900 shadow-lg p-6 relative">
        <div className="bg-white dark:bg-slate-900 rounded-md p-6 flex items-center justify-center">
          {/* Decorative inner card with subtle right-bottom drop shadow */}
          <div className="w-full max-w-md h-48 bg-white dark:bg-slate-800 rounded-md flex items-center justify-center relative"
               style={{ boxShadow: '8px 8px 0 rgba(0,0,0,0.08)' }}
          >
            {/* centered icon (verified vs fake) */}
            <img
              src={isVerified ? verifiedIcon : fakeIcon}
              alt={isVerified ? 'Verified' : 'Fake'}
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Summary row (with small toggle / dot under image, optional) */}
        <div className="flex items-center justify-center mt-4">
          <div className="h-2 w-8 rounded-full mr-2"></div>
          <div
            className={`h-2 w-4 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-rose-500'}`}
          />
        </div>

        {/* Text */}
        <div className="mt-6 flex items-start gap-3">
          {/* check icon */}
          <div className="mt-1">
            {isVerified ? (
              <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          <div>
            {headline && <div className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-1">{headline}</div>}
            <div className="text-sm text-gray-700 dark:text-slate-200">{summary}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([]) // chat messages (both user + backend steps)
  const [isDark, setIsDark] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [aboutTab, setAboutTab] = useState('about')
  const idRef = useRef(1)
  const scrollRef = useRef(null)
  const hasDraft = query.trim().length > 0

  useEffect(() => {
    // initial backend message (optional)
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('(backend not reachable)'))
  }, [])

  // initialize theme from storage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setIsDark(initial === 'dark')
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  // apply theme on change
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // ensure scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, hasDraft])

  const backendStepsFor = (q) => [
    `Let's see what we find about: "${q}"`,
    'Checking Google for more info 🔎',
    'Evidence gathered! 📄',
    'Forwarding data to Gemini for reasoning ✨',
  ]

  const send = async (e) => {
    if (e) e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    // add user bubble
    const userId = idRef.current++
    setMessages((m) => [
      ...m,
      { id: userId, role: 'user', text: trimmed, time: Date.now() },
    ])

    setQuery('')

    const steps = backendStepsFor(trimmed)

    const normalized = trimmed.toLowerCase()
    const match = SAMPLE_FACTS.find((item) =>
      item.keywords.some((keyword) => normalized.includes(keyword))
    )
    const verdict = match?.verdict ?? 'unknown'
    const summary =
      match?.summary ??
      `Result: no matching fact-check found for "${trimmed}". We'll keep investigating.`
    const headline = match?.headline

    // single placeholder for the assistant step
    const stepId = idRef.current++
    setMessages((m) => [
      ...m,
      { id: stepId, role: 'assistant', text: '', loading: true },
    ])

    for (let i = 0; i < steps.length; i++) {
      await sleep(900 + Math.random() * 700) // wait before showing the next step
      const currentStep = steps[i]

      // update same message instead of stacking
      setMessages((m) =>
        m.map((msg) =>
          msg.id === stepId
            ? { ...msg, text: currentStep, loading: i === steps.length - 1 ? false : true }
            : msg
        )
      )
    }

    // after all steps, add final result (rendered as card)
    const finalId = idRef.current++
    setMessages((m) => [
      ...m.filter((msg) => msg.id !== stepId),
      {
        id: finalId,
        role: 'assistant',
        text: summary,
        loading: false,
        final: true,
        verdict,
        headline,
      },
    ])
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-screen-4xl mx-auto relative px-4 sm:px-6 lg:px-8 py-12 lg:pr-[520px]">
        {/* Main Screen */}
        <main className="w-full flex flex-col min-h-[70vh]">
          <div className="flex-1">
            {messages.length === 0 ? (
              // Hero view when no chat yet
              <div className="flex flex-col items-center text-center gap-8 py-16 sm:py-20">
                <div className="w-full max-w-2xl lg:max-w-4xl mx-auto">
                  <div className="mx-auto rounded-2xl p-10 flex items-center justify-center bg-white/0">
                    <div className="w-full h-64 flex items-center justify-center">
                      <img src={image} alt="Image" className="w-full h-full max-h-64 object-contain" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white max-w-3xl">
                  Your go-to tool for verifying facts and exposing fake news.
                </h1>

                <div className="w-full max-w-3xl">
                  <p className="mt-4 text-sm text-gray-500 sm:text-base">Disclaimer here (if needed) lorem ipsum lorem ipsum</p>

                  <div className="mt-6 text-sm text-gray-600">
                    <strong>Backend:</strong> {message || <span className="text-gray-400">(no message yet)</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="space-y-6 max-h-[65vh] overflow-y-auto pr-4 mx-auto w-full max-w-3xl lg:max-w-5xl"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* assistant avatar */}
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center text-sm font-medium">
                        A
                      </div>
                    )}

                    <div className={`rounded-xl p-4 shadow-md max-w-[70%] ${
                      m.role === 'user'
                        ? 'bg-purple-500 text-white rounded-br-none'
                        : 'bg-white text-gray-700 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}>
                      {/* if final result -> show the result card */}
                      {m.final ? (
                        <FinalResultCard headline={m.headline} summary={m.text} verdict={m.verdict} />
                      ) : (
                        <>
                          <div>{m.text}</div>
                          {m.loading && <div className="mt-2"><div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" /></div>}
                        </>
                      )}
                    </div>

                    {/* user avatar */}
                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* draft preview while typing */}
                {hasDraft && (
                  <div key="draft" className="flex items-start gap-4 justify-end">
                    <div className="rounded-xl p-4 shadow-md max-w-[70%] bg-purple-500/80 text-white rounded-br-none">
                      {query}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-medium">
                      U
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8">
            <form onSubmit={send} className="max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Not sure if it's true? Type it here..."
                  className="w-full pl-5 pr-12 py-4 rounded-xl bg-white dark:bg-slate-900 shadow-lg placeholder-gray-400 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600/60 border border-transparent dark:border-slate-700"
                />

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-500 to-violet-600 p-2.5 sm:p-3 rounded-lg shadow-md transition-transform duration-150 hover:scale-105"
                  aria-label="submit-search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Right sidebar (fixed) */}
        <aside className="hidden lg:flex flex-col fixed top-0 right-0 h-screen w-[500px] border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Top 5 Lorem Ipsum</h3>
            </div>
            {/* replaced "see all" with info icon */}
            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Open information modal"
              title="About"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                <h4 className="text-lg font-medium">Top 5 Lorem Ipsum</h4>
                <p className="mt-1 text-sm text-gray-400 line-clamp-3">a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years...</p>
                <div className="mt-2 text-xs text-gray-300">2 days ago • Author</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Floating theme toggle (bottom-right) */}
        <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6">
          <button
            onClick={() => setIsDark((v) => !v)}
            className="p-3 sm:p-4 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
            aria-pressed={isDark}
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              // Sun icon (light theme target)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v2m0 12v2m8-8h2M2 12H4m13.657-6.343l1.414 1.414M4.929 19.071l1.414-1.414m0-10.314L4.93 5.657M19.071 19.07l-1.414-1.414" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            ) : (
              // Moon icon (dark theme target)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/40 dark:bg-black/60"
              onClick={() => setShowInfo(false)}
            />
            {/* dialog */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                role="dialog"
                aria-modal="true"
                className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl"
              >
                {/* header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-100">About JuanSource</h2>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                    aria-label="Close modal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* tabs */}
                <div className="px-6 pt-4">
                  <div className="flex items-center justify-center">
                    <div className="inline-flex p-1 rounded-full bg-gray-100 dark:bg-slate-800/80">
                      <button
                        onClick={() => setAboutTab('about')}
                        className={`px-4 py-1.5 text-sm rounded-full transition ${
                          aboutTab === 'about'
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow'
                            : 'text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100'
                        }`}
                      >
                        About Us
                      </button>
                      <button
                        onClick={() => setAboutTab('how')}
                        className={`px-4 py-1.5 text-sm rounded-full transition ${
                          aboutTab === 'how'
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow'
                            : 'text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100'
                        }`}
                      >
                        How to Use
                      </button>
                    </div>
                  </div>

                  {/* body */}
                  <div className="px-2 sm:px-6 py-6 text-sm text-gray-700 dark:text-slate-200">
                    {/* logo row */}
                    <div className="flex items-center justify-center my-6">
                      <div className="text-3xl font-extrabold tracking-widest text-gray-800 dark:text-slate-100">LOGO</div>
                    </div>

                    {aboutTab === 'about' ? (
                      <div className="space-y-3">
                        <p>
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the
                          industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of
                          type and scrambled it to make a type specimen book.
                        </p>
                        <p>
                          It survived not only five centuries, but also the leap into electronic typesetting, remaining
                          essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
                          containing Lorem Ipsum passages.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <ol className="list-decimal pl-5 space-y-2">
                          <li>Type a claim in the input box and press Enter.</li>
                          <li>We gather public evidence and analyze it.</li>
                          <li>View the final verdict with a Verified or Fake badge.</li>
                          <li>Use the sidebar to explore trending items.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
