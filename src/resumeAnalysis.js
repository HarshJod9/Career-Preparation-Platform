export const roles = {
  'Frontend Developer': ['JavaScript', 'React', 'HTML/CSS', 'Git', 'Accessibility', 'Testing'],
  'Data Analyst': ['SQL', 'Python', 'Excel', 'Statistics', 'Data visualization', 'Communication'],
  'Product Designer': ['Figma', 'User research', 'Prototyping', 'Wireframing', 'Accessibility', 'Communication'],
  'Project Manager': ['Project management', 'Agile', 'Communication', 'Risk management', 'Data analysis', 'Leadership'],
}

const skillAliases = {
  'JavaScript': ['javascript', 'ecmascript', ' es6'], 'TypeScript': ['typescript'], 'React': ['react', 'react.js', 'reactjs'],
  'HTML/CSS': ['html', 'css', 'html5', 'css3'], 'Git': ['git', 'github', 'gitlab'], 'Accessibility': ['accessibility', 'wcag', 'a11y'],
  'Testing': ['testing', 'jest', 'vitest', 'cypress', 'playwright'], 'SQL': ['sql', 'postgresql', 'mysql', 'sqlite'],
  'Python': ['python'], 'Excel': ['excel', 'spreadsheets', 'vlookup', 'pivot table'], 'Statistics': ['statistics', 'statistical analysis'],
  'Data visualization': ['data visualization', 'tableau', 'power bi', 'matplotlib', 'looker'], 'Communication': ['communication', 'presentation', 'stakeholder management'],
  'Figma': ['figma'], 'User research': ['user research', 'usability testing', 'user interviews'], 'Prototyping': ['prototyping', 'prototype'],
  'Wireframing': ['wireframing', 'wireframe'], 'Project management': ['project management', 'project planning'], 'Agile': ['agile', 'scrum', 'kanban'],
  'Risk management': ['risk management', 'risk assessment'], 'Leadership': ['leadership', 'team leadership', 'mentoring'],
  'Node.js': ['node.js', 'nodejs'], 'Java': ['java'], 'C++': ['c++'], 'C#': ['c#'], 'Docker': ['docker'],
  'AWS': ['aws', 'amazon web services'], 'Machine learning': ['machine learning', 'scikit-learn', 'tensorflow', 'pytorch'],
  'Problem solving': ['problem solving', 'analytical thinking'], 'Data analysis': ['data analysis', 'data analytics', 'analytics'],
}

function includesTerm(text, term) {
  const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(text)
}

export function extractSkills(text) {
  const normalized = text.replace(/\s+/g, ' ').toLowerCase()
  return Object.entries(skillAliases)
    .filter(([, aliases]) => aliases.some(alias => includesTerm(normalized, alias)))
    .map(([skill]) => skill)
}

export async function extractResumeText(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') {
    const [pdfjsLib, pdfWorkerModule] = await Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      import('pdfjs-dist/legacy/build/pdf.worker.mjs?url'),
    ])
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerModule.default
    const document = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
    const pages = await Promise.all(Array.from({ length: document.numPages }, async (_, i) => {
      const page = await document.getPage(i + 1)
      const content = await page.getTextContent()
      return content.items.map(item => item.str).join(' ')
    }))
    return pages.join('\n').trim()
  }
  throw new Error('Choose a PDF file.')
}

const databaseName = 'careerai-phase1'
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('resumes')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveResumeBlob(key, file) {
  const db = await openDatabase()
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('resumes', 'readwrite')
    transaction.objectStore('resumes').put(file, key)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}

export async function removeResumeBlob(key) {
  const db = await openDatabase()
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('resumes', 'readwrite')
    transaction.objectStore('resumes').delete(key)
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
  })
  db.close()
}
