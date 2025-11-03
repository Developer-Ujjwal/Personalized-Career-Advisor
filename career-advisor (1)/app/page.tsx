"use client"; 

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// This is the main component for your homepage
const Home: React.FC = () => {
    // State for managing the mobile menu's visibility
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    
    // State to track the currently active section for scroll-spy
    const [activeSection, setActiveSection] = useState<string>('');
    
    // State to track authentication status
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Effect for handling the scroll-spy logic and checking authentication
    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        setIsAuthenticated(!!token);
        
        // Find all sections that have an 'id'
        const sections = document.querySelectorAll('section[id]') as NodeListOf<HTMLElement>;
        
        const handleScroll = () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // Check if scroll position is past the section top (with a 100px offset)
                if (window.pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id') || '';
                }
            });
            setActiveSection(current);
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    // Helper function to create the 'active' class string conditionally
    const getNavLinkClass = (hash: string) => {
        return `nav-link text-gray-600 hover:text-blue-600 transition-colors ${activeSection === hash ? 'active' : ''}`;
    };

    const getMobileNavLinkClass = (hash: string) => {
        return `block nav-link text-gray-600 hover:text-blue-600 ${activeSection === hash ? 'active' : ''}`;
    };

    return (
        <>
            {/*
              Global styles like 'Inter' font should be in your layout.tsx or globals.css
              This <style> tag is just for component-specific logic (the active link).
            */}
            <style>{`
                /* Simple scroll-spy highlighting */
                .nav-link.active {
                    color: #3b82f6; /* blue-500 */
                    font-weight: 600;
                }
            `}</style>

            {/*
              The <html> and <body> tags are handled by Next.js in layout.tsx.
              This component just returns the page content.
            */}
            <div className="bg-white text-gray-800 antialiased">
                {/* Header */}
                <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <nav className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img src="/placeholder-logo.svg" alt="CareerPath Logo" className="h-8 sm:h-10 w-auto" />
                            <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-800">CareerPath</span>
                        </div>
                        <div className="hidden md:flex space-x-4 lg:space-x-8 items-center">
                            <a href="#problem" className={getNavLinkClass('problem')}>The Problem</a>
                            <a href="#science" className={getNavLinkClass('science')}>Our Science</a>
                            <a href="#how" className={getNavLinkClass('how')}>How It Works</a>
                            <a href="#ethics" className={getNavLinkClass('ethics')}>Our Ethics</a>
                            {isAuthenticated ? (
                                <Link href="/personality-entry" className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-shadow shadow-md text-sm sm:text-base">
                                    Start Free Assessment
                                </Link>
                            ) : (
                                <Link href="/auth?callbackUrl=/personality-entry" className="bg-blue-600 text-white px-3 sm:px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-shadow shadow-md text-sm sm:text-base">
                                    Start Free Assessment
                                </Link>
                            )}
                        </div>
                        {/* Mobile Menu Button */}
                        <button 
                            id="mobile-menu-btn" 
                            className="md:hidden text-gray-700"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggle state on click
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </nav>
                    {/* Mobile Menu - visibility controlled by state */}
                    <div id="mobile-menu" className={`${isMobileMenuOpen ? '' : 'hidden'} md:hidden px-4 sm:px-6 pb-4 space-y-2 mt-2`}>
                        <a href="#problem" className={getMobileNavLinkClass('problem')}>The Problem</a>
                        <a href="#science" className={getMobileNavLinkClass('science')}>Our Science</a>
                        <a href="#how" className={getMobileNavLinkClass('how')}>How It Works</a>
                        <a href="#ethics" className={getMobileNavLinkClass('ethics')}>Our Ethics</a>
                        {isAuthenticated ? (
                            <Link href="/personality-entry" className="block bg-blue-600 text-white text-center px-5 py-2 rounded-full font-medium hover:bg-blue-700 mt-2">
                                Start Free Assessment
                            </Link>
                        ) : (
                            <Link href="/auth?callbackUrl=/personality-entry" className="block bg-blue-600 text-white text-center px-5 py-2 rounded-full font-medium hover:bg-blue-700 mt-2">
                                Start Free Assessment
                            </Link>
                        )}
                    </div>
                </div>
            </header>

                <main>
                    {/* 1. Hero Section */}
                    <section id="hero" className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-32">
                        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                            {/* Hero Text Content */}
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight tracking-tight text-gray-900">
                                    Career Guidance Built on <span className="text-blue-600">Science</span>, Not Pseudoscience.
                                </h1>
                                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0">
                                    Project Synapse is India's first AI-powered career advisor built on the scientifically validated HEXACO and RIASEC models. Stop guessing, start planning.
                                </p>
                                {isAuthenticated ? (
                                    <Link href="/personality-entry" className="mt-6 sm:mt-10 inline-block bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                        Start Your Free Assessment
                                    </Link>
                                ) : (
                                    <Link href="/auth?callbackUrl=/personality-entry" className="mt-6 sm:mt-10 inline-block bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                        Start Your Free Assessment
                                    </Link>
                                )}
                            </div>
                            {/* Hero Visual */}
                            <div>
                                <img src="https://placehold.co/600x450/e0e7ff/3b82f6?text=Diverse+Indian+Students"
                                    alt="Diverse, optimistic Indian students"
                                    className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        e.currentTarget.src = 'https://placehold.co/600x450/e0e7ff/3b82f6?text=Image+Placeholder';
                                    }} />
                            </div>
                        </div>
                    </section>

                    {/* 2. The Problem Section */}
                    <section id="problem" className="bg-gray-50 py-20 md:py-28">
                        <div className="container mx-auto px-6 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">The Illusion of Choice: A Market Saturated with Pseudoscience</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                You're not alone. The career guidance market is failing our students, leading to anxiety and wasted potential.
                            </p>
                            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
                                {/* Problem Card 1 */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h3 className="text-xl font-semibold text-blue-600">Anxiety & Confusion</h3>
                                    <p className="mt-2 text-gray-600">"90% of Indian students choose unsuitable careers, leading to anxiety and wasted potential."</p>
                                </div>
                                {/* Problem Card 2 */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h3 className="text-xl font-semibold text-blue-600">Flawed Tools</h3>
                                    <p className="mt-2 text-gray-600">"Current 'AI' advisors rely on unscientific typologies (like MBTI) that are unreliable and misleading."</p>
                                </div>
                                {/* Problem Card 3 */}
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                                    <h3 className="text-xl font-semibold text-blue-600">The Systemic Gap</h3>
                                    <p className="mt-2 text-gray-600">"Our education system often lacks integrated, personalized, and scientifically-grounded career counselling."</p>
                                </div>
                            </div>
                            {/* MBTI Visual Anchor */}
                            <div className="mt-16">
                                <img src="https://placehold.co/300x150/fef2f2/ef4444?text=MBTI%3F"
                                    alt="Image questioning the validity of MBTI"
                                    className="rounded-xl shadow-md mx-auto"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        e.currentTarget.src = 'https://placehold.co/300x150/fef2f2/ef4444?text=MBTI%3F+Placeholder';
                                    }} />
                                <p className="mt-4 text-gray-500 italic">Pseudoscience has no place in your future.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Our Scientific Foundation */}
                    <section id="science" className="py-20 md:py-28">
                        <div className="container mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Thesis: A Hybrid Model for Unprecedented Accuracy</h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    We don't guess. We use a dual-framework approach, validated for the Indian context, to build a multi-dimensional, predictive, and deeply personal career blueprint.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-16 max-w-5xl mx-auto">
                                {/* HEXACO Card */}
                                <div className="bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
                                    <img src="https://placehold.co/150x150/dbeafe/3b82f6?text=HEXACO+Diagram"
                                        alt="HEXACO 6-factor diagram"
                                        className="h-24 w-24 rounded-full mx-auto mb-4"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                            e.currentTarget.src = 'https://placehold.co/150x150/dbeafe/3b82f6?text=HEXACO';
                                        }} />
                                    <h3 className="text-2xl font-semibold text-center text-blue-700">HEXACO (Personality)</h3>
                                    <p className="mt-4 text-gray-700">
                                        Measures <span className="font-semibold">how</span> you behave, think, and feel. Its 6-factor model (including Honesty-Humility) is a powerful predictor of workplace integrity and success, validated for the Indian context.
                                    </p>
                                </div>
                                {/* RIASEC Card */}
                                <div className="bg-green-50 p-8 rounded-2xl shadow-lg border border-green-100">
                                    <img src="https://placehold.co/150x150/dcfce7/16a34a?text=RIASEC+Hexagon"
                                        alt="Holland Codes (RIASEC) hexagon"
                                        className="h-24 w-24 rounded-full mx-auto mb-4"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                            e.currentTarget.src = 'https://placehold.co/150x150/dcfce7/16a34a?text=RIASEC';
                                        }} />
                                    <h3 className="text-2xl font-semibold text-center text-green-700">Holland Codes (Interests)</h3>
                                    <p className="mt-4 text-gray-700">
                                        Maps <span className="font-semibold">what</span> activities and environments you thrive in. The global standard for matching vocational interests to career satisfaction and persistence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. How It Works */}
                    <section id="how" className="bg-gray-50 py-20 md:py-28">
                        <div className="container mx-auto px-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">Your Journey from Confusion to Clarity</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center">
                                We provide a simple, clear path from the unknown to a confident future.
                            </p>
                            {/* Steps Timeline */}
                            <div className="mt-16 max-w-4xl mx-auto">
                                <div className="space-y-12">
                                    {/* Step 1 */}
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">1</div>
                                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                            <h3 className="text-xl font-semibold text-gray-900">Engage & Assess</h3>
                                            <p className="mt-1 text-gray-600">Take our gamified, interactive HEXACO-RIASEC assessment. No boring tests.</p>
                                        </div>
                                    </div>
                                    {/* Step 2 */}
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">2</div>
                                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                            <h3 className="text-xl font-semibold text-gray-900">Visualize & Understand</h3>
                                            <p className="mt-1 text-gray-600">Get a dynamic dashboard—not a static report. Instantly visualize your unique personality and interest spikes.</p>
                                        </div>
                                    </div>
                                    {/* Step 3 */}
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">3</div>
                                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                            <h3 className="text-xl font-semibold text-gray-900">Explore & Plan</h3>
                                            <p className="mt-1 text-gray-600">Receive top career matches with a 'Match Score' and clear explanations (<span className="italic">"Recommended because..."</span>).</p>
                                        </div>
                                    </div>
                                    {/* Step 4 */}
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">4</div>
                                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                            <h3 className="text-xl font-semibold text-gray-900">Develop & Grow</h3>
                                            <p className="mt-1 text-gray-600">Get a personalized skill development roadmap and AI-driven psychological support to manage stress.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Meet Your Personal AI Mentor */}
                    <section id="mentor" className="py-20 md:py-28">
                        <div className="container mx-auto px-6">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                {/* AI Mentor Text */}
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">An Advisor, Not Just an Algorithm</h2>
                                    <p className="mt-4 text-lg text-gray-600">
                                        Powered by Google's Gemini, our AI mentor provides empathetic, conversational guidance. This isn't just a report; it's a conversation about your future.
                                    </p>
                                    <ul className="mt-6 space-y-4">
                                        <li className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-gray-700">Ask <span className="font-semibold">*why*</span> you were matched with a career.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-gray-700">Explore skill pathways and get real-time insights from the Indian job market.</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-gray-700">Receive psychological support based on CBT principles to tackle career anxiety and imposter syndrome.</span>
                                        </li>
                                    </ul>
                                </div>
                                {/* AI Mentor Visual (Chatbot Mockup) */}
                                <div>
                                    <img src="https://placehold.co/500x400/eef2ff/4338ca?text=AI+Chatbot+Interface+Mockup"
                                        alt="Mock-up of the AI mentor chatbot interface"
                                        className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                            e.currentTarget.src = 'https://placehold.co/500x400/eef2ff/4338ca?text=Chatbot+Mockup';
                                        }} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 6. Our Ethical Framework */}
                    <section id="ethics" className="bg-gray-900 text-white py-20 md:py-28">
                        <div className="container mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold">We're a "Glass Box," Not a "Black Box"</h2>
                                <p className="mt-4 text-lg text-gray-300">
                                    Trust is our foundation. We believe in transparency and ethics, giving you full control and clarity.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-7xl mx-auto">
                                {/* Pillar 1: XAI */}
                                <div className="bg-gray-800 p-6 rounded-xl">
                                    <h3 className="text-xl font-semibold text-blue-400">Explainable AI (XAI)</h3>
                                    <p className="mt-2 text-gray-300">We tell you *why* every recommendation is made. No secrets.</p>
                                </div>
                                {/* Pillar 2: DPDP */}
                                <div className="bg-gray-800 p-6 rounded-xl">
                                    <h3 className="text-xl font-semibold text-blue-400">DPDP Act 2023 Compliant</h3>
                                    <p className="mt-2 text-gray-300">Your data is secure. Built with a 'Consent Manager' architecture from the ground up.</p>
                                </div>
                                {/* Pillar 3: Bias Mitigation */}
                                <div className="bg-gray-800 p-6 rounded-xl">
                                    <h3 className="text-xl font-semibold text-blue-400">Proactive Bias Mitigation</h3>
                                    <p className="mt-2 text-gray-300">Our algorithms are continuously audited for fairness across gender, location, and status.</p>
                                </div>
                                {/* Pillar 4: Human-in-the-Loop */}
                                <div className="bg-gray-800 p-6 rounded-xl">
                                    <h3 className="text-xl font-semibold text-blue-400">Human-in-the-Loop</h3>
                                    <p className="mt-2 text-gray-300">AI is a guide, not an oracle. Seamlessly connect with a certified human counselor anytime.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. Beyond Generic Labels (Case Studies) */}
                    <section id="case-studies" className="py-20 md:py-28">
                        <div className="container mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Beyond Generic Labels: The Power of Granularity</h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    "Creative" or "Leader" is just a starting point. Your unique traits define your ideal path. We show you the difference.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-6xl mx-auto">
                                {/* Case Study 1: Creative */}
                                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                    <h3 className="text-2xl font-semibold text-gray-900">If you are "Creative"...</h3>
                                    <p className="text-gray-600">(High Artistic Interest)</p>
                                    <div className="mt-6 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-blue-600">Path A (with high Investigative traits):</h4>
                                            <p className="text-gray-700">We'll recommend <span className="font-medium">UX Researcher</span>, focusing on user empathy and data-driven design.</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-blue-600">Path B (with high Enterprising traits):</h4>
                                            <p className="text-gray-700">We'll recommend a path to <span className="font-medium">Creative Director</span>, focusing on managing teams and pitching concepts.</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Case Study 2: Leader */}
                                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                    <h3 className="text-2xl font-semibold text-gray-900">If you are a "Leader"...</h3>
                                    <p className="text-gray-600">(High Enterprising Interest)</p>
                                    <div className="mt-6 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-green-600">Path A (with high Extraversion):</h4>
                                            <p className="text-gray-700">We'll recommend <span className="font-medium">Sales Manager</span>, leveraging your ability to influence and persuade.</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-semibold text-green-600">Path B (with high Honesty-Humility):</h4>
                                            <p className="text-gray-700">We'll recommend <span className="font-medium">Operations & Compliance Specialist</span>, leveraging your integrity and meticulous planning.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 8. Final Call to Action (CTA) */}
                    <section id="cta" className="bg-blue-600 text-white">
                        <div className="container mx-auto px-6 py-20 md:py-28 text-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                                The Right Guidance is a Necessity, Not a Luxury.
                            </h2>
                            <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                                Find the career that fits your unique psychological DNA. Stop guessing and start building your future with confidence.
                            </p>
                            <a href="personality-entry" className="mt-10 inline-block bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Start Your Free Assessment Now
                            </a>
                            <div className="mt-8">
                                <a href="#partner" className="text-blue-200 hover:text-white underline transition-colors">
                                    Are you an educational institution? Partner with us.
                                </a>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-gray-400 py-16">
                    <div className="container mx-auto px-6 text-center">
                        <div className="text-2xl font-bold text-white mb-4">
                            Project Synapse
                        </div>
                        <div className="space-x-6 mb-6">
                            <a href="#problem" className="hover:text-white">The Problem</a>
                            <a href="#science" className="hover:text-white">Our Science</a>
                            <a href="#how" className="hover:text-white">How It Works</a>
                            <a href="#ethics" className="hover:text-white">Our Ethics</a>
                            <a href="#partner" className="hover:text-white">Partnerships</a>
                        </div>
                        <p className="text-sm">&copy; 2025 Project Synapse. All rights reserved. Built on science, for your future.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

// Export as default, which is standard for page.tsx
export default Home;
