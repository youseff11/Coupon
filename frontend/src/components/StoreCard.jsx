import { Link } from 'react-router-dom'
import { StoreLogo } from './common'
import { formatNumber } from '../config'

export default function StoreCard({ store }) {
  return (
    <Link to={`/stores/${store.slug}`} className="store-card">
      <StoreLogo store={store} size={84} />
      <h3>{store.name}</h3>
      <span className="store-card-count">
        {store.coupons_count ? `${formatNumber(store.coupons_count)} كوبون فعال` : 'لا توجد كوبونات حالياً'}
      </span>
    </Link>
  )
}
