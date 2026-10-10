import React, { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness, Check, ChevronRight, CircleHelp, FileText, LayoutDashboard, LogOut, Menu, MessageCircle, Plus, Sparkles, Target, Upload, X } from 'lucide-react'
import { roles } from './resumeAnalysis.js'
import { apiRequest, authenticate, clearAccessToken, uploadResume } from './api.js'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'skill-gap', label: 'Skill gap', icon: Target },
  { id: 'interview', label: 'AI interview', icon: BrainCircuit },
  { id: 'roadmap', label: 'Career roadmap', icon: BriefcaseBusiness },
  { id: 'assistant', label: 'AI assistant', icon: MessageCircle },
]


function Landing({ onAuth }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const steps = [
    { number: '01', title: 'Build your profile', copy: 'Start with your resume and the role you want next.', icon: FileText },
    { number: '02', title: 'Find your edge', copy: 'See the skills you already have and the ones to grow.', icon: Target },
    { number: '03', title: 'Practice with purpose', copy: 'Get ready for the conversations that move you forward.', icon: BrainCircuit },
  ]
  return <div className="site-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="CareerAI home"><span className="brand-mark"><Sparkles size={17} strokeWidth={2.4} /></span><span>career<span className="brand-ai">ai</span></span></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'}>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#why-careerai" onClick={() => setMenuOpen(false)}>Why CareerAI</a>
        <button className="nav-login" onClick={() => onAuth('login')}>Log in</button><button className="nav-signup" onClick={() => onAuth('register')}>Get started <ArrowRight size={15} /></button>
      </nav>
    </header>
    <main id="top">
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAREER, IN FOCUS</div>
          <h1>Make your next<br />move <span>your best one.</span></h1>
          <p className="hero-description">A clearer path to the career you want. Understand your strengths, close your skill gaps, and walk into every interview ready.</p>
          <div className="hero-actions"><button className="button-primary" onClick={() => onAuth('register')}>Start preparing <ArrowRight size={17} /></button><a className="text-link" href="#how-it-works">See how it works <ArrowDown size={15} /></a></div>
          <div className="social-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>K</span></div><p><strong>A little more clarity.</strong><br />A lot more confidence.</p></div>
        </div>
        <div className="hero-visual" aria-label="Career readiness preview"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="sparkle sparkle-a">✳</div><div className="sparkle sparkle-b">✦</div>
          <div className="preview-card readiness-card"><div className="card-topline"><div><span className="small-label">SAMPLE CAREER READINESS</span><h2>A strong start</h2></div><span className="card-icon"><Target size={18} /></span></div>
            <div className="score-row"><div className="score-ring"><div><strong>82</strong><span>/100</span></div></div><div className="score-copy"><span className="status-pill"><span /> Sample profile</span><p>Your experience is lining up with your goals.</p></div></div>
            <div className="card-divider" /><div className="skills-heading"><span>SKILLS THAT STAND OUT</span><span>03</span></div><div className="skill-list"><span>Communication <i className="skill-bar"><b style={{ width: '88%' }} /></i></span><span>Problem solving <i className="skill-bar"><b style={{ width: '73%' }} /></i></span><span>Data analysis <i className="skill-bar"><b style={{ width: '58%' }} /></i></span></div>
            <a href="#how-it-works" className="card-footer">Explore your profile <ArrowUpRight size={15} /></a>
          </div><div className="floating-note note-top"><span className="note-icon"><Check size={14} /></span><span><strong>Skills identified</strong><small>From your experience</small></span></div><div className="floating-note note-bottom"><span className="note-stars">✦</span><span><strong>Your next step</strong><small>Pick a role to explore</small></span><ArrowRight size={15} /></div><div className="visual-caption">A little progress adds up <span>↗</span></div>
        </div><div className="hero-bottom-label"><span>01 / 03</span><i /><span>START WITH WHAT YOU KNOW</span></div>
      </section>
      <section className="trust-strip" id="why-careerai"><span>YOUR NEXT CHAPTER, BUILT ON</span><div><span><Check size={14} /> Your real experience</span><span><Check size={14} /> Clear next steps</span><span><Check size={14} /> Practice that feels useful</span></div></section>
      <section className="how-section" id="how-it-works"><div className="section-intro"><div className="eyebrow"><span className="eyebrow-dot" /> A SIMPLE PLACE TO BEGIN</div><h2>Good things happen<br />when you <span>have a plan.</span></h2><p>You don't need to have it all figured out. Start where you are, and we'll help you see what comes next.</p></div>
        <div className="steps-grid">{steps.map(({ number, title, copy, icon: Icon }) => <article className="step-card" key={number}><div className="step-head"><span>{number}</span><Icon size={21} strokeWidth={1.6} /></div><h3>{title}</h3><p>{copy}</p><div className="step-line" /></article>)}</div>
        <div className="closing-cta"><div><span className="closing-icon"><Sparkles size={17} /></span><span>YOU CAN START RIGHT WHERE YOU ARE</span></div><button onClick={() => onAuth('register')}>Take the first step <ArrowRight size={16} /></button></div>
      </section>
    </main><footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span><span>career<span className="brand-ai">ai</span></span></a><span>Made for your next chapter.</span><span>© 2026 CareerAI</span></footer>
  </div>
}

function AuthPage({ mode, onBack, onSuccess, onModeChange }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const register = mode === 'register'
  async function submit(event) {
    event.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const user = await authenticate(register ? 'register' : 'login', { name: name.trim() || undefined, email: email.trim(), password })
      onSuccess(user)
    } catch (requestError) {
      setError(requestError.message || 'We could not sign you in. Try again.')
    } finally { setSubmitting(false) }
  }
  return <main className="auth-page"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to home</button><section className="auth-card">
    <a className="brand auth-brand" href="#home"><span className="brand-mark"><Sparkles size={17} /></span><span>career<span className="brand-ai">ai</span></span></a><div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
    <h1>{register ? 'Let’s get you started.' : 'Welcome back.'}</h1><p className="auth-intro">{register ? 'Create your account to set up your career dashboard.' : 'Log in to continue to your career dashboard.'}</p>
    <form onSubmit={submit} className="auth-form">{register && <label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Harsh" autoComplete="name" required /></label>}<label>Email address<input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={8} placeholder="At least 8 characters" autoComplete={register ? 'new-password' : 'current-password'} required /></label>
      <p className="demo-note"><CircleHelp size={14} /> Your account and profile are saved to the project database.</p>{error && <div className="form-error" role="alert">{error}</div>}<button className="button-primary auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : 'Continue to dashboard'} {!submitting && <ArrowRight size={16} />}</button></form>
    <div className="auth-switch">{register ? 'Already have a profile?' : 'New to CareerAI?'} <button onClick={() => onModeChange(register ? 'login' : 'register')}>{register ? 'Log in' : 'Create an account'}</button></div>
  </section><p className="auth-foot">Your career profile stays in this browser in this demo.</p></main>
}

function Dashboard({ user, onLogout }) {
  const [section, setSection] = useState('overview')
  const [mobileNav, setMobileNav] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [resume, setResume] = useState(null)
  const [skills, setSkills] = useState([])
  const [targetRole, setTargetRole] = useState(user?.target_role || '')
  const fileRef = useRef(null)
  const firstName = user?.name || 'there'

  useEffect(() => {
    let active = true
    Promise.all([apiRequest('/api/profile'), apiRequest('/api/resumes')]).then(([profile, resumes]) => {
      if (!active) return
      const latest = resumes[0]
      setTargetRole(profile.target_role || '')
      if (latest) {
        setResume({ ...latest, uploadedAt: latest.uploaded_at, textLength: latest.text_length })
        setSkills(latest.skills || [])
      }
    }).catch(error => { if (active) setUploadError(error.message || 'Could not load your saved profile.') })
    return () => { active = false }
  }, [])

  async function addResume(file) {
    if (!file) return
    const allowed = /\.pdf$/i.test(file.name)
    if (!allowed) { setUploadError('Choose a PDF resume.'); return }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Your resume must be 10 MB or smaller.'); return }
    setUploadError(''); setAnalysisStatus(''); setAnalyzing(true)
    try {
      const record = await uploadResume(file)
      setResume(record); setSkills(record.skills || [])
      setAnalysisStatus(record.textLength ? `${record.skills.length} skills found from your resume.` : 'Resume saved, but this file does not contain readable text. Try an exported PDF with selectable text.')
    } catch (error) {
      setUploadError(error?.message || 'We could not read this resume. Try another PDF file.')
    } finally { setAnalyzing(false) }
  }

  async function updateRole(event) {
    const value = event.target.value
    setTargetRole(value)
    try { await apiRequest('/api/profile', { method: 'PATCH', body: JSON.stringify({ target_role: value || null }) }) }
    catch (error) { setUploadError(error.message || 'Could not save your target role.') }
  }

  async function deleteResume() {
    if (resume?.id) await apiRequest(`/api/resumes/${resume.id}`, { method: 'DELETE' })
    setResume(null); setSkills([]); setAnalysisStatus('')
  }

  const title = navItems.find(item => item.id === section)?.label || 'Overview'
  const requiredSkills = roles[targetRole] || []
  const matchingSkills = requiredSkills.filter(skill => skills.includes(skill))
  const missingSkills = requiredSkills.filter(skill => !skills.includes(skill))
  const readiness = requiredSkills.length && resume ? Math.round(matchingSkills.length / requiredSkills.length * 100) : null
  return <div className="dashboard-shell">
    <aside className={mobileNav ? 'sidebar sidebar-open' : 'sidebar'}><a className="brand dash-brand" href="#dashboard"><span className="brand-mark"><Sparkles size={16} /></span><span>career<span className="brand-ai">ai</span></span></a>
      <div className="workspace-label">WORKSPACE</div><nav className="side-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'side-link active' : 'side-link'} onClick={() => { setSection(id); setMobileNav(false) }}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{id === 'resume' && resume && <span className="nav-check"><Check size={12} /></span>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="side-link" onClick={onLogout}><LogOut size={17} /><span>Log out</span></button><div className="user-mini"><span className="user-avatar">{firstName[0]?.toUpperCase()}</span><span><strong>{firstName}</strong><small>Personal workspace</small></span></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <main className="dashboard-main"><header className="dash-topbar"><button className="dash-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div className="dash-breadcrumb">Workspace <ChevronRight size={13} /> <strong>{title}</strong></div><div className="dash-tools"><span className="top-avatar">{firstName[0]?.toUpperCase()}</span></div></header>
      <div className="dash-content">{section === 'overview' ? <>
        <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR CAREER SNAPSHOT</div><h1>Good to see you, {firstName} <span className="wave">✳</span></h1><p>Small steps today can make your next move feel clearer.</p></div><button className="button-primary compact" onClick={() => setSection('resume')}><Plus size={16} /> Add your resume</button></div>
        {!resume && <div className="setup-banner"><span className="setup-icon"><Sparkles size={18} /></span><span><strong>Your profile is ready for its first step</strong><small>Add a resume to start organizing your experience and skills.</small></span><button onClick={() => setSection('resume')}>Add resume <ArrowRight size={15} /></button></div>}
        <div className="metric-grid"><article className="metric-card readiness-metric"><div className="metric-label">ROLE MATCH <span><CircleHelp size={14} /></span></div><div className="metric-value">{readiness === null ? '—' : readiness}<small>{readiness === null ? '' : '/ 100'}</small></div><div className="metric-bottom"><span className="metric-icon green"><Target size={15} /></span><span>{targetRole || 'Choose a target role'}</span></div></article><article className="metric-card"><div className="metric-label">SKILLS IDENTIFIED <span><CircleHelp size={14} /></span></div><div className="metric-value">{skills.length}<small> skills</small></div><div className="metric-bottom"><span className="metric-icon blue"><BrainCircuit size={15} /></span><span>{resume ? 'From your resume' : 'Upload your resume'}</span></div></article><article className="metric-card"><div className="metric-label">SKILL GAPS <span><CircleHelp size={14} /></span></div><div className="metric-value">{targetRole ? missingSkills.length : '—'}<small>{targetRole ? ' to work on' : ' gaps'}</small></div><div className="metric-bottom"><span className="metric-icon peach"><ArrowUpRight size={15} /></span><span>{targetRole ? 'For your target role' : 'Choose a target role'}</span></div></article></div>
        <div className="dash-panels"><section className="panel recent-panel"><div className="panel-heading"><div><h2>Resume</h2><p>Your experience is the starting point.</p></div><button className="panel-link" onClick={() => setSection('resume')}>View resume <ArrowRight size={14} /></button></div>{resume ? <div className="resume-summary"><span className="resume-file-icon"><FileText size={18} /></span><span><strong>{resume.name}</strong><small>Added {new Date(resume.uploadedAt).toLocaleDateString()}</small></span><button aria-label="View resume" onClick={() => setSection('resume')}><ChevronRight size={17} /></button></div> : <button className="empty-resume" onClick={() => setSection('resume')}><span className="empty-icon"><Upload size={17} /></span><strong>Upload your first resume</strong><small>PDF file</small><ArrowRight size={15} /></button>}</section>
          <section className="panel role-panel"><div className="panel-heading"><div><h2>Target role</h2><p>What are you working toward?</p></div><span className="panel-target-icon"><BriefcaseBusiness size={17} /></span></div><label className="role-input-label" htmlFor="target-role">CHOOSE A ROLE</label><select id="target-role" className="role-input" value={targetRole} onChange={updateRole}><option value="">Choose a target role</option>{Object.keys(roles).map(role => <option key={role}>{role}</option>)}</select><div className="role-hint"><Sparkles size={13} /> {targetRole ? `${roles[targetRole].length} skills compared` : 'Choose a role to see your skill gap'}</div></section></div>
        <section className="panel skills-panel"><div className="panel-heading"><div><h2>Your skills</h2><p>{resume ? `Extracted from ${resume.name}` : 'Add a resume to see your skills.'}</p></div><button className="panel-link" onClick={() => setSection('skill-gap')}>View skill gap <ArrowRight size={14} /></button></div>{skills.length ? <div className="skill-chip-row">{skills.map(skill => <span className="sample-chip" key={skill}><Check size={12} /> {skill}</span>)}</div> : <div className="skill-empty"><span className="skill-empty-icon"><BrainCircuit size={20} /></span><span><strong>No skills yet</strong><small>Upload a resume to extract skills from your experience.</small></span></div>}</section>
      </> : section === 'resume' ? <>
        <div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> YOUR EXPERIENCE</div><h1>Resume</h1><p>Keep your experience in one place as you work toward your next role.</p></div>
        <section className="panel resume-page-panel"><div className="panel-heading"><div><h2>Your resume</h2><p>Upload a PDF document, up to 10 MB.</p></div><span className="panel-target-icon"><FileText size={18} /></span></div>
          <div className={analyzing ? 'upload-drop upload-busy' : 'upload-drop'} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void addResume(event.dataTransfer.files?.[0]) }}><span className="upload-icon">{analyzing ? <span className="loader" /> : <Upload size={20} />}</span><strong>{analyzing ? 'Reading your resume…' : resume ? 'Replace your resume' : 'Drop your resume here'}</strong><span>PDF · Max 10 MB</span><button className="button-secondary" disabled={analyzing} onClick={() => fileRef.current?.click()}>Choose a file</button><input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={event => { void addResume(event.target.files?.[0]); event.target.value = '' }} hidden /></div>
          {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
          {analysisStatus && <p className={skills.length ? 'analysis-status' : 'analysis-status status-warning'} role="status">{analysisStatus}</p>}
          <div className="privacy-note"><CircleHelp size={15} /><span><strong>Private browser storage</strong><small>The file stays in this browser on this device. It is not sent to a server.</small></span></div>
          {resume && <div className="uploaded-file"><span className="resume-file-icon"><FileText size={18} /></span><span><strong>{resume.name}</strong><small>{(resume.size / 1024 / 1024).toFixed(2)} MB · Added {new Date(resume.uploadedAt).toLocaleDateString()}</small></span><span className="file-saved"><Check size={14} /> Saved</span><button className="remove-file" onClick={() => void deleteResume()}>Remove</button></div>}
        </section>
        <section className="panel skills-panel analysis-placeholder"><div className="panel-heading"><div><h2>Extracted skills</h2><p>Skills found in your resume text.</p></div><span className="panel-target-icon"><BrainCircuit size={18} /></span></div>{skills.length ? <div className="skill-chip-row">{skills.map(skill => <span className="sample-chip" key={skill}><Check size={12} /> {skill}</span>)}</div> : <div className="skill-empty"><span className="skill-empty-icon"><BrainCircuit size={20} /></span><span><strong>{resume ? 'No recognizable skills found' : 'No resume analyzed yet'}</strong><small>{resume ? 'Try a text-based PDF with your skills listed.' : 'Upload your resume to see skills identified from its text.'}</small></span></div>}</section>
      </> : section === 'skill-gap' ? <>
        <div className="page-heading"><div className="eyebrow"><span className="eyebrow-dot" /> CAREER PROFILE</div><h1>Skill gap</h1><p>Compare skills in your resume with the skills commonly used in your target role.</p></div>
        <section className="panel role-select-panel"><div className="panel-heading"><div><h2>Target role</h2><p>Choose a role to see required skills and your current matches.</p></div><span className="panel-target-icon"><BriefcaseBusiness size={18} /></span></div><label className="role-input-label" htmlFor="gap-role">TARGET ROLE</label><select id="gap-role" className="role-input" value={targetRole} onChange={updateRole}><option value="">Choose a target role</option>{Object.keys(roles).map(role => <option key={role}>{role}</option>)}</select></section>
        {!targetRole ? <div className="skill-empty gap-empty"><span className="skill-empty-icon"><Target size={20} /></span><span><strong>Choose your target role</strong><small>We’ll compare its required skills against your resume.</small></span></div> : <><div className="gap-summary"><span className="gap-score">{readiness === null ? '—' : readiness}<small>{readiness === null ? '' : '%'}</small></span><span><strong>{resume ? `${matchingSkills.length} of ${requiredSkills.length} skills matched` : 'Upload a resume to see your matches'}</strong><small>{!resume ? `Your resume will be compared with ${targetRole} skills.` : missingSkills.length ? `${missingSkills.length} skills to build toward ${targetRole}` : `Your resume matches all listed skills for ${targetRole}`}</small></span></div><div className="gap-columns"><section className="panel gap-list"><div className="panel-heading"><div><h2>Your skills</h2><p>{skills.length} identified from resume</p></div><span className="gap-count good">{matchingSkills.length}</span></div>{skills.length ? <div className="gap-skill-list">{skills.map(skill => <div className="gap-skill" key={skill}><span className="gap-skill-icon present"><Check size={14} /></span><span>{skill}</span>{requiredSkills.includes(skill) && <small>Required</small>}</div>)}</div> : <div className="skill-empty"><span className="skill-empty-icon"><FileText size={19} /></span><span><strong>{resume ? 'No skills identified' : 'Add your resume'}</strong><small>{resume ? 'Try a text-based PDF with skills listed.' : 'Upload one to identify your existing skills.'}</small></span></div>}</section><section className="panel gap-list"><div className="panel-heading"><div><h2>Required skills</h2><p>Common skills for {targetRole}</p></div><span className="gap-count">{resume ? missingSkills.length : requiredSkills.length}</span></div><div className="gap-skill-list">{requiredSkills.map(skill => <div className="gap-skill" key={skill}><span className={skills.includes(skill) ? 'gap-skill-icon present' : 'gap-skill-icon missing'}>{skills.includes(skill) ? <Check size={14} /> : <Plus size={14} />}</span><span>{skill}</span><small>{skills.includes(skill) ? 'In your resume' : resume ? 'Skill to build' : 'Compare after upload'}</small></div>)}</div></section></div><p className="analysis-method-note">Skill comparisons use a starter list and keyword matching. They are guidance, not a hiring score.</p></>}
      </> : <div className="coming-page"><span className="coming-icon">{(() => { const Icon = navItems.find(item => item.id === section)?.icon || Sparkles; return <Icon size={22} /> })()}</span><div className="eyebrow"><span className="eyebrow-dot" /> PHASE 2 FEATURE</div><h1>{title}</h1><p>This feature follows the Phase 1 foundation. Your dashboard, resume, and career profile are ready to explore.</p><button className="button-primary compact" onClick={() => setSection('overview')}>Back to overview <ArrowRight size={15} /></button></div>}</div>
    </main>
  </div>
}

function App() {
  const [view, setView] = useState('landing')
  const [authMode, setAuthMode] = useState('register')
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (!localStorage.getItem('careerai-access-token')) return
    apiRequest('/api/profile').then(profile => { setUser(profile); setView('dashboard') }).catch(() => clearAccessToken())
  }, [])
  function startAuth(mode) { setAuthMode(mode); setView('auth') }
  function completeAuth(authenticatedUser) { setUser(authenticatedUser); setView('dashboard') }
  function logout() { clearAccessToken(); setUser(null); setView('landing') }
  if (view === 'auth') return <AuthPage mode={authMode} onBack={() => setView('landing')} onSuccess={completeAuth} onModeChange={startAuth} />
  if (view === 'dashboard') return <Dashboard user={user} onLogout={logout} />
  return <Landing onAuth={startAuth} />
}

export default App
