export const SITE = {
  name: 'وفّر كود',
  tagline: 'أكواد خصم وكوبونات فعالة لأشهر المتاجر',
}

export function daysLeft(date) {
  if (!date) return null
  const end = new Date(date + 'T23:59:59')
  return Math.ceil((end - new Date()) / 86400000)
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatNumber(n) {
  return new Intl.NumberFormat('ar-EG').format(n || 0)
}

export async function copyText(text) {
  try {
    // Some embedded browsers never settle the clipboard promise; don't wait forever.
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800)),
    ])
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { /* ignore */ }
    ta.remove()
    return ok
  }
}

export function daysText(d) {
  if (d === 1) return 'يوم واحد'
  if (d === 2) return 'يومين'
  if (d >= 3 && d <= 10) return `${formatNumber(d)} أيام`
  return `${formatNumber(d)} يوماً`
}
