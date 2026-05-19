import { motion } from 'framer-motion'

export function TerminosPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
        Términos y condiciones
      </h1>
      <p className="text-xs text-text-muted dark:text-text-muted-dark mb-8">
        Última actualización: 1 de mayo de 2026
      </p>

      <div className="prose-vault space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            1. Aceptación de los términos
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Al acceder y utilizar el sitio web de VAULT 16 (vault16.ec), aceptás estos términos y
            condiciones en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que
            no uses nuestro sitio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            2. Productos y precios
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Los precios mostrados en el sitio incluyen IVA y están expresados en dólares estadounidenses (USD).
            Nos reservamos el derecho de modificar precios sin previo aviso. Los precios aplicables son los
            vigentes al momento de confirmar tu pedido.
          </p>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed mt-2">
            Las imágenes de los productos son referenciales. Pueden existir variaciones menores de
            color debido a las pantallas de los dispositivos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            3. Envíos y devoluciones
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Los tiempos de envío son estimados y pueden variar según la ubicación. Realizamos envíos
            a todo Ecuador continental. Para devoluciones, aceptamos cambios dentro de los 15 días
            posteriores a la recepción del producto, siempre que el artículo esté en su estado original
            con etiquetas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            4. Propiedad intelectual
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Todo el contenido del sitio web — incluyendo textos, diseños, logos, gráficos y código —
            es propiedad de VAULT 16 y está protegido por las leyes de propiedad intelectual del Ecuador.
            No está permitida su reproducción sin autorización escrita.
          </p>
        </section>
      </div>
    </motion.div>
  )
}
