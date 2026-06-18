# Quantum-Healing AI (Quantum-Scan Healing Engine)
## Sistem Mimarisi & Teknik Geliştirme Yol Haritası (System Architecture)

Bu belge, **Yapay Zeka (AI)**, **Uzaktan Fotopletismografi (rPPG)**, **Kuantum Biyo-Rezonans** ve **Manevi Şifa** pratiklerini bir araya getiren full-stack platformun mimari tasarımını, ses frekans motoru yapılandırmasını ve React Native entegrasyon kılavuzunu detaylandırmaktadır.

---

## 1. Genel Sistem Mimarisi (Architectural Overview)

Platform, yüksek performanslı ve düşük gecikmeli veri akışını garanti etmek amacıyla **Full-Stack (Client-Server)** mimaride tasarlanmıştır:

```
                           +---------------------------------------+
                           |       Kullanıcı Cihazı (Tarayıcı)     |
                           |   (Vite + React 19 + Tailwind CSS)    |
                           +---+-------------------------------+---+
                               |                               |
                     Biyometrik Veri (rPPG)               Frekans Çalımı
                     & Aura Koordinatları              (Web Audio API Stereo)
                               |                               |
                               v                               v
                     +---------+---------+          +----------+----------+
                     |  POST /api/analyze|          |  Binaural / Solfeggio|
                     +---------+---------+          |  Procedural Nature  |
                               |                    +---------------------+
                               v
                     +---------+---------+
                     |  Express Server   |  (Node.js REST Gateway)
                     +---------+---------+
                               |
                   httpOptions (User-Agent: aistudio-build)
                   API Secret Authorization
                               |
                               v
                     +---------+---------+
                     |    Gemini AI      |  (gemini-3.5-flash)
                     +-------------------+
```

### Teknoloji Yığını (Tech Stack):
*   **İstemci (Frontend):** React 19, TypeScript, Tailwind CSS, Motion (Animasyonlar), Lucide Icons, Canvas API (Sinyal Haritalandırma).
*   **Sunucu (Backend):** Node.js, Express, tsx, esbuild, `@google/genai` TypeScript SDK.
*   **Yapay Zeka Motoru:** Google Gemini 3.5-flash (Kuantum Manevi Şifa Sentez Raporlama).
*   **Ses Sentez Motoru:** İki kulak arasına faz farklı sızma gerçekleştiren yerel **Web Audio API**.

---

## 2. Biyometrik Tarama (PPG & Vision AI) Teknolojisi

Kameradan nabız algılama teknolojisi (**Remote Photoplethysmography - rPPG**), kandaki hemoglobin miktarının zaman içindeki ışık emilim/yansıma değişimlerini ölçmek için yeşil ışık spektrumundaki mikro dalgalanmaları takip eder.

### Mobil & Web için AI Kütüphaneleri Seçimi:
1.  **MediaPipe (Face Mesh / Pose):** Yüzdeki rPPG "ROI" (Etki Alanı - Alın, her iki yanak bölgesi) bölgelerini sabitlemek ve koordinat kilitlenmesi yapmak için Google MediaPipe Face Mesh idealdir.
2.  **OpenCV.js / OpenCV (Python):** Görüntü karelerindeki pikselleri gerçek zamanlı süzmek, kanal ayrışımı yapmak (RGB -> G kanalı absorbsiyonu en yüksek olanıdır) ve parazitleri (gürültü, kafa hareketleri) yok etmek için bant geçiren filtreler (Bandpass Filter) uygular.
3.  **TensorFlow Lite (Mobil/On-Device):** Yüksek doğruluklu anomali ve aurik yırtılma tespiti için cihaz üzerinde çalıştırabileceğimiz (ML Kit gibi) hafif bir CNN modeli imkanı sunar.

---

## 3. Web Audio API & Binaural Beats Yapılandırması

Uygulamanın şifa yükleme motoru, üçüncü parti dış ses dosyalarına veya mp3 kütüphanelerine muhtaç kalmaksızın **tamamen kodsal (procedural)** olarak tasarlanmıştır. Bu sayede hiçbir dosya yükleme hatası olmadan en kararlı ses dalgaları doğrudan tarayıcı işlemcisi tarafından üretilir.

### Ses Katmanı Mimari Şeması (Audio Nodes Graph):

```
[OscillatorLeft (carrierHz)] ---------> [StereoPannerLeft (Pan -1)] --------+
                                                                          |
[OscillatorRight (carrierHz + beat)] -> [StereoPannerRight (Pan +1)] -------+---> [BinauralGain] ---> [MainDestination]
                                                                          |
[WhiteNoiseGenerator] ----------------> [BiquadFilter (Lowpass)] ----------+---> [NatureGain]
                                               ^
                                               | (Swell modulation)
                                        [LFO Oscillator (0.12Hz)]
                                               |
                                        [LFOGain (350)]
```

### Uygulanan Temel Formül:
*   $f_{sol}$ (Sol Kulak) = $f_{ta\text{şı}y\text{ı}c\text{ı}}$ (Örn: 528 Hz)
*   $f_{sa\text{ğ}}$ (Sağ Kulak) = $f_{ta\text{şı}y\text{ı}c\text{ı}} + \Delta f$ (Örn: 528 Hz + 6 Hz = 534 Hz)
*   $\Delta f$ = Beyin Dalgalarını Sürükleyen Titreşim Farkı (6 Hz Theta • Meditasyon ve Derin Rahatlama)

---

## 4. İletişim Protokolü & Veri Sentez Algoritması

Client (React) ile Server (Express) arasındaki veri alışverişi güvenli REST API üzerinden yürütülür. Şemada sunulan `/api/analyze` uç noktası, kameradan gelen optik sinyal değişkenlerini alarak Gemini AI LLM modeline gönderir.

### Veri Akış Paket Yapısı (Payload Schema):
```json
{
  "energyScore": 68,
  "stressLevel": 51,
  "heartRate": 74,
  "breathingRate": 14,
  "dominantColor": "Turuncu Akışkan",
  "dominantVibe": "Duygusal Blokaj / Değişim",
  "blockageLocation": "Solar Pleksus - Karaciğer & Mide",
  "selectedSurah": {
    "name": "Fatiha Suresi",
    "verses": "1-7",
    "healingFrequencyHz": 528,
    "esma": "Ya Şâfî, Ya Kâfî"
  }
}
```

---

## 5. Adım Adım Teknik Yol Haritası (React Native Mobil Entegrasyonu)

Bu sistemi yerel bir mobil uygulamaya (React Native + Expo veya iOS/Android native) taşımak için şu adımları takip etmelisiniz:

### 1 Adım: Kamera ve Görüntü İşleme Entegrasyonu
*   `react-native-vision-camera` kütüphanesini kurun. Bu kütüphane yüksek frame hızlarında (60FPS) kameraya native erişim sağlar.
*   **Frame Processor** özelliğini kullanarak her bir video karesini (Frame) C++ katmanında işleyin.
*   Yüz ve vücut tespiti için `react-native-fast-tflite` veya `google-mlkit/face-detection` kullanarak göz bebegi, alın koordinatlarını saptayın.

### 2. Adım: Native Ses Sentezleme (Binaural Beats)
*   Web Audio API mobil webview dışında doğrudan React Native js motorunda bulunmaz.
*   Bunun yerine, **iOS Swift** ve **Android Kotlin** tabanlı native kod yazan `react-native-audio-synthesizer` veya `expo-audio` yerel yapılarını entegre edin.
*   **iOS tarafında:** `AVAudioEngine`, `AVAudioOscillatorNode` kullanarak iki kanala faz farklı sinüs dalgası ataması yapın.
*   **Android tarafında:** `AudioTrack` sınıfını kullanarak byte düzeyinde çift kanallı PCM sinüs dizini oluşturun ve sürekli tampon (Buffer) döngüsünde yansıtın.

### 3. Adım: Cihaz Üstü Veritabanı ve Yerel Depolama
*   Bu projedeki `quran_db.ts` gibi statik verileri mobil cihazın yerel `SQLite` veritabanına veya Expo kullanılıyorsa `expo-sqlite` ya da `MMKV` (Hızlı key-value hafızası) üzerine taşıyın.

### 4. Adım: Arka Plan Terapisi ve Ekran Kilit Koruması
*   Kullanıcı gözlerini kapatıp telefonu kilitlediğinde ses akışının kesilmemesi için raw ses çalma iznini (`background audio plist/permissions` AndroidManifest) manifest dosyalarına işleyin.
*   Lockscreen (Akıllı Kilit Ekranı) medya kontrollerine aktif solfeggio Hz bilgisini basın.
