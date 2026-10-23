'use client';

import { useState, useEffect } from 'react';
import { getAiConfigAdminAction, simpanAiConfigAction } from '../../../api/supabase/admin/ai';
import Notifikasi from '../../../components/notifikasi';
import Spinner from '../../../components/spinner';
import { Bot, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminAiConfigPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState(null);

  const [form, setForm] = useState({
    modelOcr: 'gpt-4o-mini',
    modelAsisten: 'gpt-4o-mini',
    systemPromptAsisten: '',
    promptOcrKtp: '',
    asistenAktif: true
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getAiConfigAdminAction();
        if (res.success && res.data) {
          setForm({
            modelOcr: res.data.model_ocr || 'gpt-4o-mini',
            modelAsisten: res.data.model_asisten || 'gpt-4o-mini',
            systemPromptAsisten: res.data.system_prompt_asisten || '',
            promptOcrKtp: res.data.prompt_ocr_ktp || '',
            asistenAktif: Boolean(res.data.asisten_aktif)
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotif(null);

    try {
      const res = await simpanAiConfigAction(form);
      if (res.success) {
        setNotif({ tipe: 'sukses', pesan: res.message });
      } else {
        setNotif({ tipe: 'error', pesan: res.error || 'Gagal menyimpan konfigurasi.' });
      }
    } catch (err) {
      setNotif({ tipe: 'error', pesan: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Spinner text="Memuat konfigurasi AI..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Bot className="w-6 h-6 text-[#2d6a4f]" />
          <span>Konfigurasi Kecerdasan Buatan (AI)</span>
        </h2>
        <p className="text-sm text-stone-500">
          Atur model OpenAI, prompt OCR dokumen KTP, serta kepribadian asisten edukasi sampah
        </p>
      </div>

      {notif && <Notifikasi tipe={notif.tipe} pesan={notif.pesan} onClose={() => setNotif(null)} />}

      <form onSubmit={handleSimpan} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
        {/* Toggle Status Asisten AI */}
        <div className="flex items-center justify-between p-4 bg-[#f7faf8] rounded-2xl border border-stone-200">
          <div>
            <h4 className="font-bold text-stone-900 text-sm">Status Widget Asisten AI</h4>
            <p className="text-xs text-stone-500">Aktifkan atau matikan fitur tanya jawab AI di halaman warga</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.asistenAktif}
              onChange={(e) => setForm({ ...form, asistenAktif: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a4f]"></div>
          </label>
        </div>

        {/* Model Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
              Model Vision OCR KTP
            </label>
            <select
              value={form.modelOcr}
              onChange={(e) => setForm({ ...form, modelOcr: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Cepat & Ekonomis - Direkomendasikan)</option>
              <option value="gpt-4o">gpt-4o (Akurasi Vision Maksimal)</option>
            </select>
            <span className="text-[11px] text-stone-400 mt-1 block">Digunakan pada saat warga memindai foto KTP</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
              Model Chat Asisten Edukasi
            </label>
            <select
              value={form.modelAsisten}
              onChange={(e) => setForm({ ...form, modelAsisten: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Cepat & Responsif)</option>
              <option value="gpt-4o">gpt-4o (Kemampuan Nalar Tinggi)</option>
            </select>
            <span className="text-[11px] text-stone-400 mt-1 block">Digunakan pada percakapan tanya jawab warga</span>
          </div>
        </div>

        {/* System Prompt Asisten */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
            System Prompt Asisten Sampah
          </label>
          <textarea
            rows={4}
            value={form.systemPromptAsisten}
            onChange={(e) => setForm({ ...form, systemPromptAsisten: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
            placeholder="Instruksi perilaku dan gaya bahasa asisten..."
          />
          <span className="text-[11px] text-stone-400 mt-1 block">
            Panduan karakter dan instruksi utama saat asisten menjawab pertanyaan warga
          </span>
        </div>

        {/* Prompt OCR KTP */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase mb-1.5">
            Prompt Ekstraksi Dokumen KTP (Vision)
          </label>
          <textarea
            rows={3}
            value={form.promptOcrKtp}
            onChange={(e) => setForm({ ...form, promptOcrKtp: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-xl focus:border-[#2d6a4f]"
            placeholder="Perintah ekstraksi JSON identitas KTP..."
          />
          <span className="text-[11px] text-stone-400 mt-1 block">
            Instruksi yang dikirimkan ke model vision untuk membaca bagian-bagian KTP
          </span>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Spinner size="sm" /> : <Save className="w-5 h-5" />}
            <span>Simpan Konfigurasi AI</span>
          </button>
        </div>
      </form>
    </div>
  );
}
