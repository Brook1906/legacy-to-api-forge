import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    
    // Parse the path to determine the resource and ID
    // Expected format: /rest-api/{dataset_name}/{record_id?}
    const datasetName = pathSegments[1]; // Skip 'rest-api'
    const recordId = pathSegments[2];

    console.log(`REST API Call: ${method} ${url.pathname}`);
    console.log(`Dataset: ${datasetName}, Record ID: ${recordId}`);

    if (!datasetName) {
      // List all available datasets
      const { data: datasets, error } = await supabase
        .from('uploaded_datasets')
        .select('id, name, description, created_at, record_count')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        message: 'Available datasets',
        datasets: datasets.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          created_at: d.created_at,
          record_count: d.record_count,
          endpoint: `/rest-api/${d.name}`
        }))
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Find the dataset by name
    const { data: dataset, error: datasetError } = await supabase
      .from('uploaded_datasets')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', datasetName)
      .single();

    if (datasetError || !dataset) {
      return new Response(JSON.stringify({ error: 'Dataset not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const data = dataset.data as any[];

    switch (method) {
      case 'GET':
        if (recordId) {
          // Get specific record by index or ID
          const index = parseInt(recordId);
          if (isNaN(index) || index < 0 || index >= data.length) {
            return new Response(JSON.stringify({ error: 'Record not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({
            record: data[index],
            index: index,
            dataset: datasetName
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else {
          // Get all records with pagination
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = (page - 1) * limit;

          const paginatedData = data.slice(offset, offset + limit);

          return new Response(JSON.stringify({
            data: paginatedData,
            pagination: {
              page,
              limit,
              total: data.length,
              pages: Math.ceil(data.length / limit)
            },
            dataset: datasetName
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

      case 'POST':
        // Add new record to the dataset
        const newRecord = await req.json();
        const updatedData = [...data, newRecord];

        const { error: updateError } = await supabase
          .from('uploaded_datasets')
          .update({ 
            data: updatedData,
            record_count: updatedData.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', dataset.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
          message: 'Record added successfully',
          record: newRecord,
          index: updatedData.length - 1,
          dataset: datasetName
        }), {
          status: 201,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'PUT':
        if (!recordId) {
          throw new Error('Record ID required for update');
        }

        const updateIndex = parseInt(recordId);
        if (isNaN(updateIndex) || updateIndex < 0 || updateIndex >= data.length) {
          return new Response(JSON.stringify({ error: 'Record not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const updateRecord = await req.json();
        const updatedDataPut = [...data];
        updatedDataPut[updateIndex] = updateRecord;

        const { error: putError } = await supabase
          .from('uploaded_datasets')
          .update({ 
            data: updatedDataPut,
            updated_at: new Date().toISOString()
          })
          .eq('id', dataset.id);

        if (putError) throw putError;

        return new Response(JSON.stringify({
          message: 'Record updated successfully',
          record: updateRecord,
          index: updateIndex,
          dataset: datasetName
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      case 'DELETE':
        if (!recordId) {
          throw new Error('Record ID required for deletion');
        }

        const deleteIndex = parseInt(recordId);
        if (isNaN(deleteIndex) || deleteIndex < 0 || deleteIndex >= data.length) {
          return new Response(JSON.stringify({ error: 'Record not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const deletedRecord = data[deleteIndex];
        const updatedDataDelete = data.filter((_, index) => index !== deleteIndex);

        const { error: deleteError } = await supabase
          .from('uploaded_datasets')
          .update({ 
            data: updatedDataDelete,
            record_count: updatedDataDelete.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', dataset.id);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({
          message: 'Record deleted successfully',
          deleted_record: deletedRecord,
          index: deleteIndex,
          dataset: datasetName
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

      default:
        throw new Error('Method not allowed');
    }
  } catch (error: any) {
    console.error('REST API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes('not found') ? 404 : 
               error.message.includes('Authorization') ? 401 :
               error.message.includes('Method not allowed') ? 405 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);