'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  X, 
  User, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    register
  } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthModalOpen) return;

    setMode('LOGIN');
    setUsername('');
    setPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setCity('');
    setErrorMsg(null);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (mode === 'LOGIN') {
        const success = await login(username, password);
        if (success) {
          setIsAuthModalOpen(false);
        } else {
          setErrorMsg('Username atau password salah. Silakan coba lagi.');
        }
      } else {
        if (!username || !password || !fullName) {
          setErrorMsg('Semua field bertanda * wajib diisi.');
          return;
        }
        const success = await register({
          username,
          password,
          name: fullName,
          role: 'CUSTOMER',
          phone,
          address,
          city,
        });
        if (success) {
          setIsAuthModalOpen(false);
        } else {
          setErrorMsg('Username sudah digunakan atau akun gagal dibuat.');
        }
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungkan ke Supabase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 relative my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-200 text-xs font-bold uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Sistem Autentikasi Akun</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'LOGIN' ? 'Masuk ke Jastipyudin' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-amber-100/90 mt-1">
            Simpan keranjang pribadi, pantau riwayat belanja Bangkok & kelola pesananmu.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Alya Putri Maharani"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Username (e.g. pembeli / admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {mode === 'REGISTER' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp (Notifikasi Resi)
                  </label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Kirim</label>
                    <input
                      type="text"
                      placeholder="Nama Jalan, No. Rumah"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      placeholder="Jakarta Selatan"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs sm:text-sm mt-2"
            >
              <span>{mode === 'LOGIN' ? 'Masuk Sekarang' : 'Daftarkan Akun'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs">
            {mode === 'LOGIN' ? (
              <p className="text-slate-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('REGISTER'); setErrorMsg(null); }}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Daftar di sini
                </button>
              </p>
            ) : (
              <p className="text-slate-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setErrorMsg(null); }}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
