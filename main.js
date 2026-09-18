// VARIABLES
const inputs = document.querySelectorAll('.inputs')
// individual inputs
const loanNameInput = document.getElementById('loan-name-input')
const remainingAmmountInput = document.getElementById('remaining-ammount-input')
const interestRateInput = document.getElementById('interest-rate-input')
const minMonthPayInput = document.getElementById('min-month-pay-input')
// end VARIABLES

// initialize empty graph
    const color = ['#0DC5EB', '#B41A8A', '#FF7D6D', '#FFD900', '#00B89C', '#663B19']; // values can be: rgb, hex or word values: 'blue'

    const debt = new Chart("debt", {
        type: "line",
            data: {
                labels: [],
                datasets: [] // <-- add loans here
            },
        options: {
            interaction: { mode: 'index', intersect: false },
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 5,
                    hitRadius: 10
                }
            },
            scales: {
                y: { stacked: true }
            }
        }
    });
// end initialize empty graph

// get user's date
    var today = new Date();
    var dd = Number(today.getDate());
    var mm = Number(today.getMonth() + 1); //January is 0!
    var yyyy = today.getFullYear();
    let date = [mm + 1, 1, yyyy]
    if (date[0] >= 13) {
        date[0] = 1
        date[2] += 1
    }
    // console.log(today);
// end get user's date

// graph input logic
    function inputsFilled() {
        for (let i = 0; i < inputs.length; i++) {
            if (!inputs[i].value) return false // if one input not filled don't try to update graph
        }
        return true // all inputs filled
    }
// end graph input logic
document.getElementById('add-loan-button').addEventListener("click", updateGraph);
function updateGraph() {
    if (!inputsFilled()) {
        console.log("not all inputs filled")
        return
    }

    const loanName = loanNameInput.value;
    let remainingAmmount = Number(remainingAmmountInput.value);
    const interestRate = Number(interestRateInput.value) * 0.01; // convert to a number, then convert to decimal
    const minMonthPay = Number(minMonthPayInput.value);

    // before creating new data set decide where it goes (largest loan on bottom, smallest on top)
    let index = debt.data.datasets.findIndex(ds => ds.data[0] < remainingAmmount);
    if (index === -1) index = debt.data.datasets.length;

    //create dataset so all months can be added in loop
    const newDataset = {
        label: loanName,
        data: [],
        backgroundColor: color[debt.data.datasets.length % color.length],
        borderColor: color[debt.data.datasets.length % color.length],
    };
    debt.data.datasets.splice(index, 0, newDataset);

    // fill depends on position, so recompute for all
    debt.data.datasets.forEach((ds, i) => {
        ds.fill = i === 0 ? 'origin' : '-1';
    });

    // add data points till loan is 0
    while (remainingAmmount > 0) {
        addData(debt, newDataset, date.join('/'), remainingAmmount);

        const prev = remainingAmmount;
        remainingAmmount = parseFloat(((remainingAmmount + (remainingAmmount * (interestRate / 12))) - minMonthPay).toFixed(2)); // loans take interest for the month befor user can pay (that's what I got from my research)

        if (remainingAmmount >= prev) {
            console.log('too much interest');
            break;
        }

        date = [date[0] + 1, 1, date[2]]
        if (date[0] >= 13) {
            date[0] = 1
            date[2] += 1
        }
    }
    addData(debt, newDataset, date.join('/'), 0) // add final month debt paid!
    while (newDataset.data.length < debt.data.labels.length) newDataset.data.push(0);
    debt.update();

    // clear inputs
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = null
    }

    //reset date
    date = [mm + 1, 1, yyyy]
    if (date[0] >= 13) {
        date[0] = 1
        date[2] += 1
    }
}

// graphing helper functions:
function addData(chart, ds, month, newData) {
    const index = ds.data.length; // which month this point is

    if (index >= chart.data.labels.length) {
        chart.data.labels.push(month);
        // new month: older loans already ended, so give them 0
        chart.data.datasets.forEach(d => {
            if (d !== ds) d.data.push(0);
        });
    }

    ds.data.push(newData);
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
