import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const method = req.method;
    const customerId = pathSegments[pathSegments.length - 1];

    console.log(`API Call: ${method} ${url.pathname}`);

    switch (method) {
      case 'GET':
        if (customerId && customerId !== 'customers') {
          // Get specific customer
          const { data, error } = await supabase
            .from('legacy_customers')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', customerId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          // Get all customers
          const { data, error } = await supabase
            .from('legacy_customers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({ data, count: data.length }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

      case 'POST':
        const postBody = await req.json();
        const { data: newCustomer, error: insertError } = await supabase
          .from('legacy_customers')
          .insert([{ ...postBody, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(JSON.stringify(newCustomer), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'PUT':
        if (!customerId) {
          throw new Error('Customer ID required for update');
        }

        const putBody = await req.json();
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('legacy_customers')
          .update(putBody)
          .eq('user_id', user.id)
          .eq('id', customerId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedCustomer), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'DELETE':
        if (!customerId) {
          throw new Error('Customer ID required for deletion');
        }

        const { error: deleteError } = await supabase
          .from('legacy_customers')
          .delete()
          .eq('user_id', user.id)
          .eq('id', customerId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'Customer deleted successfully' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      default:
        throw new Error('Method not allowed');
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('not found') ? 404 : 
               error.message.includes('Authorization') ? 401 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);