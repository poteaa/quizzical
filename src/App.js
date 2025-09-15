import React, { useState, useEffect, useRef } from 'react'
import {nanoid} from 'nanoid'
import {decode} from 'html-entities';
import Confetti from 'react-confetti'

import QuestionBlock from './components/QuestionBlock'

export default function App() {
    const URL = 'https://opentdb.com/api.php?amount=5&category=9&difficulty=easy&type=multiple'
    const PASS_SCORE = 3
    
    const [quizQuestions, setQuizQuestions] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [areAllQuestionsAnswered, setAreAllQuestionsAnswered] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const isFinished = useRef(false)
    
    // Set CSS custom properties for background images
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--blob1-url', `url(${process.env.PUBLIC_URL}/images/blob1.png)`);
        root.style.setProperty('--blob2-url', `url(${process.env.PUBLIC_URL}/images/blob2.png)`);
    }, []);
    
    useEffect(() => {
        const answeredQuestions = quizQuestions.filter(q => q.answers.some(a => a.isSelected))
        if (answeredQuestions.length === quizQuestions.length) setAreAllQuestionsAnswered(true)
        else setAreAllQuestionsAnswered(false)
    }, [quizQuestions])
    
    function createNewQuiz() { 
        setError(null)
        setIsLoading(true)
        fetch(URL)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch quiz')
                return res.json()
            })
            .then(data => {
                if (data.response_code !== 0) {
                    throw new Error('No results found')
                }
                createQuestions(data.results)
                setIsLoading(false)
            })
            .catch((error) => {
                setError(error.message)
                setIsLoading(false)
            })
    }
    
    function createQuestions(rawQuestions) {
        const questionsWithAnswers = []
        rawQuestions.forEach(rq => {
            const newQuestion = createNewQuestionBlock(rq.question, rq['incorrect_answers'], rq['correct_answer'])
            questionsWithAnswers.push(newQuestion)
        })
        setQuizQuestions(questionsWithAnswers)
    }
    
    function createNewQuestionBlock(text, incorrectAnswers, correctAnswer) {
        return (
            {
                id: nanoid(),
                text: decode(text),
                answers: createAllAnswers(incorrectAnswers, correctAnswer)
            }
        )
    }
    
    function createAllAnswers(incorrectAnswers, correctAnswer) {
        const allAnswers = incorrectAnswers.map(answer => createAnswer(answer))
        const randomIndex = Math.floor(Math.random() * (incorrectAnswers.length + 1))
        const correctAns = createAnswer(correctAnswer, true)
        allAnswers.splice(randomIndex, 0, correctAns)
        return allAnswers
    }
    
    function createAnswer(text, isCorrect=false) {
        return (
            {
                id: nanoid(),
                text: decode(text),
                isCorrect,
                isSelected: false
            }
        )
    }
    
    function modifyAnswer(questionBlockId, answerId) {
        setQuizQuestions(oldQuiz => 
            oldQuiz.map(questionBlock =>
                questionBlock.id === questionBlockId ?
                    {
                        ...questionBlock,
                        answers: 
                            questionBlock.answers.map(answer => 
                                answer.id === answerId 
                                    ? {...answer, isSelected: !answer.isSelected}
                                    : {...answer, isSelected: false}
                            )
                    }
                    :
                    questionBlock
        ))
    }
    
    function finishQuiz() {
        setShowResults(true)
        isFinished.current = true
    }
    
    function getCorrectAnswersCount() {
        const correctResponse = quizQuestions.filter(q => q.answers.some(a => a.isCorrect && a.isSelected))
        return correctResponse.length
    }
    
    function restart() {
        setQuizQuestions([])
        setShowResults(false)
        isFinished.current = false
    }
    
    const quiz = 
        <section className="quiz" aria-label="Quiz Questions">
            <header>
                <h2 className="sr-only">Quiz Questions</h2>
            </header>
            <div className="questions">
                {quizQuestions.map(q =>
                    <React.Fragment key={q.id}>
                        <QuestionBlock
                            questionBlock={q}
                            showResults={showResults}
                            selectAnswer={modifyAnswer}
                        />
                        <hr className="separator" />
                    </React.Fragment>
                )}
            </div>
            <footer className="quiz__results" aria-label="Quiz Results">
                {showResults && 
                    <span 
                        className="quiz__results-text"
                        role="status"
                        aria-live="polite"
                    >
                        You scored {getCorrectAnswersCount()}/{quizQuestions.length} correct answers
                    </span>
                }
                <button
                    onClick={!isFinished.current ? finishQuiz : restart}
                    disabled={!areAllQuestionsAnswered} 
                    className='btn btn--large'
                    aria-describedby={!areAllQuestionsAnswered ? "answer-all-message" : undefined}
                >
                    {showResults ? 'Play Again' : 'Check answers'}
                </button>
                {!areAllQuestionsAnswered && (
                    <div id="answer-all-message" className="sr-only">
                        Please answer all questions before checking your answers
                    </div>
                )}
            </footer>
        </section>
    
    const emptyQuiz =
        <section className="quiz quiz--emtpy">
            <header>
                <h1 className="quiz__title">Quizzical</h1>
                <p className="quiz__intro">Take a general knowledge quiz</p>
            </header>
            <div className="quiz__actions">
                <button
                    className="btn btn--large" 
                    onClick={createNewQuiz}
                    disabled={isLoading}
                    aria-describedby="quiz-description"
                >
                    {isLoading ? 'Loading...' : 'Start quiz'}
                </button>
                <div id="quiz-description" className="sr-only">
                    Click to start a 5-question general knowledge quiz
                </div>
            </div>
            {error && (
                <div className="quiz__error" role="alert" aria-live="assertive">
                    <p className="quiz__error-text">Error: {error}</p>
                    <button className="btn btn--mid" onClick={createNewQuiz}>
                        Try Again
                    </button>
                </div>
            )}
        </section>
    
    if (isLoading) {
        return (
            <div className="container">
                <section className="quiz quiz--loading" aria-label="Loading Quiz">
                    <header>
                        <h2 className="quiz__title">Loading Quiz...</h2>
                    </header>
                    <div className="loading-content">
                        <div className="spinner" aria-hidden="true"></div>
                        <p className="sr-only">Please wait while we load your quiz questions</p>
                    </div>
                </section>
            </div>
        )
    }
    
    return (
        <main className="container">
            {showResults && getCorrectAnswersCount() >= PASS_SCORE && <Confetti />}
            {
                quizQuestions.length ?
                    quiz
                    :
                    emptyQuiz
            }
        </main>
    )
}