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
      // Check if there's a recent prediction (less than 24 hours old)
      const { data: recentPrediction, error: recentPredictionError } = await supabase
        .from('predictions')
        .select('*')
        .eq('client_id', client_id)
        .eq('user_id', user_id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // If there's a recent prediction and no error, return it
      if (recentPrediction && !recentPredictionError) {
        return new Response(
          JSON.stringify({ prediction: recentPrediction }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Otherwise, calculate a new prediction
      // Get user events for analysis
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

      // Get user profile for additional context
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('client_id', client_id)
        .eq('user_id', user_id)
        .single();

      // Enhanced prediction model with more factors
      const risk_score = calculateRiskScore(userEvents || [], userProfile);
      const risk_factors = determineRiskFactors(userEvents || [], userProfile);

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

// Enhanced risk score calculation with more factors
function calculateRiskScore(events, userProfile) {
  if (events.length === 0) return 0.5; // Default medium risk if no events
  
  // Risk factors to consider:
  // 1. Recency of activity (more recent = lower risk)
  // 2. Frequency of activity (more activity = lower risk)
  // 3. Types of events (certain patterns indicate higher risk)
  // 4. Time since registration (newer users may have higher churn risk)
  // 5. Error events (more errors = higher risk)
  
  const now = new Date();
  const lastEventTime = new Date(events[0].timestamp);
  const daysSinceLastActivity = (now.getTime() - lastEventTime.getTime()) / (1000 * 60 * 60 * 24);
  
  // Recency factor: Higher risk the longer they've been inactive
  const recencyFactor = Math.min(daysSinceLastActivity / 30, 1); // Max 1 month
  
  // Frequency factor: More events = lower risk
  const frequencyFactor = Math.max(1 - events.length / 100, 0); // Scales with up to 100 events
  
  // Error factor: More errors = higher risk
  const errorEvents = events.filter(e => e.event_type === 'error' || e.event_type === 'promise_rejection');
  const errorFactor = Math.min(errorEvents.length / 10, 1); // Scales with up to 10 errors
  
  // Engagement factor: More page views and clicks = lower risk
  const engagementEvents = events.filter(e => e.event_type === 'page_view' || e.event_type === 'click');
  const engagementFactor = Math.max(1 - engagementEvents.length / 50, 0); // Scales with up to 50 engagement events
  
  // Tenure factor: Based on first_seen from user profile
  let tenureFactor = 0.5; // Default
  if (userProfile && userProfile.first_seen) {
    const daysSinceRegistration = (now.getTime() - new Date(userProfile.first_seen).getTime()) / (1000 * 60 * 60 * 24);
    tenureFactor = Math.max(1 - daysSinceRegistration / 90, 0); // Higher risk for newer users, scales with up to 90 days
  }
  
  // Calculate final risk score (0-1 scale) with weighted factors
  let riskScore = (recencyFactor * 0.3) + 
                  (frequencyFactor * 0.2) + 
                  (errorFactor * 0.2) + 
                  (engagementFactor * 0.2) + 
                  (tenureFactor * 0.1);
  
  // Ensure the score is between 0 and 1
  riskScore = Math.max(0, Math.min(1, riskScore));
  
  return riskScore;
}

// Enhanced determination of risk factors
function determineRiskFactors(events, userProfile) {
  const factors = {};
  
  if (events.length === 0) {
    factors.no_data = "No activity data available";
    return factors;
  }
  
  const now = new Date();
  const lastEventTime = new Date(events[0].timestamp);
  const daysSinceLastActivity = (now.getTime() - lastEventTime.getTime()) / (1000 * 60 * 60 * 24);
  
  // Inactivity factor
  if (daysSinceLastActivity > 14) {
    factors.inactivity = "User has not been active for more than 2 weeks";
  } else if (daysSinceLastActivity > 7) {
    factors.low_activity = "User has low activity in the past week";
  }
  
  // Engagement factors
  if (events.length < 5) {
    factors.low_engagement = "User has very few interactions";
  }
  
  // Page visit patterns
  const pageVisits = events.filter(e => e.event_type === 'page_view');
  if (pageVisits.length < 3) {
    factors.limited_exploration = "User has viewed very few pages";
  }
  
  // Error experience
  const errorEvents = events.filter(e => e.event_type === 'error' || e.event_type === 'promise_rejection');
  if (errorEvents.length > 3) {
    factors.error_prone = "User encountered multiple errors";
  }
  
  // Session patterns
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  if (uniqueSessions < 2 && events.length > 10) {
    factors.single_session = "User doesn't return for multiple sessions";
  }
  
  // New user risk
  if (userProfile && userProfile.first_seen) {
    const daysSinceRegistration = (now.getTime() - new Date(userProfile.first_seen).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRegistration < 7) {
      factors.new_user = "Recently registered user with limited history";
    }
  }
  
  return factors;
}
