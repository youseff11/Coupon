import {
  ShoppingCart, ShoppingBag, Shirt, UtensilsCrossed, Pizza, Coffee, Smartphone, Laptop, Watch, Plane, Hotel,
  Sparkles, Gem, Glasses, House, Sofa, Dumbbell, Gamepad2, BookOpen, Pill, HeartPulse, Car, Gift, Baby,
  PawPrint, CreditCard, Ticket, Store, Tag,
} from 'lucide-react'

// Category.icon stores one of these keys.
export const CATEGORY_ICONS = {
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  shirt: Shirt,
  utensils: UtensilsCrossed,
  pizza: Pizza,
  coffee: Coffee,
  smartphone: Smartphone,
  laptop: Laptop,
  watch: Watch,
  plane: Plane,
  hotel: Hotel,
  sparkles: Sparkles,
  gem: Gem,
  glasses: Glasses,
  house: House,
  sofa: Sofa,
  dumbbell: Dumbbell,
  gamepad: Gamepad2,
  book: BookOpen,
  pill: Pill,
  health: HeartPulse,
  car: Car,
  gift: Gift,
  baby: Baby,
  paw: PawPrint,
  'credit-card': CreditCard,
  ticket: Ticket,
  store: Store,
  tag: Tag,
}

export default function CategoryIcon({ name, size = 20, ...props }) {
  const Icon = CATEGORY_ICONS[name] || Tag
  return <Icon size={size} {...props} />
}
