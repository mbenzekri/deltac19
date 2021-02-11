const chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
}
function vague(date) {
    const conf = confinements.find( c => date >= c.start && date <= c.max) 
    return conf ? conf.num : -1
}
const confinements = [ 
    { num : 1, start: "2020-03-17", end: "2020-05-10", max: "2020-09-01" , color: chartColors.red},
    { num : 2, start: "2020-10-30", end: "2020-12-14", max: "2021-12-30", color: chartColors.blue},
]

const config1 = {
    type: 'line',
    data: {
        labels: null,
        datasets: [{
            label: 'Vague 1 et 2',
            backgroundColor: chartColors.green,
            borderColor: chartColors.green,
            data: null,
            fill: false,
        }
    ]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Décès/jour depuis debut mars 2020 (moyenne sur 7 jours)'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Month'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Décès'
                }
            }]
        }
    }
};

const config2 = {
    type: 'line',
    data: {
        labels: null,
        datasets: [{
            label: 'Vague 1',
            backgroundColor: chartColors.blue,
            borderColor: chartColors.blue,
            data: null,
            fill: true,
        },{
            label: 'Vague 2',
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            data: null,
            fill: true,
        }
    ]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Décès/jour Vague 1 VS Vague 2 (moyenne sur 7 jours)'
       },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Jour'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Décès'
                }
            }]
        }
    }
};

const config3 = {
    type: 'line',
    data: {
        labels: null,
        datasets: [{
            label: 'Vague 1',
            backgroundColor: chartColors.blue,
            borderColor: chartColors.blue,
            data: null,
            fill: false,
        },{
            label: 'Vague 2',
            backgroundColor: chartColors.red,
            borderColor: chartColors.red,
            data: null,
            fill: false,
        }
    ]
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Décès/jour Vague 1 VS Vague 2 (moyenne sur 7 jours)'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Jour'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Cumul Décès'
                }
            }]
        }
    }
};


window.onload = function() {
    Papa.parse('https://www.data.gouv.fr/fr/datasets/r/d3a98a30-893f-47f7-96c5-2f4bcaaa0d71', {
        download: true,
        delimiter:',',
        header: true,
        dynamicTyping:true,
        skipEmptyLines:true,
        complete: (results) => {
            const data = results.data.sort((a,b) => (a.date < b.date) ? -1 : (a.date > b.date) ? 1 : 0)
            let total = 0
            let range = []
            data.forEach((item,i) => {
                item.deces_jour =  (item.total_deces_ehpad + item.total_deces_hopital) - total
                range.push(item.deces_jour)
                if (range.length > 7) range.shift()
                const avg = Math.floor(range.reduce((a, b) => a + b, 0) / range.length)
                item.deces_jour7 = avg
                total+=item.deces_jour
            })
            init_data1(data)
            init_data2(data)
            init_data3(data)
        }
    });
};

function init_data1(data) {
    config1.data.labels = data.map( item => item.date)
    config1.data.datasets[0].data = data.map( item => item.deces_jour7)
    var ctx = document.getElementById('canvas1').getContext('2d');
    window.myLine1 = new Chart(ctx, config1);    
}

function init_data2(data) {
    const dates = []
    const deces_jours_v1 = []
    const deces_jours_v2 = []
    data.forEach((item,i) => {
        const vnum = vague(item.date)
        if (vnum === 1) deces_jours_v1.push(item.deces_jour7)
        if (vnum === 2) {deces_jours_v2.push(item.deces_jour7) ;dates.push(item.date)}
    })
    const size = Math.min(deces_jours_v1.length,deces_jours_v2.length)
    config2.data.datasets[0].data = deces_jours_v1.slice(0,size)
    config2.data.datasets[1].data = deces_jours_v2.slice(0,size)
    config2.data.labels = dates.map((date,i) =>  `${date} => J${i+1}`)
    var ctx = document.getElementById('canvas2').getContext('2d');
    window.myLine2 = new Chart(ctx, config2);    
}

function init_data3(data) {
    const dates = []
    const cumul_jours_v1 = []
    const cumul_jours_v2 = []
    let cumul_v1 = 0
    let cumul_v2 = 0
    data.forEach((item,i) => {
        const vnum = vague(item.date)
        if (vnum === 1) {
            cumul_v1+=item.deces_jour
            cumul_jours_v1.push(cumul_v1)
        }
        if (vnum === 2) {
            cumul_v2+=item.deces_jour
            cumul_jours_v2.push(cumul_v2)
            dates.push(item.date)
        }
    })
    const size = Math.min(cumul_jours_v1.length,cumul_jours_v2.length)
    config3.data.datasets[0].data = cumul_jours_v1.slice(0,size)
    config3.data.datasets[1].data = cumul_jours_v2.slice(0,size)
    config3.data.labels = dates.map((date,i) =>  `${date} => J${i+1}`)
    var ctx = document.getElementById('canvas3').getContext('2d');
    window.myLine3 = new Chart(ctx, config3);    
}