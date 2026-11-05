import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Clock, Copy, Check, ExternalLink, Flame, Users, X, ChevronDown, Gift } from 'lucide-react'
import { api } from '../api'
import { copyText, daysLeft, daysText, formatDate, formatNumber } from '../config'
import { useToast } from './Toast'
import { ShareButton, ShareLinks } from './Share'
import { StoreLogo } from './common'

function ExpiryTag({ date }) {
  const d = daysLeft(date)
  if (d == null) return <span className="tag tag-muted"><Clock size={13} /> ساري حتى إشعار آخر</span>
  if (d <= 0) return <span className="tag tag-danger"><Clock size={13} /> ينتهي اليوم</span>
  if (d <= 7) return <span className="tag tag-danger"><Clock size={13} /> ينتهي خلال {daysText(d)}</span>
  return <span className="tag tag-muted"><Clock size={13} /> ينتهي {formatDate(date)}</span>
}

export function useCopyCoupon() {
  const toast = useToast()
  return async (coupon) => {
    if (coupon.code) {
      const ok = await copyText(coupon.code)
      toast(ok ? `تم نسخ الكود ${coupon.code}` : 'تعذر النسخ، انسخ الكود يدوياً', ok ? 'success' : 'error')
    }
    api.post(`/coupons/${coupon.id}/copy/`).catch(() => {})
  }
}

export function CouponCard({ coupon, store, showStore = false, onOpen }) {
  const [expanded, setExpanded] = useState(false)
  const copy = useCopyCoupon()
  const s = store || coupon.store_info
  const hasCode = !!coupon.code

  const handleMain = () => {
    onOpen?.(coupon)
    copy(coupon)
  }

  return (
    <article className={`coupon-card ${coupon.is_exclusive ? 'is-exclusive' : ''}`}>
      {coupon.is_exclusive && <span className="ribbon"><Flame size={13} /> حصري</span>}
      <div className="coupon-side">
        {showStore ? (
          <Link to={`/stores/${s.slug}`} className="coupon-store-link">
            <StoreLogo store={s} size={72} />
          </Link>
        ) : (
          <div className="discount-box">
            <strong>{coupon.discount || <Gift size={28} />}</strong>
            <span>{hasCode ? 'كود خصم' : 'عرض'}</span>
          </div>
        )}
      </div>

      <div className="coupon-body">
        {showStore && <Link to={`/stores/${s.slug}`} className="coupon-store-name">{s.name}</Link>}
        <h3 className="coupon-title">{coupon.title}</h3>
        <div className="coupon-tags">
          {coupon.is_verified && <span className="tag tag-success"><BadgeCheck size={13} /> موثق</span>}
          <ExpiryTag date={coupon.expires_at} />
          {coupon.copies_count > 0 && (
            <span className="tag tag-muted"><Users size={13} /> استخدمه {formatNumber(coupon.copies_count)}</span>
          )}
        </div>
        {coupon.description && (
          <>
            <button className="details-toggle" onClick={() => setExpanded((e) => !e)}>
              التفاصيل <ChevronDown size={15} className={expanded ? 'rot' : ''} />
            </button>
            {expanded && <p className="coupon-desc">{coupon.description}</p>}
          </>
        )}
      </div>

      <div className="coupon-actions">
        {hasCode ? (
          <button className="code-btn" onClick={handleMain} aria-label={`انسخ الكود ${coupon.code}`}>
            <span className="code-peek" dir="ltr">{coupon.code}</span>
            <span className="code-cta"><Copy size={17} /> انسخ الكود</span>
          </button>
        ) : (
          <button className="btn btn-accent deal-btn" onClick={handleMain}>
            احصل على العرض <ExternalLink size={16} />
          </button>
        )}
        <ShareButton coupon={coupon} storeSlug={s?.slug} storeName={s?.name} compact />
      </div>
    </article>
  )
}

export function CouponModal({ coupon, store, onClose }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  const s = store || coupon?.store_info

  useEffect(() => {
    if (!coupon) return
    setCopied(false)
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [coupon, onClose])

  if (!coupon) return null
  const link = coupon.link || s?.website_url

  const copy = async () => {
    const ok = await copyText(coupon.code)
    if (ok) {
      setCopied(true)
      toast(`تم نسخ الكود ${coupon.code}`)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal coupon-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="إغلاق"><X size={20} /></button>
        <div className="cm-head">
          <StoreLogo store={s} size={84} />
          <div className="cm-store">{s?.name}</div>
          <h2>{coupon.title}</h2>
        </div>

        {coupon.code ? (
          <>
            <p className="cm-hint">انسخ الكود والصقه في صفحة الدفع على موقع {s?.name}</p>
            <div className={`cm-code ${copied ? 'copied' : ''}`}>
              <span dir="ltr">{coupon.code}</span>
              <button className="btn btn-primary" onClick={copy}>
                {copied ? <><Check size={18} /> تم النسخ</> : <><Copy size={18} /> نسخ</>}
              </button>
            </div>
          </>
        ) : (
          <p className="cm-hint">لا تحتاج إلى كود، الخصم يُطبق تلقائياً عند الشراء من خلال الرابط.</p>
        )}

        {link && (
          <a className="btn btn-accent btn-block btn-lg" href={link} target="_blank" rel="noopener noreferrer nofollow">
            اذهب إلى {s?.name} <ExternalLink size={18} />
          </a>
        )}

        <div className="cm-meta">
          {coupon.is_verified && <span className="tag tag-success"><BadgeCheck size={13} /> كود موثق</span>}
          <ExpiryTag date={coupon.expires_at} />
        </div>
        {coupon.description && <p className="cm-desc">{coupon.description}</p>}

        <div className="cm-share">
          <div className="cm-share-title">شارك الكوبون مع أصدقائك</div>
          <ShareLinks coupon={coupon} storeSlug={s?.slug} storeName={s?.name} />
        </div>
      </div>
    </div>
  )
}
