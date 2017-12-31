let fetch = require('node-fetch')
let fs = require('fs')

const API_URL = 'https://api.coinmarketcap.com/v1/ticker/'

const DUMP_PER_MINUTE = 5
const DUMP_PATH ='./dumps/'

let writeDump = (id, jsonData, cb) => {
    fs.writeFile(`${DUMP_PATH}${id}.json`, jsonData + ',\n', {'flag': 'a'}, cb)
}

let writeTimestamp = (id, timestamp, cb) => {
    fs.writeFile(`${DUMP_PATH}${id}.timestamp`, timestamp, cb)
}

let getTimestamp = (id, cb) => {
    fs.readFile(`${DUMP_PATH}${id}.timestamp`, 'utf8', cb)
}

let fetchData = () => {
    fetch(`${API_URL}?limit=100`)
        .then(res => {
            return res.json()
        })
        .then(apiResponse => {
            apiResponse.forEach(coin => {
                getTimestamp(coin.id, (err, data) => {
                    let timestamp = 0

                    if (!err) {
                        timestamp = parseInt(data)
                    }

                    if (parseInt(coin.last_updated) > timestamp) {
                        console.log(`${coin.id} updated`)

                        writeDump(coin.id, JSON.stringify(coin))
                        writeTimestamp(coin.id, coin.last_updated, (err, data) => {
                            if (err) {
                                console.log('write error', err)
                                return
                            }
                        })
                    }

                })
            })
        })
}

fetchData()

setInterval(() => {
    fetchData()
}, DUMP_PER_MINUTE * 60 * 1000)