<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Synapse - AI Career Advisor</title>
    <!-- Importing Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Importing Inter font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- Custom styles -->
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Simple scroll-spy highlighting */
        .nav-link.active {
            color: #3b82f6; /* blue-500 */
            font-weight: 600;
        }
    </style>
</head>
<body class="bg-white text-gray-800 antialiased">

    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="text-2xl font-bold text-blue-600">
                Project Synapse
            </div>
            <!-- Navigation Links for larger screens -->
            <div class="hidden md:flex space-x-6 items-center">
                <a href="#problem" class="nav-link text-gray-600 hover:text-blue-600 transition-colors">The Problem</a>
                <a href="#science" class="nav-link text-gray-600 hover:text-blue-600 transition-colors">Our Science</a>
                <a href="#how" class="nav-link text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
                <a href="#ethics" class="nav-link text-gray-600 hover:text-blue-600 transition-colors">Our Ethics</a>
                <a href="#cta" class="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-shadow shadow-md">Start Free Assessment</a>
            </div>
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="md:hidden text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </nav>
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden px-6 pb-4 space-y-2">
            <a href="#problem" class="block nav-link text-gray-600 hover:text-blue-600">The Problem</a>
            <a href="#science" class="block nav-link text-gray-600 hover:text-blue-600">Our Science</a>
            <a href="#how" class="block nav-link text-gray-600 hover:text-blue-600">How It Works</a>
            <a href="#ethics" class="block nav-link text-gray-600 hover:text-blue-600">Our Ethics</a>
            <a href="#cta" class="block bg-blue-600 text-white text-center px-5 py-2 rounded-full font-medium hover:bg-blue-700 mt-2">Start Free Assessment</a>
        </div>
    </header>

    <main>
        <!-- 1. Hero Section -->
        <section id="hero" class="container mx-auto px-6 py-20 md:py-32">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <!-- Hero Text Content -->
                <div class="text-center md:text-left">
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold !leading-tight tracking-tight text-gray-900">
                        Career Guidance Built on <span class="text-blue-600">Science</span>, Not Pseudoscience.
                    </h1>
                    <p class="mt-6 text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0">
                        Project Synapse is India's first AI-powered career advisor built on the scientifically validated HEXACO and RIASEC models. Stop guessing, start planning.
                    </p>
                    <a href="#cta" class="mt-10 inline-block bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        Start Your Free Assessment
                    </a>
                </div>
                <!-- Hero Visual -->
                <div>
                    <img src="https://placehold.co/600x450/e0e7ff/3b82f6?text=Diverse+Indian+Students" 
                         alt="Diverse, optimistic Indian students" 
                         class="rounded-2xl shadow-2xl w-full h-auto object-cover"
                         onerror="this.src='https://placehold.co/600x450/e0e7ff/3b82f6?text=Image+Placeholder'">
                </div>
            </div>
        </section>

        <!-- 2. The Problem Section -->
        <section id="problem" class="bg-gray-50 py-20 md:py-28">
            <div class="container mx-auto px-6 text-center">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900">The Illusion of Choice: A Market Saturated with Pseudoscience</h2>
                <p class="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                    You're not alone. The career guidance market is failing our students, leading to anxiety and wasted potential.
                </p>
                <div class="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
                    <!-- Problem Card 1 -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 class="text-xl font-semibold text-blue-600">Anxiety & Confusion</h3>
                        <p class="mt-2 text-gray-600">"90% of Indian students choose unsuitable careers, leading to anxiety and wasted potential."</p>
                    </div>
                    <!-- Problem Card 2 -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 class="text-xl font-semibold text-blue-600">Flawed Tools</h3>
                        <p class="mt-2 text-gray-600">"Current 'AI' advisors rely on unscientific typologies (like MBTI) that are unreliable and misleading."</p>
                    </div>
                    <!-- Problem Card 3 -->
                    <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 class="text-xl font-semibold text-blue-600">The Systemic Gap</h3>
                        <p class="mt-2 text-gray-600">"Our education system often lacks integrated, personalized, and scientifically-grounded career counselling."</p>
                    </div>
                </div>
                <!-- MBTI Visual Anchor -->
                <div class="mt-16">
                    <img src="https://placehold.co/300x150/fef2f2/ef4444?text=MBTI%3F" 
                         alt="Image questioning the validity of MBTI" 
                         class="rounded-xl shadow-md mx-auto"
                         onerror="this.src='https://placehold.co/300x150/fef2f2/ef4444?text=MBTI%3F+Placeholder'">
                    <p class="mt-4 text-gray-500 italic">Pseudoscience has no place in your future.</p>
                </div>
            </div>
        </section>

        <!-- 3. Our Scientific Foundation -->
        <section id="science" class="py-20 md:py-28">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Our Thesis: A Hybrid Model for Unprecedented Accuracy</h2>
                    <p class="mt-4 text-lg text-gray-600">
                        We don't guess. We use a dual-framework approach, validated for the Indian context, to build a multi-dimensional, predictive, and deeply personal career blueprint.
                    </p>
                </div>
                <div class="grid md:grid-cols-2 gap-8 md:gap-12 mt-16 max-w-5xl mx-auto">
                    <!-- HEXACO Card -->
                    <div class="bg-blue-50 p-8 rounded-2xl shadow-lg border border-blue-100">
                        <img src="https://placehold.co/150x150/dbeafe/3b82f6?text=HEXACO+Diagram" 
                             alt="HEXACO 6-factor diagram" 
                             class="h-24 w-24 rounded-full mx-auto mb-4"
                             onerror="this.src='https://placehold.co/150x150/dbeafe/3b82f6?text=HEXACO'">
                        <h3 class="text-2xl font-semibold text-center text-blue-700">HEXACO (Personality)</h3>
                        <p class="mt-4 text-gray-700">
                            Measures <span class="font-semibold">how</span> you behave, think, and feel. Its 6-factor model (including Honesty-Humility) is a powerful predictor of workplace integrity and success, validated for the Indian context.
                        </p>
                    </div>
                    <!-- RIASEC Card -->
                    <div class="bg-green-50 p-8 rounded-2xl shadow-lg border border-green-100">
                        <img src="https://placehold.co/150x150/dcfce7/16a34a?text=RIASEC+Hexagon" 
                             alt="Holland Codes (RIASEC) hexagon" 
                             class="h-24 w-24 rounded-full mx-auto mb-4"
                             onerror="this.src='https://placehold.co/150x150/dcfce7/16a34a?text=RIASEC'">
                        <h3 class="text-2xl font-semibold text-center text-green-700">Holland Codes (Interests)</h3>
                        <p class="mt-4 text-gray-700">
                            Maps <span class="font-semibold">what</span> activities and environments you thrive in. The global standard for matching vocational interests to career satisfaction and persistence.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. How It Works -->
        <section id="how" class="bg-gray-50 py-20 md:py-28">
            <div class="container mx-auto px-6">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 text-center">Your Journey from Confusion to Clarity</h2>
                <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto text-center">
                    We provide a simple, clear path from the unknown to a confident future.
                </p>
                <!-- Steps Timeline -->
                <div class="mt-16 max-w-4xl mx-auto">
                    <div class="space-y-12">
                        <!-- Step 1 -->
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">1</div>
                            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                <h3 class="text-xl font-semibold text-gray-900">Engage & Assess</h3>
                                <p class="mt-1 text-gray-600">Take our gamified, interactive HEXACO-RIASEC assessment. No boring tests.</p>
                            </div>
                        </div>
                        <!-- Step 2 -->
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">2</div>
                            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                <h3 class="text-xl font-semibold text-gray-900">Visualize & Understand</h3>
                                <p class="mt-1 text-gray-600">Get a dynamic dashboard—not a static report. Instantly visualize your unique personality and interest spikes.</p>
                            </div>
                        </div>
                        <!-- Step 3 -->
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">3</div>
                            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                <h3 class="text-xl font-semibold text-gray-900">Explore & Plan</h3>
                                <p class="mt-1 text-gray-600">Receive top career matches with a 'Match Score' and clear explanations (<span class="italic">"Recommended because..."</span>).</p>
                            </div>
                        </div>
                        <!-- Step 4 -->
                        <div class="flex flex-col md:flex-row items-center gap-6">
                            <div class="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">4</div>
                            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100 w-full">
                                <h3 class="text-xl font-semibold text-gray-900">Develop & Grow</h3>
                                <p class="mt-1 text-gray-600">Get a personalized skill development roadmap and AI-driven psychological support to manage stress.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 5. Meet Your Personal AI Mentor -->
        <section id="mentor" class="py-20 md:py-28">
            <div class="container mx-auto px-6">
                <div class="grid md:grid-cols-2 gap-12 items-center">
                    <!-- AI Mentor Text -->
                    <div>
                        <h2 class="text-3xl md:text-4xl font-bold text-gray-900">An Advisor, Not Just an Algorithm</h2>
                        <p class="mt-4 text-lg text-gray-600">
                            Powered by Google's Gemini, our AI mentor provides empathetic, conversational guidance. This isn't just a report; it's a conversation about your future.
                        </p>
                        <ul class="mt-6 space-y-4">
                            <li class="flex items-start gap-3">
                                <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span class="text-gray-700">Ask <span class="font-semibold">*why*</span> you were matched with a career.</span>
                            </li>
                            <li class="flex items-start gap-3">
                                <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span class="text-gray-700">Explore skill pathways and get real-time insights from the Indian job market.</span>
                            </li>
                            <li class="flex items-start gap-3">
                                <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span class="text-gray-700">Receive psychological support based on CBT principles to tackle career anxiety and imposter syndrome.</span>
                            </li>
                        </ul>
                    </div>
                    <!-- AI Mentor Visual (Chatbot Mockup) -->
                    <div>
                        <img src="https://placehold.co/500x400/eef2ff/4338ca?text=AI+Chatbot+Interface+Mockup" 
                             alt="Mock-up of the AI mentor chatbot interface" 
                             class="rounded-2xl shadow-2xl w-full h-auto object-cover"
                             onerror="this.src='https://placehold.co/500x400/eef2ff/4338ca?text=Chatbot+Mockup'">
                    </div>
                </div>
            </div>
        </section>

        <!-- 6. Our Ethical Framework -->
        <section id="ethics" class="bg-gray-900 text-white py-20 md:py-28">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-bold">We're a "Glass Box," Not a "Black Box"</h2>
                    <p class="mt-4 text-lg text-gray-300">
                        Trust is our foundation. We believe in transparency and ethics, giving you full control and clarity.
                    </p>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-7xl mx-auto">
                    <!-- Pillar 1: XAI -->
                    <div class="bg-gray-800 p-6 rounded-xl">
                        <h3 class="text-xl font-semibold text-blue-400">Explainable AI (XAI)</h3>
                        <p class="mt-2 text-gray-300">We tell you *why* every recommendation is made. No secrets.</p>
                    </div>
                    <!-- Pillar 2: DPDP -->
                    <div class="bg-gray-800 p-6 rounded-xl">
                        <h3 class="text-xl font-semibold text-blue-400">DPDP Act 2023 Compliant</h3>
                        <p class="mt-2 text-gray-300">Your data is secure. Built with a 'Consent Manager' architecture from the ground up.</p>
                    </div>
                    <!-- Pillar 3: Bias Mitigation -->
                    <div class="bg-gray-800 p-6 rounded-xl">
                        <h3 class="text-xl font-semibold text-blue-400">Proactive Bias Mitigation</h3>
                        <p class="mt-2 text-gray-300">Our algorithms are continuously audited for fairness across gender, location, and status.</p>
                    </div>
                    <!-- Pillar 4: Human-in-the-Loop -->
                    <div class="bg-gray-800 p-6 rounded-xl">
                        <h3 class="text-xl font-semibold text-blue-400">Human-in-the-Loop</h3>
                        <p class="mt-2 text-gray-300">AI is a guide, not an oracle. Seamlessly connect with a certified human counselor anytime.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 7. Beyond Generic Labels (Case Studies) -->
        <section id="case-studies" class="py-20 md:py-28">
            <div class="container mx-auto px-6">
                <div class="text-center max-w-3xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Beyond Generic Labels: The Power of Granularity</h2>
                    <p class="mt-4 text-lg text-gray-600">
                        "Creative" or "Leader" is just a starting point. Your unique traits define your ideal path. We show you the difference.
                    </p>
                </div>
                <div class="grid md:grid-cols-2 gap-8 mt-16 max-w-6xl mx-auto">
                    <!-- Case Study 1: Creative -->
                    <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h3 class="text-2xl font-semibold text-gray-900">If you are "Creative"...</h3>
                        <p class="text-gray-600">(High Artistic Interest)</p>
                        <div class="mt-6 space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 class="font-semibold text-blue-600">Path A (with high Investigative traits):</h4>
                                <p class="text-gray-700">We'll recommend <span class="font-medium">UX Researcher</span>, focusing on user empathy and data-driven design.</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 class="font-semibold text-blue-600">Path B (with high Enterprising traits):</h4>
                                <p class="text-gray-700">We'll recommend a path to <span class="font-medium">Creative Director</span>, focusing on managing teams and pitching concepts.</p>
                            </div>
                        </div>
                    </div>
                    <!-- Case Study 2: Leader -->
                    <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <h3 class="text-2xl font-semibold text-gray-900">If you are a "Leader"...</h3>
                        <p class="text-gray-600">(High Enterprising Interest)</p>
                        <div class="mt-6 space-y-4">
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 class="font-semibold text-green-600">Path A (with high Extraversion):</h4>
                                <p class="text-gray-700">We'll recommend <span class="font-medium">Sales Manager</span>, leveraging your ability to influence and persuade.</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 class="font-semibold text-green-600">Path B (with high Honesty-Humility):</h4>
                                <p class="text-gray-700">We'll recommend <span class="font-medium">Operations & Compliance Specialist</span>, leveraging your integrity and meticulous planning.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 8. Final Call to Action (CTA) -->
        <section id="cta" class="bg-blue-600 text-white">
            <div class="container mx-auto px-6 py-20 md:py-28 text-center">
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold">
                    The Right Guidance is a Necessity, Not a Luxury.
                </h2>
                <p class="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                    Find the career that fits your unique psychological DNA. Stop guessing and start building your future with confidence.
                </p>
                <a href="#cta-button" class="mt-10 inline-block bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Start Your Free Assessment Now
                </a>
                <div class="mt-8">
                    <a href="#partner" class="text-blue-200 hover:text-white underline transition-colors">
                        Are you an educational institution? Partner with us.
                    </a>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-16">
        <div class="container mx-auto px-6 text-center">
            <div class="text-2xl font-bold text-white mb-4">
                Project Synapse
            </div>
            <div class="space-x-6 mb-6">
                <a href="#problem" class="hover:text-white">The Problem</a>
                <a href="#science" class="hover:text-white">Our Science</a>
                <a href="#how" class="hover:text-white">How It Works</a>
                <a href="#ethics" class="hover:text-white">Our Ethics</a>
                <a href="#partner" class="hover:text-white">Partnerships</a>
            </div>
            <p class="text-sm">&copy; 2025 Project Synapse. All rights reserved. Built on science, for your future.</p>
        </div>
    </footer>

    <!-- JavaScript for Mobile Menu and Scroll-spy -->
    <script>
        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Simple scroll-spy
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 100) { // 100px offset
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    </script>

</body>
</html>
