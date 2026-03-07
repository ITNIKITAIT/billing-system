import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Billing System</h1>
      <nav className="flex gap-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <Link href="/clients" className="text-blue-600 hover:underline">
          Clients
        </Link>
      </nav>
    </>
  );
}
