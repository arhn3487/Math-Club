import { getSupabaseAdmin } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

async function verifyUser(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    if (!decoded) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyUser(token)
    if (!user) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { responses } = body

    const supabase = getSupabaseAdmin()

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', params.examId)
      .single()

    if (examError) throw examError

    // Get all questions with correct answers
    const { data: questions, error: questionsError } = await supabase
      .from('exam_questions')
      .select('id, correct_answer, marks_per_question')
      .eq('exam_id', params.examId)

    if (questionsError) throw questionsError

    // Calculate results
    let correctCount = 0
    let totalMarks = 0

    const questionsMap = new Map(questions.map((q: any) => [q.id, q]))

    // Save responses and calculate score
    const responseRecords: any[] = []
    for (const [questionId, selectedAnswer] of Object.entries(responses)) {
      const questionData = questionsMap.get(parseInt(questionId))
      if (questionData) {
        const isCorrect = selectedAnswer === questionData.correct_answer
        if (isCorrect) {
          correctCount++
          totalMarks += questionData.marks_per_question
        }

        responseRecords.push({
          exam_id: parseInt(params.examId),
          user_id: user.user_id,
          question_id: parseInt(questionId),
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
        })
      }
    }

    // Save responses
    if (responseRecords.length > 0) {
      const { error: saveError } = await supabase.from('student_exam_responses').insert(responseRecords)
      if (saveError) throw saveError
    }

    // Create result record
    const percentage = (totalMarks / exam.total_marks) * 100
    const { error: resultError } = await supabase.from('exam_results').insert([
      {
        exam_id: parseInt(params.examId),
        user_id: user.user_id,
        total_questions: questions.length,
        correct_answers: correctCount,
        total_marks_obtained: totalMarks,
        total_marks: exam.total_marks,
        percentage: parseFloat(percentage.toFixed(2)),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    ])

    if (resultError) throw resultError

    return NextResponse.json({
      success: true,
      result: {
        correctAnswers: correctCount,
        totalMarks,
        percentage: percentage.toFixed(2),
      },
    })
  } catch (error) {
    console.error('Error submitting exam:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
