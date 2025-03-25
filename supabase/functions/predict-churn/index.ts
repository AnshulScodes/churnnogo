
// Predict Churn Risk Edge Function
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
    
    // Process for both GET and POST to allow different use cases
    const { api_key, user_id } = req.method === "GET" 
      ? Object.fromEntries(new URL(req.url).searchParams)
      : await req.json();

    if (!api_key) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
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

    // If user_id is provided, get prediction for specific user
    if (user_id) {
      const { data: predictionData, error: predictionError } = await supabase
        .from('predictions')
        .select('*')
        .eq('client_id', client_id)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (predictionError && predictionError.code !== 'PGRST116') {
        console.error("Prediction retrieval error:", predictionError);
        return new Response(
          JSON.stringify({ error: "Failed to retrieve prediction data" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (!predictionData) {
        // If no prediction exists, calculate a new one
        const { data: userEvents, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('client_id', client_id)
          .eq('user_id', user_id)
          .order('timestamp', { ascending: false });

        if (eventsError) {
          console.error("Events retrieval error:", eventsError);
          return new Response(
            JSON.stringify({ error: "Failed to retrieve user events" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        // Simple prediction model based on user events
        // In a real implementation, this would use more sophisticated algorithms
        const risk_score = calculateRiskScore(userEvents || []);
        const risk_factors = determineRiskFactors(userEvents || []);

        // Save the prediction
        const { data: newPrediction, error: insertError } = await supabase
          .from('predictions')
          .insert([{
            client_id,
            user_id,
            risk_score,
            risk_factors
          }])
          .select()
          .single();

        if (insertError) {
          console.error("Prediction insertion error:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to save prediction" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        return new Response(
          JSON.stringify({ prediction: newPrediction }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      return new Response(
        JSON.stringify({ prediction: predictionData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // Get predictions for all users of this client
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .eq('client_id', client_id)
        .order('risk_score', { ascending: false });

      if (predictionsError) {
        console.error("Predictions retrieval error:", predictionsError);
        return new Response(
          JSON.stringify({ error: "Failed to retrieve predictions" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ predictions: predictions || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Simple risk score calculation based on user activity
function calculateRiskScore(events: any[]): number {
  if (events.length === 0) return 0.5; // Default medium risk if no events
  
  // Sample factors that might indicate churn risk:
  // 1. Recency of activity (more recent = lower risk)
  // 2. Frequency of activity (more activity = lower risk)
  // 3. Types of events (certain patterns may indicate higher risk)
  
  const now = new Date();
  const lastEventTime = new Date(events[0].timestamp);
  const daysSinceLastActivity = (now.getTime() - lastEventTime.getTime()) / (1000 * 60 * 60 * 24);
  
  // Recency factor: Higher risk the longer they've been inactive
  const recencyFactor = Math.min(daysSinceLastActivity / 30, 1); // Max 1 month
  
  // Frequency factor: More events = lower risk
  const frequencyFactor = Math.max(1 - events.length / 100, 0); // Scales with up to 100 events
  
  // Calculate final risk score (0-1 scale)
  let riskScore = (recencyFactor * 0.7) + (frequencyFactor * 0.3);
  
  // Ensure the score is between 0 and 1
  riskScore = Math.max(0, Math.min(1, riskScore));
  
  return riskScore;
}

// Determine contributing factors to the risk score
function determineRiskFactors(events: any[]): any {
  const factors: any = {};
  
  if (events.length === 0) {
    factors.no_data = "No activity data available";
    return factors;
  }
  
  const now = new Date();
  const lastEventTime = new Date(events[0].timestamp);
  const daysSinceLastActivity = (now.getTime() - lastEventTime.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceLastActivity > 14) {
    factors.inactivity = "User has not been active for more than 2 weeks";
  }
  
  if (events.length < 5) {
    factors.low_engagement = "User has very few interactions";
  }
  
  // Analyze page visit patterns
  const pageVisits = events.filter(e => e.event_type === 'page_view');
  if (pageVisits.length < 3) {
    factors.limited_exploration = "User has viewed very few pages";
  }
  
  return factors;
}
