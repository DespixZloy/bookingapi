export interface Event {
  id: number;
  name: string;
  total_seats: number;
  created_at: string;
}

export interface EventDetails extends Event {
  available_seats: number;
  booked_seats: number;
}

export interface Booking {
  id: number;
  event_id: number;
  user_id: string;
  created_at: string;
  events?: Event;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
  message: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
