var score
var passed = ""
var answers = new Array(8)
var correctAns = [
    [2], 
    [4], 
    [-1], 
    [3], 
    ["x^2-8x+16", "x^2 - 8x + 16"], 
    ["4,1", "4, 1", "(4,1)", "(4, 1)"], 
    ["4860", "4,860"], 
    ["-x^2(x-1)(x+1)(x^2+1)", "-x^2 (x-1) (x+1) (x^2+1)", "-x^2(x - 1)(x + 1)(x^2 + 1)", "-x^2 (x - 1) (x + 1) (x^2 + 1)",
    "-x^2(x+1)(x-1)(x^2+1)", "-x^2 (x+1) (x-1) (x^2+1)", "-x^2(x + 1)(x - 1)(x^2 + 1)", "-x^2 (x + 1) (x - 1) (x^2 + 1)",
    "-x^2(x^2+1)(x-1)(x+1)", "-x^2 (x^2+1) (x-1) (x+1)", "-x^2(x^2 + 1)(x - 1)(x + 1)", "-x^2 (x^2 + 1) (x - 1) (x + 1)",
    "-x^2(x^2+1)(x+1)(x-1)", "-x^2 (x^2+1) (x+1) (x-1)", "-x^2(x^2 + 1)(x + 1)(x - 1)", "-x^2 (x^2 + 1) (x + 1) (x - 1)",
    ]
]
var scores = [1, 1, 1, 1, 1, 1, 2, 5]
var check

let submit = () => {
    score = 0
    check = ""
    for (let i = 1; i <= 8; i++) {
        answers[i-1] = (document.getElementById("q" + i).value)
        if (correctAns[i-1] == answers[i-1] || correctAns[i-1].includes(answers[i-1])) {
            score += scores[i-1]
            check += i + ": <span style = 'color: green'>CORRECT!</span> "
        }
        else check += i + ": <span style = 'color: red'>WRONG!</span> "
        check += "(" + scores[i-1] + " pt" + (scores[i-1] == 1 ? "" : "s") + ")<br>"
    }
    let miracle = "are a " + colorText("h3", "#F4A6D7", "MI") + colorText("h3", "#9ADBE8", "RA") + colorText("h3", "#EEE29F", "CLE")
    let passed = score < 8 ? "<span style = 'color: red'>FAILED" : score < 13 ? "<span style = 'color: green'>PASSED" : miracle

    let inst = document.getElementById("inst")
    document.getElementById("questions").style.display = "none"
    document.getElementById("submit").style.display = "none"
    inst.style.fontSize = "20pt"
    inst.innerHTML = "Submitted! <br>" + check + "Score: " + score + "/13<br>You " + passed + "!</span> - YooA"
}

var exports = {
    submit
}

export default exports