import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { BusinessProfile } from '../types';
import { Save, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '', address: '', phone: '', owner: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setProfile(StorageService.getProfile());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveProfile(profile);
    setMessage('Profil berhasil disimpan!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = () => {
    if (confirm("PERINGATAN: Ini akan menghapus semua data (transaksi, produk) dan mereset ke awal. Lanjutkan?")) {
      StorageService.resetData();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Toko</h2>
        <p className="text-gray-500">Kelola informasi profil bisnis Anda.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              value={profile.owner}
              onChange={e => setProfile({...profile, owner: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={profile.address}
              onChange={e => setProfile({...profile, address: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})}
            />
          </div>

          <div className="pt-4 flex items-center justify-between">
             {message && <span className="text-green-600 text-sm font-medium">{message}</span>}
             <div className="flex-1"></div>
             <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
             >
               <Save size={18} /> Simpan Perubahan
             </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-100 p-6">
        <h3 className="text-red-800 font-bold mb-2">Zona Bahaya</h3>
        <p className="text-sm text-red-600 mb-4">Mereset data akan menghapus semua riwayat penjualan dan stok barang. Tindakan ini tidak dapat dibatalkan.</p>
        <button
          onClick={handleReset}
          className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center gap-2"
        >
          <RefreshCw size={16} /> Reset Semua Data Aplikasi
        </button>
      </div>
    </div>
  );
};

export default Settings;