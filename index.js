
require('dotenv').config()
const WebSocket = require('ws');
const supabase = require('./utils/supabase')
const express = require('express');
const cors = require('cors');

const app = express()
app.use(cors())
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.status(200).json({ message: 'binance bitcoin/usdt market candlestick stream' })
})

app.get('/retrieve', async (req, res) => {
    try {
        const { data, error } = await supabase.from('sticks').select()
        if (error) throw error;
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})
app.get('/retrieve/onehour', async (req, res) => {
    try {
        const dt = new Date()
        let hour = dt.getHours()
        if (hour == 0) hour = 24;
        let thehour = hour - 1
        const { data, error } = await supabase.from('sticks').select().match({ thehour })
        if (error) throw error;
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})
app.get('/retrieve/twohour', async (req, res) => {
    try {
        const dt = new Date()
        let hour = dt.getHours()
        if (hour == 0) hour = 24;
        let thehour = hour - 2
        const { data, error } = await supabase.from('sticks').select().match({ thehour })
        if (error) throw error;
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})
app.get('/retrieve/threehour', async (req, res) => {
    try {
        const dt = new Date()
        let hour = dt.getHours()
        if (hour == 0) hour = 24;
        let thehour = hour - 3
        const { data, error } = await supabase.from('sticks').select().match({ thehour })
        if (error) throw error;
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

app.listen(port, () => {
    console.log('server running');
})

const delete_old_stick = async (hour) => {
    if (hour == 0) hour = 24;
    const target_hour = Math.abs(hour - 4);
    await supabase.from('sticks').delete().match({ thehour: target_hour })
}

const insert_new_stick = async ({ hour, time, utc, o, c, h, l, v }) => {
    console.log({ hour, time, utc, o, c, h, l, v });
    await supabase
        .from('sticks')
        .insert([{ thehour: hour, thetime: time, utctime: utc, open_price: o, close_price: c, high_price: h, low_price: l, volume: v }])
}

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_5m')
ws.onmessage = e => {
    const { E, k } = JSON.parse(e['data'])
    const { o, c, h, l, v } = k;
    const date = new Date(E);
    const second = date.getSeconds()
    const minute = date.getMinutes();
    const hour = date.getHours();
    const time = `${hour + 5}:${minute + 30}:${second}`;
    if (minute == 0 && second == 0 || 1) delete_old_stick(hour);
    insert_new_stick({ hour, time, utc: E, o, c, h, l, v })
}

