'use client';

import { useState } from 'react';
import { Bot, X, Send, User } from 'lucide-react';
import { tanyaAiAsistenAction } from '../api/openai/aiAsisten';

export default function AiAsisten() {
  const [isOpen, setIsOpen] = useState(false);
  const [pesan, setPesan] = useState('');
  const [chatList, setChatList] = useState([
    {
      role: 'assistant',
      content: 'Halo! Saya asisten pintar pemilahan sampah. Ada yang ingin ditanyakan tentang cara memilah sampah di rumah?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const kirimPesan = async (e) => {
    e?.preventDefault();
    if (!pesan.trim() || loading) return;

    const userMsg = pesan.trim();
    setPesan('');
    const newChatList = [...chatList, { role: 'user', content: userMsg }];
    setChatList(newChatList);
    setLoading(true);

    try {
      const res = await tanyaAiAsistenAction(userMsg, newChatList);
      if (res.success) {
        setChatList(prev => [...prev, { role: 'assistant', content: res.jawaban }]);
      } else {
        setChatList(prev => [...prev, { role: 'assistant', content: res.error || 'Maaf, terjadi kendala saat menjawab.' }]);
      }
    } catch (_) {
      setChatList(prev => [...prev, { role: 'assistant', content: 'Gagal terhubung dengan server asisten.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol Mengambang Floating Asisten */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        title="Tanya Asisten Pemilahan Sampah"
        className="fixed bottom-20 md:bottom-6 right-5 z-40 p-3.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
      >
        <Bot className="w-6 h-6" />
        <span className="text-xs font-bold hidden sm:inline pr-1">Tanya Sampah AI</span>
      </button>

      {/* Jendela Chat Asisten */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 sm:h-[500px] z-50 bg-white dark:bg-stone-900 sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#2d6a4f] dark:bg-emerald-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Asisten Edukasi Sampah</h4>
                <p className="text-[11px] text-emerald-100 dark:text-emerald-200">Bantuan memilah sampah ramah keluarga</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Kotak Riwayat Percakapan */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f7faf8] dark:bg-stone-950/70">
            {chatList.map((chat, idx) => {
              const isMe = chat.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-[#d8f3dc] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#2d6a4f] dark:bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 shadow-2xs rounded-tl-none'
                    }`}
                  >
                    {chat.content}
                  </div>
                  {isMe && (
                    <div className="w-7 h-7 rounded-full bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs py-2">
                <div className="w-2 h-2 rounded-full bg-[#2d6a4f] dark:bg-emerald-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#2d6a4f] dark:bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#2d6a4f] dark:bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span>Menyiapkan jawaban...</span>
              </div>
            )}
          </div>

          {/* Form Input Pesan */}
          <form onSubmit={kirimPesan} className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Contoh: Kulit telur masuk sampah apa?"
              className="flex-1 px-3.5 py-2 text-sm bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-hidden focus:border-[#2d6a4f] dark:focus:border-emerald-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
            <button
              type="submit"
              disabled={loading || !pesan.trim()}
              className="p-2.5 bg-[#2d6a4f] hover:bg-[#1b4332] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
