import { BleClient } from '@capacitor-community/bluetooth-le';



export async function scan() {
    try {
      await BleClient.initialize();
      await BleClient.initialize({ androidNeverForLocation: true });
      await BleClient.requestLEScan(
        {
          //services: [HEART_RATE_SERVICE],
        },
        (result) => {
          console.log('received new scan result', result);
        }
      );
  
      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('stopped scanning');
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }

  let deviceObject;
  export async function connect() {
    try {
      await BleClient.initialize();
  
      const device = await BleClient.requestDevice({

      });
  
      // connect to device, the onDisconnect callback is optional
      await BleClient.connect(device.deviceId, (deviceId) => onDisconnect(deviceId));
      console.log('connected to device', device);
      deviceObject = device;
  
    } catch (error) {
      console.error(error);
    }
  }

  const char1Value = document.getElementById('char1');
  async function startListen() {
    await BleClient.startNotifications(
        deviceObject.deviceId,
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
        (value) => {
            console.log('char data received: ', value.getUint32(0), true);
            char1Value.innerHTML = value.getUint32(0, true).toString();

        }
    )
  }
  let ledToggle = 0;
  let rValue = 255;
  let gValue = 255;
  let bValue = 255;
  

  const button3 = document.getElementById("button3");
  button3.addEventListener('click', () => {
    if (ledToggle === 0) {
      ledToggle = 1;
    } else {
      ledToggle = 0;
    }
    console.log("ledToggle", ledToggle);
    writeData(ledToggle, rValue, gValue, bValue);
  })

  async function writeData(ledToggle, rValue, gValue, bValue) {
    const bufferSize = 20;
    const buffer = new ArrayBuffer(bufferSize);
    const dataView = new DataView(buffer);

    dataView.setUint8(0, ledToggle);
    dataView.setUint8(1, rValue);
    dataView.setUint8(2, gValue);
    dataView.setUint8(3, bValue);

    await BleClient.write(
        deviceObject.deviceId,
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "e3223119-9445-4e96-a4a1-85358c4046a2",
        dataView
    )
  }

  var colorPicker = new iro.ColorPicker('#picker');

  const rValueDom = document.getElementById("r-value");
  const gValueDom = document.getElementById("g-value");
  const bValueDom = document.getElementById("b-value");

  colorPicker.on('color:change', function(color) {
    // log the current color as a HEX string
    //console.log(color.rgb);
    console.log("r: ", color.rgb.r, " g: ", color.rgb.g, " b: ", color.rgb.b);
    rValue = color.rgb.r;
    gValue = color.rgb.g;
    bValue = color.rgb.b;
    rValueDom.innerHTML = rValue;
    gValueDom.innerHTML = gValue;
    bValueDom.innerHTML = bValue;
    writeData(ledToggle, rValue, gValue, bValue);
  });

  let sliderValue;
  const sendDataButton = document.getElementById("button3");
  const slider1 = document.getElementById("slider1");
  const slider1Reading = document.getElementById("slider1-reading");
  slider1Reading.innerHTML = slider1.value;
  
  slider1.addEventListener('input', function() {
    slider1Reading.innerHTML = this.value;
    sliderValue = parseInt(this.value, 10);
    writeData(sliderValue);
  })

  function onDisconnect(deviceId) {
    console.log(`device ${deviceId} disconnected`);
  }

  const button1 = document.getElementById("button1");
  button1.addEventListener('click', () => {
    connect();
    console.log("button pressed");
  })

  const button2 = document.getElementById("button2");
  button2.addEventListener('click', () => {
    startListen();
  })