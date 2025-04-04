let questions = []
let userEmail = ''
let quizTitle = 'Quiz App'

function shuffleAnswers(q) {
  return q.answers
    .map((ans) => {
      let inputType = q.multipleAnswer ? 'checkbox' : 'radio'
      return `
    <p>
      <label>
        <input class="with-gap" type="${inputType}" name="q${q.id}" value="${ans.answer}" />
        <span>${ans.answer}</span>
      </label>
    </p>
  `
    })
    .join('')
}

function renderQuiz() {
  // Lấy Title từ Settings
  google.script.run
    .withSuccessHandler(function (settings) {
      quizTitle = settings.Title || 'Quiz App'
      document.getElementById('quiz-title').innerText = quizTitle

      // Lấy câu hỏi
      google.script.run
        .withSuccessHandler(function (data) {
          questions = data
          const quizDiv = document.getElementById('quiz')
          let index = 0
          quizDiv.innerHTML = data
            .map((q) => {
              index++
              return `              
        <div class="card question-card" id="qcard-${q.id}">
          <div class="card-content">
            <span class="card-title">${index}. ${q.question}</span>
            ${shuffleAnswers(q)}
          </div>
        </div>
      `
            })
            .join('')
          document.getElementById('loading-status').style.display = 'none'
        })
        .getQuestions()
    })
    .getSettings()

  // Lấy email người dùng
  google.script.run
    .withSuccessHandler(function (email) {
      userEmail = email
    })
    .getUserEmail()
}

function submitQuiz() {
  let quizDiv = document.getElementById('quiz')
  let qcards = quizDiv.querySelectorAll('.question-card')
  let details = []
  let correctCount = 0
  console.log(qcards.length)
  qcards.forEach(function (qcard) {
    let qid = qcard.id.replace('qcard-', '')
    let q = questions.find(function (question) {
      // Giả sử bạn đã thêm một thuộc tính 'id' vào mỗi question object
      // để khớp với qid từ qcard.id.
      return question.id == qid
    })
    console.log(q)
    if (q) {
      let userAnswers = []
      let isCorrect = true

      if (q.multipleAnswer) {
        // Multiple answers (checkboxes)
        let checkboxes = qcard.querySelectorAll('input[type="checkbox"]:checked')
        let selectedAnswers = Array.from(checkboxes).map(function (checkbox) {
          return checkbox.value
        })

        q.answers.forEach(function (answer) {
          let userAnswer = {
            answer: answer.answer,
            isCorrect: selectedAnswers.includes(answer.answer) === answer.isCorrect,
          }
          userAnswers.push(userAnswer)
          if (userAnswer.isCorrect === false) {
            isCorrect = false
          }
        })
      } else {
        // Single answer (radio buttons)
        let selectedRadio = qcard.querySelector('input[type="radio"]:checked')
        if (selectedRadio) {
          let selectedAnswer = selectedRadio.value
          q.answers.forEach(function (answer) {
            let userAnswer = {
              answer: answer.answer,
              isCorrect: selectedAnswer === answer.answer && answer.isCorrect,
            }
            userAnswers.push(userAnswer)
            if (userAnswer.isCorrect === false) {
              isCorrect = false
            }
          })
        } else {
          isCorrect = false
          q.answers.forEach(function (answer) {
            userAnswers.push({ answer: answer.answer, isCorrect: false })
          })
        }
      }

      details.push({
        question: q.question,
        useranswers: userAnswers,
        isCorrect: isCorrect,
      })

      if (isCorrect) {
        correctCount++
      }
    }
  })

  let result = {
    correct: correctCount,
    total: questions.length,
  }

  return {
    result: result,
    details: details,
  }
}

function submitQuizOld() {
  const form = document.querySelectorAll('input[type=radio]:checked')
  let score = 0
  let details = []

  form.forEach((input) => {
    const qid = parseInt(input.name.substring(1))
    const selected = input.value
    const q = questions.find((q) => q.id === qid)

    const isCorrect = selected.toString().trim().toLowerCase() === q.correct.toString().trim().toLowerCase()
    if (isCorrect) score++

    details.push({
      question: q.question,
      selected,
      correct: q.correct,
      isCorrect,
    })

    const card = document.getElementById(`qcard-${qid}`)
    card.classList.add(isCorrect ? 'correct' : 'incorrect')

    const correctAnswerNote = document.createElement('p')
    correctAnswerNote.innerHTML = `✔ Correct answer: <span class="answer-correct-text">${q.correct}</span>`
    card.querySelector('.card-content').appendChild(correctAnswerNote)
  })

  // Disable tất cả radio
  document.querySelectorAll('input[type=radio]').forEach((input) => (input.disabled = true))

  // Disable nút submit
  const btn = document.getElementById('submit-button')
  btn.disabled = true
  btn.classList.add('disabled')

  // Gửi kết quả
  google.script.run
    .withSuccessHandler(() => {
      document.getElementById('result').innerHTML = `
      🎯 You scored ${score} / ${questions.length}<br>
      ✅ Kết quả của bạn (<strong>${userEmail}</strong>) đã được ghi nhận!
    `
    })
    .submitAnswers(userEmail, score, details)
}

window.onload = renderQuiz
