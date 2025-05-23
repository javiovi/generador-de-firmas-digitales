export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-gray-200 bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Identymail. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
