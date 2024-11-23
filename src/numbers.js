var rand
var num
var score = 0
var eng_num = ""
var k_num = ""
var scores = "Score: 0<br>"
var plus
var num_system

var ans
var correct_ans = "YooArin"
var ans_lang

var time
var start_time

var sino_ones = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"]
var sino_pow10 = ["", "십", "백", "천"]
var sino_pow10000 = ["", "만", "억", "조"]

var native_ones = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"]
var native_tens = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"]

var timer 

let start = (button, input, dis) => {
    if (input) {
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
            event.preventDefault();
            button.click();
            }
        });
    }
    button.style.display = ""
    input.style.display = ""
    document.getElementById("start").style.display = "none"
    start_time = new Date().getTime()
    time = 300
    plus = ""
    submit(input)
    timer = setInterval(() => timerTick(button, input, dis), 1)
}

function timerTick(button, input, dis) {
    time = Math.max(300 - (new Date().getTime() - start_time) / 1000, 0)
    dis.innerHTML = "Time: " + formatTime(time) + "<br>" + scores + num_system + eng_num + k_num + "<br>"
    if (time <= 0) {
        clearInterval(timer)
        let miracle = "are a " + colorText("h3", "#F4A6D7", "MI") + colorText("h3", "#9ADBE8", "RA") + colorText("h3", "#EEE29F", "CLE")
        let passed = score < 20 ? "<span style = 'color: red'>FAILED" : score < 40 ? "<span style = 'color: green'>PASSED" : miracle
        dis.innerHTML = "Time's Up!<br>" + scores + "You " + passed + "!</span> - YooA"
        input.style.display = "none"
        button.style.display = "none"
    }
}

let submit = (input) => {
    if ((plus == "" || !scores.includes("+")) && time > 0) {
        let score_time = 0
        ans = input.value
        if (ans == correct_ans || (ans == num && ans_lang == "English")) {
            let div = ans_lang == "English" ? 4 : 2.5
            let add = Math.floor((num.toString().length - 1) / div) + 1
            plus = " (+" + add + ")<br><span style = 'color: green'>Correct!</span>"
            score += add
        }
        else plus = " (+0)<br><span style = 'color: red'>Wrong! Correct Answer: " + correct_ans + "</span>"
        scores = "Score: " + score + plus + "<br>"
        if (correct_ans != "YooArin") { 
            score_time = new Date().getTime()
            setTimeout(function(){ 
                scores = "Score: " + score + "<br>" 
                randNum()
            }, 5000)
        }
        else {
            scores = "Score: " + score + "<br>" 
            randNum()
        }
    }
}

function randNum() {
    //Math.random = random number from 0.00 to 1.00
    num_system = Math.random() < 0.5 ? "Sino-Korean" : "Native Korean" //50% sino/native
    ans_lang = Math.random() < 0.5 ? "English" : "Korean"
    if (num_system == "Sino-Korean") {
        rand =  Math.floor(10 ** (Math.random() * 16)) - 1 //x ** y = x^y (exponents), Math.floor = Round down.
        let n = rand.toString()
        k_num = ""
        if (rand == 0) k_num = "영"
        else {
            for (let i = n.length; i > 0; i--) {
                //x % y= remainder of x/y 
                let ones = sino_ones[n[i - 1] % 10]
                let pow10 = (n.length - i) % 4 
                let pow10000 = Math.floor((n.length - i) / 4)
                if (n[i - 1] == '1' && i < n.length && (pow10 != 0 || (n.length % 4 == 1 && i == 1))) ones = ""
                if (n[i - 1] != '0' || (n[i - 1] == 0 && pow10 == 0)) {
                    let pow = pow10 == 0 ? sino_pow10000[pow10000] + " " : ""
                    k_num = ones + sino_pow10[pow10] + pow + k_num
                }
                k_num = k_num.replace(" 일만", " 만")
                k_num = k_num.replace(" 일억", " 억")
                k_num = k_num.replace(" 일조", " 조")
            }
        }
    }
    else {
        rand = Math.floor(Math.random() * 100)
        if (rand == 0) k_num = "영"
        else k_num = native_tens[Math.floor(rand / 10)] + native_ones[rand % 10]
    }
    num = rand
    k_num = k_num.trim()
    let knum = k_num
    
    k_num = "<br>" + k_num
    eng_num = "<br>" + num.toLocaleString()

    if (ans_lang == "English") {
        correct_ans = num.toLocaleString()
        eng_num = ""
    }
    else {
        correct_ans = knum
        k_num = ""
    }
    document.getElementById("knum").value = ""
}

var exports = {
    start,
    submit
}

export default exports