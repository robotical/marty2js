import { Marty } from "./dist/Marty.js"
import { DiscoveredRIC, RICFileSendType, RICLogLevel } from "./dist/RICTypes.js";
import * as fs from 'fs';

class MyEventListener
{
    onRxSmartServo(smartServos) {
        // console.log("SmartServoData");
    }
    onRxIMU(imuData) {
        // console.log("IMUData");
    }
    onRxPowerStatus(powerStatus) {
        // console.log("PowerStatus");
    }
    onRxAddOnPub(addOnInfo) {
        // console.log("AddOnInfo");
    }
    onConnEvent(connEvent, connEventArgs) {
        console.log("ConnEvent ", myMarty.getEventStr(connEvent), connEventArgs);
    }
}

function progCB(sent, total, progress) {
    console.log(`File transfer sent ${sent} total ${total} prog ${progress}`);
}

console.log("Starting test")
const myMarty = new Marty();
myMarty.setLogLevel(RICLogLevel.DEBUG);
const connPromise = myMarty.connect(new DiscoveredRIC("192.168.86.98", "Marty"));
connPromise.then((rslt)=>{
    if (rslt) {
        console.log("RIC Connected")

        myMarty.setEventListener(new MyEventListener())

        // let promiseRicName = myMarty.getRICName()
        // promiseRicName.then((ricName)=>{
        //     console.log("ricName", ricName)
        // },()=>console.log("Failed ricName"))

        // let promiseFileList = myMarty.getFileList()
        // promiseFileList.then((fileList)=>{
        //     console.log("fileList", fileList)
        // },()=>console.log("Failed fileList"))

        // let promiseUpdate = myMarty.checkForUpdate()
        // promiseUpdate.then((updateAvailable)=>{
        //     console.log("updateAvailable", updateAvailable)
        //     console.log(myMarty.getCachedSystemInfo())
        // },()=>console.log("Failed updateAvailable"))

        // let promiseFile = myMarty.fileSend("test.raw", RICFileSendType.RIC_NORMAL_FILE, new Uint8Array(1000), progCB);
        // promiseFile.then((sendRslt)=>{
        //     console.log("fileSendRslt", sendRslt)
        // },()=>console.log("Failed fileSend"))

        // const fwData = fs.readFileSync("/home/rob/rdev/RIC2FirmwareIDF/build/RIC2FirmwareIDF.bin")
        // console.log(`FW Length ${fwData.length}`)
        // let promiseFwUpdate = myMarty.fileSend("fw.bin", RICFileSendType.RIC_FIRMWARE_UPDATE, fwData, progCB);
        // promiseFwUpdate.then((sendRslt)=>{
        //     console.log("fwUpdateRslt", sendRslt)
        //     myMarty.disconnect();
        // },
        // () => {
        //     console.log("Failed fwUpdate");
        //     myMarty.disconnect();
        // })
        myMarty.disconnect();
    } else {
        console.log("Connect returned false");
        myMarty.disconnect();
    }
},()=>{
    console.log("Failed to connect"); 
});



// if (rslt) {
//     console.log(await myMarty.getAddOnList())

//     await new Promise(resolve => setTimeout(resolve, 5000));
// } else {
//     console.log("Failed to connect to RIC")
// }