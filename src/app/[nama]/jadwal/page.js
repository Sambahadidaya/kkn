'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getJadwalPatroliAction, simpanJadwalAction, hapusJadwalAction } from '../../../api/supabase/public/jadwal';
import { getDaftarWilayahAction } from '../../../api/supabase/public/registrasi';
import Modal from '../../../components/modal';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import { Calendar, Plus, Trash2, Edit3, Clock, MapPin } from 'lucide-react';

export default function JadwalPage() {
  const params = useParams();
  const role = params?.nama?.toLowerCase();
  const isPetugasOrAdmin = role === 'petugas' || role === 'admin';

  const [jadwalList, setJadwalList] = useState([]);
  const [wilayah, setWilayah] = useState({ rw: [], rt: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().split('T')[0],
    jamMulai: '08:00',
    jamSelesai: '11:00',
    rtIds: [],
    catatan: '',
    status: 'terjadwal'
  });

  const loadJadwal = async () => {
    try {
      const [jRes, wRes] = await Promise.all([
        getJadwalPatroliAction(),
        getDaftarWilayahAction()
      ]);
      setJadwalList(jRes.data || []);
      setWilayah({ rw: wRes.rw || [], rt: wRes.rt || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJadwal();
  }, []);

  const handleBukaTambah = () => {
    setForm({
      id: null,
      tanggal: new Date().toISOString().split('T')[0],
      jamMulai: '08:00',
      jamSelesai: '11:00',
      rtIds: [],
      catatan: '',
      status: 'terjadwal'
    });
    setModalOpen(true);
  };

  const handleEdit = (j) => {
    const existingRtIds = (j.rts || []).map(r => r.rt?.id).filter(Boolean);
    setForm({
      id: j.id,
      tanggal: j.tanggal,
      jamMulai: j.jam_mulai?.slice(0, 5) || '08:00',
      jamSelesai: j.jam_selesai?.slice(0, 5) || '',
      rtIds: existingRtIds,
      catatan: j.catatan || '',
      status: j.status || 'terjadwal'
    });
    setModalOpen(true);
  };

  const handleHapus = async (id) => {
    if (!confirm('Hapus jadwal patroli ini?')) return;
    try {
      const res = await hapusJadwalAction(id);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: 'Jadwal berhasil dihapus.' });
        loadJadwal();
      } else {
        setNotif({ tipe: 'error', pesan: res.error });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (form.rtIds.length === 0) {
      setNotif({ tipe: 'error', pesan: 'Pilih minimal satu RT tujuan patroli.' });
      return;
    }

    setSubmitting(true);
    setNotif(null);

    try {
      const res = await simpanJadwalAction(form);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
        setModalOpen(false);
        loadJadwal();
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'Gagal menyimpan jadwal.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRtSelect = (rtId) => {
    setForm(prev => {
      const exists = prev.rtIds.includes(rtId);
      return {
        ...prev,
        rtIds: exists ? prev.rtIds.filter(id => id !== rtId) : [...prev.rtIds, rtId]
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#2d6a4f]" />
            <span>Jadwal Pengambilan Sampah</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Jadwal operasional petugas patroli di lingkungan RT & RW
          </p>
        </div>

        {isPetugasOrAdmin && (
          <button
            onClick={handleBukaTambah}
            className="py-2.5 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-xs flex items-center gap-2 text-sm self-start sm:self-auto transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Atur Jadwal Patroli</span>
          </button>
        )}
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      {/* Daftar Kartu Jadwal */}
      {loading ? (
        <div className="p-8 text-center"><Spinner text="Memuat jadwal..." /></div>
      ) : jadwalList.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm">
          Belum ada jadwal patroli yang direncanakan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jadwalList.map((j) => (
            <div
              key={j.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2d6a4f] bg-[#eef8f2] px-2.5 py-1 rounded-full">
                    {j.tanggal}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    j.status === 'selesai' ? 'bg-stone-100 text-stone-700' :
                    j.status === 'berlangsung' ? 'bg-blue-100 text-blue-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {j.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <Clock className="w-4 h-4 text-stone-400" />
                  <span>Pukul {j.jam_mulai?.slice(0, 5)} {j.jam_selesai ? `- ${j.jam_selesai?.slice(0, 5)}` : ''} WIB</span>
                </div>

                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-800">Wilayah Patroli: </span>
                    {j.rts?.length > 0 ? (
                      j.rts.map(r => `RT ${r.rt?.nomor}/RW ${r.rt?.rw?.nomor}`).join(', ')
                    ) : (
                      'Belum ditentukan'
                    )}
                  </div>
                </div>

                {j.catatan && (
                  <p className="text-xs text-stone-500 italic bg-[#f7faf8] p-2.5 rounded-xl border border-stone-100">
                    "{j.catatan}"
                  </p>
                )}
              </div>

              {/* Aksi Khusus Petugas / Admin */}
              {isPetugasOrAdmin && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleEdit(j)}
                    className="p-2 text-stone-600 hover:text-[#2d6a4f] hover:bg-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => handleHapus(j.id)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD Jadwal untuk Petugas */}
      {isPetugasOrAdmin && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={form.id ? 'Ubah Jadwal Patroli' : 'Buat Jadwal Patroli Baru'}
        >
          <form onSubmit={handleSimpan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Tanggal Patroli
              </label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Jam Mulai
                </label>
                <input
                  type="time"
                  required
                  value={form.jamMulai}
                  onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Jam Selesai (Opsional)
                </label>
                <input
                  type="time"
                  value={form.jamSelesai}
                  onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Pilih RT yang Dipatroli (Bisa Lebih Dari 1)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-[#f7faf8] rounded-xl border border-stone-200">
                {wilayah.rt.map((rt) => {
                  const checked = form.rtIds.includes(rt.id);
                  return (
                    <label
                      key={rt.id}
                      onClick={() => toggleRtSelect(rt.id)}
                      className={`p-2 rounded-lg text-xs font-semibold cursor-pointer border flex items-center gap-2 ${
                        checked
                          ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      <input type="checkbox" checked={checked} readOnly className="sr-only" />
                      <span>RT {rt.nomor}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Status Patroli
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              >
                <option value="terjadwal">Terjadwal</option>
                <option value="berlangsung">Sedang Berlangsung</option>
                <option value="selesai">Selesai</option>
                <option value="batal">Batal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Catatan / Instruksi
              </label>
              <textarea
                rows={2}
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Contoh: Fokus pada sampah daur ulang dan kardus"
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
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
                {submitting ? <Spinner size="sm" /> : 'Simpan Jadwal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
