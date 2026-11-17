import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, RotateCcw } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
  modelsUsed?: string[]
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Halo! Saya **RADEN**, asisten AI lokal untuk Simpang Artos. Kamu bisa ngobrol bebas dengan saya, tanya kondisi jalan saat ini, prediksi arus 5–25 menit ke depan, penyebab kemacetan, atau cari rute alternatif tercepat.',
    timestamp: 'Baru saja'
  }
]

const CHAT_STORAGE_KEY = 'artefac_chat_history'

const suggestedPrompts = [
  'Halo RADEN, kamu pakai model AI apa saja?',
  'Prediksi arus lalu lintas 10 menit lagi',
  'Kenapa bisa padat dan apa rekomendasinya?',
  'Rute tercepat dari Magelang ke Yogyakarta',
  'Ringkasan kondisi Simpang Artos saat ini'
]

function loadStoredMessages(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) return initialMessages
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    // Abaikan jika JSON rusak
  }
  return initialMessages
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx} className="font-semibold text-dark-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx} className="italic text-gray-700">{part.slice(1, -1)}</em>
    }
    return <span key={idx}>{part}</span>
  })
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Abaikan error kuota storage
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isTyping) scrollToBottom()
  }, [isTyping])

  const generateBotReply = (query: string): string => {
    const q = query.toLowerCase()

    if (q.includes('ringkasan') || q.includes('semua') || q.includes('kondisi') || q.includes('overview')) {
      return `📊 **Ringkasan Sistem ARTEFAC (Simpang Artos)**:\n\n` +
        `• **Lalu Lintas**: Kepadatan tertinggi dari arah Purworejo (27 kend.) & Yogyakarta (21 kend.). Rekomendasi lampu hijau aktif 25–40 detik.\n` +
        `• **Tempat Sampah Pintar**: Tempat sampah utama di Gerbang Utama terisi 65% (Hampir Penuh, jarak 45 cm).\n` +
        `• **Penerangan Pintar**: Intensitas LDR 320 lux, status lampu jalan **MENYALA** (Mode Otomatis).\n` +
        `• **Perangkat IoT**: 8 sensor IR aktif, Kontroler ESP32 normal, Gateway LoRa terkoneksi.`
    }

    if (q.includes('traffic') || q.includes('lalu lintas') || q.includes('lampu hijau') || q.includes('kendaraan')) {
      return `🚦 **Status Lalu Lintas Adaptif**:\n\n` +
        `• **Magelang**: 18 Kendaraan | Kepadatan: Sedang | Waktu Hijau: 25 detik\n` +
        `• **Purworejo**: 27 Kendaraan | Kepadatan: Tinggi | Waktu Hijau: 40 detik (Prioritas)\n` +
        `• **Yogyakarta**: 21 Kendaraan | Kepadatan: Tinggi | Waktu Hijau: 35 detik\n` +
        `• **Artos**: 8 Kendaraan | Kepadatan: Rendah | Waktu Hijau: 15 detik\n\n` +
        `💡 *Kendali Adaptif AI aktif mengoptimalkan durasi lampu hijau secara otomatis berdasarkan input sensor IR.*`
    }

    if (q.includes('sampah') || q.includes('waste') || q.includes('kapasitas')) {
      return `🗑️ **Status Tempat Sampah Pintar (Sensor Ultrasonik)**:\n\n` +
        `• **Gerbang Utama**: 65% - Status: *Hampir Penuh* (Jarak: 45 cm)\n` +
        `• **Sisi Utara**: 20% - Status: *Normal* (Jarak: 80 cm)\n` +
        `• **Gerbang Timur**: 85% - Status: *Penuh* (Jarak: 30 cm) ⚠️ *Perlu pengosongan segera*\n` +
        `• **Gerbang Selatan**: 90% - Status: *Penuh* (Jarak: 25 cm) ⚠️ *Perlu pengosongan segera*`
    }

    if (q.includes('cahaya') || q.includes('lampu') || q.includes('ldr') || q.includes('lighting')) {
      return `💡 **Status Penerangan Pintar (Sensor LDR)**:\n\n` +
        `• **Intensitas Saat Ini**: 320 Lux (Ambang Batas: 300 Lux)\n` +
        `• **Status Lampu**: MENYALA\n` +
        `• **Mode**: Otomatis (Kendali Otomatis via ESP32)\n` +
        `• **Kondisi Jalan**: Jalan Utama, Jalan Utara, dan Jalur Selatan aktif menyala.`
    }

    if (q.includes('lora') || q.includes('perangkat') || q.includes('sensor') || q.includes('iot') || q.includes('esp32')) {
      return `📡 **Status Konektivitas Perangkat IoT**:\n\n` +
        `• **Kontroler Utama ESP32**: Aktif (Baterai: 85%)\n` +
        `• **Gateway LoRa (868 MHz)**: Aktif (Latensi ~120ms)\n` +
        `• **8× Sensor Kendaraan IR**: 7 Aktif, 1 Terputus (Sensor Barat IR-04 terputus sejak 2 jam lalu)\n` +
        `• **Sensor Ultrasonik & LDR**: Semua unit beroperasi normal.`
    }

    return `Terima kasih atas pertanyaannya. Sebagai asisten AI sistem ARTEFAC, saya siap membantu memantau data lalu lintas, status tempat sampah, penerangan otomatis, atau perangkat IoT Simpang Artos. Anda dapat memilih salah satu topik rekomendasi di atas.`
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Coba panggil Backend API ARTEFAC (http://localhost:5000/api/chat)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2500)
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: 'operator-web' }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelsUsed: data.aiMeta?.modelsUsed
        }
        setMessages(prev => [...prev, botMsg])
        setIsTyping(false)
        return
      }
    } catch {
      // Backend offline -> gunakan fallback respons lokal
    }

    // Fallback respons lokal jika backend belum berjalan
    setTimeout(() => {
      const botReply = generateBotReply(text)
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleResetChat = () => {
    setMessages(initialMessages)
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    } catch {
      // Abaikan error storage
    }
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* Main Chat Box Container */}
      <div className="card flex-1 flex flex-col p-0 overflow-hidden border border-gray-200 w-full">
        {/* Messages List Area */}
        <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-6 h-6 text-gray-500 translate-y-0.5"
                      aria-label="Pengguna Anonim"
                    >
                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src="/images/icon%20ai.png"
                      alt="RADEN"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] break-words rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-dark-900 border border-gray-200 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  <div className="leading-relaxed">
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isUser ? 'text-blue-100' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0">
                <img
                  src="/images/icon%20ai.png"
                  alt="RADEN"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2 overflow-x-hidden">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-xs text-gray-500 font-medium shrink-0">Saran:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-white hover:bg-blue-50 text-dark-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan kondisi lalu lintas, tempat sampah, penerangan, atau perangkat..."
              className="input-field flex-1 text-sm py-2.5"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className="btn-primary flex items-center justify-center px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Kirim Pesan"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetChat}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-gray-600 border border-gray-300 flex items-center justify-center shrink-0 transition-colors"
              title="Reset Obrolan"
              aria-label="Reset Obrolan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
