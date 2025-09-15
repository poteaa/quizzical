import React from 'react'
import Answer from './Answer'

export default function QuestionBlock({questionBlock, showResults, selectAnswer}) {
    
    const allAnswers = questionBlock.answers.map(answer => {
        return (
                <Answer
                    key={answer.id}
                    answer={answer} 
                    showResults={showResults}
                    selectAnswer={() => {
                        selectAnswer(questionBlock.id, answer.id)
                    }}
                />
            )
    })
    
    return (
        <div className="question-block">
            <p id={`question-${questionBlock.id}`} className="question-block__text">
                {questionBlock.text}
            </p>
            <div 
                className="answers"
                role="radiogroup"
                aria-labelledby={`question-${questionBlock.id}`}
            >   
                {allAnswers}
            </div>
        </div>
    )
}