var answers = new Array(1).fill(new Array(4))
var score
var correctAns = [
    [28, 28.5, 29, 1.79]
]
var scores = [
    [1, 1, 1, 2]
]
var element = ["Mean", "Median", "Mode", "Standard Deviation"]
var check
var passed

let submit = () => {
    score = 0
    check = ""
    for (let i = 1; i <= 1; i++) {
        answers[i-1][0] = document.getElementById("mean" + i).value
        answers[i-1][1] = document.getElementById("median" + i).value
        answers[i-1][2] = document.getElementById("mode" + i).value
        answers[i-1][3] = document.getElementById("sd" + i).value
        for (let j = 0; j <= 3; j++) {
            if (correctAns[i-1][j] == answers[i-1][j]) {
                score += scores[i-1][j]
                check += i + " " + element[j] + ": CORRECT!\n"
            }
            else check += i + " " + element[j] + ": WRONG!\n"
        }
    }
    if (score >= 10) passed = "are YOOA"
    else if (score < 5) passed = "FAILED"
    else passed = "PASSED"
    alert("Submitted!\n" + check + "Score: " + score + "\nYou " + passed + "! - YooA")
}

var exports = {
    submit
}

export default exports