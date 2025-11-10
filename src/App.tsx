import { useState, useEffect } from 'react';
import { Header, EventCard, BookingModal } from './components';
import { Event, EventDetails } from './types';
import { getEvents } from './services/api';
import { AlertCircle, Loader } from 'lucide-react';

function App() {
  const [userId, setUserId] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('userId');
    if (saved) setUserId(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents();
      setEvents(data.events);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <Header userId={userId} onUserIdChange={setUserId} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Предстоящие <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Мероприятия</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Забронируйте свои любимые мероприятия. Все места ограничены, поспешите зарезервировать свое место!
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 animate-fade-in">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300 mb-1">Ошибка загружения</h3>
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={loadEvents}
                className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 font-semibold rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Попытаться еще
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin mb-4">
              <Loader className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-gray-400 text-lg">Загружение мероприятий...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-400 text-lg mb-4">Нет доступных мероприятий</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div key={event.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
                <EventCard
                  event={event}
                  onBookClick={setSelectedEvent}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <BookingModal
        event={selectedEvent}
        userId={userId}
        onClose={() => setSelectedEvent(null)}
        onSuccess={loadEvents}
      />

      <footer className="relative z-10 border-t border-slate-700/50 backdrop-blur-md bg-slate-900/30 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2025 EventBook. Все права защищены.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">О нас</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Приватность</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Контакты</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
