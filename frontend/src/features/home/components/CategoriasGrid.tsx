import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// ─── Category data ───────────────────────────────────────────────────────────

const categories = [
  {
    id: 'hoodies',
    slug: 'hoodies',
    nombre: 'Hoodies',
    img: 'https://media.istockphoto.com/id/2156898498/photo/woman-wearing-a-black-hoodie.jpg?s=612x612&w=0&k=20&c=xuE30acUqypB2_4hqGc2g4_YibzNFuqSU8KRBIjULLU=',
    imgAlt: 'Hoodie oversize streetwear',
  },
  {
    id: 't-shirts',
    slug: 't-shirts',
    nombre: 'T-Shirts',
    img: 'https://theurbanmove.com/cdn/shop/products/Urban-Move-Streetwear-Shop-Boxout-Tee-Freddy-2_1400x.jpg?v=1618667869',
    imgAlt: 'T-shirt estilo urbano',
  },
  {
    id: 'pants',
    slug: 'pants',
    nombre: 'Pants',
    img: 'https://cdn.shopify.com/s/files/1/0263/6270/8027/files/pantalon-cargo-streetwear-03.jpg?v=1651430141',
    imgAlt: 'Pantalones streetwear cargo',
  },
  {
    id: 'jackets',
    slug: 'jackets',
    nombre: 'Jackets',
    img: 'https://m.media-amazon.com/images/I/81dSR0CiR-L.jpg',
    imgAlt: 'Jacket urbana streetwear',
  },
  {
    id: 'accesorios',
    slug: 'accesorios',
    nombre: 'Accesorios',
    img: 'https://i.etsystatic.com/35403789/r/il/68e1cb/4657778194/il_794xN.4657778194_71zi.jpg',
    imgAlt: 'Accesorios streetwear snapback cap',
  },
  {
    id: 'sets',
    slug: 'sets',
    nombre: 'Sets',
    img: 'https://i.pinimg.com/originals/fa/2f/00/fa2f000d211db6eb257ac41371f21ad8.jpg',
    imgAlt: 'Set completo outfit streetwear urbano',
  },
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
          {categories.map(({ id, slug, nombre, img, imgAlt }, index) => (
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
                {/* Photo background */}
                <div className="absolute inset-0 transition-transform duration-500 ease-smooth group-hover:scale-105">
                  <img
                    src={img}
                    alt={imgAlt}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    draggable={false}
                  />
                </div>

                {/* Strong bottom gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* Category name */}
                <div className="absolute bottom-4 left-4 z-raised">
                  <h3 className="text-2xl font-mono font-semibold text-white uppercase tracking-tight drop-shadow-lg">
                    {nombre}
                  </h3>
                  <p className="text-xs text-white/70 mt-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-normal">
                    Ver colección →
                  </p>
                </div>

                {/* Hover border accent */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-accent/40 transition-colors duration-normal" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
