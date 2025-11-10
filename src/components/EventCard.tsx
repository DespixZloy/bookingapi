import { Event, EventDetails } from '../types';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getEventDetails } from '../services/api';

interface EventCardProps {
  event: Event;
  onBookClick: (event: EventDetails) => void;
}

export function EventCard({ event, onBookClick }: EventCardProps) {
  const [details, setDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventDetails(event.id)
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [event.id]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 glass card-hover h-full animate-shimmer">
        <div className="h-12 bg-white/10 rounded mb-4"></div>
        <div className="h-4 bg-white/10 rounded mb-2"></div>
      </div>
    );
  }

  if (!details) return null;

  const seatPercentage = (details.booked_seats / details.total_seats) * 100;
  const availableSeats = details.available_seats;
  const isAlmostFull = seatPercentage > 80;
  const isFull = seatPercentage === 100;

  return (
    <div className="group relative animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 glass card-hover h-full border border-slate-700/50 hover:border-blue-500/50 transition-colors duration-300">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {details.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(details.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-6 flex-grow">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {details.booked_seats} / {details.total_seats} мест
                </span>
              </div>
              <span className={`text-sm font-semibold ${
                isFull ? 'text-red-400' : isAlmostFull ? 'text-amber-400' : 'text-green-400'
              }`}>
                {availableSeats} осталось
              </span>
            </div>

            <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull
                    ? 'bg-red-500'
                    : isAlmostFull
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${seatPercentage}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => onBookClick(details)}
            disabled={isFull}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isFull
                ? 'bg-slate-700 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/50 active:scale-95'
            }`}
          >
            {isFull ? 'Мест нет' : 'Забронировать'}
            {!isFull && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
