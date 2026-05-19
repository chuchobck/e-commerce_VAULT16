import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Instagram, Send } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/hooks/useToast'

export function ContactoPage() {
  const { success } = useToast()
  const [sending, setSending] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      success('¡Mensaje enviado! Te responderemos pronto.')
      ;(e.target as HTMLFormElement).reset()
    }, 800)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-content mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
        Contacto
      </h1>
      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-8">
        ¿Tenés alguna pregunta? Escribinos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre" placeholder="Tu nombre" fullWidth required />
              <Input label="Email" type="email" placeholder="tu@email.com" fullWidth required />
            </div>
            <Input label="Asunto" placeholder="¿Sobre qué querés hablar?" fullWidth required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                Mensaje
              </label>
              <textarea
                placeholder="Contanos..."
                rows={5}
                required
                className="w-full rounded-md border px-3 py-2 text-base font-sans transition-colors duration-fast bg-bg-base dark:bg-bg-hover-dark border-border-base dark:border-border-base-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-muted dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-none"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" loading={sending} leftIcon={<Send className="h-4 w-4" />}>
              Enviar mensaje
            </Button>
          </form>
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">Email</h3>
            <a href="mailto:hola@vault16.ec" className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Mail className="h-4 w-4" />
              hola@vault16.ec
            </a>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">Redes</h3>
            <div className="space-y-2">
              <a href="https://instagram.com/vault16ec" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors">
                <Instagram className="h-4 w-4" />
                @vault16ec
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">Ubicación</h3>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              Quito, Ecuador 🇪🇨
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
