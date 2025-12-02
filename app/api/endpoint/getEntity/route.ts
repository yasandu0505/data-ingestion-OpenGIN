import { NextRequest, NextResponse } from 'next/server';

// POST - Get entities from readApiUrl based on majorKind and minorKind
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { majorKind, minorKind, readApiUrl } = body;

    // Validate required fields
    if (!majorKind || !minorKind || !readApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'majorKind, minorKind, and readApiUrl are required',
        },
        { status: 400 }
      );
    }

    // Prepare payload for the readApiUrl
    const payload = {
      kind: {
        major: majorKind,
        minor: minorKind,
      },
    };

    // Call the readApiUrl with the payload
    const response = await fetch(readApiUrl + "/v1/entities/search", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch entities',
          message: `API returned status ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract the body array from the response
    if (!data.body || !Array.isArray(data.body)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response format',
          message: 'Response does not contain a valid body array',
        },
        { status: 500 }
      );
    }

    // Return the items from the body
    return NextResponse.json(
      {
        success: true,
        data: data.body,
        count: data.body.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching entities:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Request timeout',
          message: 'The request to the readApiUrl timed out',
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch entities',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

