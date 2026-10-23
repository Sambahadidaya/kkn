'use server';

// Server Action untuk Pencatatan Sampah oleh Petugas
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';
import { assertRole } from '../../../scurity/roleakses';

export async function getKategoriSampahAction() {
  try {
    const service = getSupabaseServiceClient();
    const { data: kategori, error: katErr } = await service
      .from('kategori_sampah')
      .select('id, slug, nama, deskripsi, urutan')
      .order('urutan', { ascending: true });

    if (katErr) throw katErr;

    const { data: jenis, error: jenErr } = await service
      .from('jenis_sampah')
      .select('id, kategori_id, nama, deskripsi, gambar');

    if (jenErr) throw jenErr;

    return {
      success: true,
      kategori: kategori || [],
      jenis: jenis || []
    };
  } catch (err) {
    return { success: false, error: err.message, kategori: [], jenis: [] };
  }
}

export async function simpanSetoranSampahAction({
  rumahId,
  wargaId,
  statusPilah, // 'sudah' (20 poin) | 'sebagian' (10 poin) | 'belum' (0 poin)
  catatan,
  items = [] // [{ kategori_id, jenis_id, berat_kg }]
}) {
  try {
    const profile = await assertRole(['petugas', 'admin']);
    const service = getSupabaseServiceClient();

    if (!rumahId || !wargaId) {
      return { success: false, error: 'Identitas rumah atau warga tidak valid.' };
    }

    if (!statusPilah) {
      return { success: false, error: 'Status pemilahan wajib dipilih.' };
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'Harap masukkan minimal satu jenis sampah dan berat timbangan.' };
    }

    // 1. Masukkan ke setoran_sampah (trigger di database akan otomatis memberi poin 20/10/0)
    const { data: setoran, error: setoranErr } = await service
      .from('setoran_sampah')
      .insert({
        rumah_id: rumahId,
        warga_id: wargaId,
        petugas_id: profile.id,
        status_pilah: statusPilah,
        catatan: catatan || null,
        tanggal: new Date().toISOString().split('T')[0]
      })
      .select('id, poin')
      .single();

    if (setoranErr) throw setoranErr;

    // 2. Masukkan rincian item timbangan
    const setoranItems = items
      .filter(it => Number(it.berat_kg) > 0)
      .map(it => ({
        setoran_id: setoran.id,
        kategori_id: it.kategori_id,
        jenis_id: it.jenis_id || null,
        berat_kg: Number(it.berat_kg)
      }));

    if (setoranItems.length > 0) {
      const { error: itemsErr } = await service.from('setoran_item').insert(setoranItems);
      if (itemsErr) throw itemsErr;
    }

    return {
      success: true,
      message: `Pencatatan berhasil! Warga mendapatkan poin pemilahan.`,
      setoranId: setoran.id
    };
  } catch (err) {
    console.error('Error simpanSetoranSampahAction:', err);
    return { success: false, error: err.message };
  }
}
