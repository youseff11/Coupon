import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Empty } from '../components/common'

export default function NotFound() {
  return (
    <div className="container page">
      <Empty icon={Compass} title="الصفحة غير موجودة" text="الرابط الذي تبحث عنه غير متاح.">
        <Link to="/" className="btn btn-primary">العودة للرئيسية</Link>
      </Empty>
    </div>
  )
}
