export default function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-3 lg:px-6">
        <div>
          <p className="text-base font-semibold text-zinc-900">
            Coloquio Digital
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Plataforma para registro, gestión de equipos, evaluación docente y
            seguimiento del coloquio académico.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900">Navegación</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>Inicio</li>
            <li>Registro</li>
            <li>Login</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-900">Estado</p>
          <p className="mt-3 text-sm text-zinc-600">
            Sistema en funcionamiento para gestión de equipos, salas y
            evaluaciones.
          </p>
        </div>
      </div>
    </footer>
  );
}