import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Serial } from './components/Serial.js';

const port = 1337;

class Index {
  microcontroller;
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());
    this.server = http.createServer(this.app);
    this.setup();
    this.addRoutes();
    this.initSerial();
    this.addSerialListeners();
    this.start();
  }
  setup() {
    this.app.use((_, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Origin', '*');
      next();
    });
    this.app.use((req, res, next) => {
      const now = new Date();
      console.log(
        `Endpoint ${req.originalUrl} hit at ${now
          .getHours()
          .toString()
          .padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now
          .getSeconds()
          .toString()
          .padStart(2, '0')}:${now
          .getMilliseconds()
          .toString()
          .padStart(3, '0')}`
      );
      next();
    });
    console.log('does this shit ever get called');
  }
  addRoutes() {
    this.app.all('/', (req, res) => {
      res.status(200).send({ response: 'hello!' });
    });
    this.app.all('/note_on/:channel/:midi', (req, res) => {
      this.microcontroller.sendMessage({
        message: 'note_on',
        midi: parseInt(req.params.midi),
        channel: parseInt(req.params.channel)
      });
      res.status(200).send({ response: 'OK!' });
    });
    this.app.all('/note_off/:channel/:midi', (req, res) => {
      this.microcontroller.sendMessage(
        'note_off',
        parseInt(req.params.midi),
        parseInt(req.params.channel),
        0
      );
      res.status(200).send({ response: 'OK!' });
    });
    this.app.all('/frequency/:channel/:offset', (req, res) => {
      this.microcontroller.sendMessage({
        message: 'frequency',
        channel: parseInt(req.params.channel),
        offset: parseInt(req.params.offset)
      });
      res.status(200).send({ response: 'OK!' });
    });
    this.app.all('/duty/:channel/:duty', (req, res) => {
      this.microcontroller.sendMessage({
        message: 'duty',
        channel: parseInt(req.params.channel),
        duty_cycle: parseInt(req.params.duty)
      });
      res.status(200).send({ response: 'OK!' });
    });
    this.app.all('/volume/:channel/:volume', (req, res) => {
      this.microcontroller.sendMessage({
        message: 'volume',
        channel: parseInt(req.params.channel),
        volume: parseInt(req.params.volume)
      });
      res.status(200).send({ response: 'OK!' });
    });
    this.app.all('*', (req, res) => {
      res.status(404).send({ response: 'ERROR, no URL at this location' });
    });
  }
  initSerial() {
    // Start up the instrument communiations
    this.microcontroller = new Serial('/dev/tty.usbmodem11301', 9600);
  }
  addSerialListeners() {
    this.microcontroller.addListener('serial_message', (data) => {
      console.log('data');
    });
  }
  start() {
    this.server.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  }
}

new Index();
