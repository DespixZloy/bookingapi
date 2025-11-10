import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ReserveBookingRequest {
  event_id: number;
  user_id: string;
}

interface Event {
  id: number;
  name: string;
  total_seats: number;
}

interface Booking {
  id: number;
  event_id: number;
  user_id: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'ОПЦИИ') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/reserve') && req.method === 'POST') {
      const body: ReserveBookingRequest = await req.json();
      const { event_id, user_id } = body;

      if (!event_id || !user_id) {
        return new Response(
          JSON.stringify({ error: 'требуются идентификаторы event_id и user_id' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: existingBooking, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('event_id', event_id)
        .eq('user_id', user_id)
        .maybeSingle();

      if (checkError) {
        return new Response(
          JSON.stringify({ error: 'Не удалось проверить существующее бронирование', details: checkError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (existingBooking) {
        return new Response(
          JSON.stringify({ error: 'Этот пользователь уже забронирован на мероприятие ' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, total_seats')
        .eq('id', event_id)
        .maybeSingle();

      if (eventError || !event) {
        return new Response(
          JSON.stringify({ error: 'Мероприятие не найдено' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { count: bookingCount, error: countError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id);

      if (countError) {
        return new Response(
          JSON.stringify({ error: 'Не удалось проверить наличие свободных мест', details: countError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (bookingCount !== null && bookingCount >= event.total_seats) {
        return new Response(
          JSON.stringify({ error: 'На это мероприятие нет свободных мест' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({ event_id, user_id })
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Не удалось создать бронирование', details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          booking,
          message: `Успешно забронированное место на ${event.name}`,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path.endsWith('/events') && req.method === 'GET') {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Не удалось получить события', details: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({ events }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.match(/\/events\/\d+$/) && req.method === 'GET') {
      const eventId = parseInt(path.split('/').pop()!);
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError || !event) {
        return new Response(
          JSON.stringify({ error: 'Мероприятие не найдино' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      return new Response(
        JSON.stringify({
          event,
          available_seats: event.total_seats - (bookingCount || 0),
          booked_seats: bookingCount || 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (path.match(/\/user\/[^\/]+\/bookings$/) && req.method === 'GET') {
      const userId = path.split('/')[2];

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          event_id,
          user_id,
          created_at,
          events (
            id,
            name,
            total_seats
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Не удалось получить события', details: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({ bookings }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера', details: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});