export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <img src="/images/rubrica-logo.png" alt="Rubrica Logo" className="h-20" />
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
