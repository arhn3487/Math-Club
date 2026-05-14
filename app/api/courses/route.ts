import { NextRequest, NextResponse } from 'next/server'
import {
  fetchData,
  fetchDataById,
  createData,
  updateData,
  deleteData,
} from '@/lib/db'
import { Course } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const batchId = searchParams.get('batchId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    if (id) {
      const course = await fetchDataById<Course>('courses', id)
      return NextResponse.json(course)
    }

    const filters = batchId ? { batch_id: batchId } : undefined
    const courses = await fetchData<Course>('courses', filters, {
      limit,
      orderBy: 'created_at',
    })

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const course = await createData<Course>('courses', body)
    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create course' },
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
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const course = await updateData<Course>('courses', id, body)
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update course' },
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
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    await deleteData('courses', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    )
  }
}
