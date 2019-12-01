let ws = null, theChart = null, userName = ''
const dataChart = [0,0,0]


const setSystemMessage = data => {
    message.textContent = data
}

const login = async () => {
    const user = {
        name: usrName.value,
        password: password.value
    }
    userName = user.name
    const header = new Headers()
    header.append('Content-type', 'application/json')

    const options = {
        method: 'POST', 
        headers: header,
        body: JSON.stringify(user)
    }
    let data = {}
    const response = await fetch('/login', options)
    switch (response.status) {
        case 200:
            data = await response.json()
            connectWS(data)
            container_auth.style.display = 'block'
            container_login.style.display = 'none'
            myChart.style.display = 'block'
            chat_auth.style.display = 'block'
            systemMessage.style.opacity = '1'
            loadChart()
            break
        case 401:
            setSystemMessage('Usuario o contraseña no válida')
            break
        default:
            setSystemMessage('Estado no esperado: '+response.status)
            break
    }
}

function getRandomBadge() {
    let options = ['primary','secondary','success','danger','warning','light','dark']
    let badge = 'badge-'
    badge += options[Math.floor(Math.random() * 7)]
    return badge
}


btnLogin.addEventListener('click', e => {
    e.preventDefault()
    login()
})

const connectWS = data => {
    ws = new WebSocket(`ws://localhost:9999/ws?uname=${usrName.value}&token=${data.token}`)
    ws.onopen = e => {
        setSystemMessage('conectado al ws correctamente')
        console.log(userName)
    }

    ws.onerror = e => {
        setSystemMessage(e)
    }

    ws.onmessage = e => {
        const data = JSON.parse(e.data)
        switch (data.type) {
            case "message":
                const className = userName === data.data_response.name ? 'badge badge-info' : `badge ${getRandomBadge()}`
                content.innerHTML +=  `
                <div class= "bg-light mb-3 rounded p-2 ">
                    <span class="${className}">${data.data_response.name}</span>
                    <div class="">
                        ${data.data_response.message}
                    </div>
                </div>`
                txtmsg.value = ''
                break
            case "sale":
                dataChart[data.data_sale.product] += data.data_sale.quantity
                theChart.update()
                break
            case "pong":
                console.log('sigo vivo xD')
                break       
            default:    
                setSystemMessage('Recibi un tipo de mensaje desconocido')
        }
    }

    setInterval(() => {
        ws.send(JSON.stringify({type: 'ping'}))
    }, 60000)
}

btnSendMessage.addEventListener('click', e => {
    e.preventDefault()
    const data = {
        type: 'message',
        message: txtmsg.value
    }
    if (txtmsg.value !== '') {
        ws.send(JSON.stringify(data))
    }else {
        setSystemMessage('rellene el campo para enviar un mensaje')
    }
})

btnSale.addEventListener('click', e => {
    e.preventDefault()
    const data = {
        type: 'sale',
        product: parseInt(product.value,10),
        quantity: parseInt(quantity.value,10)
    }
    if (quantity.value > 0) {
        ws.send(JSON.stringify(data))
    } else {
        setSystemMessage('ingrese una cantidad mayor a cero')
    }
})

const loadChart = () => {
    const ctx = myChart.getContext('2d');
    myChart.width = 400
    myChart.height = 400
    theChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Zapatos", "Camisas", "Billeteras"],
            datasets: [{
                label: 'Sales',
                data: dataChart,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontSize: 20,
                        fontColor: '#fff'
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 20,
                        fontColor: '#fff'
                    }
                }]
            },
            legend: {
                labels: {
                    fontColor: 'white',
                    fontSize: 20,
                }
            }
        }
    })
}