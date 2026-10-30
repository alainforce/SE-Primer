# YZM301 - SE Primer: Tasarım Sistemi ve Stil Rehberi (`DESIGN.md`)

---

## 1. Görsel Konsept ve Felsefe: "The Diamond Age Illustrated Primer"

**SE Primer**, Neal Stephenson'ın *The Diamond Age* romanındaki etkileşimli Primer konseptinden esinlenmiştir. Görsel dil, "karanlık bir nöbet odasında parlayan neo-klasik teknik bir el kitabı" hissiyatı uyandırmalıdır:
- **Koyu Lacivert (Deep Navy):** Ciddi, odaklanmış bir gece nöbetini (on-call) temsil eder.
- **Sıcak Kehribar / Turuncu (Warm Amber):** Kritik sistem alarmlarını, Sokratik bilgelik ışığını ve antika kitap vinyetlerini simgeler.
- **Serif Başlıklar (Serif Typography):** Klasik ansiklopedi ve basılı mühendislik el kitaplarının ağırlığını verir.
- **Monospace Terminal Blokları:** Canlı sistem logları, connection pool metrikleri ve HTTP hata kodları için gerçekçi mühendislik dokusu sunar.

---

## 2. Tasarım Tokenları (Design Tokens)

Tasarım tokenları Tailwind tema yapılandırmasında (`tailwind.config.js`) tanımlanır ve `index.css` içerisinde CSS Değişkenleri (`var(--...)`) olarak yansıtılır. Kod içinde tekrarlayan rastgele hex değerleri yerine doğrudan bu semantik tokenlar kullanılır.

### 2.1 Renk Paleti (Color Tokens)

| Token İsmi | CSS Değişkeni | Varsayılan Değer | Kullanım Amacı |
|---|---|---|---|
| `canvas` | `--color-canvas` | `#0B132B` | Genel sayfa arka planı (Karanlık derin uzay / gece nöbeti) |
| `surface` | `--color-surface` | `#14213D` | Kartlar, paneller, karar blokları arka planı |
| `surface-elevated` | `--color-surface-elevated` | `#1C2A4A` | İç kutular, terminal log konsolu, aktif seçim kartı |
| `border-subtle` | `--color-border-subtle` | `#253659` | Kart kenarlıkları, ayraçlar (1px katı) |
| `border-accent` | `--color-border-accent` | `#FCA311` | Seçilen kart, aktif sayaç ve primer çerçeve çizgisi |
| `accent` | `--color-accent` | `#FCA311` | Butonlar, vurucu aksiyonlar, önemli vurgular |
| `accent-hover` | `--color-accent-hover` | `#E5920C` | Vurgu butonu üzerine gelme hali |
| `text-primary` | `--color-text-primary` | `#FFFFFF` | Başlıklar, ana metinler, değerler |
| `text-secondary` | `--color-text-secondary` | `#CBD5E1` | Açıklama paragrafları, ikincil etiketler |
| `text-muted` | `--color-text-muted` | `#94A3B8` | Zaman damgaları, dipnotlar, pasif metinler |
| `success` | `--color-success` | `#10B981` | Ending A, güvenli durum, test geçti rozetleri |
| `danger` | `--color-danger` | `#EF4444` | Ending B, KVKK ihlali, sayaç kritik bölgesi |
| `warning` | `--color-warning` | `#F59E0B` | Teknik borç uyarısı, gecikme uyarısı |

### 2.2 Tipografi (Typography Tokens)

Tüm yazı tipleri Türkçe karakterleri (İ, ı, ş, ğ, ç, ö, ü) eksiksiz ve bozulma olmadan destekler:
- **`font-serif` (Başlıklar):** `'Playfair Display', Merriweather, Georgia, 'Times New Roman', serif`
- **`font-sans` (Gövde Metinleri):** `Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **`font-mono` (Terminal ve Kod):** `'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace`

### 2.3 Tipografi ve Aralık Skalası

- Boyutlar: `text-2xl` (24px başlık), `text-xl` (20px sahne), `text-lg` (18px kart), `text-sm` (14px gövde), `text-xs` (12px detay/log).
- Mobil cihaz hedefi: `100dvh` tam ekran yüksekliği, minimum `44px` dokunma hedefi (touch target) buton ve seçim kartları.

---

## 3. Bileşen Mimarisi ve Varyasyon Kuralları

### 3.1 İlerleme Çubuğu (`ProgressBar`)
- "KARAR 1 / 3", "KARAR 2 / 3", "KARAR 3 / 3" şeklinde gösterilir.
- İlgili karar tamamlandıkça 3 segmentli kehribar çizgi dolar.

### 3.2 Seviye Varyasyonları: Başlangıç vs. Deneyimli
- **Başlangıç Seviyesi (`beginner`):**
  - Geri sayım sayacı **kesinlikle gösterilmez**.
  - Statik rehber ipucu paneli (`hint-panel`) sayfa açıldığında **varsayılan olarak açık ve görünürdür**. İçeriği `storyData.ts`'ten statik ve deterministik gelir (ağ çağrısı yapmaz).
- **Deneyimli Seviye (`experienced`):**
  - 60 saniyelik geri sayım sayacı (`timer`) ekranın üstünde aktiftir.
  - Sokratik mentor çekmecesi varsayılan olarak kapalıdır, yalnızca `tutor-toggle` butonuyla isteğe bağlı açılır.
  - **Kural:** `timer` ve otomatik açılan `hint-panel` birbirini dışlar (mutually exclusive).

### 3.3 Sayaç Mekaniği ve Erişilebilirlik (`Timer`)
- Sayaç `setInterval` ve `Date.now()` referansı ile hesaplanır (`requestAnimationFrame` kullanılmaz; böylece Cypress `cy.clock()` / `cy.tick()` ile sanal zamanda test edilebilir).
- `prefers-reduced-motion` medya sorgusu desteklenir; kullanıcı hareket azaltmayı seçmişse `animate-pulse` kapatılır.
- Her saniye ekran okuyuculara gereksiz bildirim gitmemesi için per-second `aria-live` kullanılmaz.
- Süre 0'a ulaştığında: Otomatik olarak B seçeneği tetiklenir ve `timeout-notice` ("Baskı altında karar vermemek de fiili bir karardır...") görünür.

### 3.4 Seçenek Kartları (`DecisionCard`)
- Tarafsız etiketler kullanılır: Yalnızca **"SEÇENEK A"** ve **"SEÇENEK B"**.
- Seçenek kartlarının içinde "güvenli", "hızlı" gibi yönlendirici etiketler yer almaz. Risk analizleri yalnızca başlangıç seviyesindeki rehber panelinde gösterilir.

### 3.5 Onboarding Başlangıç Durumu
- Açılışta hiçbir seçenek önceden seçili gelmez.
- 3 soru (Seviye, Rol, Hedef) yanıtlanmadan "Nöbeti Devral ve Başla" butonu `disabled` durumdadır ve tıklanamaz.

### 3.6 Mobil ve Klavye Uyumluluğu
- Mobil ekranda `100dvh` kullanılır.
- Tutor çekmecesi açıldığında karar kartlarını tamamen örtmeyecek şekilde konumlandırılır; soru yazma alanı mobil klavye açıldığında görünür kalır.

---

## 4. `data-testid` Sözleşmesi (Contract Table)

Tüm etkileşimli bileşenler ve kritik durum göstergeleri Cypress testlerinin deterministik çalışması için aşağıdaki `data-testid` değerlerini taşımak zorundadır:

| `data-testid` Değeri | Bulunduğu Bileşen / Ekran | Açıklama |
|---|---|---|
| `onboarding-level-beginner` | Onboarding | Seviye: Başlangıç seçim kartı |
| `onboarding-level-experienced`| Onboarding | Seviye: Deneyimli seçim kartı |
| `onboarding-role-backend` | Onboarding | Rol: Backend Mühendisi seçim kartı |
| `onboarding-role-devops` | Onboarding | Rol: DevOps / SRE seçim kartı |
| `onboarding-role-frontend` | Onboarding | Rol: Frontend / Fullstack seçim kartı |
| `onboarding-goal-uptime` | Onboarding | Hedef: Sistemi Ayakta Tutmak |
| `onboarding-goal-compliance` | Onboarding | Hedef: Veri Güvenliği ve Mevzuat |
| `onboarding-goal-learning` | Onboarding | Hedef: Hatalardan Öğrenmek |
| `onboarding-start` | Onboarding | "Nöbeti Devral ve Başla" butonu (3 soru dolmadan disabled) |
| `progress-bar` | Üst Bilgi / Navigasyon | 3 adımlı ilerleme çubuğu kapsayıcısı |
| `scene-title` | SceneView | Karar ekranı sahne başlığı ("08:00, randevu sistemi çöktü...") |
| `scene-narrative` | SceneView | Rol ve hedefe göre kişiselleştirilmiş anlatım metni |
| `terminal-log` | SceneView | Monospace teknik hata/metrik konsolu |
| `timer` | SceneView (Yalnızca Experienced) | 60 saniyelik geri sayım sayacı bileşeni |
| `timeout-notice` | ConsequenceView | Süre dolunca gösterilen "karar vermemek de bir karardır" uyarısı |
| `choice-A` | SceneView | Karar Seçenek A butonu/kartı |
| `choice-B` | SceneView | Karar Seçenek B butonu/kartı |
| `hint-panel` | SceneView (Yalnızca Beginner) | Statik rehber ipucu kutusu |
| `tutor-toggle` | SceneView | Sokratik mentor çekmecesini açıp/kapatan buton |
| `tutor-input` | TutorDrawer | Mentora soru sorma metin girişi |
| `tutor-send` | TutorDrawer | Soru gönderme butonu |
| `tutor-reply` | TutorDrawer | Mentorun döndüğü Sokratik yanıt balonu |
| `what-happened` | ConsequenceView | "Ne Oldu?" teknik sonuç açıklaması |
| `why-it-happened` | ConsequenceView | "Neden Oldu?" teknik kök neden açıklaması |
| `decision-debt` | ConsequenceView | İlgili karardan doğan operasyonel borç notu |
| `continue-button` | ConsequenceView | Sonraki karara / bitiş raporuna geçiş butonu |
| `ending-title` | EndingView | Bitiş başlığı metni |
| `ending-badge` | EndingView | Bitiş rozeti/mührü (üzerinde `data-ending="A"` veya `data-ending="B"` taşır) |
| `technical-debt-summary` | EndingView | D1 ve D2 seçimlerinden türetilen teknik borç listesi |
| `restart-button` | EndingView | Simülasyonu yeniden başlatma butonu |
