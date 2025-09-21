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
    const datasetId = pathSegments[pathSegments.length - 1];

    console.log(`Datasets API Call: ${method} ${url.pathname}`);

    switch (method) {
      case 'GET':
        if (datasetId && datasetId !== 'datasets') {
          // Get specific dataset
          const { data, error } = await supabase
            .from('uploaded_datasets')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', datasetId)
            .single();

          if (error) throw error;

          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          // Get all datasets
          const { data, error } = await supabase
            .from('uploaded_datasets')
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
        const { data: newDataset, error: insertError } = await supabase
          .from('uploaded_datasets')
          .insert([{ ...postBody, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(JSON.stringify(newDataset), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'PUT':
        if (!datasetId) {
          throw new Error('Dataset ID required for update');
        }

        const putBody = await req.json();
        const { data: updatedDataset, error: updateError } = await supabase
          .from('uploaded_datasets')
          .update(putBody)
          .eq('user_id', user.id)
          .eq('id', datasetId)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updatedDataset), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'DELETE':
        if (!datasetId) {
          throw new Error('Dataset ID required for deletion');
        }

        const { error: deleteError } = await supabase
          .from('uploaded_datasets')
          .delete()
          .eq('user_id', user.id)
          .eq('id', datasetId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'Dataset deleted successfully' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      default:
        throw new Error('Method not allowed');
    }
  } catch (error: any) {
    console.error('Datasets API Error:', error);
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