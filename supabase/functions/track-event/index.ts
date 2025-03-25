
// Track Event Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Only process POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }

    const { 
      api_key,
      user_id,
      session_id,
      event_type,
      page_url,
      element_info = {}
    } = await req.json();

    if (!api_key || !event_type) {
      return new Response(
        JSON.stringify({ error: "API key and event type are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Find the client_id associated with the API key
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('api_key', api_key)
      .single();

    if (clientError || !clientData) {
      console.error("Client lookup error:", clientError);
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const client_id = clientData.id;

    // Insert event data
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert([{
        client_id,
        user_id,
        session_id,
        event_type,
        page_url,
        element_info
      }]);

    if (eventError) {
      console.error("Event insertion error:", eventError);
      return new Response(
        JSON.stringify({ error: "Failed to record event" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Update or create user profile
    if (user_id) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert([{
          client_id,
          user_id,
          last_active: new Date().toISOString()
        }], {
          onConflict: 'client_id, user_id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error("User profile update error:", profileError);
        // Continue even if profile update fails
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
