var answers = new Array(4)
var score
var correctAns = [
    "YOOA NUMBER ONE",
    "HYOJUNG MIMI YOOA SEUNGHEE YUBIN ARIN",
    "84 191 39 91 100 225 55 126 108 246",
    "380 275 231 168 137 98 55 40 11 8 206 149 205 149 117 84 55 40",
]
var scores = [2, 3, 2, 3]
var check
var passed

let start = () => {
    document.getElementById("miracle").innerHTML = "YOU ARE A " + colorText("h3", "#F4A6D7", "MI") + colorText("h3", "#9ADBE8", "RA") + colorText("h3", "#EEE29F", "CLE")
}

let submit = () => {
    score = 0
    check = ""
    for (let i = 1; i <= 4; i++) {
        answers[i-1] = document.getElementById("crypto" + i).value
        if (correctAns[i-1] == answers[i-1]) {
            score += scores[i-1]
            check += i + ": <span style = 'color: green'>CORRECT!</span> "
        }
        else check += i + ": <span style = 'color: red'>WRONG!</span> "
        check += "(" + scores[i-1] + " pts)<br>"
    }
    if (score >= 10) passed = "are a " + colorText("h3", "#F4A6D7", "MI") + colorText("h3", "#9ADBE8", "RA") + colorText("h3", "#EEE29F", "CLE")
    else if (score < 5) passed = "<span style = 'color: red'>FAILED"
    else passed = "<span style = 'color: green'>PASSED"

    let inst = document.getElementById("inst")
    document.getElementById("questions").style.display = "none"
    inst.style.fontSize = "20pt"
    inst.innerHTML = "Submitted!<br>" + check + "Score: " + score + "<br>You " + passed + "!</span> - YooA"
}

var exports = {
    start,
    submit
}
export default exports