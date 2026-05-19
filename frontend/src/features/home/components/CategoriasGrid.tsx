import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// ─── Category SVG Art Components ─────────────────────────────────────────────

function HoodieArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#1E2428" />
      {/* Hoodie silhouette — abstract lines */}
      <path
        d="M140,60 Q200,30 260,60 L280,120 L270,200 L130,200 L120,120 Z"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1.5"
        opacity="0.2"
      />
      {/* Hood */}
      <path
        d="M155,65 Q200,35 245,65"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        opacity="0.25"
      />
      {/* Pocket */}
      <rect x="170" y="145" width="60" height="30" rx="4" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.15" />
      {/* Accent lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={100 + i * 40} y1="0" x2={120 + i * 40} y2="256" stroke="#60A5FA" strokeWidth="0.5" opacity="0.06" />
      ))}
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">HOO</text>
    </svg>
  )
}

function TeeArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#252A2E" />
      {/* T-shirt rectangle form */}
      <rect x="140" y="50" width="120" height="160" rx="8" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.2" />
      {/* Sleeves */}
      <line x1="140" y1="70" x2="100" y2="110" stroke="#3B82F6" strokeWidth="1.5" opacity="0.2" />
      <line x1="260" y1="70" x2="300" y2="110" stroke="#3B82F6" strokeWidth="1.5" opacity="0.2" />
      {/* Center graphic — abstract logo */}
      <circle cx="200" cy="130" r="25" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.2" />
      <circle cx="200" cy="130" r="15" fill="#3B82F6" opacity="0.06" />
      <circle cx="200" cy="130" r="5" fill="#60A5FA" opacity="0.15" />
      {/* Grid pattern */}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={`h-${i}`} x1="0" y1={i * 64} x2="400" y2={i * 64} stroke="#60A5FA" strokeWidth="0.5" opacity="0.04" />
      ))}
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">TEE</text>
    </svg>
  )
}

function PantsArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#181C1F" />
      {/* Vertical long lines — leg silhouette */}
      {Array.from({ length: 10 }, (_, i) => (
        <line
          key={i}
          x1={140 + i * 15}
          y1={20 + (i % 3) * 10}
          x2={140 + i * 15}
          y2={240 - (i % 2) * 20}
          stroke="#60A5FA"
          strokeWidth={i === 4 || i === 5 ? 2 : 0.8}
          opacity={0.08 + (i % 3) * 0.04}
        />
      ))}
      {/* Waistband */}
      <rect x="140" y="40" width="140" height="6" rx="2" fill="#3B82F6" opacity="0.12" />
      {/* Center seam */}
      <line x1="210" y1="46" x2="210" y2="240" stroke="#60A5FA" strokeWidth="1" opacity="0.1" strokeDasharray="4 4" />
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">PAN</text>
    </svg>
  )
}

function JacketArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#2E353B" />
      {/* Jacket shape */}
      <path
        d="M150,40 L250,40 L270,80 L280,200 L200,200 L200,40"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1"
        opacity="0.15"
      />
      <path
        d="M250,40 L150,40 L130,80 L120,200 L200,200"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="1"
        opacity="0.15"
      />
      {/* Zipper line (center) */}
      <line x1="200" y1="40" x2="200" y2="200" stroke="#3B82F6" strokeWidth="2" opacity="0.2" />
      {/* Zipper teeth */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1="196" y1={50 + i * 16} x2="204" y2={50 + i * 16} stroke="#3B82F6" strokeWidth="1.5" opacity="0.15" />
      ))}
      {/* Collar */}
      <path d="M160,40 L200,25 L240,40" fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.2" />
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">JAC</text>
    </svg>
  )
}

function AccesoriosArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#353C42" />
      {/* Grid of mini icons */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const x = 80 + col * 60
          const y = 40 + row * 52
          const shape = (row + col) % 3
          if (shape === 0) {
            return <circle key={`${row}-${col}`} cx={x} cy={y} r="10" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.15" />
          } else if (shape === 1) {
            return <rect key={`${row}-${col}`} x={x - 8} y={y - 8} width="16" height="16" rx="2" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.12" />
          }
          return <polygon key={`${row}-${col}`} points={`${x},${y - 10} ${x + 10},${y + 8} ${x - 10},${y + 8}`} fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.12" />
        }),
      )}
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">ACC</text>
    </svg>
  )
}

function SetsArt() {
  return (
    <svg viewBox="0 0 400 256" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="256" fill="#1E2428" />
      {/* Two silhouettes combined — top + bottom */}
      {/* Top (tee) */}
      <rect x="120" y="30" width="70" height="100" rx="6" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.15" />
      <line x1="120" y1="50" x2="95" y2="75" stroke="#60A5FA" strokeWidth="1" opacity="0.12" />
      <line x1="190" y1="50" x2="215" y2="75" stroke="#60A5FA" strokeWidth="1" opacity="0.12" />
      {/* Bottom (pants) */}
      <rect x="215" y="90" width="70" height="130" rx="4" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.15" />
      <line x1="250" y1="90" x2="250" y2="220" stroke="#3B82F6" strokeWidth="0.8" opacity="0.1" strokeDasharray="3 3" />
      {/* Connecting line */}
      <line x1="190" y1="80" x2="215" y2="130" stroke="#60A5FA" strokeWidth="0.8" opacity="0.1" strokeDasharray="4 4" />
      {/* Plus symbol */}
      <line x1="195" y1="100" x2="215" y2="100" stroke="#3B82F6" strokeWidth="2" opacity="0.2" />
      <line x1="205" y1="90" x2="205" y2="110" stroke="#3B82F6" strokeWidth="2" opacity="0.2" />
      <text x="30" y="240" fontFamily="'JetBrains Mono', monospace" fontSize="80" fontWeight="700" fill="#60A5FA" opacity="0.04">SET</text>
    </svg>
  )
}

// ─── Category data ───────────────────────────────────────────────────────────

const categories = [
  { id: 'hoodies', slug: 'hoodies', nombre: 'Hoodies', Art: HoodieArt },
  { id: 't-shirts', slug: 't-shirts', nombre: 'T-Shirts', Art: TeeArt },
  { id: 'pants', slug: 'pants', nombre: 'Pants', Art: PantsArt },
  { id: 'jackets', slug: 'jackets', nombre: 'Jackets', Art: JacketArt },
  { id: 'accesorios', slug: 'accesorios', nombre: 'Accesorios', Art: AccesoriosArt },
  { id: 'sets', slug: 'sets', nombre: 'Sets', Art: SetsArt },
] as const

// ─── CategoriasGrid Component ────────────────────────────────────────────────

export function CategoriasGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="bg-bg-surface dark:bg-bg-surface-dark py-16 sm:py-20"
    >
      <div className="max-w-content mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-accent mb-2">
            Explorá por estilo
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark">
            Encontrá lo tuyo
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(({ id, slug, nombre, Art }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link
                to={`/categoria/${slug}`}
                className="group relative block h-64 overflow-hidden rounded-lg"
              >
                {/* SVG Background */}
                <div className="absolute inset-0 transition-transform duration-normal ease-smooth group-hover:scale-[1.02] group-hover:rotate-[0.5deg]">
                  <Art />
                </div>

                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category name */}
                <div className="absolute bottom-4 left-4 z-raised">
                  <h3 className="text-2xl font-mono font-semibold text-white uppercase tracking-tight">
                    {nombre}
                  </h3>
                  <p className="text-xs text-asphalt-300 mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-normal">
                    Ver colección →
                  </p>
                </div>

                {/* Hover border accent */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-accent/30 transition-colors duration-normal" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
