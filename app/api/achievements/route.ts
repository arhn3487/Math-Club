import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { Achievement } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (id) {
      const achievement = await fetchDataById<Achievement>(
        'achievements',
        id
      )
      return NextResponse.json(achievement)
    }

    const achievements = await fetchData<Achievement>('achievements', undefined, {
      orderBy: 'date',
    })

    return NextResponse.json(achievements)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const achievement = await createData<Achievement>('achievements', body)
    return NextResponse.json(achievement, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create achievement' },
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
        { error: 'Achievement ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const achievement = await updateData<Achievement>('achievements', id, body)
    return NextResponse.json(achievement)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update achievement' },
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
        { error: 'Achievement ID is required' },
        { status: 400 }
      )
    }

    await deleteData('achievements', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete achievement' },
      { status: 500 }
    )
  }
}
