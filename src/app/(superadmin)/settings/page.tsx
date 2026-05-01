export default function SuperadminSettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi global aplikasi</p>
      </div>
      <div className="bg-white rounded-2xl border p-6 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Default Slot Waktu</h3>
          <p className="text-sm text-gray-500">Slot waktu default adalah 08:00 - 22:00 (14 slot per jam). Slot dapat dikustomisasi per court melalui halaman manajemen venue.</p>
        </div>
        <div className="border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-2">Batas Waktu Upload</h3>
          <p className="text-sm text-gray-500">Booking yang tidak melakukan upload bukti transfer dalam 2 jam akan otomatis berubah status menjadi EXPIRED.</p>
        </div>
        <div className="border-t pt-6">
          <h3 className="font-bold text-gray-900 mb-2">Format Kode Booking</h3>
          <p className="text-sm text-gray-500 font-mono">PDL-YYYYMMDD-XXXXXX</p>
        </div>
      </div>
    </div>
  );
}
