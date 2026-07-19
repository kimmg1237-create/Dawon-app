/**
 * Extract a safe optional element accessor for partial page mounts.
 * Missing nodes become a silent no-op stub so initStrategy can run per-route.
 */
export function createDomHelpers(root: ParentNode = document) {
  const makeStub = (): HTMLElement => {
    const el = document.createElement('div')
    el.setAttribute('data-dawon-stub', '1')
    el.style.display = 'none'
    document.documentElement.appendChild(el)
    return el
  }

  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root): T => {
    return (r.querySelector(sel) as T) || (makeStub() as unknown as T)
  }

  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root): T[] => {
    return [...r.querySelectorAll(sel)] as T[]
  }

  return { $, $$ }
}
