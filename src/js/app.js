function start() {
    let l = document.querySelector('input[name="radio-level"]:checked').value;
    window.open('../views/playground.html?l=' + l, '', 'width=400, height=600')
}

function updateBestScoreLabel() {
    let l = document.querySelector('input[name="radio-level"]:checked').value;
    let history = JSON.parse(localStorage.getItem('snake-hunter-record'));
    if (history && history[l])
        document.getElementById('landing_score').innerHTML = history[l];
    else
        document.getElementById('landing_score').innerHTML = '0';
}