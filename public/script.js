let ws = null, theChart = null
const dataChart = [5,15,12]

const setSystemMessage = data => {
    systemMessage.textContent = data
}

const login = async () => {
    const user = {
        name: usrName.value,
        password: password.value
    }
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
            // console.log(data)
            connectWS(data)
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


btnLogin.addEventListener('click', e => {
    e.preventDefault()
    login()
})

const connectWS = data => {
    ws = new WebSocket(`ws://localhost:9999/ws?uname=${usrName.value}&token=${data.token}`)
    ws.onopen = e => {
        setSystemMessage('conectado al ws correctamente')
    }

    ws.onerror = e => {
        setSystemMessage(e)
    }

    ws.onmessage = e => {
        const data = JSON.parse(e.data)
        switch (data.type) {
            case "message":
                content.insertAdjacentHTML('beforeend', `<div>De: <span>${data.data_response.name}</span>, Mensaje: ${data.data_response.message}</div>`)
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
                        beginAtZero:true
                    }
                }]
            }
        }
    })
}