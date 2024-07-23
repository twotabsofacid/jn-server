import { SerialPort, SerialPortMock, ReadlineParser } from 'serialport';
import { EventEmitter } from 'node:events';
import { wait } from '../helpers/utils.js';

class Serial extends EventEmitter {
  constructor(_serialPath, _baudRate) {
    super();
    this.port = new SerialPort({
      path: _serialPath,
      baudRate: _baudRate,
      autoOpen: false
    });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    this.addSerialPortListeners();
    this.start();
  }
  /**
   *
   * @param {*} obj
   *   @param {string} message 'note_on', 'note_off', 'duty'
   *   @param {int} midi midi value
   *   @param {int} channel channel number
   *   @param {int} duty_cycle duty cycle value
   *   @param {int} offset offset from root frequency
   */
  sendMessage(
    obj = {
      message: 'note_on',
      midi: 60,
      channel: 0,
      duty_cycle: 50,
      offset: 0
    }
  ) {
    // First part of message is message type plus channel
    // message types:
    //    - 144 = note on
    //    - 128 = note off
    //    - 160 = duty cycle change
    //    - 176 = volume attenuation
    //    - 192 = offset change
    // PLUS the channel
    //    - 0 = channel zero
    //    - 1 = channel one
    //    - 2 = channel two
    // ... and so on
    // Second part of the message is note number,
    // OR duty cycle (1 to 99)
    // OR offset (0 to 127, which is -64 to 63)
    // OR volume (0 is full volume, 15 is mute)
    // Note number is:
    // Straight midi value of that number
    // Duty cycle is:
    // Straight integer number of the duty cycle
    let messageInteger = 0;
    if (obj.message === 'note_on') {
      messageInteger = 144;
    } else if (obj.message === 'note_off') {
      messageInteger = 128;
    } else if (obj.message === 'frequency') {
      messageInteger = 192;
    } else if (obj.message === 'volume') {
      messageInteger = 176;
    } else {
      messageInteger = 160;
    }
    let messageToSend =
      messageInteger === 160
        ? obj.duty_cycle
        : messageInteger === 192
        ? obj.offset + 64
        : messageInteger === 176
        ? obj.volume
        : obj.midi;
    console.log(
      `about to send a ${obj.message} message: ${(
        messageInteger + obj.channel
      ).toString()}. The ${
        messageInteger === 160
          ? 'duty'
          : messageInteger === 192
          ? 'offset'
          : messageInteger === 176
          ? obj.volume
          : 'midi'
      } message is ${messageToSend}.`
    );
    this.port.write([messageInteger + obj.channel, messageToSend], (err) => {
      if (err) {
        return console.log('Error on write command message: ', err.message);
      }
    });
  }
  addSerialPortListeners() {
    this.port.on('open', (err) => {
      console.log('PORT OPENED!!!!', err);
    });
    this.port.on('error', (err) => {
      console.log('Unable to connect to serial port', err);
      const path = '/dev/null';
      SerialPortMock.binding.createPort(path);
      this.port = new SerialPortMock({ path, baudRate: 11520 });
      console.log('Established Mock Serialport connection');
    });
    this.parser.on('data', (data) => {
      console.log('what the fuck', data);
      // this.emit('serial_message', data);
    });
  }
  async start() {
    console.log('waiting two seconds...');
    await wait(2000);
    console.log('opening port');
    this.port.open();
  }
}

export { Serial };
