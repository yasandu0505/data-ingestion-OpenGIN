import { NextRequest, NextResponse } from 'next/server';
import Endpoint, { ensureMongooseConnection } from '@/lib/endpoint';

// GET - Read all endpoint data
export async function GET() {
  try {
    // Ensure MongoDB connection
    await ensureMongooseConnection();

    // Fetch all endpoints from database
    const endpoints = await Endpoint.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: endpoints,
        count: endpoints.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch endpoints',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Save endpoint data
export async function POST(request: NextRequest) {
  try {
    // Ensure MongoDB connection
    await ensureMongooseConnection();

    // Parse request body
    const body = await request.json();
    const { readApiUrl, updateApiUrl, kindPairs = [] } = body;

    // Validate required fields
    if (!readApiUrl || !updateApiUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Both readApiUrl and updateApiUrl are required',
        },
        { status: 400 }
      );
    }

    // Validate kindPairs if provided
    if (kindPairs && Array.isArray(kindPairs)) {
      for (const pair of kindPairs) {
        if (!pair.majorKind || !pair.minorKind) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid kind pairs',
              message: 'Each kind pair must have both majorKind and minorKind',
            },
            { status: 400 }
          );
        }
      }
    }

    // Create new endpoint document
    const endpointData: any = {
      readApiUrl,
      updateApiUrl,
    };

    // Only add kindPairs if it's a non-empty array
    if (kindPairs && Array.isArray(kindPairs) && kindPairs.length > 0) {
      endpointData.kindPairs = kindPairs;
    } else {
      endpointData.kindPairs = [];
    }


    const endpoint = new Endpoint(endpointData);

    // Save to database
    const savedEndpoint = await endpoint.save();
    

    return NextResponse.json(
      {
        success: true,
        data: savedEndpoint,
        message: 'Endpoint saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving endpoint:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save endpoint',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

