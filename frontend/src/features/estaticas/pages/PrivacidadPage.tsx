import { motion } from 'framer-motion'

export function PrivacidadPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
        Política de privacidad
      </h1>
      <p className="text-xs text-text-muted dark:text-text-muted-dark mb-8">
        Última actualización: 1 de mayo de 2026
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            1. Datos que recopilamos
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Recopilamos únicamente la información necesaria para procesar tus pedidos: nombre,
            apellido, email, teléfono, RUC/cédula y direcciones de envío. También almacenamos
            datos de navegación anónimos para mejorar la experiencia.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            2. Uso de la información
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Tus datos se utilizan exclusivamente para: procesar y enviar tus pedidos, emitir
            comprobantes de pago, comunicarnos contigo sobre el estado de tus compras, y mejorar
            nuestro servicio. No vendemos ni compartimos tu información con terceros.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            3. Seguridad
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Utilizamos encriptación estándar de la industria (HTTPS, bcrypt para contraseñas, JWT
            para sesiones). Los pagos con tarjeta se procesan a través de Stripe, un procesador
            certificado PCI DSS. Nunca almacenamos datos completos de tarjetas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            4. Tus derechos
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Podés solicitar la modificación o eliminación de tus datos personales en cualquier momento
            escribiendo a{' '}
            <a href="mailto:hola@vault16.ec" className="text-accent hover:underline">
              hola@vault16.ec
            </a>.
            Responderemos en un plazo máximo de 15 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            5. Cookies
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            Usamos cookies esenciales para el funcionamiento del sitio (sesión, carrito, preferencias
            de tema). No usamos cookies de tracking de terceros ni publicidad programática.
          </p>
        </section>
      </div>
    </motion.div>
  )
}
