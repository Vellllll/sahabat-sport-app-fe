// app/admin/dashboard/ai-report/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Sparkles, LayoutDashboard, Send, Bot, User, Loader2, ClipboardList, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { sendQueryToDatabaseAgent } from './actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

export default function AdminAiChatAgentPage() {
    const token = "DUMMY_OR_INJECTED_ADMIN_TOKEN";

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: "Halo, Bos! Saya adalah **Agent Database Sahabat Sport**. Anda bisa bertanya apa saja mengenai data penjualan, stok barang, performa produk, hingga tren finansial toko kita secara real-time. Ada yang bisa saya bantu periksa hari ini?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Otomatis scroll ke bawah setiap kali ada pesan baru atau efek mengetik berjalan
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    /**
     * 🟢 HELPER FUNCTION FOR TYPEWRITER EFFECT
     * Fungsi ini mensimulasikan AI mengetik dengan menambahkan kata demi kata secara berkala
     */
    const simulateTyping = (fullText: string, messageId: string) => {
        const words = fullText.split(' ');
        let currentWordIndex = 0;
        let currentText = '';

        // Buat slot pesan kosong terlebih dahulu di timeline chat
        setMessages(prev => [
            ...prev,
            {
                id: messageId,
                role: 'assistant',
                text: '',
                timestamp: new Date()
            }
        ]);

        const interval = setInterval(() => {
            if (currentWordIndex < words.length) {
                currentText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];

                // Update pesan spesifik berdasarkan ID-nya
                setMessages(prev =>
                    prev.map(msg => msg.id === messageId ? { ...msg, text: currentText } : msg)
                );

                currentWordIndex++;
            } else {
                clearInterval(interval);
                setIsLoading(false); // Matikan loading state setelah mengetik selesai
            }
        }, 45); // Kecepatan mengetik (semakin kecil nilainya, semakin cepat)
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userText = inputMessage;
        setInputMessage('');

        // 1. Masukkan pesan user ke timeline secara instan
        const userMessage: Message = {
            id: Math.random().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // 🟢 AKTIFKAN LOADING: Indikator "Agent sedang memeriksa query SQL..." akan muncul
        setIsLoading(true);

        // 2. Tembak API /chat/query ke backend NestJS
        const response = await sendQueryToDatabaseAgent(token, userText);

        if (response && response.status === 201) {
            // 3. Jalankan efek mengetik. 
            // CATATAN: Di dalam fungsi `simulateTyping`, pastikan `setIsLoading(false)` 
            // BARU DIKRESEK MATI setelah kata terakhir selesai diketik agar transisinya mulus!
            const targetAiMessageId = Math.random().toString();
            simulateTyping(response.answer, targetAiMessageId);
        } else {
            // Kebijakan Fallback jika koneksi database gagal
            const targetAiMessageId = Math.random().toString();
            simulateTyping("Maaf Bos, terjadi kendala saat menghubungi database pusat. Silakan coba sesaat lagi.", targetAiMessageId);
            setIsLoading(false); // Matikan loading jika error keras
        }
    };

    const clearChatHistory = () => {
        if (confirm("Apakah Anda ingin membersihkan seluruh riwayat obrolan ini?")) {
            setMessages([messages[0]]);
        }
    };

    const sanitizeMarkdownText = (text: string) => {
        if (!text) return "";
        return text
            .replace(/<br\s*\/?>/gi, "\n") // Mengubah <br>, <br/>, atau <br > menjadi newline \n
            .replace(/\n\s*\n/g, "\n");   // Merapikan enter ganda yang terlalu renggang
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between max-w-6xl mx-auto space-y-6">

            {/* HEADER BAR */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 shrink-0">
                <div className="space-y-1">
                    <Link
                        href="/admin/dashboard"
                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#165dfc] flex items-center gap-1.5 transition-colors mb-1"
                    >
                        <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard Utama
                    </Link>
                    <h1 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#165dfc]" /> Ask Database Agent AI
                    </h1>
                </div>

                <button
                    onClick={clearChatHistory}
                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* CHAT BUBBLE VIEWPORT TIMELINE */}
            <div className="flex-1 bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-y-auto p-4 sm:p-6 h-[calc(100vh-280px)] space-y-6 scrollbar-thin">
                {messages.map((msg) => {
                    const isBot = msg.role === 'assistant';
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-200 ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                        >
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm
                ${isBot ? 'bg-blue-50 text-[#165dfc] border-blue-100' : 'bg-slate-950 text-white border-slate-900'}
              `}>
                                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>

                            <div className="space-y-1">
                                <div className={`p-4 rounded-[24px] shadow-sm text-xs sm:text-sm leading-relaxed border
                  ${isBot
                                        ? 'bg-slate-50/50 text-slate-800 border-slate-100 rounded-tl-none'
                                        : 'bg-[#165dfc] text-white border-[#124ecb] rounded-tr-none'
                                    }
                `}>
                                    <article className={`prose max-w-none text-xs sm:text-sm font-medium
                    ${isBot ? 'text-slate-700 prose-strong:text-slate-950' : 'text-white prose-strong:text-white'}
                    prose-strong:font-black prose-ul:space-y-1 prose-ul:my-2
                  `}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {/* 🟢 Gunakan fungsi sanitasi di sini */}
                                            {sanitizeMarkdownText(msg.text)}
                                        </ReactMarkdown>
                                    </article>
                                </div>

                                <p className={`text-[9px] font-bold text-slate-400 font-mono ${!isBot && 'text-right'}`}>
                                    {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* LOADING INDICATOR (Hanya muncul saat menunggu response API awal sebelum efek mengetik dimulai) */}
                {isLoading && (
                    <div className="flex gap-4 max-w-[80%] mr-auto animate-in fade-in duration-200">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#165dfc] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-[24px] rounded-tl-none flex items-center gap-2.5 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-[#165dfc]" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                Agent sedang membaca skema database...
                            </span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* FOOTER FORM INPUT STATION */}
            <form onSubmit={handleSendMessage} className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-md flex items-center gap-2 shrink-0">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tanyakan sesuatu... (Contoh: Berapa produk raket yang lunas terjual bulan Juni?)"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 placeholder-slate-400 outline-none bg-transparent disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-11 w-11 bg-[#165dfc] text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-[#165dfc]/10 hover:bg-[#124ecb] active:scale-95 disabled:opacity-30 disabled:scale-100 cursor-pointer"
                >
                    <Send className="h-4 w-4" />
                </button>
            </form>

            {/* QUICK SUGGESTIONS TEMPLATE */}
            <div className="hidden sm:flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none shrink-0">
                <ClipboardList className="h-3.5 w-3.5 text-[#165dfc]" /> Rekomendasi Pertanyaan:
                <button
                    onClick={() => setInputMessage("Berapa omset kotor toko kita sepanjang tahun 2026?")}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-slate-500 hover:border-[#165dfc] hover:text-[#165dfc] transition-colors cursor-pointer disabled:opacity-50"
                >
                    Omset 2026
                </button>
                <button
                    onClick={() => setInputMessage("Tampilkan daftar produk terlaris saat ini")}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-slate-500 hover:border-[#165dfc] hover:text-[#165dfc] transition-colors cursor-pointer disabled:opacity-50"
                >
                    Produk Terlaris
                </button>
            </div>

        </main>
    );
}