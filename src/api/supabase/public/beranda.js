'use server';

// Server Action untuk Dashboard Beranda Lintas Role
import { getCurrentUserProfile } from '../../../scurity/roleakses';
import { getSupabaseServiceClient } from '../../../utils/supabaseUtils';

export async function getBerandaDataAction() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return { success: false, error: 'Belum login' };
    }

    const service = getSupabaseServiceClient();
    const role = profile.role;
    let berandaData = {};

    // 1. DATA KHUSUS WARGA
    if (role === 'warga') {
      // Ambil poin & kg dari tabel peringkat
      const { data: rank } = await service
        .from('peringkat')
        .select('*')
        .eq('warga_id', profile.id)
        .maybeSingle();

      // Ambil jadwal patroli terdekat untuk RT-nya
      let jadwalTerdekat = null;
      if (profile.rt_id) {
        const { data: jadwal } = await service
          .from('jadwal_patroli_rt')
          .select('jadwal:jadwal_id(id, tanggal, jam_mulai, status, catatan, petugas:petugas_id(nama))')
          .eq('rt_id', profile.rt_id)
          .gte('jadwal.tanggal', new Date().toISOString().split('T')[0])
          .order('jadwal(tanggal)', { ascending: true })
          .limit(1)
          .maybeSingle();
        jadwalTerdekat = jadwal?.jadwal || null;
      }

      // Ambil 3 setoran terakhir
      const { data: recentSetoran } = await service
        .from('setoran_sampah')
        .select('id, tanggal, status_pilah, poin, setoran_item(berat_kg, kategori:kategori_id(nama))')
        .eq('warga_id', profile.id)
        .order('tanggal', { ascending: false })
        .limit(3);

      berandaData = {
        totalPoin: rank?.total_poin || 0,
        totalKg: rank?.total_kg || 0,
        statusPilah: rank?.status_pilah_terakhir || 'belum',
        jadwalTerdekat,
        riwayatSingkat: recentSetoran || []
      };
    }

    // 2. DATA KHUSUS PETUGAS
    else if (role === 'petugas') {
      // Hitung jadwal patroli hari ini
      const today = new Date().toISOString().split('T')[0];
      const { data: jadwalHariIni } = await service
        .from('jadwal_patroli')
        .select('id, tanggal, jam_mulai, status, catatan, rts:jadwal_patroli_rt(rt:rt_id(nomor, rw:rw_id(nomor)))')
        .eq('petugas_id', profile.id)
        .eq('tanggal', today);

      // Hitung total setoran yang dicatat petugas
      const { count: totalDicatat } = await service
        .from('setoran_sampah')
        .select('*', { count: 'exact', head: true })
        .eq('petugas_id', profile.id);

      berandaData = {
        jadwalHariIni: jadwalHariIni || [],
        totalDicatat: totalDicatat || 0
      };
    }

    // 3. DATA KHUSUS RT
    else if (role === 'rt') {
      // Total warga di RT
      const { count: jumlahWarga } = await service
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('rt_id', profile.rt_id)
        .eq('role', 'warga');

      // Total kg sampah di RT
      const { data: rtRank } = await service
        .from('peringkat')
        .select('total_kg, total_poin, status_pilah_terakhir')
        .eq('rt_id', profile.rt_id);

      const totalKg = rtRank?.reduce((acc, r) => acc + Number(r.total_kg || 0), 0) || 0;
      const wargaSudahPilah = rtRank?.filter(r => r.status_pilah_terakhir === 'sudah').length || 0;

      // 5 warga teratas di RT
      const { data: topWarga } = await service
        .from('peringkat')
        .select('warga_id, nama_tampil, total_poin, total_kg, status_pilah_terakhir')
        .eq('rt_id', profile.rt_id)
        .order('total_poin', { ascending: false })
        .limit(5);

      berandaData = {
        jumlahWarga: jumlahWarga || 0,
        totalKg: Number(totalKg.toFixed(2)),
        wargaSudahPilah,
        topWarga: topWarga || []
      };
    }

    // 4. DATA KHUSUS RW
    else if (role === 'rw') {
      const { data: rekapRt } = await service.rpc('rekap_rt');
      berandaData = {
        rekapRt: rekapRt || []
      };
    }

    // 5. DATA KHUSUS KELURAHAN
    else if (role === 'kelurahan') {
      const { data: rekapRw } = await service.rpc('rekap_rw');
      const { data: rekapRt } = await service.rpc('rekap_rt');
      berandaData = {
        rekapRw: rekapRw || [],
        rekapRt: rekapRt || []
      };
    }

    return {
      success: true,
      role,
      profile,
      data: berandaData
    };
  } catch (err) {
    console.error('Error getBerandaDataAction:', err);
    return { success: false, error: err.message };
  }
}
