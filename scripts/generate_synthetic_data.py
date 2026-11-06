#!/usr/bin/env python3
"""
scripts/generate_synthetic_data.py

SE Primer için sentetik oturum verisi üretici.
Sabit rastgelelik tohumu (seed=42) kullanarak tekrarlanabilir veri üretir.

Kullanım:
    python scripts/generate_synthetic_data.py [--sessions 120] [--output data/oturumlar.csv]
"""

import argparse
import csv
import os
import random

ROLES = ["backend", "devops", "frontend"]
GOALS = ["uptime", "compliance", "learning"]

CSV_HEADER = [
    "oturum_id",
    "kaynak",
    "sahne_no",
    "seviye",
    "rol",
    "hedef",
    "karar_suresi_sn",
    "onceki_ort_karar_suresi_sn",
    "onceki_ipucu_sayisi",
    "onceki_riskli_secim_sayisi",
    "secim",
    "riskli_secim",
    "zaman_asimi",
]


def generate_sessions(num_sessions: int = 120, seed: int = 42) -> list[dict]:
    random.seed(seed)
    rows = []

    for i in range(1, num_sessions + 1):
        oturum_id = f"synt_{i:04d}"
        seviye = 1 if random.random() < 0.50 else 0  # 1=experienced, 0=beginner
        rol = random.choice(ROLES)
        hedef = random.choice(GOALS)

        # Hedefe göre temel risk çarpanı
        # uptime: hızlı ve riskli olmaya daha yatkın
        # compliance: kuralcı ve savunmacı olmaya yatkın
        # learning: dengeli
        goal_risk_bias = 0.12 if hedef == "uptime" else (-0.15 if hedef == "compliance" else 0.0)

        decision_durations = []
        hint_counts = []
        risky_choices = []

        for sahne_no in (1, 2, 3):
            # Geçmiş nitelikler (karar anından önce hesaplanır)
            if sahne_no == 1:
                onceki_ort_sure = 0.0
                onceki_ipucu = 0
                onceki_riskli = 0
            else:
                onceki_ort_sure = round(sum(decision_durations) / len(decision_durations), 1)
                onceki_ipucu = sum(hint_counts)
                onceki_riskli = sum(risky_choices)

            # Karar süresi dağılımı
            if seviye == 1:
                # Deneyimli: 60s baskısı altında, ortalama 18s, nadiren timeout
                # 60s timeout ihtimali: %5
                is_timeout = random.random() < 0.05
                if is_timeout:
                    karar_suresi = 60.0
                else:
                    karar_suresi = round(random.gauss(20.0, 7.0), 1)
                    karar_suresi = max(3.0, min(58.0, karar_suresi))
            else:
                # Başlangıç: süre sınırı yok, daha uzun düşünür
                is_timeout = False
                karar_suresi = round(random.gauss(34.0, 10.0), 1)
                karar_suresi = max(5.0, min(95.0, karar_suresi))

            # İpucu açma / danışma davranışı
            # Başlangıçlar ipucu paneline daha sık bakar
            if seviye == 0:
                hint_used = 1 if random.random() < 0.70 else 0
            else:
                # Deneyimliler krizde acele ediyorsa daha az bakar
                hint_used = 1 if random.random() < 0.25 else 0

            # Riskli seçim (Seçenek B) olasılık modeli:
            # - Kısa süre (< 12s) acele ve panik -> risk artar
            # - İpucu kullanılmışsa -> risk azalır
            # - Önceki kararlarda B seçildiyse -> alışkanlık / eylemsizlik artar
            # - Seviye experienced ise -> canlıda yama yapma refleksi biraz daha yüksek
            base_p_risk = 0.40
            if karar_suresi < 12.0:
                base_p_risk += 0.22
            elif karar_suresi > 30.0:
                base_p_risk -= 0.15

            if hint_used:
                base_p_risk -= 0.20
            if onceki_ipucu > 0:
                base_p_risk -= 0.08

            if onceki_riskli > 0:
                base_p_risk += 0.18 * onceki_riskli

            if seviye == 1:
                base_p_risk += 0.08

            base_p_risk += goal_risk_bias

            # Sahneye göre hafif risk nüansı (Karar 3 KVKK'da risk oranı biraz daha düşer)
            if sahne_no == 3:
                base_p_risk -= 0.10

            p_risk = max(0.08, min(0.92, base_p_risk))

            if is_timeout:
                # Timeout durumunda sistem otomatik B seçer
                secim = "B"
                riskli_secim = 1
                zaman_asimi = 1
            else:
                zaman_asimi = 0
                if random.random() < p_risk:
                    secim = "B"
                    riskli_secim = 1
                else:
                    secim = "A"
                    riskli_secim = 0

            decision_durations.append(karar_suresi)
            hint_counts.append(hint_used)
            risky_choices.append(riskli_secim)

            rows.append({
                "oturum_id": oturum_id,
                "kaynak": "sentetik",
                "sahne_no": sahne_no,
                "seviye": seviye,
                "rol": rol,
                "hedef": hedef,
                "karar_suresi_sn": karar_suresi,
                "onceki_ort_karar_suresi_sn": onceki_ort_sure,
                "onceki_ipucu_sayisi": onceki_ipucu,
                "onceki_riskli_secim_sayisi": onceki_riskli,
                "secim": secim,
                "riskli_secim": riskli_secim,
                "zaman_asimi": zaman_asimi,
            })

    return rows


def write_csv(rows: list[dict], output_path: str):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADER)
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description="SE Primer sentetik veri üretici")
    parser.add_argument("--sessions", type=int, default=120, help="Üretilecek oturum sayısı (varsayılan: 120)")
    parser.add_argument("--seed", type=int, default=42, help="Rastgelelik tohumu (varsayılan: 42)")
    parser.add_argument("--output", type=str, default="data/oturumlar.csv", help="Çıktı CSV yolu")
    args = parser.parse_args()

    rows = generate_sessions(num_sessions=args.sessions, seed=args.seed)
    write_csv(rows, args.output)
    print(f"Başarıyla {len(rows)} karar satırı ({args.sessions} oturum) üretildi -> {args.output}")


if __name__ == "__main__":
    main()

