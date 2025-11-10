import { Event, EventDetails, BookingResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ANON_KEY}`,
  'Apikey': ANON_KEY,
};

export async function getEvents(): Promise<{ events: Event[] }> {
  const response = await fetch(`${API_URL}/functions/v1/bookings/events`, { headers });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch events');
  }
  return response.json();
}

export async function getEventDetails(eventId: number): Promise<EventDetails> {
  const response = await fetch(`${API_URL}/functions/v1/bookings/events/${eventId}`, { headers });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch event details');
  }
  const data = await response.json();
  return data.event ? { ...data.event, available_seats: data.available_seats, booked_seats: data.booked_seats } : data;
}

export async function reserveBooking(eventId: number, userId: string): Promise<BookingResponse> {
  const response = await fetch(`${API_URL}/functions/v1/bookings/reserve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ event_id: eventId, user_id: userId }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = data;
    throw new Error(error.error || 'Failed to reserve booking');
  }

  return data as BookingResponse;
}

export async function getUserBookings(userId: string) {
  const response = await fetch(`${API_URL}/functions/v1/bookings/user/${userId}/bookings`, { headers });
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error || 'Failed to fetch bookings');
  }
  return response.json();
}
