import Image from "next/image";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-6">
        <div>
          <Image
            src="/logo-movimiento-en-marcha.png"
            alt="Movimiento en Marcha"
            width={140}
            height={140}
            className="h-20 w-auto"
          />

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
            Plataforma digital para registrar, evaluar y exhibir proyectos
            creativos orientados a organizaciones sociales.
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#2e5090]">
            Navegación
          </p>

          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <Link href="/" className="block hover:text-[#2e5090]">
              Inicio
            </Link>
            <Link href="/registro" className="block hover:text-[#2e5090]">
              Registro
            </Link>
            <Link href="/exposicion" className="block hover:text-[#2e5090]">
              Exposición
            </Link>
            <Link href="/login" className="block hover:text-[#2e5090]">
              Login
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#2e5090]">
            Categorías
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <p className="text-[#009e51]">Ambiental</p>
            <p className="text-[#f88f03]">Desarrollo</p>
            <p className="text-[#2e5090]">Derechos humanos</p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-100 px-4 py-4 text-center text-xs text-zinc-500">
        Movimiento en Marcha · Coloquio Creativo
      </div>
    </footer>
  );
}