import { useEffect, useRef, useState } from 'react'
import { Share2, Link2, Send, MessageCircle } from 'lucide-react'
import { copyText } from '../config'
import { useToast } from './Toast'

export function couponShareUrl(coupon, storeSlug) {
  const slug = storeSlug || coupon.store_info?.slug
  return `${window.location.origin}/stores/${slug}?c=${coupon.id}`
}

function shareText(coupon, storeName) {
  const name = storeName || coupon.store_info?.name || ''
  return coupon.code
    ? `كود خصم ${name}: ${coupon.code} — ${coupon.title}`
    : `عرض ${name}: ${coupon.title}`
}

const FacebookIcon = (p) => (
  <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3C16.7 2.3 15.6 2 14.4 2 11.8 2 10 3.6 10 6.5v2H7.3V12H10v10h4V12h2.8l.4-3.5H14z" /></svg>
)
const XIcon = (p) => (
  <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.5l11.2 14.5z" /></svg>
)
const WhatsappIcon = (p) => (
  <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
)

export function ShareLinks({ coupon, storeSlug, storeName, onDone }) {
  const toast = useToast()
  const url = couponShareUrl(coupon, storeSlug)
  const text = shareText(coupon, storeName)
  const enc = encodeURIComponent
  const items = [
    { label: 'واتساب', cls: 'wa', icon: WhatsappIcon, href: `https://wa.me/?text=${enc(text + '\n' + url)}` },
    { label: 'فيسبوك', cls: 'fb', icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: 'تليجرام', cls: 'tg', icon: Send, href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
    { label: 'إكس', cls: 'x', icon: XIcon, href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
  ]

  const copyLink = async () => {
    if (await copyText(url)) toast('تم نسخ رابط الكوبون')
    onDone?.()
  }

  const nativeShare = async () => {
    try { await navigator.share({ title: text, text, url }) } catch { /* cancelled */ }
    onDone?.()
  }

  return (
    <div className="share-links">
      {items.map((i) => (
        <a key={i.cls} className={`share-item ${i.cls}`} href={i.href} target="_blank" rel="noopener noreferrer" onClick={onDone}>
          <span className="share-icon"><i.icon size={18} /></span>
          <span>{i.label}</span>
        </a>
      ))}
      <button className="share-item copy" onClick={copyLink}>
        <span className="share-icon"><Link2 size={18} /></span>
        <span>نسخ الرابط</span>
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="share-item more" onClick={nativeShare}>
          <span className="share-icon"><MessageCircle size={18} /></span>
          <span>المزيد</span>
        </button>
      )}
    </div>
  )
}

export function ShareButton({ coupon, storeSlug, storeName, compact }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="share-wrap" ref={ref}>
      <button
        className={`btn btn-ghost ${compact ? 'btn-icon' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="مشاركة"
        aria-expanded={open}
      >
        <Share2 size={18} />
        {!compact && <span>مشاركة</span>}
      </button>
      {open && (
        <div className="share-pop">
          <div className="share-pop-title">شارك الكوبون</div>
          <ShareLinks coupon={coupon} storeSlug={storeSlug} storeName={storeName} onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
