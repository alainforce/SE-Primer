import { DecisionDefinition, DecisionId, PathOutcome } from '../types/story';

export const DECISIONS: Record<DecisionId, DecisionDefinition> = {
  d1: {
    id: 'd1',
    stepNumber: 1,
    totalSteps: 3,
    title: '08:00, randevu sistemi çöktü. Nöbetçi sensin.',
    terminalLog: `[HATA] 08:00:14.212 [HikariPool-1] Baglanti havuzu tukendi, istek zaman asimina ugradi.
[HATA] 08:00:15.890 [Ingress-Gateway] HTTP 500 Internal Server Error (Hata orani: %98.4)
[KRITIK] Poliklinik onunde 300 hasta kuyrukta bekliyor. Randevu servisi cevap vermiyor.`,
    staticHint: 'Eski sürüme dönmek (rollback) hızlı bir nefes aldırabilir. Ancak dün gece çalıştırılan veritabanı şema göçünün (migration) geriye dönük uyumlu olup olmadığını ve yeni kolonların eski kodda hata verip vermeyeceğini hesaba kattın mı?',
    timeoutReason: 'Baskı altında karar vermemek de fiili bir karardır: Kriz anındaki analiz felci nedeniyle sistem acil durum varsayılanı olan canlıda yamayı (Seçenek B) devreye soktu.',
    narratives: {
      base: 'Dün gece sisteme v2.4.0 sürümü yüklendi. Sabah 08:00 itibarıyla randevu servisi gelen isteklere yanıt vermiyor ve 300 hasta bankolarda bekliyor.',
      roleNuance: {
        backend: 'Backend mimarisinde veritabanı bağlantı havuzu (HikariPool) kilitlendi, thread starvation yaşanıyor ve gece uygulanan SQL migration sorguları deadlock oluşturuyor.',
        devops: 'Kubernetes kümesinde pod restart döngüsü (CrashLoopBackOff) başladı, ingress trafiği tıkanmış durumda ve canary deployment adımları atlanmış görünüyor.',
        frontend: 'İstemci tarafında gateway timeout (HTTP 504) fırtınası yaşanıyor, retry mekanizması sunucuyu boğuyor ve kullanıcı kuyruğu kilitlenmiş durumda.'
      },
      goalNuance: {
        uptime: 'Öncelikli hedefimiz sistemi ne pahasına olursa olsun en kısa sürede ayağa kaldırıp 300 hastanın poliklinik girişini sağlamak.',
        compliance: 'Öncelikli hedefimiz kriz esnasında hasta kayıtlarının ve özel nitelikli sağlık verilerinin bütünlüğünü korumak.',
        learning: 'Öncelikli hedefimiz krizin teknik kök nedenini anlayarak mimari dayanıklılığı artıracak dersler çıkarmak.'
      }
    },
    choices: {
      A: {
        id: 'A',
        badge: 'SEÇENEK A',
        title: 'Eski sürüme geri dön (Rollback)',
        description: 'Trafiği dün geceden önceki kararlı sürüme (v2.3.9) anında yönlendir.',
        whatHappened: 'Trafik v2.3.9 kararlı sürümüne yönlendirildi. Servis podları ayağa kalktı ve bağlantı havuzu normal seviyelere indi.',
        whyItHappened: 'Gece uygulanan veritabanı şema göçü geriye dönük uyumlu (expand-and-contract) tasarlandığı için eski kod tabanı veritabanını hatasız okuyabildi.',
        decisionDebt: 'Yeni sürümle gelen tüm özellikler ertelendi; veritabanı şema senkronizasyonu ve yarım kalan göç işlemleri teknik borç olarak backlog listesine kaydedildi.'
      },
      B: {
        id: 'B',
        badge: 'SEÇENEK B',
        title: 'Canlı sistemde yama yap (Hot-patch)',
        description: 'Sunucuya doğrudan girip bağlantı havuz limitini ve thread sınırını canlıda artır.',
        whatHappened: 'Canlı ortamda konfigürasyon parametreleri anlık script ile güncellendi ve servis geçici olarak nefes aldı.',
        whyItHappened: 'Container içine girilerek max pool size elle artırıldı; uygulama yeniden başlatılmadan bağlantı darboğazı geçici olarak aşıldı.',
        decisionDebt: 'Ortam kayması (configuration drift) oluştu; canlıdaki bu acil değişiklik Git deposunda ve CI/CD pipeline yapılandırmasında yer almadığı için sonraki dağıtımlarda ezilme riski doğdu.'
      }
    }
  },
  d2: {
    id: 'd2',
    stepNumber: 2,
    totalSteps: 3,
    title: 'Müdahale yapıldı. Sıra doğrulamada.',
    terminalLog: `[BILGI] 08:08:20.104 Yama/Surum aktif edildi. CPU: %42, RAM: %61.
[TEST-SUITE] Hızlı duman testi (smoke test) paketi hazir (Tahmini sure: 3 dakika).
[DURUM] Bankolarda bekleyen hasta sayisi artiyor. Yonetim acil acilis baskisi yapiyor.`,
    staticHint: 'Canlıya doğrudan trafik vermek hasta kuyruğunu anında rahatlatabilir. Ancak test edilmemiş bir yamanın canlı veritabanında sessiz veri bozulmalarına (data corruption) yol açması durumunda bunu geri almanın maliyeti ne olurdu?',
    timeoutReason: 'Baskı altında karar vermemek de fiili bir karardır: Zaman aşımı nedeniyle test prosedürü atlanarak doğrudan yayına alma (Seçenek B) acil refleks olarak işletildi.',
    narratives: {
      base: 'İlk mimari müdahale tamamlandı ancak sistem henüz dış dünyaya açılmadı. Kapıdaki hasta kuyruğu büyürken doğrulama yapıp yapmama ikilemiyle karşı karşıyasın.',
      roleNuance: {
        backend: 'Backend katmanında transaction isolation seviyeleri ve veri tabanı yazma tutarlılığı kritik; doğrulanmamış bir sorgu veritabanında mükerrer randevu yaratabilir.',
        devops: 'DevOps pipeline tarafında otomatik smoke test paketi hazır bekliyor; pod sağlık kontrolleri (liveness ve readiness probe) trafiği açmadan önce onay bekliyor.',
        frontend: 'Frontend form validasyonları ve istemci kuyruğu hazırda bekliyor; test edilmeden açılırsa UI üzerinde geçersiz form istekleri yığılabilir.'
      },
      goalNuance: {
        uptime: 'Hedef kesintisiz uptime olduğundan zaman kaybına tahammül az; ancak hatalı bir açılışın sistemi tekrar çökertme riski var.',
        compliance: 'Hedef yasal uyumluluk ve güvenilirlik olduğundan, test aşaması veri doğruluğu için emniyet kilididir.',
        learning: 'Hedef süreçten öğrenmek olduğundan, kriz anında test disiplininin önemini değerlendirmek gerekiyor.'
      }
    },
    choices: {
      A: {
        id: 'A',
        badge: 'SEÇENEK A',
        title: 'Önce hızlı bir smoke test çalıştır',
        description: 'Kritik randevu akışını sentetik bir hasta isteğiyle sandbox ortamında 3 dakika doğrula.',
        whatHappened: 'Sentetik test hastasıyla randevu alma ve SMS bildirim akışı hatasız tamamlandı; regrese bir bug olmadığı kanıtlandı.',
        whyItHappened: 'Kritik kullanıcı akışları canlı trafiğe açılmadan önce simüle edildi; bağlantı havuzunun yeni yük altında kilitlenmediği doğrulandı.',
        decisionDebt: 'Hastalar 3 dakika daha bekletildi; ancak canlıda veri kirlenmesi, mükerrer kayıt ve sessiz arıza riski tamamen bertaraf edildi.'
      },
      B: {
        id: 'B',
        badge: 'SEÇENEK B',
        title: 'Test etmeden doğrudan yayına al',
        description: 'Doğrulama adımını atla ve tüm hasta randevu trafiğini derhal sisteme ver.',
        whatHappened: 'Trafik anında sisteme salındı; kuyruktaki ilk hastalar randevu işlemlerini yapmaya başladı.',
        whyItHappened: 'Yönetim ve hasta baskısı nedeniyle kalite kontrol kapısı (quality gate) bilinçli olarak bypass edildi.',
        decisionDebt: 'Edge-case senaryolar test edilmediği için bazı özel poliklinik randevularında mükerrer kayıtlar ve gizli veri anomalileri canlıya sızdı.'
      }
    }
  },
  d3: {
    id: 'd3',
    stepNumber: 3,
    totalSteps: 3,
    title: 'Sistem toparlanıyor. Log paylaşımı ve KVKK eşiği.',
    terminalLog: `[UYARI] 08:18:45.332 Stacktrace paylasimi bekleniyor.
[VERI-ORNEK] payload: {"hasta_ad": "Fatma D***", "tc": "28194******", "tani": "Onkoloji Randevu"}
[MEVZUAT] 6698 sayili KVKK Madde 6: Saglik verileri ozel nitelikli kisisel veridir.`,
    staticHint: 'Ekibin problemi hızla çözmesi için ham verilere ihtiyacı olduğunu düşünebilirsin. Fakat üçüncü taraf mesajlaşma araçlarına veya harici log platformlarına aktarılan T.C. kimlik ve tanı bilgileri 6698 sayılı kanun nezdinde nasıl bir hukuki sorumluluk doğurur?',
    timeoutReason: 'Baskı altında karar vermemek de fiili bir karardır: Zaman aşımı nedeniyle güvenlik filtreleri uygulanmadan loglar olduğu gibi dışarıya iletildi (Seçenek B).',
    narratives: {
      base: 'Sistem operasyonel hale geldi ancak destek ekibi ve üçüncü taraf yazılım yüklenicisi kök neden analizi için hata loglarının tamamını istiyor.',
      roleNuance: {
        backend: 'Backend loglarında SQL hata parametreleri ve ORM payload dökümleri yer alıyor; hasta adları ve tanı kodları açık metin olarak stacktrace içinde geziyor.',
        devops: 'DevOps merkezi log havuzunda (ELK/Grafana) filtreleme kuralı tanımlanabilir ya da loglar olduğu gibi genel Slack kanalına ve harici SaaS servisine akıtılabilir.',
        frontend: 'Frontend hata yakalama (Sentry) araçlarına düşen breadcrumb kayıtlarında hasta form girdileri bulunuyor.'
      },
      goalNuance: {
        uptime: 'Hızlıca problemi kapatıp nöbeti devretmek cazip gelebilir ancak veri güvenliği ödün verilemez bir sınırdır.',
        compliance: 'KVKK ve hasta mahremiyeti odaklı bu aşamada atılacak adım yasal yaptırım riskini doğrudan belirleyecektir.',
        learning: 'Mühendislik etiği ve yasal mevzuat sınırları kriz anında da geçerlidir; bu tecrübe gelecekteki log mimarisini şekillendirecektir.'
      }
    },
    choices: {
      A: {
        id: 'A',
        badge: 'SEÇENEK A',
        title: 'Loglardaki hasta verilerini maskele',
        description: 'T.C. kimlik numaraları, hasta adları ve tıbbi tanıları regex ile anonimleştirerek ekibe ilet.',
        whatHappened: 'Tüm kişisel sağlık verileri `***` ve tuzlanmış hash değerleriyle maskelenerek destek ekibine ve log platformuna güvenle aktarıldı.',
        whyItHappened: 'KVKK Madde 6 ve Madde 12 uyarınca veri minimizasyonu ve mahremiyet ilkeleri uygulandı; teknik hata analizi hasta kimliklerine ihtiyaç duyulmadan yapıldı.',
        decisionDebt: 'Maskeleme scripti nedeniyle log paylaşımı 2 dakika gecikti; ancak kurum hukuki yaptırım ve veri ihlali riskinden tamamen korundu.'
      },
      B: {
        id: 'B',
        badge: 'SEÇENEK B',
        title: 'Logları ekibe olduğu gibi ilet',
        description: 'Hızlı kök neden analizi için ham stacktrace ve tüm hasta payload dökümünü mesajlaşma kanalına yapıştır.',
        whatHappened: '300 hastanın adı, T.C. kimlik numarası ve poliklinik tanı detayları açık metin halinde şirket Slack kanalına ve harici sağlayıcıya iletildi.',
        whyItHappened: 'Acil çözüm telaşıyla güvenlik prosedürleri göz ardı edildi; ham verinin harici ortamlarda barınamayacağı kuralı ihlal edildi.',
        decisionDebt: 'KVKK 6698 sayılı kanun kapsamında veri ihlali oluştu; Kişisel Verileri Koruma Kurulu tarafından idari para cezası ve adli soruşturma riski teknik mirasa eklendi.'
      }
    }
  }
};

export const PATH_OUTCOMES: Record<string, PathOutcome> = {
  AAA: {
    pathKey: 'AAA',
    ending: 'A',
    title: 'Kusursuz Mühendislik Müdahalesi',
    badgeLabel: '08:25 Sistem Ayakta, Veriler Güvende',
    description: 'Nöbet başarıyla tamamlandı. Geri alma işlemi şema uyumuyla çalıştı, duman testi regresyonu engelledi ve KVKK maskelemesiyle hasta mahremiyeti korundu.',
    resolutionTime: '08:25',
    kvkkStatus: 'Tam Uyumlu / İhlal Yok',
    leakedRecords: 0,
    systemStatus: 'Aktif ve Kararlı',
    caveatText: 'Sistem kararlı ve güvenli; tüm 300 hasta randevusunu aldı.',
    technicalDebtSummary: [
      'Karar 1 (Rollback): v2.4.0 ile gelen özellikler ertelendi; geriye uyumlu DB şema göçünün kodla yeniden senkronizasyonu backlog listesine eklendi.',
      'Karar 2 (Smoke Test): 3 dakikalık test süresi eklendi; fakat canlı ortamda regresyon ve sessiz veri anomalisi riski sıfırlandı.',
      'Karar 3 (KVKK Maskeleme): Loglardaki PII verileri başarıyla temizlendi; 6698 sayılı kanuna tam uyum sağlandı.'
    ]
  },
  AAB: {
    pathKey: 'AAB',
    ending: 'B',
    title: 'Teknik Başarı, Hukuki Yıkım',
    badgeLabel: 'Sistem Ayakta Fakat KVKK İhlali Oluştu',
    description: 'Sistem 08:23 itibarıyla ayağa kalktı ve randevular açıldı; ancak Slack kanalına dökülen ham hasta verileri nedeniyle hastane hakkında KVKK denetimi ve veri ihlali soruşturması başlatıldı.',
    resolutionTime: '08:23',
    kvkkStatus: 'Kritik İhlal Bildirildi',
    leakedRecords: 300,
    systemStatus: 'Aktif (Hukuki İncelemede)',
    caveatText: 'Sistem çalışıyor ancak 300 hastanın özel nitelikli sağlık verisi sızdı.',
    technicalDebtSummary: [
      'Karar 1 (Rollback): Geri alma sonrası ertelenen özelliklerin tekrar planlanması gerekiyor.',
      'Karar 2 (Smoke Test): Test disiplini sistemi çöküşten korudu.',
      'Karar 3 (Logları Olduğu Gibi İletme): Ağır KVKK yaptırımı ve hukuki savunma zorunluluğu doğdu; log arındırma prosedürü teknik borç olarak yazıldı.'
    ]
  },
  ABA: {
    pathKey: 'ABA',
    ending: 'A',
    title: 'Kısmi Başarı: Regresyon Riskiyle Kurtarma',
    badgeLabel: '08:15 Sistem Ayakta, Veriler Güvende (Regresyon Uyarılı)',
    description: 'Sistem erken açıldı ve KVKK verileri korundu. Ancak smoke test atlandığı için ilk 10 dakikada bazı randevu istekleri mükerrer basıldı; veritabanı temizliği gerekecek.',
    resolutionTime: '08:15',
    kvkkStatus: 'Tam Uyumlu / İhlal Yok',
    leakedRecords: 0,
    systemStatus: 'Aktif (Kısmi Veri Tutarsızlığı)',
    caveatText: 'Sistem ayakta ve veri gizliliği sağlandı; ancak testsiz açılış nedeniyle mükerrer randevu kayıtları oluştu.',
    technicalDebtSummary: [
      'Karar 1 (Rollback): Eski sürüme dönüldü; şema senkronizasyon borcu mevcut.',
      'Karar 2 (Test Atlandı): Testsiz yayına alma kaynaklı mükerrer kayıtların temizlenmesi ve veri tabanı düzeltme scripti borcu doğdu.',
      'Karar 3 (KVKK Maskeleme): Veri güvenliği protokollerine sadık kalındı.'
    ]
  },
  ABB: {
    pathKey: 'ABB',
    ending: 'B',
    title: 'Çifte Kriz: Veri Tutarsızlığı ve KVKK İhlali',
    badgeLabel: 'Kritik KVKK İhlali ve Veri Bozulması',
    description: 'Hem test atlandığı için mükerrer hasta kayıtları oluştu hem de acil log paylaşımı sebebiyle 300 hastanın kimlik ve tanı bilgileri harici kanallara sızdırıldı.',
    resolutionTime: '08:14',
    kvkkStatus: 'Kritik İhlal Bildirildi',
    leakedRecords: 300,
    systemStatus: 'Kararsız (Çifte Kriz)',
    caveatText: 'Hem KVKK ihlali cezası riski hem de veritabanında mükerrer randevu kirliliği oluştu.',
    technicalDebtSummary: [
      'Karar 1 (Rollback): Eski sürüm borcu backlog listesinde.',
      'Karar 2 (Test Atlandı): Canlıda oluşan tutarsız hasta randevu verilerinin ayıklanması gerekiyor.',
      'Karar 3 (Logları Olduğu Gibi İletme): Kişisel Verileri Koruma Kurumu nezdinde veri ihlali bildirimi zorunluluğu doğdu.'
    ]
  },
  BAA: {
    pathKey: 'BAA',
    ending: 'A',
    title: 'Pragmatik Mühendislik: Canlı Yama ve Doğrulama',
    badgeLabel: '08:25 Sistem Ayakta, Veriler Güvende (Ortam Kayması Notlu)',
    description: 'Canlı sistemde uygulanan yama hızlı duman testinden başarıyla geçti ve KVKK maskelemesiyle veriler korundu. Sistem stabil hale getirildi.',
    resolutionTime: '08:25',
    kvkkStatus: 'Tam Uyumlu / İhlal Yok',
    leakedRecords: 0,
    systemStatus: 'Aktif (Canlı Yama Aktif)',
    caveatText: 'Sistem çalışıyor ve veri gizliliği korundu; ancak canlıdaki yamanın Git deposuna aktarılması şart.',
    technicalDebtSummary: [
      'Karar 1 (Hot-patch): Canlı ortamda yapılan elle müdahale Git ve CI/CD pipeline yapılandırmasına aktarılmadığı takdirde bir sonraki dağıtımda ezilme riski taşır.',
      'Karar 2 (Smoke Test): Duman testi canlı yamanın sistemi bozmadığını doğruladı.',
      'Karar 3 (KVKK Maskeleme): Loglar filtrelenerek veri sızıntısı engellendi.'
    ]
  },
  BAB: {
    pathKey: 'BAB',
    ending: 'B',
    title: 'Başarılı Yama, İhlal Edilen Hasta Mahremiyeti',
    badgeLabel: 'Sistem Ayakta Fakat KVKK İhlali Oluştu',
    description: 'Canlı yama sistemi çöküşten kurtardı ancak destek ekibine ham stacktrace iletildiği için hasta kayıtları üçüncü şahıslara açıldı. Başhekimlik hukuki işlem başlattı.',
    resolutionTime: '08:23',
    kvkkStatus: 'Kritik İhlal Bildirildi',
    leakedRecords: 300,
    systemStatus: 'Aktif (Hukuki İncelemede)',
    caveatText: 'Altyapı kurtarıldı fakat hasta gizliliği ihlal edildi.',
    technicalDebtSummary: [
      'Karar 1 (Hot-patch): Canlıdaki yapılandırma değişikliği Git reposuyla senkronize edilmeli.',
      'Karar 2 (Smoke Test): Test doğrulaması operasyonel riski düşürdü.',
      'Karar 3 (Logları Olduğu Gibi İletme): 6698 sayılı kanun ihlali nedeniyle kurum ağır yaptırım riskiyle karşı karşıya kaldı.'
    ]
  },
  BBA: {
    pathKey: 'BBA',
    ending: 'A',
    title: 'Yüksek Riskli Kurtarma: Dokümante Edilmemiş Canlı Yama',
    badgeLabel: '08:12 Sistem Ayakta, Veriler Güvende (Yüksek Risk Notlu)',
    description: 'Sistem çok hızlı açıldı ve KVKK verileri korundu. Ancak testsiz canlı yama nedeniyle prod ortamında dokümante edilmemiş gizli bug riski kaldı.',
    resolutionTime: '08:12',
    kvkkStatus: 'Tam Uyumlu / İhlal Yok',
    leakedRecords: 0,
    systemStatus: 'Aktif (Kırılgan Yapı)',
    caveatText: 'Sistem hızla açıldı ve KVKK ihlali önlendi; ancak doğrulanmamış canlı yama ciddi ortam kayması bıraktı.',
    technicalDebtSummary: [
      'Karar 1 (Hot-patch): Canlıdaki yama CI/CD dışında kaldı (Configuration Drift).',
      'Karar 2 (Test Atlandı): Test edilmeyen yama canlı yük altında öngörülemeyen yan etki riski taşıyor.',
      'Karar 3 (KVKK Maskeleme): Veri maskeleme ile yasal kriz başarıyla engellendi.'
    ]
  },
  BBB: {
    pathKey: 'BBB',
    ending: 'B',
    title: 'Tam Felaket: Kaos, Veri Bozulması ve KVKK İhlali',
    badgeLabel: 'Tam Sistem ve Hukuk Krizi',
    description: 'Hem canlı yama testsiz açıldığı için veritabanında tutarsızlıklar birikti hem de panikle paylaşılan ham hasta bilgileri nedeniyle 300 hastanın kayıtları yetkisiz ellere sızdı.',
    resolutionTime: '08:10',
    kvkkStatus: 'Kritik İhlal Bildirildi',
    leakedRecords: 300,
    systemStatus: 'Ağır Hasarlı ve İhlalde',
    caveatText: 'Sistemin açıldığı sanıldı ancak hem canlı veri bozuldu hem de 300 hastanın kayıtları sızdı.',
    technicalDebtSummary: [
      'Karar 1 (Hot-patch): Ortam kayması ve kontrolsüz canlı yama mirası.',
      'Karar 2 (Test Atlandı): Tutarsız veri kayıtları ve canlı sistemde gizli patlamaya hazır bug birikimi.',
      'Karar 3 (Logları Olduğu Gibi İletme): Ağır para cezası, savcılık bildirimi ve kurumsal itibar kaybı.'
    ]
  }
};

