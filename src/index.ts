export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== '/upload-log') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!url.searchParams.has('key')) {
      return new Response(JSON.stringify({ error: 'No access key provided' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (url.searchParams.get('key') !== env.UPLOAD_KEY) {
      return new Response(JSON.stringify({ error: 'Invalid access key provided' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const formData = await request.formData();
    const file = formData.get('fileToUpload') as any;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Invalid file uploaded' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Get the filename with any directory path stripped
    const baseFilename = file.name.split('/').pop() || file.name;

    console.log('Uploading file', baseFilename, 'with size', file.size);

    // Upload file to storage
    const nowDate = new Date();
    const dateString = nowDate.toISOString().split('T')[0];

    const hashedName = await stringHash(file.name);
    const key = `${dateString}/${hashedName}.tsv`;

    console.log('Will save as', key);

    const metadata = await env.LOGS_BUCKET.head(key);
    if (metadata) {
      // Already exists!
      console.log('File already exists');

      // Assume they're the same file
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    await env.LOGS_BUCKET.put(`${dateString}/${hashedName}.tsv`, file);

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
} satisfies ExportedHandler<Env>;

async function stringHash(str: string): Promise<string> {
  const hashedName = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  const hashArray = Array.from(new Uint8Array(hashedName));
  const hashHexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHexString;
}
