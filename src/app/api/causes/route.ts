import { NextResponse } from 'next/server';
import { getAllCauses } from '@/lib/contentstack/taxonomies';

/**
 * API Route: Get All Causes
 * Returns causes with colors from Contentstack
 */
export async function GET() {
  try {
    const causes = await getAllCauses();
    
    // Return causes with colors
    const causesWithColors = causes.map(cause => ({
      slug: cause.slug,
      name: cause.name,
      color: cause.color || '#a855f7', // Default to purple
    }));
    
    return NextResponse.json(causesWithColors);
  } catch (error) {
    console.error('[API /causes] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch causes' }, { status: 500 });
  }
}
