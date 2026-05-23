import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { Batch } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const batch = await fetchDataById<Batch>('batches', id)
      return NextResponse.json(batch)
    }

    // Try Supabase first for resource sharing batches
    try {
      const supabase = getSupabaseAdmin()
      const { data: supabaseBatches, error } = await supabase
        .from('batches')
        .select('*')
        .order('batch_year', { ascending: true })

      if (!error && supabaseBatches) {
        return NextResponse.json({ batches: supabaseBatches })
      }
    } catch (supabaseErr) {
      console.log('Supabase fetch failed, falling back to db')
    }

    // Fallback to old database
    const batches = await fetchData<Batch>('batches', undefined, {
      orderBy: 'created_at',
    })

    return NextResponse.json({ batches })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const batch = await createData<Batch>('batches', body)
    return NextResponse.json(batch, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const batch = await updateData<Batch>('batches', id, body)
    return NextResponse.json(batch)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      )
    }

    await deleteData('batches', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    )
  }
}
