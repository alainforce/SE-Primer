# SE Primer - Oturum Veri Sözlüğü (`data/SOZLUK.md`)

Bu doküman, `data/oturumlar.csv` veri setinde yer alan sütunların tanımlarını, veri tiplerini, izin verilen değerlerini ve makine öğrenmesi modelindeki rollerini açıklar.

---

## Sütun Tanımları

| Sütun Adı | Veri Tipi | Birim / Format | İzin Verilen Değerler | Açıklama ve Rol |
|---|---|---|---|---|
| `oturum_id` | String | Tanımlayıcı | Örn: `sess_a8f9c12d` | Tekil oturum kimliği. Ayrık oturum bölme (session-level train/test split) için kullanılır. Kişisel veri içermez. |
| `kaynak` | String | Kategorik | `gercek`, `sentetik` | Veri satırının üretim kaynağı. Gerçek kullanıcı oyunu (`gercek`) veya sentetik simülasyon (`sentetik`). |
| `sahne_no` | Integer | Sıra İndeksi | `1`, `2`, `3` | Mevcut karar aşaması. (1: Mimari / Rollback vs Hot-patch, 2: Test / Smoke vs Ship, 3: KVKK / Mask vs As-Is). **Model Niteliği**. |
| `seviye` | Integer | İkili (0/1) | `0` (Başlangıç), `1` (Deneyimli) | Oyuncunun onboarding aşamasında seçtiği deneyim seviyesi. **Model Niteliği**. |
| `rol` | String | Kategorik | `backend`, `devops`, `frontend` | Oyuncunun uzmanlık rolü (Terminoloji ve bağlam anlatımını etkiler). |
| `hedef` | String | Kategorik | `uptime`, `compliance`, `learning` | Oyuncunun kriz yönetimindeki öncelikli hedefi. |
| `karar_suresi_sn` | Float | Saniye (`sn`) | $\ge 0.0$ | Oyuncunun bu kararı verirken harcadığı toplam süre. |
| `onceki_ort_karar_suresi_sn` | Float | Saniye (`sn`) | $\ge 0.0$ | Aynı oturumda bu karardan önceki kararlarda harcanan sürelerin aritmetik ortalaması (Sahne 1 için `0.0`). **Model Niteliği**. |
| `onceki_ipucu_sayisi` | Integer | Adet | $\ge 0$ | Aynı oturumda bu karardan önce oyuncunun **yalnızca kendi isteğiyle açtığı veya sorduğu** ipucu sayısı (Model tarafından otomatik açılan ipuçları sayılmaz; Sahne 1 için `0`). **Model Niteliği**. |
| `onceki_riskli_secim_sayisi` | Integer | Adet | `0`, `1`, `2` | Aynı oturumda bu karardan önce yapılan riskli (Seçenek B) tercih sayısı (Sahne 1 için `0`). **Model Niteliği**. |
| `secim` | String | Harf | `A`, `B` | Oyuncunun verdiği karar (A: Savunmacı/Güvenli, B: Riskli/Agresif). |
| `riskli_secim` | Integer | İkili (0/1) | `0` (A seçildi), `1` (B seçildi) | **Model Hedef Değişkeni (Target)**. Oyuncunun kendi kararıyla B seçip seçmediği. |
| `zaman_asimi` | Integer | İkili (0/1) | `0` (Kendi seçimi), `1` (Süre dolumu) | Kararın 60s süresi dolduğu için sistem tarafından otomatik verilip verilmediği. **Model eğitiminde `zaman_asimi == 1` olan satırlar filtrelenir.** |

---

## Makine Öğrenmesi Nitelik Kümesi (Feature Set)

Karar anından hemen önce bilinen 5 nitelik:
1. `seviye` (0 veya 1)
2. `sahne_no` (1, 2, 3)
3. `onceki_ort_karar_suresi_sn` (sn)
4. `onceki_ipucu_sayisi` (adet)
5. `onceki_riskli_secim_sayisi` (adet)

**Hedef:** `riskli_secim` (0 veya 1).

---

## Sentetik Veri Üretim Mantığı (Synthetic Generation Rules)

`scripts/generate_synthetic_data.py` tarafından üretilen sentetik veriler şu olasılık dağılım kurallarına dayanır (Tohum: `seed=42`):
1. **Deneyim & Hız:** Deneyimli oyuncular (`seviye=1`) 60s sayaç baskısı altında kararları ortalama 12-28 saniyede verir; başlangıç oyuncuları (`seviye=0`) 25-50 saniyede verir.
2. **İpucu Kullanımı:** Başlangıç seviyesinde ipucu kullanım oranı %75 civarındadır; deneyimli oyuncularda %25 civarındadır.
3. **Risk Eğilimi:**
   - Çok hızlı karar veren (< 10s) ve ipucu kullanmayan oyuncularda riskli seçim (B) olasılığı belirgin şekilde artar (~%65-70).
   - İpucu inceleyen ve düşünme süresi yüksek olan oyuncularda savunmacı seçim (A) olasılığı artar (~%70-80).
   - Önceki kararlarda B seçen oyuncuların bir sonraki kararda da B seçme koşullu olasılığı (eylemsizlik momenti) yükselir.
   - Deneyimli modda oyuncuların yaklaşık %5'i süre aşımına (`zaman_asimi=1`) uğrar.

