import React from 'react'

export default function Answer({answer, showResults, selectAnswer}) {
    
    function getStyles() {
        let style = 'answer '
        if (!showResults && answer.isSelected) {
            style += 'answer--selected answer--enable'
        } else if (showResults) {
            style += 'answer--disable '
            if (answer.isCorrect) {
                style += 'answer--correct'
            } else if (!answer.isCorrect && answer.isSelected) {
                style += 'answer--incorrect'
            }
        } 
        
        return style
    }

    // ARIA attributes for better accessibility
    const getAriaLabel = () => {
        if (showResults) {
            if (answer.isCorrect) {
                return `${answer.text} (Correct answer)`
            } else if (!answer.isCorrect && answer.isSelected) {
                return `${answer.text} (Incorrect answer)`
            } else {
                return answer.text
            }
        }
        return answer.text
    }
    
    return (
        <>
            <input 
                type="radio" 
                name="answer" 
                value={answer.text} 
                id={answer.id} 
                className="none"
                checked={answer.isSelected}
                disabled={showResults}
            />
            <label
                htmlFor={answer.id}
                className={getStyles()}
                onClick={selectAnswer}
                aria-label={getAriaLabel()}
                role="radio"
                aria-checked={answer.isSelected}
            >
                {answer.text}
            </label>
        </>
    )
}