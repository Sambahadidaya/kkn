'use client';

import { useState, useEffect } from 'react';
import { getDaftarAkunAction, buatAkunAparaturAction, toggleStatusAkunAction } from '../../../api/supabase/admin/auth';
import { getDaftarWilayahAction } from '../../../api/supabase/public/registrasi';
import Modal from '../../../components/modal';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import { UserPlus, UserCheck, Shield, Check, X, Search } from 'lucide-react';

export default function AdminAkunPage() {
  const [accounts, setAccounts] = useState([]);
  const [wilayah, setWilayah] = useState({ rw: [], rt: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    noTelepon: '',
    password: '',
    role: 'petugas',
    rtId: '',
    rwId: ''
  });

  const loadData = async () => {
    try {
      const [accRes, wilRes] = await Promise.all([
        getDaftarAkunAction(),
        getDaftarWilayahAction()
      ]);
      setAccounts(accRes.data || []);
      setWilayah({ rw: wilRes.rw || [], rt: wilRes.rt || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuatAkun = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotif(null);

    try {
      const res = await buatAkunAparaturAction(formData);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        setModalOpen(false);
        setFormData({
          nama: '',
          username: '',
          email: '',
          noTelepon: '',
          password: '',
          role: 'petugas',
          rtId: '',
          rwId: ''
        });
        loadData();
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'Gagal membuat akun.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAktif = async (userId, currentStatus) => {
    try {
      await toggleStatusAkunAction(userId, !currentStatus);
      loadData();
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.nama?.toLowerCase().includes(search.toLowerCase()) ||
    acc.email?.toLowerCase().includes(search.toLowerCase()) ||
    acc.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Kelola Akun Aparatur</h2>
          <p className="text-sm text-stone-500">Pendaftaran manual akun Petugas, RT, RW, dan Kelurahan</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-5 h-5" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      {/* Pencarian */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <Search className="w-5 h-5 text-stone-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau role..."
          className="flex-1 text-sm bg-transparent border-none outline-hidden"
        />
      </div>

      {/* Tabel Akun */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><Spinner text="Memuat akun..." /></div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-sm">Tidak ada akun ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-[#f7faf8] text-xs uppercase font-semibold text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Nama & Username</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Wilayah</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{acc.nama}</div>
                      <div className="text-xs text-stone-500">@{acc.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{acc.email}</div>
                      <div className="text-xs text-stone-500">{acc.no_telepon || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        acc.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        acc.role === 'petugas' ? 'bg-blue-100 text-blue-800' :
                        acc.role === 'rt' ? 'bg-emerald-100 text-emerald-800' :
                        acc.role === 'rw' ? 'bg-amber-100 text-amber-800' :
                        acc.role === 'kelurahan' ? 'bg-teal-100 text-teal-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {acc.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {acc.rt ? `RT ${acc.rt.nomor}` : ''}
                      {acc.rw ? ` RW ${acc.rw.nomor}` : ''}
                      {!acc.rt && !acc.rw ? '-' : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${acc.aktif ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {acc.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleAktif(acc.id, acc.aktif)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                            acc.aktif
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {acc.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Akun Baru */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Daftarkan Akun Aparatur Baru"
      >
        <form onSubmit={handleBuatAkun} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Role Aparatur
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
            >
              <option value="petugas">Petugas Pengambil Sampah</option>
              <option value="rt">Rukun Tetangga (RT)</option>
              <option value="rw">Rukun Warga (RW)</option>
              <option value="kelurahan">Aparatur Kelurahan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="budir01"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">No. Telepon</label>
              <input
                type="text"
                required
                value={formData.noTelepon}
                onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
                placeholder="08123456789"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="budi@email.com"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Kata Sandi</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
            />
          </div>

          {/* Pemilihan Wilayah RT / RW */}
          {(formData.role === 'rt' || formData.role === 'rw') && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Pilih RW</label>
                <select
                  value={formData.rwId}
                  onChange={(e) => setFormData({ ...formData, rwId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                >
                  <option value="">-- Pilih RW --</option>
                  {wilayah.rw.map(rw => (
                    <option key={rw.id} value={rw.id}>RW {rw.nomor}</option>
                  ))}
                </select>
              </div>

              {formData.role === 'rt' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Pilih RT</label>
                  <select
                    value={formData.rtId}
                    onChange={(e) => setFormData({ ...formData, rtId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                  >
                    <option value="">-- Pilih RT --</option>
                    {wilayah.rt
                      .filter(rt => !formData.rwId || rt.rw_id === formData.rwId)
                      .map(rt => (
                        <option key={rt.id} value={rt.id}>RT {rt.nomor}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Spinner size="sm" /> : 'Simpan Akun'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
