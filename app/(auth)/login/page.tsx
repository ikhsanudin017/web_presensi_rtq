export default function LoginChooser() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4 border rounded p-6 bg-white dark:bg-gray-900">
        <h1 className="text-2xl font-semibold">Pilih Jenis Login</h1>
        <p className="text-sm opacity-80">Silakan pilih halaman login sesuai peran Anda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <a href="/login/ustadz" className="block text-center px-4 py-3 rounded bg-primary hover:bg-primaryDark text-white">Login Ustadz</a>
          <a href="/login/orangtua" className="block text-center px-4 py-3 rounded border border-primary text-primary hover:bg-primary hover:text-white transition">Login Orang Tua</a>
        </div>
      </div>
    </main>
  )
}
