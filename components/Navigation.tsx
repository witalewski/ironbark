"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/exercises", label: "EXERCISES" },
  { href: "/workouts", label: "WORKOUTS" },
  { href: "/sessions", label: "HISTORY" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/20 z-50">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-4 text-center text-xs tracking-widest transition-colors ${
              pathname.startsWith(item.href)
                ? "text-white border-t border-white -mt-px"
                : "text-white/40 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex-1 py-4 text-center text-xs tracking-widest text-white/40 hover:text-white transition-colors"
        >
          SIGN OUT
        </button>
      </div>
    </nav>
  )
}
