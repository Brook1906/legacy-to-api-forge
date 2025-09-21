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
    const action = pathSegments[1]; // 'upload', 'download', 'list', etc.
    const fileId = pathSegments[2];

    console.log(`File API Call: ${method} ${url.pathname}`);

    switch (method) {
      case 'GET':
        if (action === 'list') {
          // List all uploaded files
          const { data: files, error } = await supabase
            .from('uploaded_datasets')
            .select('id, name, description, created_at, file_type, file_size, record_count')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          return new Response(JSON.stringify({
            files: files.map(f => ({
              id: f.id,
              name: f.name,
              description: f.description,
              created_at: f.created_at,
              file_type: f.file_type,
              file_size: f.file_size,
              record_count: f.record_count,
              download_url: `/file-api/download/${f.id}`,
              api_url: `/rest-api/${f.name}`
            }))
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } else if (action === 'download' && fileId) {
          // Download specific file
          const { data: file, error } = await supabase
            .from('uploaded_datasets')
            .select('*')
            .eq('user_id', user.id)
            .eq('id', fileId)
            .single();

          if (error || !file) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          const jsonData = JSON.stringify(file.data, null, 2);
          
          return new Response(jsonData, {
            headers: {
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${file.name}.json"`,
              ...corsHeaders
            },
          });
        } else if (action === 'info' && fileId) {
          // Get file information
          const { data: file, error } = await supabase
            .from('uploaded_datasets')
            .select('id, name, description, created_at, file_type, file_size, record_count')
            .eq('user_id', user.id)
            .eq('id', fileId)
            .single();

          if (error || !file) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }

          return new Response(JSON.stringify({
            file: {
              ...file,
              download_url: `/file-api/download/${file.id}`,
              api_url: `/rest-api/${file.name}`
            }
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      case 'POST':
        if (action === 'upload') {
          // Handle file upload
          const formData = await req.formData();
          const file = formData.get('file') as File;
          const name = formData.get('name') as string || file?.name;
          const description = formData.get('description') as string;

          if (!file) {
            throw new Error('No file provided');
          }

          const content = await file.text();
          let parsedData;

          try {
            parsedData = JSON.parse(content);
            if (!Array.isArray(parsedData)) {
              parsedData = [parsedData];
            }
          } catch {
            // Try to parse as CSV
            const lines = content.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              throw new Error('Invalid file format');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
            parsedData = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index] || '';
              });
              return obj;
            });
          }

          const { data: newFile, error: insertError } = await supabase
            .from('uploaded_datasets')
            .insert([{
              user_id: user.id,
              name: name.replace(/\.[^/.]+$/, ''), // Remove extension
              description: description || `Uploaded via API (${(file.size / 1024).toFixed(2)} KB)`,
              data: parsedData,
              file_type: file.name.split('.').pop()?.toLowerCase() || 'json',
              file_size: file.size,
              record_count: parsedData.length
            }])
            .select()
            .single();

          if (insertError) throw insertError;

          return new Response(JSON.stringify({
            message: 'File uploaded successfully',
            file: {
              id: newFile.id,
              name: newFile.name,
              record_count: newFile.record_count,
              api_url: `/rest-api/${newFile.name}`,
              download_url: `/file-api/download/${newFile.id}`
            }
          }), {
            status: 201,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      case 'DELETE':
        if (fileId) {
          const { error } = await supabase
            .from('uploaded_datasets')
            .delete()
            .eq('user_id', user.id)
            .eq('id', fileId);

          if (error) throw error;

          return new Response(JSON.stringify({
            message: 'File deleted successfully'
          }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
        break;

      default:
        throw new Error('Method not allowed');
    }

    throw new Error('Invalid endpoint');
  } catch (error: any) {
    console.error('File API Error:', error);
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