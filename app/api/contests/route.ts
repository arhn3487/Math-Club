import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { CustomContest } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const contest = await fetchDataById<CustomContest>('custom_contests', id)
      return NextResponse.json(contest)
    }

    const contests = await fetchData<CustomContest>('custom_contests', undefined, {
      orderBy: 'start_time',
    })

    return NextResponse.json(contests)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contests' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const contest = await createData<CustomContest>('custom_contests', body)
    return NextResponse.json(contest, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create contest' },
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
        { error: 'Contest ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const contest = await updateData<CustomContest>('custom_contests', id, body)
    return NextResponse.json(contest)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update contest' },
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
        { error: 'Contest ID is required' },
        { status: 400 }
      )
    }

    await deleteData('custom_contests', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete contest' },
      { status: 500 }
    )
  }
}
