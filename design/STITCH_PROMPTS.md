# YZM301 - SE Primer: Google Stitch Ekran Promptları (`design/STITCH_PROMPTS.md`)

Bu dosya, Google Labs tarafından geliştirilen Stitch arayüz prototip aracına doğrudan yapıştırılmak üzere hazırlanmış 3 adet ekran oluşturma istemini (prompt) içerir. Tüm istemler `DESIGN.md` dosyasındaki tasarım tokenları, renk paleti (#0B132B, #14213D, #FCA311), serif başlıklar ve Neal Stephenson'ın *The Diamond Age* etkileşimli Primer atmosferiyle tam uyumludur. Arayüz metinlerinde Türkçe ifadeler kullanılmış, yalnızca uluslararası standart teknik terimler (Rollback, Hot-patch, Smoke Test, Pod, Ingress) korunmuştur.

---

## 1. Ekran 1: Onboarding (3 Soruluk Başlangıç ve Kişiselleştirme Ekranı)

```text
A mobile web application screen for a software engineering interactive storybook titled "SE Primer", inspired by Neal Stephenson's The Diamond Age.

Dimensions & Device: Mobile portrait layout (390x844 px), modern smartphone form factor with subtle dark framing.
Visual Mood: Deep dark navy background (#0B132B), dark slate card surfaces (#14213D), warm golden-amber accent (#FCA311), and crisp white text. An aesthetic blending an antique illuminated technical handbook with a modern on-call SRE incident console.

Header:
- Top title in serif font (Playfair Display / Merriweather, 20px, bold): "SE Primer: Sistem Mühendisi El Kitabı"
- Subtitle in muted slate-300 (13px): "Nöbet Öncesi Mühendislik Profili ve Kişiselleştirme"

Content Sections (Form with no pre-selected options):
1. Soru 1 (Deneyim Seviyesi):
   - Label: "Mühendislik Deneyiminiz"
   - Two selectable option cards (both unselected by default, dark surface #1C2A4A, border #253659):
     * Card 1: "Başlangıç" - subtitle: "Sokratik rehber ipuçları her kararda açık gelir"
     * Card 2: "Deneyimli" - subtitle: "60 saniyelik kriz geri sayım baskısı aktif"
2. Soru 2 (Mühendislik Rolü):
   - Label: "Uzmanlık Alanınız"
   - Three selectable option cards (unselected by default):
     * Card 1: "Backend Mühendisi" - subtitle: "Veritabanı havuzu ve şema odaklı"
     * Card 2: "DevOps Mühendisi" - subtitle: "Kubernetes podları ve ingress odaklı"
     * Card 3: "Frontend Mühendisi" - subtitle: "Kullanıcı kuyruğu ve ağ gecikmesi odaklı"
3. Soru 3 (Öncelikli Hedef):
   - Label: "Kriz Anındaki Öncelikli Hedefiniz"
   - Three selectable option pills (unselected by default):
     * "Sistemi Ayakta Tutmak"
     * "Veri Güvenliği ve Mevzuat"
     * "Hatalardan Öğrenmek"

Bottom Action (Disabled State):
- Full-width button: "Nöbeti Devral ve Başla" (disabled style: bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50, rounded-xl, 14px bold).
- Small hint text below button: "Lütfen simülasyona başlamak için tüm soruları yanıtlayın."
```

---

## 2. Ekran 2: Karar Sahnesi (Decision 1: Deneyimli Modu & Kriz Terminali)

> **Tasarım Varyasyonu Notu:** Bu prompt **Deneyimli (Experienced)** modunu yansıtır (üstte 60 saniyelik geri sayım sayacı aktiftir, Sokratik mentor çekmecesi alt kısımda buton halinde daraltılmıştır). **Başlangıç (Beginner)** varyasyonunda ise sayaç gizlenir; bunun yerine seçeneklerin hemen üzerinde statik rehber ipucu paneli açık olarak yer alır. Sayaç ile otomatik açık rehber paneli birbirini dışlar.

```text
A mobile web application decision scene screen for "SE Primer" interactive engineering simulation.

Dimensions & Device: Mobile portrait (390x844 px), dark theme, focused on-call incident interface.
Visual Mood: High-stakes 08:00 AM incident. Deep dark navy background (#0B132B), cards (#14213D), warm golden-amber accents (#FCA311), and monospace terminal logs.

Top Bar & Progress:
- Header label: "KARAR 1 / 3" (serif font, 14px bold, text-amber-400)
- 3-segment progress bar: 1st segment filled with golden-amber (#FCA311), 2nd and 3rd segments dark slate (#253659).
- Experienced mode countdown timer in top right: "54s" badge in amber border (#FCA311) with stopwatch icon.

Incident Narrative & Terminal Card:
- Serif heading (18px, bold, text-white): "08:00, randevu sistemi çöktü. Nöbetçi sensin."
- Personalized narrative text (13px, text-slate-300): "Dün gece sisteme yeni sürüm yüklendi. Kapıda 300 hasta randevu sırası bekliyor. Veritabanı bağlantı havuzu kilitlendi."
- Monospace terminal log box (#0A0F1D, rounded-lg, p-3, border #1E293B):
  - Top 3 macOS-style dots (red, yellow, green)
  - Monospace code text in amber and red:
    `[HATA] 08:00:14.212 [HikariPool-1] Baglanti havuzu tukendi, istek zaman asimina ugradi.`
    `[UYARI] 300 hasta kuyrukta bekliyor. Ingress 500 hata orani: %98.4`

Decision Cards (Neutral Badges, No Bias):
- Option Card A (Elevated card #1C2A4A, border #253659, rounded-xl, p-4):
  - Neutral badge: "SEÇENEK A" (bg-[#253659] text-slate-200 text-xs font-semibold px-2 py-0.5 rounded)
  - Title (serif, 15px, bold, text-white): "Eski sürüme geri dön (Rollback)"
  - Description (12px, text-slate-300): "Trafiği bir önceki kararlı sürüme yönlendir."
- Option Card B (Elevated card #1C2A4A, border #253659, rounded-xl, p-4):
  - Neutral badge: "SEÇENEK B" (bg-[#253659] text-slate-200 text-xs font-semibold px-2 py-0.5 rounded)
  - Title (serif, 15px, bold, text-white): "Canlı sistemde yama yap (Hot-patch)"
  - Description (12px, text-slate-300): "Doğrudan canlı ortamda bağlantı havuzu sınırını artır."

Bottom Socratic AI Tutor (Collapsed State):
- Bottom bar button: "Primer Mentoru ile İstişare Et" in dark surface (#14213D, border border-amber-500/40, text-amber-400, rounded-xl, p-3, flex items-center justify-between).
```

---

## 3. Ekran 3: Bitiş Ekranı (Olay Sonrası İnceleme Raporu & Teknik Borç Karnesi)

Bu ekranda **Ending A** (Başarılı) ve **Ending B** (KVKK İhlali) olmak üzere iki mühür varyasyonu bulunur. Metrikler (`storyData.ts` üzerinden dinamik beslenir):

```text
A mobile web application post-mortem incident report screen for "SE Primer".

Dimensions & Device: Mobile portrait (390x844 px), dark navy background (#0B132B).
Visual Mood: Technical post-mortem debriefing document. Authoritative, clean typography, badge accents.

Header & Incident Seal:
- Top label: "OLAY SONRASI İNCELEME RAPORU"

[Ending A Variant]:
- Large emerald-green seal badge: "08:25 Sistem Ayakta, Veriler Güvende" (border border-emerald-500/40 bg-emerald-950/30 text-emerald-400, rounded-xl, p-3)
- Subtitle: "Nöbet başarıyla tamamlandı. 300 hasta randevusunu aldı, hasta verileri eksiksiz korundu."

[Ending B Variant]:
- Large rose-red seal badge: "Sistem Ayakta Fakat KVKK İhlali Oluştu" (border border-rose-500/40 bg-rose-950/30 text-rose-400, rounded-xl, p-3)
- Subtitle: "Sistem erişilebilir hale geldi ancak hasta verileri harici ortama sızdı. Yasal soruşturma başlatıldı."

Dynamic Metrics Grid (2x2 Cards, values derived from storyData):
- Card 1: "Çözüm Saati" -> "08:25"
- Card 2: "KVKK Durumu" -> "Uyumlu" (Ending A) VEYA "İhlal Bildirildi" (Ending B)
- Card 3: "Sızan Kayıt" -> "0 Kayıt" (Ending A) VEYA "300 Kayıt" (Ending B)
- Card 4: "Sistem Durumu" -> "Aktif"

Technical Debt Summary Card:
- Card container (#14213D, border border-amber-500/30, rounded-xl, p-4)
- Title (serif, 15px, bold, text-amber-400): "Kararlarınızdan Doğan Teknik Borç Karnesi"
- Bullet items derived from D1 and D2:
  * "Karar 1 (Rollback): Eski sürüme dönüldü; ertelenen yeni sürüm özellikleri ve DB şema senkronizasyonu teknik borç olarak birikti."
  * "Karar 2 (Smoke Test): 3 dakikalık test süresi eklendi; fakat canlı ortamda regresyon riski sıfırlandı."

Bottom Action:
- Full-width button: "Simülasyonu Yeniden Başlat" (bg-[#FCA311] hover:bg-[#E5920C] text-[#0B132B] font-bold py-3 rounded-xl).
```
