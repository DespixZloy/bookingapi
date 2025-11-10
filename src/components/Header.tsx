import { Ticket } from 'lucide-react';

interface HeaderProps {
  userId: string;
  onUserIdChange: (id: string) => void;
}

export function Header({ userId, onUserIdChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/50 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                EventBook
              </h1>
              <p className="text-xs text-gray-500">Система бронирования</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Ваш ID пользователя"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
