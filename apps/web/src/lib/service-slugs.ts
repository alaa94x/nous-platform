// Single source of truth mapping capability / service names to their
// /services/* page slug. Used by the Capabilities section (homepage) and by
// case study pages, so the 6 service pages are reachable from both the
// homepage rows and the "services applied" list on each project.
//
// Keyed by both the business name and the engineering (name_tech) name so the
// link resolves regardless of which is stored.

export const SERVICE_PAGE_SLUGS: Record<string, string> = {
  'AI & Automation':          'ai',
  'Artificial Intelligence':  'ai',
  'Custom Digital Platforms': 'full-stack',
  'Full-Stack Engineering':   'full-stack',
  'Mobile Apps':              'mobile',
  'Mobile Development':       'mobile',
  'Online Commerce':          'ecommerce',
  'E-Commerce Solutions':     'ecommerce',
  'Cloud & Scale':            'cloud',
  'Cloud Infrastructure':     'cloud',
  'Design & Brand':           'design',
  'Design & Motion':          'design',
}

export function serviceSlug(name: string | null | undefined): string | undefined {
  return name ? SERVICE_PAGE_SLUGS[name] : undefined
}
