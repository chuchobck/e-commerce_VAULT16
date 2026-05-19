import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

export function AcercaPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-content mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-asphalt-900 dark:bg-asphalt-950 mb-12">
        <svg viewBox="0 0 800 300" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="800" height="300" fill="#0E1114" />
          <circle cx="400" cy="150" r="200" fill="none" stroke="hsla(220, 80%, 55%, 0.08)" strokeWidth="1" />
          <circle cx="400" cy="150" r="140" fill="none" stroke="hsla(220, 80%, 55%, 0.05)" strokeWidth="1" />
          <circle cx="400" cy="150" r="80" fill="none" stroke="hsla(220, 80%, 55%, 0.03)" strokeWidth="1" />
          <line x1="0" y1="150" x2="800" y2="150" stroke="hsla(220, 80%, 55%, 0.04)" strokeWidth="0.5" />
          <line x1="400" y1="0" x2="400" y2="300" stroke="hsla(220, 80%, 55%, 0.04)" strokeWidth="0.5" />
          <text x="400" y="160" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="48" fontWeight="600" fill="hsla(220, 80%, 55%, 0.06)">V16</text>
        </svg>
        <div className="relative px-6 sm:px-12 py-16 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3">
            VAULT <span className="text-accent">16</span>
          </h1>
          <p className="text-lg text-asphalt-200 max-w-lg mx-auto">
            Streetwear desde Quito para la calle.
          </p>
        </div>
      </div>

      {/* Content blocks */}
      <div className="max-w-prose mx-auto space-y-12">
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-3">
            Origen
          </h2>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            VAULT 16 nace en Quito en 2026. No empezó en una oficina ni con un plan de negocios bonito.
            Empezó con una idea simple: hacer ropa que realmente quieras ponerte. Que te sirva para
            la calle, para el bus, para el parche. Sin pretensiones, sin poses.
          </p>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed mt-3">
            Somos un equipo chico de Quito que diseña, produce y vende directo. Nada de intermediarios,
            nada de sobreprecio. Lo que ves es lo que hay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-3">
            Filosofía
          </h2>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            No hacemos "moda rápida" ni perseguimos tendencias de TikTok. Hacemos piezas que se ven
            bien hoy y se van a ver bien el próximo año. Hoodies oversized, tees de buen gramaje,
            pants con corte real. Colores que combinan con todo.
          </p>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed mt-3">
            Cada pieza pasa por nuestras manos antes de salir. Si no la usaríamos nosotros,
            no la vendemos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-3">
            Materiales y producción
          </h2>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Trabajamos con tela peruana de calidad — algodón peinado, french terry, fleece de buen peso.
            La producción es local, en talleres de Quito que pagan bien y cumplen horarios humanos.
          </p>
          <p className="text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed mt-3">
            No vamos a decir que somos una marca "sustentable" porque ese término ya perdió sentido.
            Lo que sí hacemos es producir tirajes cortos para no generar desperdicio, y elegir
            materiales que duren. Si tu hoodie se rompe en 6 meses, fallamos.
          </p>
        </section>

        <div className="text-center pt-4">
          <Link to="/catalogo">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Ver catálogo
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
