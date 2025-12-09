import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, readApiUrl } = body;

    if (!entityId || !readApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'entityId and readApiUrl are required',
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${readApiUrl}/v1/entities/${entityId}/relations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        id: "",
        relatedEntityId: "",
        name: "",
        activeAt: "",
        startTime: "",
        endTime: "",
        direction: "",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch entity relations',
          message: `API returned status ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response format',
          message: 'Expected an array response from relations endpoint',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        count: data.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching entity relations:', error);

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
        error: 'Failed to fetch entity relations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

