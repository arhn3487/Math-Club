import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { AlumniMember } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const batchId = searchParams.get('batchId')

    if (id) {
      const alumni = await fetchDataById<AlumniMember>('alumni_member', id)
      return NextResponse.json(alumni)
    }

    const filters = batchId ? { batch_id: batchId } : undefined
    const alumni = await fetchData<AlumniMember>('alumni_member', filters, {
      orderBy: 'created_at',
    })

    return NextResponse.json(alumni)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alumni' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const alumni = await createData<AlumniMember>('alumni_member', body)
    return NextResponse.json(alumni, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create alumni member' },
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
        { error: 'Alumni ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const alumni = await updateData<AlumniMember>('alumni_member', id, body)
    return NextResponse.json(alumni)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update alumni member' },
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
        { error: 'Alumni ID is required' },
        { status: 400 }
      )
    }

    await deleteData('alumni_member', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete alumni member' },
      { status: 500 }
    )
  }
}
