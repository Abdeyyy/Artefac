import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Sparkles, RotateCcw } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'bot'
  text: string
  timestamp: string
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Halo Operator! Saya adalah Asisten AI ARTEFAC untuk Simpang Artos. Anda dapat menanyakan kondisi lalu lintas, status tempat sampah, sensor penerangan, atau status perangkat IoT secara langsung.',
    timestamp: 'Baru saja'
  }
]

const suggestedPrompts = [
  'Ringkasan kondisi Simpang Artos saat ini',
  'Status traffic & rekomendasi lampu hijau',
  'Berapa kapasitas tempat sampah sekarang?',
  'Bagaimana status sensor penerangan LDR?',
  'Cek konektivitas perangkat IoT & LoRa'
]

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const generateBotReply = (query: string): string => {
    const q = query.toLowerCase()

    if (q.includes('ringkasan') || q.includes('semua') || q.includes('kondisi') || q.includes('overview')) {
      return `📊 **Ringkasan Sistem ARTEFAC (Simpang Artos)**:\n\n` +
        `• **Lalu Lintas**: Kepadatan tertinggi dari arah Purworejo (27 kend.) & Yogyakarta (21 kend.). Rekomendasi lampu hijau aktif 25–40 detik.\n` +
        `• **Smart Waste**: Tempat sampah utama di Main Gate terisi 65% (Near Full, jarak 45 cm).\n` +
        `• **Smart Lighting**: Intensitas LDR 320 lux, status lampu jalan **ON** (Mode Auto).\n` +
        `• **Perangkat IoT**: 8 sensor IR online, ESP32 Controller normal, LoRa Gateway terkoneksi.`
    }

    if (q.includes('traffic') || q.includes('lalu lintas') || q.includes('lampu hijau') || q.includes('kendaraan')) {
      return `🚦 **Status Traffic Intelligence**:\n\n` +
        `• **Magelang**: 18 Kendaraan | Kepadatan: Medium | Green Time: 25s\n` +
        `• **Purworejo**: 27 Kendaraan | Kepadatan: High | Green Time: 40s (Prioritas)\n` +
        `• **Yogyakarta**: 21 Kendaraan | Kepadatan: High | Green Time: 35s\n` +
        `• **Artos**: 8 Kendaraan | Kepadatan: Low | Green Time: 15s\n\n` +
        `💡 *AI Adaptive Control aktif mengoptimalkan durasi lampu hijau secara otomatis berdasarkan input 8 sensor IR.*`
    }

    if (q.includes('sampah') || q.includes('waste') || q.includes('kapasitas')) {
      return `🗑️ **Status Smart Waste (Sensor Ultrasonik)**:\n\n` +
        `• **Main Gate**: 65% - Status: *Near Full* (Jarak: 45 cm)\n` +
        `• **North Side**: 20% - Status: *Normal* (Jarak: 80 cm)\n` +
        `• **East Gate**: 85% - Status: *Full* (Jarak: 30 cm) ⚠️ *Perlu pengosongan segera*\n` +
        `• **South Gate**: 90% - Status: *Full* (Jarak: 25 cm) ⚠️ *Perlu pengosongan segera*`
    }

    if (q.includes('cahaya') || q.includes('lampu') || q.includes('ldr') || q.includes('lighting')) {
      return `💡 **Status Smart Lighting (Sensor LDR)**:\n\n` +
        `• **Intensitas Saat Ini**: 320 Lux (Threshold: 300 Lux)\n` +
        `• **Status Lampu**: ON\n` +
        `• **Mode**: Otomatis (Auto Control via ESP32)\n` +
        `• **Kondisi Jalan**: Main Road, North Street, dan South Path aktif menyala.`
    }

    if (q.includes('lora') || q.includes('perangkat') || q.includes('sensor') || q.includes('iot') || q.includes('esp32')) {
      return `📡 **Status Konektivitas Perangkat IoT**:\n\n` +
        `• **ESP32 Main Controller**: Online (Baterai: 85%)\n` +
        `• **LoRa Gateway (868 MHz)**: Online (Latensi ~120ms)\n` +
        `• **8× IR Vehicle Sensors**: 7 Online, 1 Offline (IR-04 West Sensor offline sejak 2 jam lalu)\n` +
        `• **Sensor Ultrasonik & LDR**: Semua unit operasional normal.`
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
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (res.ok) {
        const data = await res.json()
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-500" />
            AI Chatbot Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Asisten cerdas pemantauan dan kendali IoT Simpang Artos
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="btn-secondary flex items-center space-x-2 text-xs py-2 px-3"
          title="Reset Percakapan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Main Chat Box Container */}
      <div className="card flex-1 flex flex-col p-0 overflow-hidden border border-gray-200">
        {/* Messages List Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 text-blue-600 border border-blue-200'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-white text-dark-900 border border-gray-200 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  <div>{msg.text}</div>
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
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
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
        <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-xs text-gray-500 font-medium shrink-0">Saran:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-white hover:bg-blue-50 text-dark-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-full transition-all shrink-0 whitespace-nowrap shadow-2xs"
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
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
