
import { EventDetails } from '../types';
import { X, Loader, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { reserveBooking } from '../services/api';

interface BookingModalProps {
  event: EventDetails | null;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ event, userId, onClose, onSuccess }: BookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  if (!event) return null;

  const handleSubmit = async () => {
    if (!userId.trim()) {
      setError('Пожалуйста, введите ваш ID');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setError('');

    try {
      await reserveBooking(event.id, userId);
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при бронировании';
      setError(errorMessage);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 animate-slide-in glass-dark">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Подтвердите бронирование</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 animate-pulse">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Бронирование подтверждено!</h3>
              <p className="text-gray-400">Ваше место успешно зарезервировано.</p>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Доступно {event.available_seats} из {event.total_seats} мест
                </p>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-300">Доступность мест</span>
                    <span className="text-blue-400 font-semibold">
                      {Math.round((event.available_seats / event.total_seats) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                      style={{
                        width: `${(event.available_seats / event.total_seats) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Ваш ID пользователя</label>
                <input
                  type="text"
                  placeholder="Введите ваш ID"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-slate-700 transition-all disabled:opacity-50"
                  defaultValue={userId}
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.parentElement?.parentElement?.setAttribute('data-user-id', input.value);
                  }}
                  disabled={isLoading}
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-700/50 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Отменить
                </button>
                <button
                  onClick={() => {
                    const userIdInput = document.querySelector('input[placeholder="Введите своё ID"]') as HTMLInputElement;
                    handleSubmit();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                  disabled={isLoading}
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Обработка...' : 'Оформить бронирование'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
