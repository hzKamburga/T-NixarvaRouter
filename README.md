# Birleşik AI Model Yönlendirme Katmanı

## 📋 Açıklama

T-NixarvaRouter, farklı AI model sağlayıcılarını (OpenAI, Claude, Gemini, Groq, vb.) birleştiren standartlaştırılmış bir API yönlendirme katmanıdır.

## 🎯 Amaç

- Kullanıcıdan tek bir standartlaştırılmış istek formatı kabul etmek
- Seçilen model backend'ine bakılmaksızın isteği normalize etmek
- İsteği doğru parametre çevirisiyle seçilen sağlayıcıya yönlendirmek
- Çıktıyı standartlaştırılmış birleşik bir JSON yapısında döndürmek

## 🔧 Davranış Kuralları

### 1. Giriş Formatı
```json
{
  "model": "provider_model_name",
  "messages": [
    { "role": "user", "content": "..." }
  ]
}
```

### 2. Sağlayıcı Dönüşümleri

İstek, dahili olarak doğru sağlayıcı API formatına dönüştürülür:

- **OpenAI** → `{ model, messages }`
- **Claude** → `{ model, max_tokens, messages: [{ role: "user", content }] }`
- **Gemini** → Uygun chat parametrelerine dönüştürülür

### 3. Çıktı Formatı

```json
{
  "output": "final text response",
  "provider": "provider-name",
  "model": "model-name",
  "tokens": { 
    "input": x, 
    "output": y, 
    "total": z 
  }
}
```

### 4. Tutarlılık

- Sağlayıcıya özgü formatlama, markdown veya sistem metni içermez
- Yanıtlar tüm sağlayıcılar arasında tutarlı tutulur
- Kullanıcı tarafından açıkça istenmedikçe ek formatlama yapılmaz

## 🚀 Özellikler

- ✅ Çoklu AI sağlayıcı desteği
- ✅ Standartlaştırılmış istek/yanıt formatı
- ✅ Otomatik parametre dönüşümü
- ✅ Birleşik token kullanım raporlaması
- ✅ Sağlayıcılar arası tutarlılık

## 📦 Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/kullanıcı_adınız/T-NixarvaRouter.git

# Proje dizinine gidin
cd T-NixarvaRouter

# Bağımlılıkları yükleyin (yakında)
# npm install
```

## 💻 Kullanım

Yakında eklenecek...

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request göndermekten çekinmeyin.

## 📄 Lisans

MIT

## 📧 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.